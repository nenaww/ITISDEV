function parseMercuryItems(rawText, receiptImage = "") {
    const utils = window.ParserUtils;
    const lines = mergeMercuryItemBlocks(utils.splitReceiptLines(rawText));
    const items = [];

    for (let index = 0; index < lines.length; index++) {
        const currentLine = normalizeMercuryLine(lines[index]);

        if (!currentLine) continue;
        if (isMercuryHeaderOrFinancialLine(currentLine)) continue;

        const parsedProduct = parseMercuryProductLine(currentLine);

        if (!parsedProduct) continue;

        const nextLine = normalizeMercuryLine(lines[index + 1] || "");
        const quantityInfo = parseMercuryQuantityLine(nextLine);

        let quantity = 1;
        let unitPrice = parsedProduct.price;

        if (quantityInfo) {
            quantity = quantityInfo.quantity;
            unitPrice = quantityInfo.unitPrice;
            index++;
        }

        items.push({
            id: utils.createParserId("item"),
            quantity,
            name: cleanMercuryProductName(parsedProduct.name),
            rawName: parsedProduct.name,
            unitPrice,
            price: parsedProduct.price,
            category: "Medicine",
            receiptImage,
            ocrSource: "mercury-parser"
        });
    }

    return removeMercuryDuplicateItems(items).slice(0, 120);
}

function normalizeMercuryLine(line) {
    return String(line || "")
        .replace(/[₱]/g, "")
        .replace(/[|]/g, "I")
        .replace(/[“”]/g, '"')
        .replace(/[‘’]/g, "'")
        .replace(/\s+/g, " ")
        .trim();
}

function mergeMercuryItemBlocks(lines) {
    const cleanedLines = lines.map(normalizeMercuryLine).filter(Boolean);
    const merged = [];

    for (let index = 0; index < cleanedLines.length; index++) {
        const current = cleanedLines[index];
        const next = cleanedLines[index + 1] || "";
        const afterNext = cleanedLines[index + 2] || "";

        if (
            isMercuryPossibleProductNameLine(current) &&
            isMercuryPriceOnlyLine(next)
        ) {
            merged.push(`${current} ${next}`);
            index += 1;
            continue;
        }

        if (
            isMercuryPossibleProductNameLine(current) &&
            isMercuryBarcodeLine(next) &&
            isMercuryPriceOnlyLine(afterNext)
        ) {
            merged.push(`${current} ${afterNext}`);
            merged.push(next);
            index += 2;
            continue;
        }

        if (
            isMercuryPossibleProductNameLine(current) &&
            isMercuryPriceOnlyLine(afterNext)
        ) {
            merged.push(`${current} ${afterNext}`);
            if (next) merged.push(next);
            index += 2;
            continue;
        }

        merged.push(current);
    }

    return merged;
}

function isMercuryPossibleProductNameLine(line) {
    const clean = normalizeMercuryLine(line);
    const upper = clean.toUpperCase();

    if (!clean) return false;
    if (clean.length < 3) return false;
    if (!/[A-Za-z]{2,}/.test(clean)) return false;
    if (isMercuryHeaderOrFinancialLine(upper)) return false;
    if (isMercuryBarcodeLine(clean)) return false;
    if (isMercuryPriceOnlyLine(clean)) return false;
    if (parseMercuryQuantityLine(clean)) return false;

    return true;
}

function isMercuryBarcodeLine(line) {
    return /^[0-9]{8,14}$/.test(normalizeMercuryLine(line));
}

function isMercuryPriceOnlyLine(line) {
    const clean = normalizeMercuryLine(line);

    return /^[0-9OoQqDdIiLl!|SsEeBbGgZz]{1,8}(?:,[0-9OoQqDdIiLl!|SsEeBbGgZz]{3})*[.,][0-9OoQqDdIiLl!|SsEeBbGgZz]{2}\s*[TXZ]\s*$/i.test(clean);
}

function parseMercuryProductLine(line) {
    const clean = normalizeMercuryLine(line);

    if (!clean) return null;
    if (isMercuryHeaderOrFinancialLine(clean)) return null;

    const match = clean.match(
        /^(.+?)\s+([0-9OoQqDdIiLl!|SsEeBbGgZz]{1,8}(?:,[0-9OoQqDdIiLl!|SsEeBbGgZz]{3})*[.,][0-9OoQqDdIiLl!|SsEeBbGgZz]{2})\s*([TXZ])\s*$/i
    );

    if (!match) return null;

    const name = cleanMercuryProductName(match[1]);
    const price = parseMercuryMoney(match[2]);
    const taxCode = String(match[3] || "").toUpperCase();

    if (!name || name.length < 2) return null;
    if (!/[A-Za-z]/.test(name)) return null;
    if (!price || price <= 0) return null;
    if (!["T", "X", "Z"].includes(taxCode)) return null;
    if (isBadMercuryProductName(name)) return null;

    return {
        name,
        price,
        taxCode
    };
}

function parseMercuryQuantityLine(line) {
    const clean = normalizeMercuryLine(line);

    if (!clean) return null;

    const match = clean.match(
        /(?:^|\s)([0-9]{1,4})\s*@\s*([0-9OoQqDdIiLl!|SsEeBbGgZz]{1,8}(?:,[0-9OoQqDdIiLl!|SsEeBbGgZz]{3})*[.,][0-9OoQqDdIiLl!|SsEeBbGgZz]{2})/i
    );

    if (!match) return null;

    const quantity = Number(match[1]);
    const unitPrice = parseMercuryMoney(match[2]);

    if (!Number.isFinite(quantity) || quantity <= 0) return null;
    if (!unitPrice || unitPrice <= 0) return null;

    return {
        quantity,
        unitPrice
    };
}

function repairMercuryMoneyText(value) {
    let text = String(value || "")
        .trim()
        .replace(/[₱\s]/g, "")
        .replace(/^PHP/i, "")
        .trim();

    if (!text) return "";

    return text
        .replace(/[OoQqDd]/g, "0")
        .replace(/[IiLl!|]/g, "1")
        .replace(/[SsEe]/g, "5")
        .replace(/[Bb]/g, "8")
        .replace(/[Gg]/g, "6")
        .replace(/[Zz]/g, "2");
}

function parseMercuryMoney(value) {
    let text = repairMercuryMoneyText(value);

    if (!text) return 0;

    const commaCount = (text.match(/,/g) || []).length;
    const dotCount = (text.match(/\./g) || []).length;

    if (commaCount > 1 && dotCount === 0) {
        const lastCommaIndex = text.lastIndexOf(",");
        const wholePart = text.slice(0, lastCommaIndex).replace(/,/g, "");
        const decimalPart = text.slice(lastCommaIndex + 1);

        text = `${wholePart}.${decimalPart}`;
    } else if (commaCount >= 1 && dotCount >= 1) {
        text = text.replace(/,/g, "");
    } else if (commaCount === 1 && dotCount === 0) {
        text = text.replace(",", ".");
    }

    const number = Number(text);

    return Number.isFinite(number) ? roundMercuryMoney(number) : 0;
}

function cleanMercuryProductName(name) {
    return String(name || "")
        .replace(/^\.+/, "")
        .replace(/^[-.]+\s*/, "")
        .replace(/^PA\s*#?\s*\d+\s*/i, "")
        .replace(/\s+[0-9]{8,14}\s*$/g, "")
        .replace(/([A-Za-z])(\d)/g, "$1 $2")
        .replace(/(\d)([A-Za-z])/g, "$1 ")
        .replace(/\bML\b/gi, "mL")
        .replace(/\bMG\b/gi, "mg")
        .replace(/\bG\b/g, "g")
        .replace(/\s+/g, " ")
        .trim();
}

function isBadMercuryProductName(name) {
    const upper = String(name || "").toUpperCase();
    const key = upper.replace(/[^A-Z0-9]/g, "");

    if (!key) return true;

    return (
        upper.includes("MERCURY DRUG") ||
        upper.includes("VAT REG") ||
        upper.includes("TIN") ||
        upper.includes("TEL NO") ||
        upper.includes("MOBILE") ||
        upper.includes("VIBER") ||
        upper.includes("TOSHIBA") ||
        upper.includes("MIN:") ||
        upper.includes("PA #") ||
        upper.includes("TOTAL") ||
        upper.includes("AMOUNT TENDERED") ||
        upper.includes("TOTAL PAYMENT") ||
        upper.includes("CHANGE") ||
        upper.includes("DEBIT CARD") ||
        upper.includes("PAYMAYA") ||
        upper.includes("GCASH") ||
        upper.includes("E-M-PAY") ||
        upper.includes("EM-PAY") ||
        upper.includes("CARD") ||
        upper.includes("APPROVAL") ||
        upper.includes("ORDER") ||
        upper.includes("SOLD TO") ||
        upper.includes("ADDRESS") ||
        upper.includes("SIGNATURE") ||
        upper.includes("VATABLE") ||
        upper.includes("VAT-EXEMPT") ||
        upper.includes("VAT EXEMPT") ||
        upper.includes("VAT ZERO") ||
        upper.includes("VAT - 12") ||
        upper.includes("AMOUNT DUE") ||
        upper.includes("RECEIVED MERCHANDISE") ||
        upper.includes("PHILLOGIX") ||
        upper.includes("INVOICE") ||
        upper.includes("THIS IS YOUR INVOICE") ||
        upper.includes("NAKASISIGURO") ||
        upper.includes("MARAMING SALAMAT")
    );
}

function isMercuryHeaderOrFinancialLine(line) {
    const upper = String(line || "").toUpperCase();

    if (!upper) return true;

    return (
        upper.includes("MERCURY DRUG") ||
        upper.includes("VAT REG") ||
        upper.includes("TIN") ||
        upper.includes("TEL NO") ||
        upper.includes("MOBILE") ||
        upper.includes("VIBER") ||
        upper.includes("TOSHIBA") ||
        upper.includes("MIN:") ||
        upper.includes("PA #") ||
        upper.includes("TOTAL") ||
        upper.includes("AMOUNT TENDERED") ||
        upper.includes("TOTAL PAYMENT") ||
        upper.includes("CHANGE") ||
        upper.includes("DEBIT CARD") ||
        upper.includes("PAYMAYA") ||
        upper.includes("GCASH") ||
        upper.includes("E-M-PAY") ||
        upper.includes("EM-PAY") ||
        upper.includes("CARD") ||
        upper.includes("APPROVAL") ||
        upper.includes("ORDER") ||
        upper.includes("SOLD TO") ||
        upper.includes("ADDRESS") ||
        upper.includes("SIGNATURE") ||
        upper.includes("VATABLE") ||
        upper.includes("VAT-EXEMPT") ||
        upper.includes("VAT EXEMPT") ||
        upper.includes("VAT ZERO") ||
        upper.includes("VAT - 12") ||
        upper.includes("AMOUNT DUE") ||
        upper.includes("RECEIVED MERCHANDISE") ||
        upper.includes("PHILLOGIX") ||
        upper.includes("INVOICE") ||
        upper.includes("THIS IS YOUR INVOICE") ||
        upper.includes("NAKASISIGURO") ||
        upper.includes("MARAMING SALAMAT") ||
        /^\*+\s*\d+\s*ITEM/i.test(upper) ||
        /^[0-9]{8,14}$/.test(upper)
    );
}

function removeMercuryDuplicateItems(items) {
    const seen = new Set();

    return items.filter(item => {
        const key = [
            window.ParserUtils.normalizeKey(item.rawName || item.name),
            Number(item.quantity || 1),
            Number(item.price || 0).toFixed(2)
        ].join("|");

        if (seen.has(key)) return false;

        seen.add(key);
        return true;
    });
}

function roundMercuryMoney(value) {
    return Math.round(Number(value || 0) * 100) / 100;
}

function looksLikeMercuryReceipt(rawText) {
    const key = window.ParserUtils.normalizeKey(rawText);

    return (
        key.includes("MERCURYDRUG") ||
        key.includes("NERCURYDRUG") ||
        key.includes("MERCURY") ||
        key.includes("NERCURY") ||
        key.includes("NAKASISIGUROGAMOT") ||
        key.includes("PHILLOGIX")
    );
}

window.MercuryParser = {
    parse: parseMercuryItems,
    looksLike: looksLikeMercuryReceipt
};