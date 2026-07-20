const KABALIKAT_CATEGORIES = [
    "Food",
    "Groceries",
    "Utilities",
    "Transportation",
    "Medicine",
    "School",
    "Debt / Utang",
    "Emergency",
    "Shopping",
    "Others"
];

const KABALIKAT_STORES = [
    {
        id: "savemore",
        name: "Savemore",
        logo: "images/savemore.png",
        keywords: [
            "SAVEMORE",
            "SAVE MORE",
            "SAVEM0RE",
            "SAVEMORE MARKET",
            "SM MARKET",
            "SM MARKETS",
            "SANFORD MARKETING",
            "SANFORD MARKETING CORPORATION",
            "SALES INVOICE"
        ]
    },
    {
        id: "alfamart",
        name: "Alfamart",
        logo: "images/alfamart.png",
        keywords: [
            "ALFAMART",
            "ALFA MART",
            "ALFAMETRO",
            "ALFAMETRO MARKETING",
            "ALFAMETRO MARKETING INC",
            "THIS SERVES AS YOUR SALES INVOICE"
        ]
    },
    {
        id: "mercury",
        name: "Mercury Drug",
        logo: "images/mercury.png",
        keywords: [
            "MERCURY",
            "MERCURY DRUG",
            "MERCURY DRUGSTORE",
            "MERCURY DRUG CORP"
        ]
    },
    {
        id: "puregold",
        name: "Puregold",
        logo: "images/puregold.png",
        keywords: [
            "PUREGOLD",
            "PURE GOLD",
            "PUREGOLD PRICE CLUB",
            "PGOLD"
        ]
    },
    {
        id: "seveneleven",
        name: "7-Eleven",
        logo: "images/711.png",
        keywords: [
            "7-ELEVEN",
            "7 ELEVEN",
            "SEVEN ELEVEN",
            "711",
            "PHILIPPINE SEVEN"
        ]
    }
];

function normalizeReceiptText(text) {
    return String(text || "")
        .toUpperCase()
        .replace(/[₱]/g, " PHP ")
        .replace(/[|]/g, "I")
        .replace(/[“”]/g, '"')
        .replace(/[‘’]/g, "'")
        .replace(/\s+/g, " ")
        .trim();
}

function normalizeKey(text) {
    return String(text || "")
        .toUpperCase()
        .replace(/0/g, "O")
        .replace(/1/g, "I")
        .replace(/5/g, "S")
        .replace(/8/g, "B")
        .replace(/[^A-Z0-9]/g, "");
}

function splitReceiptLines(rawText) {
    return String(rawText || "")
        .split(/\n+/)
        .map(line => line.trim())
        .filter(line => line.length > 0);
}

function hasEndingPrice(line) {
    return /(-?\d{1,3}(?:,\d{3})*\.\d{2}|-?\d{1,6}[.,]\d{2})\s*$/.test(String(line || ""));
}

function parseMoney(value) {
    const text = String(value || "").trim();

    if (text.includes(",") && text.includes(".")) {
        return Number(text.replace(/,/g, ""));
    }

    if (text.includes(",") && !text.includes(".")) {
        return Number(text.replace(",", "."));
    }

    return Number(text);
}

function splitCompactText(text) {
    return String(text || "")
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/([A-Za-z])(\d)/g, "$1 $2")
        .replace(/(\d)([A-Za-z])/g, "$1 $2")
        .replace(/\s+/g, " ")
        .trim();
}

function titleCaseProduct(text) {
    return String(text || "")
        .toLowerCase()
        .replace(/\b[a-z]/g, letter => letter.toUpperCase())
        .replace(/\bSm\b/g, "SM")
        .replace(/\bKg\b/g, "kg")
        .replace(/\bMl\b/g, "ml")
        .replace(/\bG\b/g, "g")
        .replace(/\bL\b/g, "L")
        .replace(/\bC2\b/g, "C2")
        .replace(/\b4d\b/gi, "4D");
}

function cleanBasicProductName(name) {
    return titleCaseProduct(
        splitCompactText(
            String(name || "")
                .replace(/@\s*\d{1,6}(?:[.,]\d{2})?/g, "")
                .replace(/[^a-zA-Z0-9\s/.,&'()+%-]/g, "")
                .replace(/\s+/g, " ")
                .trim()
        )
    );
}

function removeTrailingReceiptCodes(text) {
    return String(text || "")
        .replace(/\s+[A-Z]\d{5,}$/i, "")
        .replace(/\s+[A-Z]{1,3}\d{4,}$/i, "")
        .replace(/\s+M\d{5,}$/i, "")
        .replace(/\s+S\d{5,}$/i, "")
        .replace(/\s+L\d{5,}$/i, "")
        .replace(/\s+[A-Z]{1}\d{1,3}$/i, "")
        .replace(/\s+\d{6,}$/i, "")
        .trim();
}

function shouldIgnoreReceiptLine(name) {
    const upper = String(name || "").toUpperCase();

    const ignored = [
        "TOTAL",
        "SUBTOTAL",
        "TOTAL DUE",
        "CASH",
        "CHANGE",
        "VAT",
        "VATABLE",
        "VAT AMOUNT",
        "TAX",
        "RECEIPT",
        "INVOICE",
        "TRANS",
        "DATE",
        "TIME",
        "CARD",
        "GCASH",
        "PAY MAYA",
        "MAYA",
        "CUSTOMER",
        "CUST NAME",
        "APPROVAL",
        "REFERENCE",
        "BAGGER",
        "CASHIER",
        "ADDRESS",
        "TIN",
        "BUS STYLE",
        "PERMIT",
        "DATE ISSUED",
        "ITEM(S)",
        "ITEM/S PURCHASED",
        "DISCOUNT",
        "ROUNDING",
        "POINTS",
        "BALANCE"
    ];

    return ignored.some(word => upper.includes(word));
}

function autoCategoryFromText(text, storeId = "") {
    const key = normalizeKey(text);

    const medicineWords = [
        "MED",
        "PARACETAMOL",
        "BIOGESIC",
        "VITAMIN",
        "CAPSULE",
        "TABLET",
        "SYRUP",
        "ALCOHOL",
        "ETHYL",
        "MASK",
        "TAMED",
        "BIOGENIC"
    ];

    const foodWords = [
        "MEAL",
        "BURGER",
        "HOTDOG",
        "COFFEE",
        "SANDWICH",
        "FRIES",
        "COKE",
        "JUICE",
        "SPRITE",
        "CHIPS",
        "CANDY",
        "CHOCOLATE",
        "KITKAT",
        "CHUPA",
        "TURON",
        "CAKE",
        "CURLS",
        "CHEESE",
        "MANGO",
        "TEA",
        "ICECREAM",
        "PILLOWS"
    ];

    const groceryWords = [
        "RICE",
        "MILK",
        "BREAD",
        "NOODLES",
        "SARDINES",
        "SOAP",
        "SHAMPOO",
        "DETERGENT",
        "TISSUE",
        "SUGAR",
        "VINEGAR",
        "MEAT",
        "FLOUR",
        "CONDITIONER",
        "WIPES",
        "TOOTHPASTE",
        "FABRIC",
        "TAWAS"
    ];

    if (medicineWords.some(word => key.includes(normalizeKey(word)))) return "Medicine";
    if (foodWords.some(word => key.includes(normalizeKey(word)))) return "Food";
    if (groceryWords.some(word => key.includes(normalizeKey(word)))) return "Groceries";

    if (storeId === "mercury") return "Medicine";
    if (storeId === "seveneleven") return "Food";
    if (["savemore", "puregold", "alfamart"].includes(storeId)) return "Groceries";

    return "Others";
}

function extractReceiptNumber(text) {
    const raw = String(text || "");

    const patterns = [
        /SI[#:\s-]*([0-9A-Z-]{5,})/i,
        /S1[#:\s-]*([0-9A-Z-]{5,})/i,
        /(?:OR|REF|TRANS|RECEIPT|INVOICE)\s*(?:NO|#|NUMBER)?[:\s-]*([A-Z0-9-]{5,})/i,
        /#\s*([A-Z0-9-]{5,})/i
    ];

    for (const pattern of patterns) {
        const match = raw.match(pattern);

        if (match) {
            return match[1];
        }
    }

    return "N/A";
}

function extractReceiptDate(text) {
    const raw = String(text || "");

    const patterns = [
        /(\d{4})-(\d{2})-(\d{2})/,
        /(\d{2})\/(\d{2})\/(\d{4})/,
        /(\d{2})-(\d{2})-(\d{4})/,
        /(\d{2})\/(\d{2})\/(\d{2})/,
        /(\d{2})-(\d{2})-(\d{2})/
    ];

    for (const pattern of patterns) {
        const match = raw.match(pattern);

        if (!match) continue;

        if (match[1].length === 4) {
            return `${match[1]}-${match[2]}-${match[3]}`;
        }

        let first = Number(match[1]);
        let second = Number(match[2]);
        let year = match[3];

        if (year.length === 2) {
            year = `20${year}`;
        }

        let month = first;
        let day = second;

        if (first > 12 && second <= 12) {
            day = first;
            month = second;
        }

        return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    }

    return "N/A";
}

function extractTotalAmount(rawText) {
    const text = String(rawText || "");

    const totalPatterns = [
        /TOTAL\s+DUE\s+(?:PHP\s*)?(\d{1,3}(?:,\d{3})*\.\d{2}|\d{1,6}[.,]\d{2})/i,
        /SUBTOTAL\s+(?:PHP\s*)?(\d{1,3}(?:,\d{3})*\.\d{2}|\d{1,6}[.,]\d{2})/i,
        /TOTAL\s+(?:PHP\s*)?(\d{1,3}(?:,\d{3})*\.\d{2}|\d{1,6}[.,]\d{2})/i
    ];

    for (const pattern of totalPatterns) {
        const match = text.match(pattern);

        if (match) {
            return parseMoney(match[1]);
        }
    }

    const matches = text.match(/\d{1,3}(?:,\d{3})*\.\d{2}|\d{1,6}[.,]\d{2}/g);

    if (!matches) return 0;

    const amounts = matches
        .map(parseMoney)
        .filter(value => !isNaN(value) && value > 0);

    return amounts.length ? Math.max(...amounts) : 0;
}

function detectReceiptStore(normalizedText) {
    const comparableText = normalizeKey(normalizedText);

    let bestStore = {
        id: "unknown",
        name: "Unknown Store",
        logo: "",
        keywords: []
    };

    let bestScore = 0;

    KABALIKAT_STORES.forEach(store => {
        let score = 0;

        store.keywords.forEach(keyword => {
            const key = normalizeKey(keyword);

            if (comparableText.includes(key)) {
                score += key.length + 10;
            } else {
                const similarity = slidingSimilarity(comparableText.slice(0, 500), key);

                if (similarity >= 0.74) {
                    score += Math.round(similarity * key.length);
                }
            }
        });

        if (score > bestScore) {
            bestScore = score;
            bestStore = store;
        }
    });

    return bestScore >= 7 ? bestStore : {
        id: "unknown",
        name: "Unknown Store",
        logo: "",
        keywords: []
    };
}

function slidingSimilarity(text, target) {
    const source = String(text || "");
    const goal = String(target || "");

    if (!source || !goal) return 0;
    if (source.includes(goal)) return 1;

    const goalLength = goal.length;

    if (source.length <= goalLength) {
        return similarityScore(source, goal);
    }

    let best = 0;

    for (let i = 0; i <= source.length - goalLength; i++) {
        const chunk = source.slice(i, i + goalLength);
        const score = similarityScore(chunk, goal);

        if (score > best) {
            best = score;
        }
    }

    return best;
}

function similarityScore(a, b) {
    const first = String(a || "");
    const second = String(b || "");

    if (!first || !second) return 0;

    const distance = levenshteinDistance(first, second);
    const maxLength = Math.max(first.length, second.length);

    return maxLength === 0 ? 1 : 1 - distance / maxLength;
}

function levenshteinDistance(a, b) {
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

    return matrix[b.length][a.length];
}

function createParserId(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function removeDuplicateItems(items) {
    const seen = new Set();

    return items.filter(item => {
        const key = `${normalizeKey(item.rawName || item.name)}-${item.quantity}-${item.price}`;

        if (seen.has(key)) return false;

        seen.add(key);
        return true;
    });
}

window.KABALIKAT_CATEGORIES = KABALIKAT_CATEGORIES;
window.KABALIKAT_STORES = KABALIKAT_STORES;

window.ParserUtils = {
    normalizeReceiptText,
    normalizeKey,
    splitReceiptLines,
    hasEndingPrice,
    parseMoney,
    splitCompactText,
    titleCaseProduct,
    cleanBasicProductName,
    removeTrailingReceiptCodes,
    shouldIgnoreReceiptLine,
    autoCategoryFromText,
    extractReceiptNumber,
    extractReceiptDate,
    extractTotalAmount,
    detectReceiptStore,
    slidingSimilarity,
    similarityScore,
    levenshteinDistance,
    createParserId,
    removeDuplicateItems
};