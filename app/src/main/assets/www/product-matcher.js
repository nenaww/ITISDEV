const PRODUCT_MATCHER_ALIAS_CACHE_KEY = "kabalikat_product_alias_cache_v3";
const PRODUCT_MATCHER_PRODUCT_CACHE_KEY = "kabalikat_product_cache_v3";
const PRODUCT_MATCHER_CACHE_TIME_KEY = "kabalikat_product_matcher_cache_time_v3";
const PRODUCT_MATCHER_MAX_CACHE_AGE_MS = 1000 * 60 * 60 * 24 * 7;
const PRODUCT_MATCHER_ALLOW_PARSER_FALLBACK = false;

const ProductMatcherState = {
    aliases: [],
    products: [],
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
        item && item.cleanedText,
        item && item.cleaned_text,
        item && item.normalizedText,
        item && item.normalized_text,
        item && item.name
    ];

    const candidates = pieces
        .filter(Boolean)
        .map(cleanProductCandidateText)
        .filter(Boolean);

    return [...new Set(candidates)];
}

function getFallbackItemName(item) {
    const raw = String(
        item?.rawName ||
        item?.cleanedText ||
        item?.cleaned_text ||
        item?.name ||
        "Unmatched scanned item"
    ).trim();

    const cleaned = cleanProductCandidateText(raw);

    return cleaned || raw || "Unmatched scanned item";
}

function roundMatcherScore(value) {
    return Math.round(Math.max(0, Math.min(1, Number(value || 0))) * 1000) / 1000;
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

function normalizeSizeToken(value) {
    return normalizeProductText(value)
        .replace(/GRAMS/g, "G")
        .replace(/GRAM/g, "G")
        .replace(/LTR/g, "L")
        .replace(/LT/g, "L")
        .replace(/PCS/g, "S")
        .replace(/PC/g, "S");
}

function extractProductSizeTokens(value) {
    const text = normalizeProductText(value);
    const tokens = [];

    const patterns = [
        /\d+(?:\.\d+)?(?:KG|G|GRAMS?|ML|L|LTR|LT|PCS|PC|S)/g,
        /\d+(?:\.\d+)?X\d+/g,
        /X\d+/g
    ];

    patterns.forEach(pattern => {
        const matches = text.match(pattern) || [];

        matches.forEach(match => {
            const cleaned = normalizeSizeToken(match);

            if (cleaned) {
                tokens.push(cleaned);
            }
        });
    });

    return [...new Set(tokens)];
}

function isSizeToken(token) {
    return /^\d+(?:\.\d+)?(?:KG|G|ML|L|S)?$/.test(normalizeSizeToken(token));
}

function splitProductNameTokens(value) {
    const text = String(value || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toUpperCase()
        .replace(/(\d+(?:\.\d+)?)\s*(KG|G|GRAMS?|ML|L|LTR|LT|PCS|PC|S)\b/g, "$1$2")
        .replace(/[^A-Z0-9.]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    const ignored = new Set([
        "AND",
        "OF",
        "IN",
        "THE",
        "SA",
        "WITH",
        "PLUS"
    ]);

    const tokens = text.match(/[A-Z]+|\d+(?:\.\d+)?[A-Z]*/g) || [];

    return [...new Set(
        tokens
            .map(token => normalizeProductText(token))
            .map(token => isSizeToken(token) ? normalizeSizeToken(token) : token)
            .filter(Boolean)
            .filter(token => !ignored.has(token))
    )];
}

function removeVowelsAfterFirstLetter(token) {
    const text = normalizeProductText(token);

    if (text.length <= 3) return text;

    return text.charAt(0) + text.slice(1).replace(/[AEIOU]/g, "");
}

function getConsonantSkeleton(token) {
    const text = normalizeProductText(token);
    const skeleton = text.replace(/[AEIOU]/g, "");

    if (!skeleton) return text.charAt(0);

    return skeleton;
}

function collapseRepeatedCharacters(value) {
    return String(value || "").replace(/(.)\1+/g, "$1");
}

function getShortenedSkeletonVariants(value) {
    const text = normalizeProductText(value);
    const variants = new Set();

    if (text.length >= 4) {
        variants.add(text.charAt(0) + text.slice(-2));
        variants.add(text.charAt(0) + text.slice(-3));
    }

    if (text.length >= 5) {
        variants.add(text.slice(0, 2) + text.slice(-2));
        variants.add(text.slice(0, 3) + text.slice(-2));
    }

    return [...variants].filter(item => item.length >= 3);
}

function getAutoTokenVariants(token) {
    const text = normalizeProductText(token);
    const variants = new Set();

    if (!text) return [];

    variants.add(text);

    if (isSizeToken(text)) {
        variants.add(normalizeSizeToken(text));
        return [...variants].filter(Boolean);
    }

    const noVowels = removeVowelsAfterFirstLetter(text);
    const skeleton = getConsonantSkeleton(text);

    variants.add(noVowels);
    variants.add(skeleton);
    variants.add(collapseRepeatedCharacters(text));
    variants.add(collapseRepeatedCharacters(noVowels));
    variants.add(collapseRepeatedCharacters(skeleton));

    for (let length = 2; length <= 6; length++) {
        if (text.length >= length) {
            variants.add(text.slice(0, length));
        }

        if (noVowels.length >= length) {
            variants.add(noVowels.slice(0, length));
        }

        if (skeleton.length >= length) {
            variants.add(skeleton.slice(0, length));
        }
    }

    getShortenedSkeletonVariants(text).forEach(item => variants.add(item));
    getShortenedSkeletonVariants(noVowels).forEach(item => variants.add(item));
    getShortenedSkeletonVariants(skeleton).forEach(item => variants.add(item));

    return [...variants]
        .map(normalizeProductText)
        .filter(value => value.length >= 2);
}

function getSubsequenceScore(shortText, longText) {
    const shortValue = normalizeProductText(shortText);
    const longValue = normalizeProductText(longText);

    if (!shortValue || !longValue) return 0;

    let matched = 0;
    let pointer = 0;

    for (let index = 0; index < longValue.length && pointer < shortValue.length; index++) {
        if (longValue[index] === shortValue[pointer]) {
            matched++;
            pointer++;
        }
    }

    return matched / shortValue.length;
}

function scoreTokenAgainstCandidate(token, candidateText) {
    const candidate = normalizeProductText(candidateText);
    const cleanToken = normalizeProductText(token);

    if (!candidate || !cleanToken) return 0;

    if (candidate.includes(cleanToken)) {
        return 1;
    }

    const variants = getAutoTokenVariants(cleanToken);
    let best = 0;

    variants.forEach(variant => {
        if (!variant) return;

        if (candidate.includes(variant)) {
            if (variant === cleanToken) {
                best = Math.max(best, 1);
            } else if (variant.length >= 4) {
                best = Math.max(best, 0.94);
            } else {
                best = Math.max(best, 0.78);
            }
        }

        if (variant.length >= 3) {
            best = Math.max(best, getSlidingSimilarity(candidate, variant) * 0.78);
        }

        const subsequenceScore = getSubsequenceScore(variant, candidate);

        if (subsequenceScore >= 0.86 && variant.length >= 4) {
            best = Math.max(best, subsequenceScore * 0.84);
        }
    });

    return roundMatcherScore(best);
}

function applyAcronymCoverage(tokenScores, tokens, candidateText) {
    const candidate = normalizeProductText(candidateText);

    if (!candidate) return tokenScores;

    const updated = tokenScores.map(item => ({ ...item }));

    for (let start = 0; start < tokens.length; start++) {
        for (let length = 2; length <= 4; length++) {
            const span = tokens.slice(start, start + length);

            if (span.length < length) continue;
            if (span.some(isSizeToken)) continue;

            const acronym = span.map(token => token.charAt(0)).join("");

            if (acronym.length >= 2 && candidate.includes(acronym)) {
                for (let index = start; index < start + length; index++) {
                    updated[index].score = Math.max(updated[index].score, 0.86);
                    updated[index].matchedByAcronym = true;
                }
            }
        }
    }

    return updated;
}

function normalizeProductRecord(record) {
    return {
        productId: record.id || record.productId || null,
        canonicalName: record.canonical_name || record.canonicalName || "",
        category: record.category || "Others",
        brand: record.brand || "",
        productFamily: record.product_family || record.productFamily || "",
        variantText: record.variant_text || record.variantText || "",
        sizeText: record.size_text || record.sizeText || "",
        normalizedName:
            record.normalized_name ||
            record.normalizedName ||
            normalizeProductText(record.canonical_name || record.canonicalName || ""),
        source: record.source || "products"
    };
}

function normalizeAliasRecord(record) {
    const product = record.products || record.product || {};
    const store = record.stores || record.store || {};

    return {
        aliasId: record.id || record.aliasId || null,
        productId: record.product_id || record.productId || product.id || null,
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
        storeId: record.store_id || record.storeId || store.id || null,
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

function readCachedMatcherData() {
    try {
        const savedAt = Number(localStorage.getItem(PRODUCT_MATCHER_CACHE_TIME_KEY) || 0);

        if (savedAt && Date.now() - savedAt > PRODUCT_MATCHER_MAX_CACHE_AGE_MS) {
            return {
                aliases: [],
                products: []
            };
        }

        const rawAliases = localStorage.getItem(PRODUCT_MATCHER_ALIAS_CACHE_KEY);
        const rawProducts = localStorage.getItem(PRODUCT_MATCHER_PRODUCT_CACHE_KEY);

        const aliases = rawAliases ? JSON.parse(rawAliases) : [];
        const products = rawProducts ? JSON.parse(rawProducts) : [];

        return {
            aliases: Array.isArray(aliases) ? aliases.map(normalizeAliasRecord) : [],
            products: Array.isArray(products) ? products.map(normalizeProductRecord) : []
        };
    } catch (error) {
        return {
            aliases: [],
            products: []
        };
    }
}

function saveCachedMatcherData(aliases, products) {
    return;
}

function clearOldMatcherCaches() {
    try {
        localStorage.removeItem("kabalikat_product_alias_cache_v1");
        localStorage.removeItem("kabalikat_product_alias_cache_time_v1");
        localStorage.removeItem("kabalikat_product_alias_cache_v2");
        localStorage.removeItem("kabalikat_product_cache_v2");
        localStorage.removeItem("kabalikat_product_matcher_cache_time_v2");
    } catch (error) {
        console.warn("Old product matcher cache could not be cleared.", error);
    }
}

async function fetchAliasesFromSupabase() {
    const client = getProductMatcherSupabaseClient();

    if (!client) {
        console.warn("Supabase client is missing. Product aliases were not loaded.");
        return [];
    }

    const pageSize = 1000;
    let from = 0;
    let allRows = [];

    while (true) {
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
                created_at,
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
            .range(from, from + pageSize - 1);

        if (error) {
            console.warn("Supabase product aliases could not be loaded.", error);
            break;
        }

        if (!Array.isArray(data) || data.length === 0) {
            break;
        }

        allRows = allRows.concat(data);

        if (data.length < pageSize) {
            break;
        }

        from += pageSize;
    }

    console.log("Loaded aliases from Supabase:", allRows.length);

    return allRows.map(normalizeAliasRecord);
}

async function fetchProductsFromSupabase() {
    const client = getProductMatcherSupabaseClient();

    if (!client) {
        console.warn("Supabase client is missing. Products were not loaded.");
        return [];
    }

    const { data, error } = await client
        .from("products")
        .select(`
            id,
            canonical_name,
            brand,
            category,
            size_text,
            normalized_name,
            product_family,
            variant_text,
            created_at
        `)
        .order("canonical_name", { ascending: true })
        .limit(30000);

    if (error) {
        console.warn("Supabase products could not be loaded.", error);
        return [];
    }

    return Array.isArray(data) ? data.map(normalizeProductRecord) : [];
}

function mergeAliasLists(primary, fallback) {
    const map = new Map();

    [...(fallback || []), ...(primary || [])].forEach(record => {
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

function deriveProductsFromAliases(aliases) {
    const map = new Map();

    (aliases || []).forEach(alias => {
        if (!alias.productId || !alias.canonicalName) return;

        if (!map.has(alias.productId)) {
            map.set(alias.productId, normalizeProductRecord({
                id: alias.productId,
                canonical_name: alias.canonicalName,
                brand: alias.brand || "",
                category: alias.category || "Others",
                size_text: alias.sizeText || "",
                product_family: alias.productFamily || "",
                variant_text: alias.variantText || "",
                normalized_name: normalizeProductText(alias.canonicalName),
                source: "alias-derived-products"
            }));
        }
    });

    return [...map.values()];
}

function mergeProductLists(primary, fallback) {
    const map = new Map();

    [...(fallback || []), ...(primary || [])].forEach(record => {
        const product = normalizeProductRecord(record);
        const key = product.productId || normalizeProductText(product.canonicalName);

        if (key && !map.has(key)) {
            map.set(key, product);
        }
    });

    return [...map.values()];
}

async function loadProductMatcher(options = {}) {
    if (ProductMatcherState.loaded && !options.forceRefresh) {
        return ProductMatcherState.aliases;
    }

    if (ProductMatcherState.loadingPromise && !options.forceRefresh) {
        return ProductMatcherState.loadingPromise;
    }

    ProductMatcherState.loadingPromise = (async () => {
        clearOldMatcherCaches();

        const fallbackAliases = buildFallbackAliasesFromParserRules();
        const cached = options.forceRefresh
            ? { aliases: [], products: [] }
            : readCachedMatcherData();

        if (cached.aliases.length > 0 || cached.products.length > 0) {
            ProductMatcherState.aliases = mergeAliasLists(cached.aliases, fallbackAliases);
            ProductMatcherState.products = mergeProductLists(
                cached.products,
                deriveProductsFromAliases(ProductMatcherState.aliases)
            );
            ProductMatcherState.loaded = true;
            ProductMatcherState.lastSource = "cache";
        } else {
            ProductMatcherState.aliases = fallbackAliases;
            ProductMatcherState.products = deriveProductsFromAliases(fallbackAliases);
            ProductMatcherState.loaded = true;
            ProductMatcherState.lastSource = "fallback";
        }

        const [remoteAliases, remoteProducts] = await Promise.all([
            fetchAliasesFromSupabase(),
            fetchProductsFromSupabase()
        ]);

        if (remoteAliases.length > 0 || remoteProducts.length > 0) {
            ProductMatcherState.aliases = mergeAliasLists(remoteAliases, fallbackAliases);
            ProductMatcherState.products = mergeProductLists(
                remoteProducts,
                deriveProductsFromAliases(ProductMatcherState.aliases)
            );
            ProductMatcherState.lastSource = "supabase";

            saveCachedMatcherData(
                ProductMatcherState.aliases,
                ProductMatcherState.products
            );
        }

        return ProductMatcherState.aliases;
    })();

    try {
        return await ProductMatcherState.loadingPromise;
    } finally {
        ProductMatcherState.loadingPromise = null;
    }
}

function getProductSearchText(productRecord) {
    return normalizeProductText([
        productRecord.canonicalName || "",
        productRecord.brand || "",
        productRecord.sizeText || "",
        productRecord.variantText || ""
    ].join(" "));
}

function getProductDisplaySearchText(productRecord) {
    return [
        productRecord.canonicalName || "",
        productRecord.brand || "",
        productRecord.sizeText || "",
        productRecord.variantText || ""
    ].join(" ");
}

function escapeRegex(value) {
    return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getBrandlessProductName(productRecord) {
    const canonicalName = String(productRecord.canonicalName || "").trim();
    const brand = String(productRecord.brand || "").trim();

    if (!canonicalName) return "";

    if (!brand) {
        return canonicalName;
    }

    const brandPattern = new RegExp(`^${escapeRegex(brand)}\\s+`, "i");
    const brandless = canonicalName.replace(brandPattern, "").trim();

    return brandless || canonicalName;
}

function getGenericProductName(productRecord) {
    const brandless = getBrandlessProductName(productRecord);

    if (brandless) {
        return brandless;
    }

    const pieces = [
        productRecord.productFamily || "",
        productRecord.variantText || "",
        productRecord.sizeText || ""
    ]
        .map(value => String(value || "").trim())
        .filter(Boolean);

    const seen = new Set();
    const cleanedPieces = pieces.filter(piece => {
        const key = normalizeProductText(piece);

        if (!key || seen.has(key)) {
            return false;
        }

        seen.add(key);
        return true;
    });

    return cleanedPieces.join(" ").trim() || productRecord.canonicalName || "Matched Product";
}

function getProductSearchViews(productRecord) {
    const canonicalName = String(productRecord.canonicalName || "").trim();
    const brandlessName = getBrandlessProductName(productRecord);
    const genericName = getGenericProductName(productRecord);

    const views = [
        {
            type: "exact",
            displayName: canonicalName,
            searchText: [
                canonicalName,
                productRecord.sizeText || "",
                productRecord.variantText || ""
            ].join(" "),
            minimumScore: 0.82,
            minimumCoverage: 0.88
        },
        {
            type: "brandless",
            displayName: brandlessName,
            searchText: [
                brandlessName,
                productRecord.sizeText || "",
                productRecord.variantText || ""
            ].join(" "),
            minimumScore: 0.78,
            minimumCoverage: 0.82
        },
        {
            type: "generic",
            displayName: genericName,
            searchText: [
                productRecord.productFamily || "",
                productRecord.variantText || "",
                productRecord.sizeText || "",
                brandlessName
            ].join(" "),
            minimumScore: 0.72,
            minimumCoverage: 0.65
        }
    ];

    const seen = new Set();

    return views.filter(view => {
        const key = normalizeProductText(view.searchText);

        if (!key || seen.has(key)) {
            return false;
        }

        seen.add(key);
        return true;
    });
}

function getLeftToRightAlignmentAgainstText(candidateText, searchText) {
    const candidate = normalizeProductText(candidateText);
    const productText = normalizeProductText(searchText);

    if (!candidate || !productText) {
        return {
            matchedCount: 0,
            coverage: 0,
            compactness: 0,
            startGap: 999,
            score: 0,
            positions: []
        };
    }

    let productPointer = 0;
    const positions = [];

    for (let candidateIndex = 0; candidateIndex < candidate.length; candidateIndex++) {
        const character = candidate[candidateIndex];
        const foundIndex = productText.indexOf(character, productPointer);

        if (foundIndex === -1) {
            continue;
        }

        positions.push(foundIndex);
        productPointer = foundIndex + 1;
    }

    const matchedCount = positions.length;

    if (matchedCount === 0) {
        return {
            matchedCount: 0,
            coverage: 0,
            compactness: 0,
            startGap: 999,
            score: 0,
            positions: []
        };
    }

    const coverage = matchedCount / candidate.length;
    const firstPosition = positions[0];
    const lastPosition = positions[positions.length - 1];
    const span = Math.max(1, lastPosition - firstPosition + 1);
    const compactness = matchedCount / span;

    let score = coverage * 0.70 + compactness * 0.30;

    if (firstPosition <= 1) {
        score += 0.08;
    } else if (firstPosition <= 4) {
        score += 0.04;
    } else {
        score -= Math.min(0.16, firstPosition * 0.01);
    }

    if (coverage >= 0.98) {
        score += 0.05;
    }

    return {
        matchedCount,
        coverage: roundMatcherScore(coverage),
        compactness: roundMatcherScore(compactness),
        startGap: firstPosition,
        score: roundMatcherScore(score),
        positions
    };
}

function getFamilyAcronymScore(candidateText, productRecord) {
    const candidate = normalizeProductText(candidateText);

    const familyText = [
        productRecord.productFamily || "",
        productRecord.variantText || "",
        getBrandlessProductName(productRecord)
    ].join(" ");

    const familyTokens = splitProductNameTokens(familyText)
        .filter(token => !isSizeToken(token))
        .filter(token => token.length >= 2);

    if (!candidate || familyTokens.length === 0) {
        return 0;
    }

    let best = 0;

    for (let start = 0; start < familyTokens.length; start++) {
        for (let length = 2; length <= 4; length++) {
            const span = familyTokens.slice(start, start + length);

            if (span.length < length) continue;

            const acronym = span.map(token => token.charAt(0)).join("");

            if (acronym.length >= 2 && candidate.includes(acronym)) {
                best = Math.max(best, 0.78);
            }
        }
    }

    familyTokens.forEach(token => {
        const variants = getAutoTokenVariants(token);

        variants.forEach(variant => {
            if (variant.length >= 3 && candidate.includes(variant)) {
                best = Math.max(best, 0.74);
            }
        });
    });

    return roundMatcherScore(best);
}

function calculateProductViewDetails(candidateText, productRecord, view) {
    const candidate = normalizeProductText(candidateText);
    const searchText = normalizeProductText(view.searchText);

    if (!candidate || !searchText) {
        return {
            score: 0,
            accepted: false,
            reason: "empty-view"
        };
    }

    const size = getSizeMatchDetails(candidate, productRecord);

    if (size.hasSizeConflict) {
        return {
            score: 0,
            accepted: false,
            reason: "size-conflict",
            displayName: view.displayName,
            source: `product-${view.type}`
        };
    }

    const alignment = getLeftToRightAlignmentAgainstText(candidate, view.searchText);

    let score = alignment.score;

    if (size.hasSizeMatch) {
        score += 0.08;
    }

    const familyAcronymScore = getFamilyAcronymScore(candidate, productRecord);

    if (view.type === "generic" || view.type === "brandless") {
        score = Math.max(score, familyAcronymScore);
    }

    if (candidate.length >= 8 && searchText.includes(candidate)) {
        score = Math.max(score, 0.96);
    }

    score = roundMatcherScore(score);

    const accepted =
        score >= view.minimumScore &&
        (
            alignment.coverage >= view.minimumCoverage ||
            familyAcronymScore >= 0.78
        ) &&
        (!size.hasProductSize || !size.hasCandidateSize || size.hasSizeMatch);

    return {
        score,
        accepted,
        reason: accepted ? `accepted-${view.type}-product-match` : `weak-${view.type}-product-match`,
        displayName: view.displayName,
        source: `product-${view.type}`,
        alignment,
        familyAcronymScore,
        hasSizeMatch: size.hasSizeMatch,
        hasSizeConflict: size.hasSizeConflict,
        candidateSizes: size.candidateSizes,
        productSizes: size.productSizes,
        missingNonSizeTokens: [],
        firstTokenScore: alignment.startGap <= 5 ? 1 : 0,
        strongNonSizeRatio: Math.max(alignment.coverage, familyAcronymScore)
    };
}

function getLeftToRightAlignment(candidateText, productRecord) {
    const candidate = normalizeProductText(candidateText);
    const productText = getProductSearchText(productRecord);

    if (!candidate || !productText) {
        return {
            matchedCount: 0,
            coverage: 0,
            compactness: 0,
            startGap: 999,
            endGap: 999,
            score: 0,
            accepted: false,
            positions: []
        };
    }

    let productPointer = 0;
    const positions = [];

    for (let candidateIndex = 0; candidateIndex < candidate.length; candidateIndex++) {
        const character = candidate[candidateIndex];
        const foundIndex = productText.indexOf(character, productPointer);

        if (foundIndex === -1) {
            continue;
        }

        positions.push(foundIndex);
        productPointer = foundIndex + 1;
    }

    const matchedCount = positions.length;
    const coverage = matchedCount / candidate.length;

    if (matchedCount === 0) {
        return {
            matchedCount,
            coverage: 0,
            compactness: 0,
            startGap: 999,
            endGap: 999,
            score: 0,
            accepted: false,
            positions: []
        };
    }

    const firstPosition = positions[0];
    const lastPosition = positions[positions.length - 1];
    const span = Math.max(1, lastPosition - firstPosition + 1);
    const compactness = matchedCount / span;
    const startGap = firstPosition;
    const endGap = Math.max(0, productText.length - lastPosition - 1);

    let score = coverage * 0.72 + compactness * 0.28;

    if (startGap <= 1) {
        score += 0.08;
    } else if (startGap <= 3) {
        score += 0.04;
    } else {
        score -= Math.min(0.20, startGap * 0.015);
    }

    if (coverage >= 0.98) {
        score += 0.06;
    }

    return {
        matchedCount,
        coverage: roundMatcherScore(coverage),
        compactness: roundMatcherScore(compactness),
        startGap,
        endGap,
        score: roundMatcherScore(score),
        accepted: false,
        positions
    };
}

function getSizeMatchDetails(candidateText, productRecord) {
    const candidateSizes = extractProductSizeTokens(candidateText).map(normalizeSizeToken);

    const productSizes = [
        ...extractProductSizeTokens(productRecord.canonicalName),
        ...extractProductSizeTokens(productRecord.sizeText),
        ...extractProductSizeTokens(productRecord.variantText)
    ].map(normalizeSizeToken);

    const hasCandidateSize = candidateSizes.length > 0;
    const hasProductSize = productSizes.length > 0;

    const hasSizeMatch =
        hasCandidateSize &&
        hasProductSize &&
        candidateSizes.some(size => productSizes.includes(size));

    const hasSizeConflict =
        hasCandidateSize &&
        hasProductSize &&
        !hasSizeMatch;

    return {
        candidateSizes,
        productSizes,
        hasCandidateSize,
        hasProductSize,
        hasSizeMatch,
        hasSizeConflict
    };
}

function getWordStartBonus(candidateText, productRecord) {
    const candidate = normalizeProductText(candidateText);
    const displayText = getProductDisplaySearchText(productRecord);
    const tokens = splitProductNameTokens(displayText).filter(token => !isSizeToken(token));

    if (!candidate || tokens.length === 0) {
        return 0;
    }

    const firstLetters = tokens.map(token => token.charAt(0)).join("");

    if (firstLetters.length >= 2 && candidate.startsWith(firstLetters.slice(0, 2))) {
        return 0.06;
    }

    if (tokens[0] && candidate.startsWith(tokens[0].slice(0, 2))) {
        return 0.04;
    }

    return 0;
}

function calculateProductNameMatchDetails(candidateText, productRecord) {
    const candidate = normalizeProductText(candidateText);
    const canonical = normalizeProductText(productRecord.canonicalName || "");

    if (!candidate || !canonical) {
        return {
            score: 0,
            accepted: false,
            reason: "empty"
        };
    }

    if (candidate === canonical) {
        return {
            score: 1,
            accepted: true,
            reason: "exact-product-name",
            displayName: productRecord.canonicalName,
            source: "product-exact"
        };
    }

    const views = getProductSearchViews(productRecord);

    const results = views.map(view => {
        return calculateProductViewDetails(candidate, productRecord, view);
    });

    results.sort((a, b) => b.score - a.score);

    const best = results[0] || {
        score: 0,
        accepted: false,
        reason: "no-view-match",
        displayName: productRecord.canonicalName,
        source: "product-none"
    };

    return best;
}

function calculateProductNameMatchScore(candidateText, productRecord) {
    return calculateProductNameMatchDetails(candidateText, productRecord).score;
}

function findBestProductNameMatch(candidateTexts, options = {}) {
    const candidates = Array.isArray(candidateTexts)
        ? candidateTexts.map(cleanProductCandidateText).filter(Boolean)
        : [cleanProductCandidateText(candidateTexts)].filter(Boolean);

    if (candidates.length === 0) return null;

    const rows = [];

    candidates.forEach(candidate => {
        ProductMatcherState.products.forEach(product => {
            const details = calculateProductNameMatchDetails(candidate, product);

            rows.push({
                aliasId: null,
                productId: product.productId,
                aliasText: "",
                normalizedAlias: "",
                canonicalName: details.displayName || product.canonicalName,
                category: product.category || "Others",
                brand: product.brand || "",
                productFamily: product.productFamily || "",
                variantText: product.variantText || "",
                sizeText: product.sizeText || "",
                storeId: null,
                storeName: "",
                confidence: 1,
                source: details.source || "product-name-left-to-right",
                score: details.score,
                accepted: details.accepted,
                reason: details.reason,
                candidateText: candidate,
                details
            });
        });
    });

    rows.sort((a, b) => b.score - a.score);

    const best = rows[0] || null;
    const second = rows[1] || null;

    if (!best) return null;

    const scoreGap = second ? best.score - second.score : best.score;

    if (!best.accepted) {
        return {
            ...best,
            accepted: false,
            secondBestScore: second ? second.score : 0,
            scoreGap
        };
    }

    const sameDisplayedProduct =
        second &&
        normalizeProductText(best.canonicalName) === normalizeProductText(second.canonicalName);

    if (second && best.score < 0.92 && scoreGap < 0.025 && !sameDisplayedProduct) {
        return {
            ...best,
            accepted: false,
            reason: "ambiguous-left-to-right-match",
            secondBestScore: second.score,
            scoreGap
        };
    }

    return {
        ...best,
        accepted: true,
        secondBestScore: second ? second.score : 0,
        scoreGap
    };
}

function getContinuousOrderCoverage(shortText, longText) {
    const shortValue = normalizeProductText(shortText);
    const longValue = normalizeProductText(longText);

    if (!shortValue || !longValue) return 0;

    let pointer = 0;
    let matched = 0;
    let firstMatch = -1;
    let lastMatch = -1;

    for (let i = 0; i < shortValue.length; i++) {
        const char = shortValue[i];
        const found = longValue.indexOf(char, pointer);

        if (found === -1) {
            continue;
        }

        if (firstMatch === -1) {
            firstMatch = found;
        }

        lastMatch = found;
        pointer = found + 1;
        matched++;
    }

    if (matched === 0) return 0;

    const coverage = matched / shortValue.length;
    const span = Math.max(1, lastMatch - firstMatch + 1);
    const compactness = matched / span;

    let score = coverage * 0.75 + compactness * 0.25;

    if (firstMatch <= 2) {
        score += 0.06;
    } else {
        score -= Math.min(0.18, firstMatch * 0.012);
    }

    return roundMatcherScore(score);
}

function calculateAliasMatchScore(candidateText, aliasRecord) {
    const candidate = normalizeProductText(candidateText);
    const alias = normalizeProductText(
        aliasRecord.normalizedAlias ||
        aliasRecord.aliasText ||
        ""
    );

    if (!candidate || !alias) {
        return 0;
    }

    if (candidate === alias) {
        return 1;
    }

    const candidateLoose = normalizeProductTextLoose(candidate);
    const aliasLoose = normalizeProductTextLoose(alias);

    if (candidateLoose === aliasLoose) {
        return 0.98;
    }

    if (candidate.includes(alias) || alias.includes(candidate)) {
        return 0.94;
    }

    if (candidateLoose.includes(aliasLoose) || aliasLoose.includes(candidateLoose)) {
        return 0.90;
    }

    const forwardCoverage = getContinuousOrderCoverage(candidate, alias);
    const reverseCoverage = getContinuousOrderCoverage(alias, candidate);

    let score = Math.max(forwardCoverage, reverseCoverage);

    const candidateSizes = extractProductSizeTokens(candidate).map(normalizeSizeToken);

    const aliasSizes = [
        ...extractProductSizeTokens(aliasRecord.aliasText || ""),
        ...extractProductSizeTokens(aliasRecord.canonicalName || ""),
        ...extractProductSizeTokens(aliasRecord.sizeText || ""),
        ...extractProductSizeTokens(aliasRecord.variantText || "")
    ].map(normalizeSizeToken);

    if (candidateSizes.length > 0 && aliasSizes.length > 0) {
        const hasSizeMatch = candidateSizes.some(size => aliasSizes.includes(size));

        if (hasSizeMatch) {
            score = Math.min(1, score + 0.08);
        } else {
            score = Math.max(0, score - 0.20);
        }
    }

    return roundMatcherScore(score * Number(aliasRecord.confidence || 1));
}

function findBestAliasMatch(candidateTexts, options = {}) {
    const candidates = Array.isArray(candidateTexts)
        ? candidateTexts.map(cleanProductCandidateText).filter(Boolean)
        : [cleanProductCandidateText(candidateTexts)].filter(Boolean);

    if (candidates.length === 0) return null;

    const requestedStore = normalizeProductText(options.storeName || options.storeId || "");
    const rows = [];

    candidates.forEach(candidate => {
        ProductMatcherState.aliases.forEach(alias => {
            const aliasStore = normalizeProductText(alias.storeName || "");

            /*
                Important:
                If we know the receipt is Savemore, do not compare against Mercury-only aliases.
                This prevents:
                LM PC Kalamansi -> Alaxan
            */
            if (
                requestedStore &&
                aliasStore &&
                !requestedStore.includes(aliasStore) &&
                !aliasStore.includes(requestedStore)
            ) {
                return;
            }

            let score = calculateAliasMatchScore(candidate, alias);

            if (
                requestedStore &&
                aliasStore &&
                (requestedStore.includes(aliasStore) || aliasStore.includes(requestedStore))
            ) {
                score = Math.min(1, score + 0.03);
            }

            rows.push({
                ...alias,
                score: roundMatcherScore(score),
                candidateText: candidate,
                source: alias.source || "alias"
            });
        });
    });

    rows.sort((a, b) => b.score - a.score);

    return rows[0] || null;
}

function findBestProductMatch(candidateText, options = {}) {
    const candidates = Array.isArray(candidateText)
        ? candidateText.map(cleanProductCandidateText).filter(Boolean)
        : [cleanProductCandidateText(candidateText)].filter(Boolean);

    if (candidates.length === 0) {
        return null;
    }

    const aliasBest = findBestAliasMatch(candidates, options);

    if (aliasBest && aliasBest.score >= 0.70) {
        return {
            ...aliasBest,
            accepted: true,
            reason: "alias-first-continuous-match"
        };
    }

    const productBest = findBestProductNameMatch(candidates, options);

    if (productBest && productBest.accepted && productBest.score >= 0.72) {
        return {
            ...productBest,
            reason: productBest.reason || "product-fallback-match"
        };
    }

    return null;
}

function matchReceiptItem(item, options = {}) {
    const candidateTexts = getItemCandidateTexts(item);
    const best = findBestProductMatch(candidateTexts, options);
    const fallbackName = getFallbackItemName(item);
    const primaryCandidate = candidateTexts[0] || fallbackName;

    if (!best) {
        return {
            ...item,
            name: fallbackName,
            suggestedName: fallbackName,
            category: item.category || "Groceries",
            matchedProductId: null,
            matchedAliasId: null,
            matchedAliasText: "",
            matchScore: 0,
            matchStatus: "unmatched",
            needsReview: true,
            originalName: item.name || "",
            rawName: item.rawName || fallbackName,
            cleanedText: primaryCandidate,
            normalizedText: normalizeProductText(primaryCandidate),
            productFamily: "",
            variantText: "",
            productBrand: ""
        };
    }

    const highConfidence = best.score >= 0.90;

    return {
        ...item,
        name: best.canonicalName || fallbackName,
        suggestedName: best.canonicalName || fallbackName,
        category: best.category || item.category || "Others",
        matchedProductId: best.productId,
        matchedAliasId: best.aliasId,
        matchedAliasText: best.aliasText || "",
        matchScore: best.score,
        matchStatus: highConfidence ? "matched" : "suggested",
        needsReview: !highConfidence,
        originalName: item.name || "",
        rawName: item.rawName || fallbackName,
        cleanedText: best.candidateText || primaryCandidate,
        normalizedText: normalizeProductText(best.candidateText || primaryCandidate),
        productFamily: best.productFamily || "",
        variantText: best.variantText || "",
        productBrand: best.brand || "",
        matchSource: best.source || "",
        matchReason: best.reason || ""
    };
}

function matchReceiptItems(items, options = {}) {
    if (!Array.isArray(items)) return [];

    return items
        .map(item => {
            if (Number(item.price || 0) < 0) {
                return null;
            }

            return matchReceiptItem(item, options);
        })
        .filter(Boolean);
}

function getProductMatcherStats() {
    return {
        loaded: ProductMatcherState.loaded,
        aliasCount: ProductMatcherState.aliases.length,
        productCount: ProductMatcherState.products.length,
        lastSource: ProductMatcherState.lastSource
    };
}

function findLoadedAliasInMemory(code) {
    const key = normalizeProductText(code);

    return ProductMatcherState.aliases
        .filter(alias => {
            const aliasKey = normalizeProductText(
                alias.normalizedAlias ||
                alias.aliasText ||
                ""
            );

            return (
                aliasKey === key ||
                aliasKey.includes(key) ||
                key.includes(aliasKey)
            );
        })
        .map(alias => ({
            aliasText: alias.aliasText,
            normalizedAlias: alias.normalizedAlias,
            canonicalName: alias.canonicalName,
            storeName: alias.storeName,
            source: alias.source,
            confidence: alias.confidence
        }));
}

function debugBestProductMatches(candidateText, options = {}, limit = 10) {
    const candidates = Array.isArray(candidateText)
        ? candidateText.map(cleanProductCandidateText).filter(Boolean)
        : [cleanProductCandidateText(candidateText)].filter(Boolean);

    const rows = [];

    candidates.forEach(candidate => {
        ProductMatcherState.products.forEach(product => {
            const details = calculateProductNameMatchDetails(candidate, product);

            rows.push({
                type: "product-name",
                searched: candidateText,
                candidate,
                canonicalName: product.canonicalName,
                aliasText: "",
                score: details.score,
                accepted: details.accepted,
                reason: details.reason,
                missingTokens: details.missingNonSizeTokens ? details.missingNonSizeTokens.join(", ") : "",
                sizeMatch: details.hasSizeMatch === true
            });
        });

        ProductMatcherState.aliases.forEach(alias => {
            const aliasScore = calculateAliasMatchScore(candidate, alias);

            rows.push({
                type: "alias",
                searched: candidateText,
                candidate,
                canonicalName: alias.canonicalName,
                aliasText: alias.aliasText,
                score: aliasScore,
                accepted: aliasScore >= 0.985,
                reason: "alias-score",
                missingTokens: "",
                sizeMatch: ""
            });
        });
    });

    return rows
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
}

window.KabalikatProductMatcher = {
    load: loadProductMatcher,
    matchItem: matchReceiptItem,
    matchItems: matchReceiptItems,
    findBest: findBestProductMatch,
    debugBest: debugBestProductMatches,
    findLoadedAlias: findLoadedAliasInMemory,
    normalize: normalizeProductText,
    clean: cleanProductCandidateText,
    stats: getProductMatcherStats
};