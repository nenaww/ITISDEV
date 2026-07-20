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
            "SANFORD MARKETING",
            "SANFORD MARKETING CORPORATION",
            "SALES INVOICE"
        ]
    },
    {
        id: "puregold",
        name: "Puregold",
        logo: "images/puregold.png",
        keywords: [
            "PUREGOLD",
            "PURE GOLD",
            "PUREGOLD PRICE CLUB"
        ]
    },
    {
        id: "mercury",
        name: "Mercury Drug",
        logo: "images/mercury.png",
        keywords: [
            "MERCURY",
            "MERCURY DRUG",
            "MERCURY DRUGSTORE"
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
            "711"
        ]
    },
    {
        id: "alfamart",
        name: "Alfamart",
        logo: "images/alfamart.png",
        keywords: [
            "ALFAMART",
            "ALFA MART"
        ]
    }
];

const SAVEMORE_DETAIL_RULES = [
    {
        name: "Femme Tissue 2-Ply 250",
        category: "Groceries",
        patterns: [
            "FEMMETSU2PLY250",
            "FEMMETSU",
            "FEMMETISSUE",
            "FEMMETSU2PLY"
        ]
    },
    {
        name: "Mysan SkyFlakes Crackers",
        category: "Groceries",
        patterns: [
            "MYSANSKYFLAKES",
            "MYSANSKYFLKS",
            "SKYFLAKES",
            "SKYFLKS"
        ]
    },
    {
        name: "Nissin Eggnog Regular 130g",
        category: "Groceries",
        patterns: [
            "NISSINEGGNOGREG130",
            "NISSINEGGNOG",
            "EGGNOGREG130",
            "EGGNOG130"
        ]
    },
    {
        name: "Jack 'n Jill Dewberry Blueberry Cheesecake",
        category: "Food",
        patterns: [
            "JNJDWBRYBLBRYCHSCK",
            "JNJDWBRY",
            "DEWBERRYBLUEBERRY",
            "DEWBERRYCHEESECAKE"
        ]
    },
    {
        name: "Glee Green Tea Toothpaste 150g",
        category: "Groceries",
        patterns: [
            "GLEEGRTEATPSTE150",
            "GLEEGREATEATPSTE150",
            "GLEEGREENTEATOOTHPASTE",
            "GRTEATPSTE150"
        ]
    },
    {
        name: "Del Monte Pineapple Tidbits Crushed",
        category: "Groceries",
        patterns: [
            "DELMONTEPTCRSPR",
            "DELMONTEPTCRSP",
            "DELMONTEPINEAPPLE",
            "DELMONTECRUSH"
        ]
    },
    {
        name: "Sprite Can 320ml",
        category: "Food",
        patterns: [
            "SPRITECAN320",
            "4SPRITECAN320"
        ]
    },
    {
        name: "Gardenia White Bread",
        category: "Groceries",
        patterns: [
            "GARWHITEBREAD",
            "GARWHITEBREADRS",
            "GARDENIAWHITEBREAD",
            "WHITEBREADRS"
        ]
    },
    {
        name: "Turon with Langka",
        category: "Food",
        patterns: [
            "TURONWITHLANGKA",
            "TURONLANGKA"
        ]
    },
    {
        name: "Ariel Detergent Powder Sunrise Fresh 1.4kg",
        category: "Groceries",
        patterns: [
            "ARIELDETPSUN14",
            "ARIELDETPSUN1",
            "ARIELDETERGENTPOWDER",
            "ARIELSUNRISE"
        ]
    },
    {
        name: "Palmolive Pink Intensive Moisture 400ml",
        category: "Groceries",
        patterns: [
            "PALPNKINTNSVEMS400",
            "PALPINKINTENSIVE400",
            "PALMOLIVEPINK400"
        ]
    },
    {
        name: "Cream Silk Conditioner 180ml",
        category: "Groceries",
        patterns: [
            "CREAMSILKCON180",
            "CREAMSIKCON180",
            "CREAMSILKCONDITIONER180",
            "CREAMSILKCON"
        ]
    },
    {
        name: "Surf Fabric Conditioner Luxury Perfume 720ml",
        category: "Groceries",
        patterns: [
            "SURFFCLUXPERF720",
            "SURFFABRICCONDITIONER720",
            "SURFLUXPERF720"
        ]
    },
    {
        name: "Maya All-Purpose Flour 2kg",
        category: "Groceries",
        patterns: [
            "MAYAAPFLOUR2K",
            "MAYAALLPURPOSEFLOUR",
            "MAYAAPFLOUR"
        ]
    },
    {
        name: "Silver Swan Vinegar 1L",
        category: "Groceries",
        patterns: [
            "SSWANSUKAP1LT",
            "SSWANSUKA1LT",
            "SILVERSWANVINEGAR",
            "SILVERSWANSUKA"
        ]
    },
    {
        name: "Maggi Magic Sarap",
        category: "Groceries",
        patterns: [
            "MAGGMAGICSARAP",
            "MAGGIMAGICSARAP",
            "MAGIC SARAP"
        ]
    },
    {
        name: "Ajinomoto MSG 100g",
        category: "Groceries",
        patterns: [
            "AJINOMOTOMSG100",
            "JMNOMAT0MSG100",
            "JMNOMATOMSG100",
            "JINOMOTOMSG100"
        ]
    },
    {
        name: "SM Bonus Sugar 1kg",
        category: "Groceries",
        patterns: [
            "SMBONUSSUGAR1K",
            "SMBONUSSUGAR"
        ]
    },
    {
        name: "SM Bonus Brown Sugar 1kg",
        category: "Groceries",
        patterns: [
            "SMBRWNSGAR1K",
            "SMBROWNSUGAR1K",
            "SMBROWNSUGAR"
        ]
    },
    {
        name: "Purefoods Luncheon Meat Chicken 360g",
        category: "Groceries",
        patterns: [
            "PFLMEATCHIX360",
            "PFLMEATCHIX360G",
            "PUREFOODSLUNCHEONMEATCHICKEN",
            "LMEATCHIX360"
        ]
    },
    {
        name: "555 Sardines Spanish Style 155g",
        category: "Groceries",
        patterns: [
            "555SARDSPANSH155",
            "555SARDSPANISH155",
            "555SARDINESSPANISH",
            "SARDSPANSH155"
        ]
    },
    {
        name: "Whole Wheat Bread 600g",
        category: "Groceries",
        patterns: [
            "WHLWHEAT600",
            "WHOLEWHEAT600",
            "WHLWHEAT"
        ]
    },
    {
        name: "Oishi Prawn Crunch 120g",
        category: "Food",
        patterns: [
            "OISHIPONCRUNC120G",
            "OISHIPRAWNCRUNCH120",
            "PONCRUNC120"
        ]
    },
    {
        name: "Oishi Pillows Party Pack 170g",
        category: "Food",
        patterns: [
            "OISHIPLOWPARTY170G",
            "OISHIPILLOWPARTY170",
            "PLOWPARTY170"
        ]
    },
    {
        name: "Oishi Pillows",
        category: "Food",
        patterns: [
            "OISHIPILLOWS",
            "OISHIPILLOW",
            "PILLOWS"
        ]
    },
    {
        name: "Kopiko Creamy Coffee 10s",
        category: "Groceries",
        patterns: [
            "KOPIKOCRMCRM10T",
            "KOPIKOCREAMYCOFFEE",
            "KOPIKOCRM"
        ]
    },
    {
        name: "Kopiko Cappuccino 25g 10s",
        category: "Groceries",
        patterns: [
            "KOPIKOCAP25G10S",
            "KOPIKOCAPPUCCINO",
            "KOPIKOCAP"
        ]
    },
    {
        name: "Great Taste White Coffee",
        category: "Groceries",
        patterns: [
            "GRTTSTWHT",
            "GREATTASTEWHITE",
            "GRTTSTWHITE"
        ]
    },
    {
        name: "Jack 'n Jill Chiz Curls 155g",
        category: "Food",
        patterns: [
            "JJCHIZCUR155G",
            "JACKNJILLCHIZCURLS",
            "CHIZCUR155"
        ]
    },
    {
        name: "Jack 'n Jill Piattos 85g",
        category: "Food",
        patterns: [
            "JJPIATTOS85G",
            "PIATTOS85G",
            "PIATTOS85"
        ]
    },
    {
        name: "Jack 'n Jill Mr. Chips 26g",
        category: "Food",
        patterns: [
            "JJMRCHIPS26G",
            "MRCHIPS26G",
            "MRCHIPS"
        ]
    },
    {
        name: "Nestlé KitKat 17g x 6",
        category: "Food",
        patterns: [
            "NESTLEKITKAT17GX6",
            "KITKAT17GX6",
            "KITKAT17G"
        ]
    },
    {
        name: "Fita Crackers Rainbow",
        category: "Groceries",
        patterns: [
            "FITACRCKRSRNBOW",
            "FITACRACKERSRAINBOW",
            "FITARAINBOW"
        ]
    },
    {
        name: "Quaker Oat Overload White Chocolate",
        category: "Groceries",
        patterns: [
            "QUAKEOVRLOADWHTCHO",
            "QUAKEROVERLOADWHITECHOCO",
            "OVRLOADWHTCHO"
        ]
    },
    {
        name: "Oishi Cheese Snack Tubs 23g",
        category: "Food",
        patterns: [
            "OISHICHEESE2TUBS23G",
            "OISHICHEESETUBS23G",
            "CHEESETUBS23G"
        ]
    },
    {
        name: "Fudgee Barr Chocolate 40g x 10",
        category: "Food",
        patterns: [
            "FUGDEECHO40GX10",
            "FUDGEECHO40GX10",
            "FUDGEECHOCOLATE"
        ]
    },
    {
        name: "Yvonnie Banana Chips",
        category: "Food",
        patterns: [
            "YVONNYTIFFBNNCHIPS",
            "YVONNIEBANANACHIPS",
            "BANANACHIPS"
        ]
    },
    {
        name: "Magic Flakes Butter Cream",
        category: "Groceries",
        patterns: [
            "MAGICFLAKESBCREAM",
            "MAGICFLAKESBUTTERCREAM",
            "MAGICFLAKES"
        ]
    },
    {
        name: "Rebisco Crackers",
        category: "Groceries",
        patterns: [
            "REBISCOCRM",
            "REBISCOCRACKERS",
            "REBISCO"
        ]
    },
    {
        name: "4D Sour Strawberry Candy",
        category: "Food",
        patterns: [
            "4DSOURSTRW",
            "4DSOURSTRAWBERRY"
        ]
    },
    {
        name: "4D Sour Rainbow Candy",
        category: "Food",
        patterns: [
            "4DSOURRAINBOW",
            "4DSOURRSRIBON",
            "SOURRAINBOW"
        ]
    },
    {
        name: "Tang Powder Mango 19g",
        category: "Groceries",
        patterns: [
            "TANGPWDRMANGO19G",
            "TANGPOWDERMANGO",
            "TANGMANGO"
        ]
    },
    {
        name: "Cream Silk Standout Pink",
        category: "Groceries",
        patterns: [
            "CRMSIKONSTR8PINK",
            "CREAMSILKSTANDOUTPINK",
            "CREAMSILKPINK"
        ]
    },
    {
        name: "Chupa Chups Lollipop",
        category: "Food",
        patterns: [
            "CHUPACHUPS",
            "CHUPACHUPSMILDYOP",
            "LOLLIPOP"
        ]
    },
    {
        name: "C2 Green Tea 455ml",
        category: "Food",
        patterns: [
            "C2GREENTEA455ML",
            "C2GTEA455ML",
            "C2GTEA455"
        ]
    },
    {
        name: "C2 Green Tea Plain 500ml",
        category: "Food",
        patterns: [
            "C2GTEAPLAIN500ML",
            "C2GREENTEAPLAIN500",
            "C2PLAIN500"
        ]
    },
    {
        name: "C2 Peach 500ml",
        category: "Food",
        patterns: [
            "C2PEACH500ML",
            "C2PEACH500"
        ]
    },
    {
        name: "C2 Green Tea Lemon 500ml",
        category: "Food",
        patterns: [
            "C2GTEALEMON500ML",
            "C2GREENTEALEMON500",
            "C2LEMON500"
        ]
    },
    {
        name: "Bioderm Soap",
        category: "Groceries",
        patterns: [
            "BIODERM",
            "BIODERMSOAP"
        ]
    },
    {
        name: "Pride Powder 400g",
        category: "Groceries",
        patterns: [
            "PRIDEPOW400",
            "PRIDEPOWDER400",
            "PRIDEPOW"
        ]
    },
    {
        name: "Funsize Cheese Rings",
        category: "Food",
        patterns: [
            "FUNSIZECHEESE",
            "CHEESERINGS"
        ]
    },
    {
        name: "Funsize Spaghetti 230g",
        category: "Groceries",
        patterns: [
            "FUNSIZESPAG230G",
            "FUNSIZESPAGHETTI230",
            "SPAGHETTI230"
        ]
    },
    {
        name: "Tomato Sauce",
        category: "Groceries",
        patterns: [
            "TOMATOSAUCE",
            "TOMATOS"
        ]
    },
    {
        name: "Oishi Bread Pan Toasted Bread",
        category: "Food",
        patterns: [
            "OISHIBREADPAN",
            "BREADPAN"
        ]
    },
    {
        name: "Oishi Bread Chips 25g",
        category: "Food",
        patterns: [
            "OISHIBREAD25G",
            "BREADCHIPS25G"
        ]
    },
    {
        name: "Oishi Fishda Crackers",
        category: "Food",
        patterns: [
            "OISHIFISHDA",
            "FISHDA"
        ]
    },
    {
        name: "Oreo Cookies",
        category: "Food",
        patterns: [
            "OREO"
        ]
    },
    {
        name: "Corned Beef",
        category: "Groceries",
        patterns: [
            "CORNEDBEEF",
            "CBEEF"
        ]
    },
    {
        name: "Rin Detergent Cake",
        category: "Groceries",
        patterns: [
            "RINDETERGENT",
            "RINCAKE"
        ]
    },
    {
        name: "Dried Mangoes 200g",
        category: "Food",
        patterns: [
            "DRIEDMANGOES200G",
            "DRIEDMANGOES",
            "DRIEDMANGO"
        ]
    }
];

const SAVEMORE_GENERIC_RULES = [
    {
        name: "Rice",
        category: "Groceries",
        words: ["RICE", "BIGAS", "JASMINE", "DINORADO", "SINANDOMENG"]
    },
    {
        name: "Bread",
        category: "Groceries",
        words: ["BREAD", "LOAF", "TASTY"]
    },
    {
        name: "Eggs",
        category: "Groceries",
        words: ["EGG", "EGGS", "ITLOG"]
    },
    {
        name: "Chicken",
        category: "Groceries",
        words: ["CHICKEN", "CHIX", "MANOK"]
    },
    {
        name: "Pork",
        category: "Groceries",
        words: ["PORK", "LIEMPO", "KASIM"]
    },
    {
        name: "Beef",
        category: "Groceries",
        words: ["BEEF"]
    },
    {
        name: "Fish",
        category: "Groceries",
        words: ["FISH", "BANGUS", "TILAPIA", "TUNA FRESH"]
    },
    {
        name: "Milk",
        category: "Groceries",
        words: ["MILK", "BEARBRAND", "ALASKA"]
    },
    {
        name: "Cooking Oil",
        category: "Groceries",
        words: ["COOKINGOIL", "OIL", "MANTIKA"]
    },
    {
        name: "Vinegar",
        category: "Groceries",
        words: ["VINEGAR", "SUKA"]
    },
    {
        name: "Soy Sauce",
        category: "Groceries",
        words: ["SOYSAUCE", "TOYO"]
    },
    {
        name: "Sugar",
        category: "Groceries",
        words: ["SUGAR", "SGAR", "ASUKAL"]
    },
    {
        name: "Toothpaste",
        category: "Groceries",
        words: ["TOOTHPASTE", "TPSTE"]
    },
    {
        name: "Detergent Powder",
        category: "Groceries",
        words: ["DETERGENT", "DETPSUN", "POWDER"]
    },
    {
        name: "Fabric Conditioner",
        category: "Groceries",
        words: ["FABRICCONDITIONER", "FABCON", "FCLUXPERF"]
    },
    {
        name: "Conditioner",
        category: "Groceries",
        words: ["CONDITIONER"]
    },
    {
        name: "Tissue",
        category: "Groceries",
        words: ["TISSUE", "TSU"]
    },
    {
        name: "Chocolate",
        category: "Food",
        words: ["CHOCOLATE", "CHOCO"]
    },
    {
        name: "Candy",
        category: "Food",
        words: ["CANDY"]
    },
    {
        name: "Coffee",
        category: "Groceries",
        words: ["COFFEE"]
    }
];

function parseKabalikatReceipt(rawText, receiptImage = "") {
    const normalizedText = normalizeReceiptText(rawText);
    const store = detectReceiptStore(normalizedText);
    const receiptNumber = extractReceiptNumber(normalizedText);
    const receiptDate = extractReceiptDate(normalizedText);

    let items = [];

    if (store.id === "savemore") {
        items = parseSavemoreItems(rawText, receiptImage);
    } else if (store.id === "alfamart") {
        items = parseAlfamartItems(rawText, receiptImage);
    } else {
        items = parseGenericReceiptItems(rawText, store, receiptImage);
    }

    const subtotal = items.reduce((sum, item) => sum + Number(item.price || 0), 0);

    return {
        store,
        receiptNumber,
        receiptDate,
        items,
        subtotal
    };
}

function parseSavemoreItems(rawText, receiptImage = "") {
    const lines = mergeBrokenItemLines(splitReceiptLines(rawText));
    const itemLines = getSavemoreItemSection(lines);
    const items = [];

    itemLines.forEach(line => {
        const parsed = parseSavemoreItemLine(line);

        if (!parsed) return;

        const decoded = decodeSavemoreProduct(parsed.name);

        if (shouldIgnoreReceiptLine(decoded.name)) return;

        items.push({
            id: createParserId("item"),
            quantity: parsed.quantity,
            name: decoded.name,
            rawName: parsed.name,
            unitPrice: parsed.unitPrice,
            price: parsed.price,
            category: decoded.category,
            receiptImage
        });
    });

    const cleanedItems = removeDuplicateItems(items);

    if (cleanedItems.length === 0) {
        const total = extractTotalAmount(rawText);

        if (total > 0) {
            cleanedItems.push({
                id: createParserId("item"),
                quantity: 1,
                name: "Scanned Savemore Receipt Total",
                rawName: "Scanned Savemore Receipt Total",
                unitPrice: total,
                price: total,
                category: "Groceries",
                receiptImage
            });
        }
    }

    return cleanedItems.slice(0, 100);
}

function decodeSavemoreProduct(rawName) {
    const key = normalizeProductKey(rawName);

    const detailMatch = matchDetailedSavemoreProduct(key);

    if (detailMatch) {
        return detailMatch;
    }

    const genericMatch = matchGenericSavemoreProduct(key);

    if (genericMatch) {
        return genericMatch;
    }

    return {
        name: cleanSavemoreProductName(rawName),
        category: autoCategoryFromText(rawName, "savemore")
    };
}

function matchDetailedSavemoreProduct(key) {
    let bestMatch = null;
    let bestScore = 0;

    for (const product of SAVEMORE_DETAIL_RULES) {
        for (const pattern of product.patterns) {
            const patternKey = normalizeProductKey(pattern);

            let score = 0;

            if (key.includes(patternKey)) {
                score = 1;
            } else if (patternKey.includes(key) && key.length >= 8) {
                score = 0.92;
            } else {
                score = slidingSimilarity(key, patternKey);
            }

            if (score > bestScore) {
                bestScore = score;
                bestMatch = product;
            }
        }
    }

    if (bestScore >= 0.72) {
        return {
            name: bestMatch.name,
            category: bestMatch.category
        };
    }

    return null;
}

function matchGenericSavemoreProduct(key) {
    for (const product of SAVEMORE_GENERIC_RULES) {
        for (const word of product.words) {
            const wordKey = normalizeProductKey(word);

            if (wordKey.length < 4) continue;

            if (key.includes(wordKey)) {
                return {
                    name: product.name,
                    category: product.category
                };
            }
        }
    }

    return null;
}

function getSavemoreItemSection(lines) {
    const itemLines = [];
    let insideItemArea = false;

    for (const line of lines) {
        const upper = line.toUpperCase();

        if (
            upper.includes("SALES INVOICE") ||
            upper.includes("SI#") ||
            upper.includes("S1#") ||
            upper.includes("TRANS#") ||
            upper.includes("TRANSH")
        ) {
            insideItemArea = true;
            continue;
        }

        if (
            upper.includes("TOTAL DUE") ||
            upper.includes("SUBTOTAL") ||
            upper.includes("VATABLE") ||
            upper.includes("VAT AMOUNT") ||
            upper.includes("ZERO-RATED") ||
            upper.includes("VAT-EXEMPT") ||
            upper.includes("CUST NAME") ||
            upper.includes("CUSTOMER") ||
            upper.includes("BAGGER") ||
            upper.includes("CASH") ||
            upper.includes("CHANGE")
        ) {
            if (itemLines.length > 0) break;
        }

        if (looksLikeSavemoreItemLine(line)) {
            insideItemArea = true;
            itemLines.push(line);
        } else if (insideItemArea && looksLikeSavemoreItemContinuation(line)) {
            itemLines.push(line);
        }
    }

    return itemLines;
}

function looksLikeSavemoreItemLine(line) {
    const clean = String(line || "").trim();

    if (!/^\d{1,3}\s*/.test(clean)) return false;
    if (!hasEndingPrice(clean)) return false;

    const upper = clean.toUpperCase();

    if (
        upper.includes("TOTAL") ||
        upper.includes("CASH") ||
        upper.includes("CHANGE") ||
        upper.includes("VAT") ||
        upper.includes("CARD") ||
        upper.includes("ORDER") ||
        upper.includes("AUTH") ||
        upper.includes("ITEM(S)")
    ) {
        return false;
    }

    return true;
}

function looksLikeSavemoreItemContinuation(line) {
    const clean = String(line || "").trim();

    if (!hasEndingPrice(clean)) return false;
    if (/^\d{1,3}\s+ITEM/i.test(clean)) return false;

    return /^\d{1,3}\s*[A-Za-z#]/.test(clean);
}

function parseSavemoreItemLine(line) {
    let cleanLine = fixCommonSavemoreOcrLine(String(line || ""))
        .replace(/[₱]/g, "")
        .replace(/[|]/g, "I")
        .replace(/\s+/g, " ")
        .trim();

    const priceMatch = cleanLine.match(/(\d{1,3}(?:,\d{3})*\.\d{2}|\d{1,6}[.,]\d{2})\s*$/);

    if (!priceMatch) return null;

    const price = parseMoney(priceMatch[1]);

    if (isNaN(price) || price <= 0) return null;

    let leftSide = cleanLine.slice(0, priceMatch.index).trim();

    const qtyMatch = leftSide.match(/^(\d{1,3})(?:\s+|(?=[A-Za-z#]))(.+)$/);

    if (!qtyMatch) return null;

    const quantity = Number(qtyMatch[1]);
    let productText = qtyMatch[2].trim();
    let unitPrice = null;

    const unitPriceMatch = productText.match(/@\s*(\d{1,3}(?:,\d{3})*\.\d{2}|\d{1,6}(?:[.,]\d{2})?)/);

    if (unitPriceMatch) {
        unitPrice = parseMoney(unitPriceMatch[1]);
        productText = productText.replace(/@\s*\d{1,3}(?:,\d{3})*\.\d{2}/g, "");
        productText = productText.replace(/@\s*\d{1,6}(?:[.,]\d{2})?/g, "");
    }

    productText = removeTrailingReceiptCodes(productText);

    productText = productText
        .replace(/^#+/, "")
        .replace(/\*+/g, "")
        .replace(/\s+#\d{1,3}$/i, "")
        .replace(/\s+/g, " ")
        .trim();

    if (!productText || productText.length < 2) return null;

    return {
        quantity: isNaN(quantity) || quantity <= 0 ? 1 : quantity,
        name: productText,
        unitPrice,
        price
    };
}

function mergeBrokenItemLines(lines) {
    const merged = [];

    for (let i = 0; i < lines.length; i++) {
        const current = String(lines[i] || "").trim();
        const next = String(lines[i + 1] || "").trim();

        const startsLikeItem = /^\d{1,3}\s*[A-Za-z#]/.test(current);
        const currentHasPrice = hasEndingPrice(current);
        const nextIsPrice = /^\d{1,6}[.,]\d{2}$/.test(next);

        if (startsLikeItem && !currentHasPrice && nextIsPrice) {
            merged.push(`${current} ${next}`);
            i++;
        } else {
            merged.push(current);
        }
    }

    return merged;
}

function hasEndingPrice(line) {
    return /(\d{1,3}(?:,\d{3})*\.\d{2}|\d{1,6}[.,]\d{2})\s*$/.test(String(line || ""));
}

function fixCommonSavemoreOcrLine(line) {
    return String(line || "")
        .replace(/Item\(s\)/gi, "Item(s)")
        .replace(/ltem\(s\)/gi, "Item(s)")
        .replace(/Php/gi, "PHP")
        .replace(/Femme\s*Tsu/gi, "FemmeTsu")
        .replace(/Femme\s*TSU/gi, "FemmeTsu")
        .replace(/Mysan\s*Sky\s*Flakes/gi, "Mysan SkyFlakes")
        .replace(/MYSAN\s*SkyFlakes/gi, "Mysan SkyFlakes")
        .replace(/Nissin\s*Eggnog\s*Reg/gi, "NissinEggnogReg")
        .replace(/Glee\s*Gr\s*Tea\s*Tpste/gi, "GleeGrTeaTpste")
        .replace(/Del\s*Monte\s*Pt\s*Crspr/gi, "DelMontePtCrspr")
        .replace(/GAR\s*White\s*Bread/gi, "GAR WhiteBread")
        .replace(/Whl\s*Wheat/gi, "WhlWheat")
        .replace(/Ariel\s*Det\s*P\s*Sun/gi, "ArielDetPSun")
        .replace(/Cream\s*Silk\s*Con/gi, "CreamsilkCon")
        .replace(/Cream\s*SiK\s*Con/gi, "CreamsilkCon")
        .replace(/Surf\s*FC\s*Lux\s*Perf/gi, "SurfFCLuxPerf")
        .replace(/Magg\s*Magic\s*Sarap/gi, "MaggMagicSarap")
        .replace(/SM\s*BONUS\s*SUGAR/gi, "SMBONUSSUGAR")
        .replace(/SM\s*BRWN\s*SGAR/gi, "SMBRWNSGAR")
        .replace(/PF\s*LMeat\s*Chix/gi, "PFLMeatChix")
        .replace(/555\s*Sard\s*Spansh/gi, "555SardSpansh")
        .replace(/GRT\s*TST\s*WHT/gi, "GrtTstWht")
        .replace(/JJ\s*Chiz\s*Cur/gi, "JJChizCur")
        .replace(/JJ\s*Mr\.?\s*Chips/gi, "JJMrChips");
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

function cleanSavemoreProductName(name) {
    let clean = String(name || "")
        .replace(/@\s*\d{1,6}(?:[.,]\d{2})?/g, "")
        .replace(/[^a-zA-Z0-9\s/.,&'()-]/g, "")
        .replace(/\s+/g, " ")
        .trim();

    clean = splitCompactText(clean);

    const replacements = [
        [/Femme\s*Tsu/gi, "Femme Tissue"],
        [/Tsu/gi, "Tissue"],
        [/2\s*Ply/gi, "2-Ply"],
        [/Chix/gi, "Chicken"],
        [/Reg/gi, "Regular"],
        [/Tpste/gi, "Toothpaste"],
        [/Gr\s*Tea/gi, "Green Tea"],
        [/Det\s*P\s*Sun/gi, "Detergent Powder Sunrise"],
        [/Creamsilk/gi, "Cream Silk"],
        [/CreamSiK/gi, "Cream Silk"],
        [/Con\b/gi, "Conditioner"],
        [/FCLuxPerf/gi, "Fabric Conditioner Luxury Perfume"],
        [/AP\s*Flour/gi, "All-Purpose Flour"],
        [/Suka/gi, "Vinegar"],
        [/SGAR/gi, "Sugar"],
        [/BRWN/gi, "Brown"],
        [/LMeat/gi, "Luncheon Meat"],
        [/PF\b/gi, "Purefoods"],
        [/Sard/gi, "Sardines"],
        [/Spansh/gi, "Spanish"],
        [/WhlWheat/gi, "Whole Wheat"],
        [/GrtTst/gi, "Great Taste"],
        [/Wht/gi, "White"],
        [/Crm/gi, "Cream"],
        [/Chiz/gi, "Cheese"],
        [/Cur/gi, "Curls"],
        [/Crckrs/gi, "Crackers"],
        [/RnBow/gi, "Rainbow"],
        [/Ovrload/gi, "Overload"],
        [/Cho/gi, "Chocolate"],
        [/Pwdr/gi, "Powder"],
        [/Strw/gi, "Strawberry"],
        [/Mildyop/gi, "Lollipop"]
    ];

    replacements.forEach(([pattern, value]) => {
        clean = clean.replace(pattern, value);
    });

    return titleCaseProduct(clean);
}

function parseGenericReceiptItems(rawText, store, receiptImage = "") {
    const lines = splitReceiptLines(rawText);
    const items = [];

    lines.forEach(line => {
        const parsed = parseGenericItemLine(line);

        if (!parsed) return;
        if (shouldIgnoreReceiptLine(parsed.name)) return;

        items.push({
            id: createParserId("item"),
            quantity: parsed.quantity,
            name: cleanProductName(parsed.name),
            rawName: parsed.name,
            unitPrice: parsed.unitPrice,
            price: parsed.price,
            category: autoCategoryFromText(parsed.name, store.id),
            receiptImage
        });
    });

    if (items.length === 0) {
        const total = extractTotalAmount(rawText);

        if (total > 0) {
            items.push({
                id: createParserId("item"),
                quantity: 1,
                name: "Scanned Receipt Total",
                rawName: "Scanned Receipt Total",
                unitPrice: total,
                price: total,
                category: store.id === "mercury" ? "Medicine" : "Groceries",
                receiptImage
            });
        }
    }

    return items.slice(0, 60);
}

function parseGenericItemLine(line) {
    const cleanLine = String(line || "")
        .replace(/[₱]/g, "")
        .replace(/\s+/g, " ")
        .trim();

    const priceMatch = cleanLine.match(/(\d{1,3}(?:,\d{3})*\.\d{2}|\d{1,6}[.,]\d{2})\s*$/);

    if (!priceMatch) return null;

    const price = parseMoney(priceMatch[1]);

    if (isNaN(price) || price <= 0) return null;

    let leftSide = cleanLine.slice(0, priceMatch.index).trim();

    const qtyMatch = leftSide.match(/^(\d{1,3})(?:\s+|(?=[A-Za-z#]))(.+)$/);

    let quantity = 1;

    if (qtyMatch) {
        quantity = Number(qtyMatch[1]);
        leftSide = qtyMatch[2].trim();
    }

    let unitPrice = null;

    const unitPriceMatch = leftSide.match(/@\s*(\d{1,3}(?:,\d{3})*\.\d{2}|\d{1,6}(?:[.,]\d{2})?)/);

    if (unitPriceMatch) {
        unitPrice = parseMoney(unitPriceMatch[1]);
        leftSide = leftSide.replace(/@\s*\d{1,3}(?:,\d{3})*\.\d{2}/g, "");
        leftSide = leftSide.replace(/@\s*\d{1,6}(?:[.,]\d{2})?/g, "");
    }

    leftSide = removeTrailingReceiptCodes(leftSide).trim();

    if (!leftSide || leftSide.length < 2) return null;

    return {
        quantity: isNaN(quantity) || quantity <= 0 ? 1 : quantity,
        name: leftSide,
        unitPrice,
        price
    };
}

function detectReceiptStore(normalizedText) {
    const comparableText = normalizeProductKey(normalizedText);

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
            const key = normalizeProductKey(keyword);

            if (comparableText.includes(key)) {
                score += key.length + 10;
            } else {
                const similarity = slidingSimilarity(comparableText.slice(0, 450), key);

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

function splitReceiptLines(rawText) {
    return String(rawText || "")
        .split(/\n+/)
        .map(line => line.trim())
        .filter(line => line.length > 0);
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
        "ITEM(S)"
    ];

    return ignored.some(word => upper.includes(word));
}

function autoCategoryFromText(text, storeId = "") {
    const key = normalizeProductKey(text);

    const medicineWords = ["MED", "PARACETAMOL", "BIOGESIC", "VITAMIN", "CAPSULE", "TABLET", "SYRUP", "ALCOHOL", "MASK"];
    const foodWords = ["MEAL", "BURGER", "HOTDOG", "COFFEE", "SANDWICH", "FRIES", "COKE", "JUICE", "SPRITE", "CHIPS", "CANDY", "CHOCOLATE", "KITKAT", "OISHI", "PIATTOS", "CHUPA", "TURON"];
    const groceryWords = ["RICE", "MILK", "BREAD", "NOODLES", "SARDINES", "SOAP", "SHAMPOO", "DETERGENT", "TISSUE", "SUGAR", "VINEGAR", "MEAT", "FLOUR", "CONDITIONER"];

    if (medicineWords.some(word => key.includes(normalizeProductKey(word)))) return "Medicine";
    if (foodWords.some(word => key.includes(normalizeProductKey(word)))) return "Food";
    if (groceryWords.some(word => key.includes(normalizeProductKey(word)))) return "Groceries";

    if (storeId === "mercury") return "Medicine";
    if (storeId === "seveneleven") return "Food";
    if (["savemore", "puregold", "alfamart"].includes(storeId)) return "Groceries";

    return "Others";
}

function cleanProductName(name) {
    return titleCaseProduct(
        splitCompactText(
            String(name || "")
                .replace(/@\s*\d{1,6}(?:[.,]\d{2})?/g, "")
                .replace(/[^a-zA-Z0-9\s/.,&'()-]/g, "")
                .replace(/\s+/g, " ")
                .trim()
        )
    );
}

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

function normalizeProductKey(text) {
    return String(text || "")
        .toUpperCase()
        .replace(/0/g, "O")
        .replace(/1/g, "I")
        .replace(/5/g, "S")
        .replace(/8/g, "B")
        .replace(/[^A-Z0-9]/g, "");
}

function splitCompactText(text) {
    return String(text || "")
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/([A-Za-z])(\d)/g, "$1 $2")
        .replace(/(\d)([A-Za-z])/g, "$1 ")
        .replace(/\s+/g, " ")
        .trim();
}

function titleCaseProduct(text) {
    return String(text || "")
        .toLowerCase()
        .replace(/\b[a-z]/g, letter => letter.toUpperCase())
        .replace(/\bSm\b/g, "SM")
        .replace(/\bPf\b/g, "Purefoods")
        .replace(/\bPhp\b/g, "PHP")
        .replace(/\bKg\b/g, "kg")
        .replace(/\bMl\b/g, "ml")
        .replace(/\bG\b/g, "g")
        .replace(/\bL\b/g, "L")
        .replace(/\bC2\b/g, "C2")
        .replace(/\b4d\b/gi, "4D")
        .replace(/\bJj\b/g, "Jack 'n Jill");
}

function removeDuplicateItems(items) {
    const seen = new Set();

    return items.filter(item => {
        const key = `${normalizeProductKey(item.rawName || item.name)}-${item.quantity}-${item.price}`;

        if (seen.has(key)) return false;

        seen.add(key);
        return true;
    });
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

window.KABALIKAT_CATEGORIES = KABALIKAT_CATEGORIES;
window.KABALIKAT_STORES = KABALIKAT_STORES;
window.parseKabalikatReceipt = parseKabalikatReceipt;

const ALFAMART_DETAIL_RULES = [
    {
        name: "Selecta Ice Cream Cookies and Cream 1.5L",
        category: "Food",
        patterns: [
            "SELICKSSCCRMV15L",
            "SELICCKSCCRMV15L",
            "SELECTAICECREAMCOOKIESCREAM",
            "CKSCCRMV15L"
        ]
    },
    {
        name: "Selecta 3-in-1 Choco Keso Ube",
        category: "Food",
        patterns: [
            "SEL3N1CHOCOKSOUBE1",
            "SELECTA3N1CHOCOKESOUBE",
            "3N1CHOCOKSOUBE",
            "CHOCOKSOUBE"
        ]
    }
];

function parseAlfamartItems(rawText, receiptImage = "") {
    const lines = splitReceiptLines(rawText);
    const itemLines = getAlfamartItemSection(lines);
    const items = [];

    itemLines.forEach(line => {
        const parsed = parseAlfamartItemLine(line);

        if (!parsed) return;
        if (shouldIgnoreReceiptLine(parsed.name)) return;

        const decoded = decodeAlfamartProduct(parsed.name);

        items.push({
            id: createParserId("item"),
            quantity: 1,
            name: decoded.name,
            rawName: parsed.name,
            unitPrice: parsed.price,
            price: parsed.price,
            category: decoded.category,
            receiptImage
        });
    });

    if (items.length === 0) {
        const total = extractTotalAmount(rawText);

        if (total > 0) {
            items.push({
                id: createParserId("item"),
                quantity: 1,
                name: "Scanned Alfamart Receipt Total",
                rawName: "Scanned Alfamart Receipt Total",
                unitPrice: total,
                price: total,
                category: "Groceries",
                receiptImage
            });
        }
    }

    return items.slice(0, 60);
}

function getAlfamartItemSection(lines) {
    const itemLines = [];
    let insideItemArea = false;

    for (const line of lines) {
        const upper = String(line || "").toUpperCase();

        if (
            upper.includes("THIS SERVES AS YOUR SALES INVOICE") ||
            upper.includes("SALES INVOICE")
        ) {
            insideItemArea = true;
            continue;
        }

        if (
            upper.includes("DISCOUNT") ||
            upper.includes("SUBTOTAL") ||
            upper.includes("TOTAL") ||
            upper.includes("CASH") ||
            upper.includes("CHANGE") ||
            upper.includes("ITEM/S PURCHASED") ||
            upper.includes("VATABLE") ||
            upper.includes("VAT ") ||
            upper.includes("CUSTOMER")
        ) {
            if (itemLines.length > 0) break;
        }

        if (insideItemArea && looksLikeAlfamartItemLine(line)) {
            itemLines.push(line);
        }
    }

    return itemLines;
}

function looksLikeAlfamartItemLine(line) {
    const clean = String(line || "").trim();
    const upper = clean.toUpperCase();

    if (!hasEndingPrice(clean)) return false;
    if (upper.includes("DISCOUNT")) return false;
    if (upper.includes("SUBTOTAL")) return false;
    if (upper.includes("TOTAL")) return false;
    if (upper.includes("CASH")) return false;
    if (upper.includes("CHANGE")) return false;
    if (upper.includes("VAT")) return false;

    return /[A-Z]{2,}/i.test(clean);
}

function parseAlfamartItemLine(line) {
    const cleanLine = String(line || "")
        .replace(/[₱]/g, "")
        .replace(/\s+/g, " ")
        .trim();

    const priceMatch = cleanLine.match(/(-?\d{1,3}(?:,\d{3})*\.\d{2}|-?\d{1,6}[.,]\d{2})\s*$/);

    if (!priceMatch) return null;

    const price = parseMoney(priceMatch[1]);

    if (isNaN(price) || price <= 0) return null;

    const productText = cleanLine
        .slice(0, priceMatch.index)
        .replace(/\s+/g, " ")
        .trim();

    if (!productText || productText.length < 2) return null;

    return {
        name: productText,
        price
    };
}

function decodeAlfamartProduct(rawName) {
    const key = normalizeProductKey(rawName);

    for (const product of ALFAMART_DETAIL_RULES) {
        for (const pattern of product.patterns) {
            const patternKey = normalizeProductKey(pattern);

            if (key.includes(patternKey) || slidingSimilarity(key, patternKey) >= 0.72) {
                return {
                    name: product.name,
                    category: product.category
                };
            }
        }
    }

    return {
        name: cleanAlfamartProductName(rawName),
        category: autoCategoryFromText(rawName, "alfamart")
    };
}

function cleanAlfamartProductName(name) {
    let clean = String(name || "")
        .replace(/SEL\b/gi, "Selecta")
        .replace(/\bIC\b/gi, "Ice Cream")
        .replace(/CKSCCRMV/gi, "Cookies and Cream")
        .replace(/3N1/gi, "3-in-1")
        .replace(/CHOCO/gi, "Choco")
        .replace(/\bKSO\b/gi, "Keso")
        .replace(/UBE1/gi, "Ube")
        .replace(/([A-Za-z])(\d)/g, "$1 $2")
        .replace(/(\d)([A-Za-z])/g, "$1 $2")
        .replace(/\s+/g, " ")
        .trim();

    return titleCaseProduct(clean);
}