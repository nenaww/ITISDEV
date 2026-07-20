const PRODUCT_MATCHER_CACHE_KEY = "kabalikat_product_alias_cache_v1";
const PRODUCT_MATCHER_CACHE_TIME_KEY = "kabalikat_product_alias_cache_time_v1";
const PRODUCT_MATCHER_MAX_CACHE_AGE_MS = 1000 * 60 * 60 * 24 * 7;
const PRODUCT_MATCHER_ALLOW_PARSER_FALLBACK = false;

const ProductMatcherState = {
    aliases: [],
    loaded: false,
    loadingPromise: null,
    lastSource: "none"
};

function getProductMatcherSupabaseClient() {
    if (window.kabalikatSupabase) return window.kabalikatSupabase;
    if (window.supabaseClient) return window.supabaseClient;

    try {
        if (typeof supabaseClient !== "undefined") {
            return supabaseClient;
        }
    } catch (error) {
        return null;
    }

    return null;
}

function normalizeProductText(value) {
    return String(value || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toUpperCase()
        .replace(/[₱]/g, " ")
        .replace(/[|]/g, "I")
        .replace(/[“”]/g, '"')
        .replace(/[‘’]/g, "'")
        .replace(/[^A-Z0-9]/g, "");
}

function normalizeProductTextLoose(value) {
    return normalizeProductText(value)
        .replace(/0/g, "O")
        .replace(/1/g, "I")
        .replace(/5/g, "S")
        .replace(/8/g, "B");
}

function cleanProductCandidateText(value) {
    return String(value || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .split("|")[0]
        .replace(/price from savemore price column/gi, " ")
        .replace(/repaired by subtotal check/gi, " ")
        .replace(/[₱]/g, " ")
        .replace(/\bPHP\b/gi, " ")
        .replace(/@\s*\d{1,3}(?:,\d{3})*[.,]\d{2}/g, " ")
        .replace(/@\s*\d{1,6}(?:[.,]\d{2})?/g, " ")
        .replace(/@/g, " ")
        .replace(/(?:^|\s)-?\d{1,3}(?:,\d{3})*[.,]\d{2}\s*$/g, " ")
        .replace(/(?:^|\s)-?\d{1,6}[.,]\d{2}\s*$/g, " ")
        .replace(/^\s*\d{1,3}\s+#?\s*/g, "")
        .replace(/^\s*[Iil!jJ({\[]\s+#?\s*/g, "")
        .replace(/\s+[A-Z]{1,3}\d{4,}\s*$/gi, "")
        .replace(/\s+\d{6,}\s*$/g, "")
        .replace(/[*#]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function getItemCandidateTexts(item) {
    const pieces = [
        item && item.rawName,
        item && item.name,
        item && item.cleanedText,
        item && item.cleaned_text,
        item && item.normalizedText,
        item && item.normalized_text
    ];

    const candidates = pieces
        .filter(Boolean)
        .map(cleanProductCandidateText)
        .filter(Boolean);

    return [...new Set(candidates)];
}

function getItemCandidateText(item) {
    const candidates = getItemCandidateTexts(item);

    return candidates[0] || "";
}

function extractProductSizeTokens(value) {
    const text = String(value || "").toUpperCase().replace(/\s+/g, " ");
    const tokens = [];

    const patterns = [
        /\b\d+(?:\.\d+)?\s*(?:KG|G|GRAMS?|ML|L|LTR|LT|PCS|PC|S)\b/g,
        /\b\d+(?:\.\d+)?\s*X\s*\d+\b/g,
        /\bX\s*\d+\b/g
    ];

    patterns.forEach(pattern => {
        const matches = text.match(pattern) || [];

        matches.forEach(match => {
            const cleaned = normalizeProductText(match);

            if (cleaned) {
                tokens.push(cleaned);
            }
        });
    });

    return [...new Set(tokens)];
}

function getSimilarityScore(first, second) {
    if (
        window.ParserUtils &&
        typeof window.ParserUtils.similarityScore === "function"
    ) {
        return window.ParserUtils.similarityScore(first, second);
    }

    const a = String(first || "");
    const b = String(second || "");

    if (!a || !b) return 0;
    if (a === b) return 1;

    const matrix = [];

    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }

    return 1 - matrix[b.length][a.length] / Math.max(a.length, b.length);
}

function getSlidingSimilarity(source, target) {
    if (
        window.ParserUtils &&
        typeof window.ParserUtils.slidingSimilarity === "function"
    ) {
        return window.ParserUtils.slidingSimilarity(source, target);
    }

    const text = String(source || "");
    const goal = String(target || "");

    if (!text || !goal) return 0;
    if (text.includes(goal)) return 1;

    if (text.length <= goal.length) {
        return getSimilarityScore(text, goal);
    }

    let best = 0;

    for (let index = 0; index <= text.length - goal.length; index++) {
        const chunk = text.slice(index, index + goal.length);
        const score = getSimilarityScore(chunk, goal);

        if (score > best) {
            best = score;
        }
    }

    return best;
}

function calculateAliasMatchScore(candidateText, aliasRecord) {
    const candidate = normalizeProductText(candidateText);
    const candidateLoose = normalizeProductTextLoose(candidateText);
    const alias = normalizeProductText(aliasRecord.normalizedAlias || aliasRecord.aliasText);
    const aliasLoose = normalizeProductTextLoose(aliasRecord.normalizedAlias || aliasRecord.aliasText);
    const productName = normalizeProductText(aliasRecord.canonicalName);

    if (!candidate || !alias) return 0;

    let score = 0;

    if (candidate === alias) {
        score = 1;
    } else if (candidate.includes(alias) && alias.length >= 5) {
        score = Math.max(score, 0.98);
    } else if (alias.includes(candidate) && candidate.length >= 5) {
        score = Math.max(score, 0.94);
    }

    if (candidateLoose === aliasLoose) {
        score = Math.max(score, 0.96);
    } else if (candidateLoose.includes(aliasLoose) && aliasLoose.length >= 5) {
        score = Math.max(score, 0.93);
    } else if (aliasLoose.includes(candidateLoose) && candidateLoose.length >= 5) {
        score = Math.max(score, 0.90);
    }

    score = Math.max(score, getSlidingSimilarity(candidate, alias) * 0.98);
    score = Math.max(score, getSlidingSimilarity(candidateLoose, aliasLoose) * 0.94);

    if (productName) {
        score = Math.max(score, getSlidingSimilarity(candidate, productName) * 0.88);
        score = Math.max(
            score,
            getSlidingSimilarity(candidateLoose, normalizeProductTextLoose(productName)) * 0.84
        );
    }

    const candidateSizes = extractProductSizeTokens(candidateText);
    const aliasSizes = [
        ...extractProductSizeTokens(aliasRecord.aliasText),
        ...extractProductSizeTokens(aliasRecord.canonicalName),
        ...extractProductSizeTokens(aliasRecord.sizeText),
        ...extractProductSizeTokens(aliasRecord.variantText)
    ];

    const hasCandidateSize = candidateSizes.length > 0;
    const hasAliasSize = aliasSizes.length > 0;

    if (hasCandidateSize && hasAliasSize) {
        const hasSizeMatch = candidateSizes.some(size => aliasSizes.includes(size));

        if (hasSizeMatch) {
            score = Math.min(1, score + 0.05);
        } else if (score < 0.97) {
            score = Math.max(0, score - 0.08);
        }
    }

    return Math.round(score * 1000) / 1000;
}

function normalizeAliasRecord(record) {
    const product = record.products || record.product || {};
    const store = record.stores || record.store || {};

    return {
        aliasId: record.id || null,
        productId: record.product_id || product.id || null,
        aliasText: record.alias_text || record.aliasText || "",
        normalizedAlias:
            record.normalized_alias ||
            record.normalizedAlias ||
            normalizeProductText(record.alias_text || record.aliasText || ""),
        canonicalName:
            product.canonical_name ||
            record.canonical_name ||
            record.canonicalName ||
            "",
        category: product.category || record.category || "Others",
        brand: product.brand || record.brand || "",
        productFamily:
            product.product_family ||
            record.product_family ||
            record.productFamily ||
            "",
        variantText:
            product.variant_text ||
            record.variant_text ||
            record.variantText ||
            "",
        sizeText:
            product.size_text ||
            record.size_text ||
            record.sizeText ||
            "",
        storeId: record.store_id || store.id || null,
        storeName: store.store_name || record.store_name || record.storeName || "",
        confidence: Number(record.confidence || 1),
        source: record.source || "supabase"
    };
}

function buildFallbackAliasesFromParserRules() {
    if (!PRODUCT_MATCHER_ALLOW_PARSER_FALLBACK) {
        return [];
    }

    const rules =
        window.SavemoreParser && Array.isArray(window.SavemoreParser.rules)
            ? window.SavemoreParser.rules
            : [];

    const aliases = [];

    rules.forEach(rule => {
        const productName = rule.name || "";
        const category = rule.category || "Groceries";
        const patterns = Array.isArray(rule.patterns) ? rule.patterns : [];

        [productName, ...patterns].forEach(pattern => {
            const aliasText = String(pattern || "").trim();

            if (!aliasText) return;

            aliases.push({
                aliasId: null,
                productId: null,
                aliasText,
                normalizedAlias: normalizeProductText(aliasText),
                canonicalName: productName,
                category,
                brand: "",
                productFamily: productName,
                variantText: "",
                sizeText: "",
                storeId: null,
                storeName: "Savemore",
                confidence: 1,
                source: "p-save.js fallback"
            });
        });
    });

    return aliases;
}

function readCachedAliases() {
    try {
        const raw = localStorage.getItem(PRODUCT_MATCHER_CACHE_KEY);
        const savedAt = Number(localStorage.getItem(PRODUCT_MATCHER_CACHE_TIME_KEY) || 0);

        if (!raw) return [];
        if (savedAt && Date.now() - savedAt > PRODUCT_MATCHER_MAX_CACHE_AGE_MS) {
            return [];
        }

        const parsed = JSON.parse(raw);

        return Array.isArray(parsed) ? parsed.map(normalizeAliasRecord) : [];
    } catch (error) {
        return [];
    }
}

function saveCachedAliases(aliases) {
    try {
        localStorage.setItem(PRODUCT_MATCHER_CACHE_KEY, JSON.stringify(aliases));
        localStorage.setItem(PRODUCT_MATCHER_CACHE_TIME_KEY, String(Date.now()));
    } catch (error) {
        console.warn("Product matcher cache could not be saved.", error);
    }
}

async function fetchAliasesFromSupabase() {
    const client = getProductMatcherSupabaseClient();

    if (!client || !navigator.onLine) {
        return [];
    }

    const { data, error } = await client
        .from("product_aliases")
        .select(`
            id,
            product_id,
            store_id,
            alias_text,
            normalized_alias,
            confidence,
            source,
            products (
                id,
                canonical_name,
                brand,
                category,
                size_text,
                normalized_name,
                product_family,
                variant_text
            ),
            stores (
                id,
                store_name,
                normalized_store_name
            )
        `)
        .order("created_at", { ascending: false })
        .limit(10000);

    if (error) {
        console.warn("Supabase product aliases could not be loaded.", error);
        return [];
    }

    return Array.isArray(data) ? data.map(normalizeAliasRecord) : [];
}

async function loadProductMatcher(options = {}) {
    if (ProductMatcherState.loaded && !options.forceRefresh) {
        return ProductMatcherState.aliases;
    }

    if (ProductMatcherState.loadingPromise && !options.forceRefresh) {
        return ProductMatcherState.loadingPromise;
    }

    ProductMatcherState.loadingPromise = (async () => {
        const cached = readCachedAliases();
        const fallback = buildFallbackAliasesFromParserRules();

        if (cached.length > 0) {
            ProductMatcherState.aliases = mergeAliasLists(cached, fallback);
            ProductMatcherState.loaded = true;
            ProductMatcherState.lastSource = "cache";
        } else {
            ProductMatcherState.aliases = fallback;
            ProductMatcherState.loaded = true;
            ProductMatcherState.lastSource = "fallback";
        }

        const remote = await fetchAliasesFromSupabase();

        if (remote.length > 0) {
            ProductMatcherState.aliases = mergeAliasLists(remote, fallback);
            ProductMatcherState.lastSource = "supabase";
            saveCachedAliases(ProductMatcherState.aliases);
        }

        return ProductMatcherState.aliases;
    })();

    try {
        return await ProductMatcherState.loadingPromise;
    } finally {
        ProductMatcherState.loadingPromise = null;
    }
}

function mergeAliasLists(primary, fallback) {
    const map = new Map();

    [...fallback, ...primary].forEach(record => {
        const alias = normalizeAliasRecord(record);
        const key = [
            normalizeProductText(alias.normalizedAlias || alias.aliasText),
            normalizeProductText(alias.canonicalName),
            normalizeProductText(alias.storeName)
        ].join("|");

        if (!map.has(key)) {
            map.set(key, alias);
        }
    });

    return [...map.values()];
}

function findBestProductMatch(candidateText, options = {}) {
    const candidates = Array.isArray(candidateText)
        ? candidateText.map(cleanProductCandidateText).filter(Boolean)
        : [cleanProductCandidateText(candidateText)].filter(Boolean);

    if (candidates.length === 0) {
        return null;
    }

    const storeName = normalizeProductText(options.storeName || options.storeId || "");
    let best = null;

    candidates.forEach(text => {
        ProductMatcherState.aliases.forEach(alias => {
            let score = calculateAliasMatchScore(text, alias);

            const aliasStore = normalizeProductText(alias.storeName || "");

            if (
                storeName &&
                aliasStore &&
                (storeName.includes(aliasStore) || aliasStore.includes(storeName))
            ) {
                score = Math.min(1, score + 0.025);
            }

            score = Math.round(score * Number(alias.confidence || 1) * 1000) / 1000;

            if (!best || score > best.score) {
                best = {
                    ...alias,
                    score,
                    candidateText: text
                };
            }
        });
    });

    return best;
}

function matchReceiptItem(item, options = {}) {
    const candidateTexts = getItemCandidateTexts(item);
    const best = findBestProductMatch(candidateTexts, options);
    const primaryCandidate = candidateTexts[0] || item.rawName || item.name || "";

    const fallbackName =
        item.name ||
        item.cleanedText ||
        item.rawName ||
        primaryCandidate ||
        "";

    if (!best) {
        return {
            ...item,
            name: fallbackName,
            suggestedName: fallbackName,
            rawName: item.rawName || primaryCandidate || "",
            cleanedText: primaryCandidate,
            normalizedText: normalizeProductText(primaryCandidate),
            category: item.category || "Others",
            matchedProductId: null,
            matchedAliasId: null,
            matchedAliasText: "",
            matchScore: 0,
            matchStatus: "unmatched",
            needsReview: true,
            needsNameReview: true,
            originalName: item.name || "",
            productFamily: "",
            variantText: "",
            productBrand: ""
        };
    }

    const highConfidence = best.score >= 0.78;
    const mediumConfidence = best.score >= 0.60;

    if (!mediumConfidence) {
        return {
            ...item,
            name: fallbackName,
            suggestedName: fallbackName,
            rawName: item.rawName || primaryCandidate || "",
            cleanedText: primaryCandidate,
            normalizedText: normalizeProductText(primaryCandidate),
            category: item.category || "Others",
            matchedProductId: null,
            matchedAliasId: null,
            matchedAliasText: best.aliasText || "",
            matchScore: best.score,
            matchStatus: "unmatched",
            needsReview: true,
            needsNameReview: true,
            originalName: item.name || "",
            productFamily: "",
            variantText: "",
            productBrand: ""
        };
    }

    return {
        ...item,
        name: best.canonicalName || fallbackName,
        suggestedName: best.canonicalName || fallbackName,
        category: best.category || item.category || "Others",
        matchedProductId: best.productId,
        matchedAliasId: best.aliasId,
        matchedAliasText: best.aliasText,
        matchScore: best.score,
        matchStatus: highConfidence ? "matched" : "suggested",
        needsReview: !highConfidence,
        needsNameReview: false,
        originalName: item.name || "",
        rawName: item.rawName || primaryCandidate,
        cleanedText: best.candidateText || primaryCandidate,
        normalizedText: normalizeProductText(best.candidateText || primaryCandidate),
        productFamily: best.productFamily || "",
        variantText: best.variantText || "",
        productBrand: best.brand || ""
    };
}

function matchReceiptItems(items, options = {}) {
    if (!Array.isArray(items)) return [];

    return items
        .map(item => matchReceiptItem(item, options))
        .filter(item => item && Number(item.price || 0) > 0);
}

function getProductMatcherStats() {
    return {
        loaded: ProductMatcherState.loaded,
        aliasCount: ProductMatcherState.aliases.length,
        lastSource: ProductMatcherState.lastSource
    };
}

window.KabalikatProductMatcher = {
    load: loadProductMatcher,
    matchItem: matchReceiptItem,
    matchItems: matchReceiptItems,
    findBest: findBestProductMatch,
    normalize: normalizeProductText,
    clean: cleanProductCandidateText,
    stats: getProductMatcherStats
};