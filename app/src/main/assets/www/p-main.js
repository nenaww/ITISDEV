function parseKabalikatReceipt(rawText, receiptImage = "", options = {}) {
    const utils = window.ParserUtils;
    const normalizedText = utils.normalizeReceiptText(rawText);
    let store = utils.detectReceiptStore(normalizedText);

    if (
        store.id === "unknown" &&
        window.SavemoreParser &&
        typeof window.SavemoreParser.looksLike === "function" &&
        window.SavemoreParser.looksLike(rawText)
    ) {
        store = window.KABALIKAT_STORES.find(item => item.id === "savemore") || {
            id: "savemore",
            name: "Savemore",
            logo: "images/savemore.png",
            keywords: []
        };
    }

    if (
        store.id === "unknown" &&
        window.MercuryParser &&
        typeof window.MercuryParser.looksLike === "function" &&
        window.MercuryParser.looksLike(rawText)
    ) {
        store = window.KABALIKAT_STORES.find(item => item.id === "mercury") || {
            id: "mercury",
            name: "Mercury Drug",
            logo: "images/mercury.png",
            keywords: []
        };
    }

    let items = [];

    if (store.id === "savemore" && window.SavemoreParser) {
        if (options.secondaryText && typeof window.SavemoreParser.parseHybrid === "function") {
            items = window.SavemoreParser.parseHybrid(rawText, options.secondaryText, receiptImage);
        } else {
            items = window.SavemoreParser.parse(rawText, receiptImage);
        }
    } else if (store.id === "alfamart" && window.AlfamartParser) {
        items = window.AlfamartParser.parse(rawText, receiptImage);
    } else if (store.id === "mercury" && window.MercuryParser) {
        items = window.MercuryParser.parse(rawText, receiptImage);
    } else if (store.id === "puregold" && window.PuregoldParser) {
        items = window.PuregoldParser.parse(rawText, receiptImage);
    } else if (store.id === "seveneleven" && window.SevenElevenParser) {
        items = window.SevenElevenParser.parse(rawText, receiptImage);
    } else {
        items = parseGenericReceiptItems(rawText, store, receiptImage);
    }

    if (
        window.KabalikatProductMatcher &&
        typeof window.KabalikatProductMatcher.matchItems === "function"
    ) {
        items = window.KabalikatProductMatcher.matchItems(items, {
            storeId: store.id,
            storeName: store.name
        });
    }

    const subtotal = items.reduce((sum, item) => sum + Number(item.price || 0), 0);

    const isMercuryReceipt = store.id === "mercury";

    return {
        store,
        receiptNumber: isMercuryReceipt ? "-" : utils.extractReceiptNumber(rawText),
        receiptDate: isMercuryReceipt ? "-" : utils.extractReceiptDate(rawText),
        items,
        subtotal
    };
}

function parseGenericReceiptItems(rawText, store, receiptImage = "") {
    const utils = window.ParserUtils;
    const lines = utils.splitReceiptLines(rawText);
    const items = [];

    lines.forEach(line => {
        const parsed = parseGenericItemLine(line);

        if (!parsed) return;
        if (utils.shouldIgnoreReceiptLine(parsed.name)) return;

        items.push({
            id: utils.createParserId("item"),
            quantity: parsed.quantity,
            name: utils.cleanBasicProductName(parsed.name),
            rawName: parsed.name,
            unitPrice: parsed.unitPrice || calculateGenericUnitPrice(parsed.price, parsed.quantity),
            price: parsed.price,
            category: utils.autoCategoryFromText(parsed.name, store.id),
            receiptImage
        });
    });

    const cleanedItems = utils.removeDuplicateItems(items);

    if (cleanedItems.length === 0) {
        const total = utils.extractTotalAmount(rawText);

        if (total > 0) {
            cleanedItems.push({
                id: utils.createParserId("item"),
                quantity: 1,
                name: store.id === "unknown" ? "Scanned Receipt Total" : `Scanned ${store.name} Receipt Total`,
                rawName: store.id === "unknown" ? "Scanned Receipt Total" : `Scanned ${store.name} Receipt Total`,
                unitPrice: total,
                price: total,
                category: store.id === "mercury" ? "Medicine" : "Groceries",
                receiptImage
            });
        }
    }

    return cleanedItems.slice(0, 60);
}

function parseGenericItemLine(line) {
    const utils = window.ParserUtils;

    const cleanLine = String(line || "")
        .replace(/[₱]/g, "")
        .replace(/[|]/g, "I")
        .replace(/\s+/g, " ")
        .trim();

    const priceMatch = cleanLine.match(/(-?\d{1,3}(?:,\d{3})*[.,]\d{2}|-?\d{1,6}[.,]\d{2})\s*$/);

    if (!priceMatch) return null;

    const price = utils.parseMoney(priceMatch[1]);

    if (isNaN(price) || price <= 0) return null;

    let leftSide = cleanLine.slice(0, priceMatch.index).trim();
    const qtyMatch = leftSide.match(/^(\d{1,3})\s+(.+)$/);
    let quantity = 1;

    if (qtyMatch) {
        quantity = Number(qtyMatch[1]);
        leftSide = qtyMatch[2].trim();
    }

    let unitPrice = null;
    const unitPriceMatch = leftSide.match(/@\s*(\d{1,3}(?:,\d{3})*[.,]\d{2}|\d{1,6}(?:[.,]\d{2})?)/);

    if (unitPriceMatch) {
        unitPrice = utils.parseMoney(unitPriceMatch[1]);
        leftSide = leftSide.replace(/@\s*\d{1,3}(?:,\d{3})*[.,]\d{2}/g, "");
        leftSide = leftSide.replace(/@\s*\d{1,6}(?:[.,]\d{2})?/g, "");
    }

    leftSide = utils.removeTrailingReceiptCodes(leftSide)
        .replace(/^#+/, "")
        .replace(/\*+/g, "")
        .replace(/\s+/g, " ")
        .trim();

    if (!leftSide || leftSide.length < 2) return null;

    return {
        quantity: isNaN(quantity) || quantity <= 0 ? 1 : quantity,
        name: leftSide,
        unitPrice,
        price
    };
}

function calculateGenericUnitPrice(totalPrice, quantity) {
    const qty = Number(quantity || 1);

    if (!qty || qty <= 0) return totalPrice;

    return Math.round((Number(totalPrice || 0) / qty) * 100) / 100;
}

window.parseKabalikatReceipt = parseKabalikatReceipt;