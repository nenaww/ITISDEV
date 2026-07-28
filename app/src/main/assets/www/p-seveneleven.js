function parseSevenElevenItems(rawText, receiptImage = "") {
    const utils = window.ParserUtils;
    const lines = utils.splitReceiptLines(rawText);
    const items = [];
    const namesWaitingForPrices = [];

    let isInItemSection = false;
    let itemNamesClosed = false;

    for (const rawLine of lines) {

        const line = normalizeSevenElevenLine(rawLine);

        if (!line) continue;

        if (isSevenElevenItemSectionStart(line)) {

            isInItemSection = true;

            const productOnStaffLine =
                extractSevenElevenProductFromStaffLine(line);

            if (productOnStaffLine)
                namesWaitingForPrices.push(productOnStaffLine);

            continue;
        }

        if (!isInItemSection)
            continue;

        if (isSevenElevenItemSectionEnd(line)) {

            itemNamesClosed = true;

            if (namesWaitingForPrices.length === 0)
                break;

            continue;
        }

        const quantityPrice =
            parseSevenElevenQuantityPriceLine(line);

        if (quantityPrice && namesWaitingForPrices.length > 0) {

            const rawName = namesWaitingForPrices.shift();

            items.push(
                createSevenElevenItem(
                    rawName,
                    quantityPrice.totalPrice,
                    receiptImage,
                    {
                        quantity: quantityPrice.quantity,
                        unitPrice: quantityPrice.unitPrice
                    }
                )
            );

            continue;
        }

        const standalonePrice =
            parseSevenElevenStandalonePrice(line);

        if (standalonePrice > 0 && namesWaitingForPrices.length > 0) {

            const rawName = namesWaitingForPrices.shift();

            items.push(
                createSevenElevenItem(
                    rawName,
                    standalonePrice,
                    receiptImage
                )
            );

            continue;
        }

        const inlineItem =
            parseSevenElevenInlineItem(line);

        if (inlineItem) {

            items.push(
                createSevenElevenItem(
                    inlineItem.rawName,
                    inlineItem.price,
                    receiptImage,
                    {
                        quantity: inlineItem.quantity,
                        unitPrice: inlineItem.unitPrice
                    }
                )
            );

            continue;
        }

        const hasTotalMarker = /\bTOTAL\b/i.test(line);

        const productName =
            itemNamesClosed
                ? ""
                : parseSevenElevenNameOnlyLine(
                    line.replace(/\bTOTAL\s*\(\s*\d+\s*\).*$/i, "").trim()
                );

        if (productName)
            namesWaitingForPrices.push(productName);

        if (hasTotalMarker)
            itemNamesClosed = true;
    }

    /*
     * Repair case:
     *
     * NutrifamChiaSds10g
     * 19.00 X
     * Total (3)
     */

    const expectedQtyMatch = rawText.match(/TOTAL\s*\((\d+)\)/i);

    if (
        expectedQtyMatch &&
        items.length === 1 &&
        items[0].quantity === 1
    ) {

        const expectedQty = Number(expectedQtyMatch[1]);

        if (expectedQty > 1) {

            items[0].quantity = expectedQty;

            items[0].unitPrice =
                Number(items[0].unitPrice || items[0].price);

            items[0].price =
                Math.round(items[0].unitPrice * expectedQty * 100) / 100;
        }
    }

    return utils.removeDuplicateItems(items).slice(0, 60);
}

function normalizeSevenElevenLine(line) {
    return String(line || "")
        .replace(/[₱â‚±]/g, "")
        .replace(/[|]/g, "I")
        .replace(/\s+/g, " ")
        .trim();
}

function isSevenElevenItemSectionStart(line) {
    return /\b(?:STAFF|CASHIER)\s*[:#]/i.test(line);
}

function extractSevenElevenProductFromStaffLine(line) {
    const staffMatch = String(line || "").match(/\b(?:STAFF|CASHIER)\s*:\s*(.*)$/i);

    if (!staffMatch) return "";

    const trailingToken = staffMatch[1]
        .trim()
        .match(/([A-Z][A-Z0-9]*\d+[A-Z0-9]*)\s*$/i);

    return trailingToken ? trailingToken[1] : "";
}

function isSevenElevenItemSectionEnd(line) {
    return /^(?:TOTAL|SUBTOTAL|CASH|E-?PAYMENT|CHANGE|[VU]AT(?:ABLE|[_ -]?AMT|[_ -]?EXEMPT)?|ZERO[_ -]?RATED|LOYALTY|NAME|ADDRESS|TIN)\b/i.test(line);
}

function parseSevenElevenInlineItem(line) {
    if (isSevenElevenReceiptMeta(line)) return null;

    const quantityMatch = line.match(/^(.+?)\s+([0-9O]{1,5}(?:[.,][0-9O]{2}))\s*[X×*]\s*(\d{1,3})\s+([0-9O]{1,5}(?:[.,][0-9O]{2}))\s*[A-Z]?\s*$/i);

    if (quantityMatch && /[A-Z]/i.test(quantityMatch[1])) {
        const unitPrice = parseSevenElevenMoney(quantityMatch[2]);
        const quantity = Number(quantityMatch[3]);
        const totalPrice = parseSevenElevenMoney(quantityMatch[4]);

        if (unitPrice > 0 && quantity > 0 && totalPrice > 0) {
            return {
                rawName: quantityMatch[1].trim(),
                price: totalPrice,
                quantity,
                unitPrice
            };
        }
    }

    const match = line.match(/^(.+?)\s*([0-9O]{1,5}(?:[.,][0-9O]{2}))\s*[A-Z]?\s*$/i);

    if (!match || !/[A-Z]/i.test(match[1])) return null;

    const price = parseSevenElevenMoney(match[2]);

    if (!Number.isFinite(price) || price <= 0) return null;

    return {
        rawName: match[1].trim(),
        price,
        quantity: 1,
        unitPrice: price
    };
}

function parseSevenElevenQuantityPriceLine(line) {
    const match = String(line || "").match(/^([0-9O]{1,5}(?:[.,][0-9O]{2}))\s*[X×*]\s*(\d{1,3})\s+([0-9O]{1,5}(?:[.,][0-9O]{2}))\s*[A-Z]?\s*$/i);

    if (!match) return null;

    const unitPrice = parseSevenElevenMoney(match[1]);
    const quantity = Number(match[2]);
    const totalPrice = parseSevenElevenMoney(match[3]);

    if (!unitPrice || !quantity || !totalPrice) return null;

    return { unitPrice, quantity, totalPrice };
}

function parseSevenElevenStandalonePrice(line) {
    const match = String(line || "").match(/(?:^|\s)([0-9O]{1,5}(?:[.,][0-9O]{2}))\s*[A-Z]?\s*$/i);

    return match ? parseSevenElevenMoney(match[1]) : 0;
}

function parseSevenElevenMoney(value) {
    return window.ParserUtils.parseMoney(String(value || "").replace(/O/gi, "0"));
}

function parseSevenElevenNameOnlyLine(line) {
    if (isSevenElevenReceiptMeta(line)) return "";

    const quantityMatch = line.match(/^(.+?)\s+(\d{1,3})\s*$/);

    if (quantityMatch && /[A-Z]/i.test(quantityMatch[1])) {
        return quantityMatch[1].trim();
    }

    if (
        /^[A-Z][A-Z0-9 .,'&/()%-]{1,}$/i.test(line) &&
        !/\d{1,5}[.,]\d{2}/.test(line)
    ) {
        return line.trim();
    }

    return "";
}

function createSevenElevenItem(rawName, price, receiptImage, options = {}) {
    const utils = window.ParserUtils;
    const name = cleanSevenElevenProductName(rawName);
    const quantity = Number(options.quantity || 1);
    const unitPrice = Number(options.unitPrice || price);

    return {
        id: utils.createParserId("item"),
        quantity: quantity > 0 ? quantity : 1,
        name,
        rawName,
        unitPrice,
        price,
        category: utils.autoCategoryFromText(name, "seveneleven"),
        preserveOcrName: true,
        receiptImage
    };
}

function cleanSevenElevenProductName(rawName) {
    let clean = String(rawName || "")
        .replace(/R\s*C\s*COLA/gi, "RC Cola")
        .replace(/NO\s*SUGAR/gi, "No Sugar")
        .replace(/RYAL\s*TR\s*ORNGE\s*P\s*T/gi, "Royal Tru Orange PET")
        .replace(/RYAL\s*TR/gi, "Royal Tru")
        .replace(/SPRTE\s*ZR\s*SGR/gi, "Sprite Zero Sugar")
        .replace(/RYALTR/gi, "Royal Tru")
        .replace(/TRORNG/gi, "Tru Orang")
        .replace(/ORNGEPT|ORNGEP[T]?/gi, "Orange PET")
        .replace(/SUGARPET/gi, "Sugar PET")
        .replace(/RYAL/gi, "Royal")
        .replace(/\bTR\b/gi, "Tru")
        .replace(/ORNGE|ORNG/gi, "Orange")
        .replace(/\bPT\b/gi, "PET")
        .replace(/PT(?=\d)/gi, "PET")
        .replace(/SPRTE|SPRT/gi, "Sprite")
        .replace(/\bZR\b/gi, "Zero")
        .replace(/\bSGR\b/gi, "Sugar")
        .replace(/MTN?DEW/gi, "Mountain Dew")
        .replace(/COKEZERO/gi, "Coke Zero")
        .replace(/COCACOLA/gi, "Coca Cola")
        .replace(/(\d)O(?=M\b)/gi, (_, digit) => `${digit}0`)
        .replace(/(\d+)\s*M\s*[L1]\b/gi, "$1ml")
        .replace(/(\d+)M\b/gi, "$1ml")
        .replace(/([A-Za-z])([0-9])/g, "$1 $2")
        .replace(/([0-9])(ml|g|kg|l)\b/gi, "$1 $2")
        .replace(/\s+/g, " ")
        .trim();

    return window.ParserUtils.cleanBasicProductName(clean)
        .replace(/\bPet\b/g, "PET")
        .replace(/\bRc\b/g, "RC");
}

function isSevenElevenReceiptMeta(line) {
    return /^(?:7-?ELEVEN|PHILIPPINE|OWNED|[VU]ATREG|STORE|MIN|IN[UV]OICE|RESET|SN|STAFF|CASHIER|TOTAL|SUBTOTAL|CASH|E-?PAYMENT|CHANGE|[VU]AT|ZERO|LOYALTY|NAME|ADDRESS|TIN|BIR|PTU|HAPPY|SAVE|THIS IS)/i.test(line);
}

function looksLikeSevenElevenReceipt(rawText) {
    const text = window.ParserUtils.normalizeReceiptText(rawText);
    const hasBrand = /7\s*-?\s*ELEVE[NM]|PHILIPPINE\s+SEVEN\s+CORPORATION/.test(text);
    const hasSevenElevenLayout =
        /(?:RESET\s*[_ ]?CNT|E\s*[- ]?PAYMENT|LOYALTY\s+NO)/.test(text) &&
        /(?:IN[UV]OICE|STORE\s*#?)/.test(text);

    return hasBrand || hasSevenElevenLayout;
}

window.SevenElevenParser = {
    parse: parseSevenElevenItems,
    looksLike: looksLikeSevenElevenReceipt
};
