let cameraStream = null;
let isScanning = false;
let currentReceiptImage = "";
let currentDetectedItems = [];
let pendingDeleteItemId = null;
let currentReceiptAdjustment = null;

let mlKitProgressTimer = null;
let mlKitFakeProgress = 0;
let mlKitProgressMessage = "Preparing receipt...";
let mlKitProgressPauseUntil = 0;

const scanView = document.getElementById("scanView");
const reviewView = document.getElementById("reviewView");
const reviewActionBar = document.getElementById("reviewActionBar");
const scannerPage = document.querySelector(".scanner-page");

const cameraPreview = document.getElementById("cameraPreview");
const scannerCameraCard = document.getElementById("scannerCameraCard");
const scanInstruction = document.getElementById("scanInstruction");
const captureCanvas = document.getElementById("captureCanvas");
const receiptUpload = document.getElementById("receiptUpload");

const scanBackBtn = document.getElementById("scanBackBtn");
const captureScanBtn = document.getElementById("captureScanBtn");
const rescanBtn = document.getElementById("rescanBtn");
const saveExpensesBtn = document.getElementById("saveExpensesBtn");

const scanningModal = document.getElementById("scanningModal");
const scanningModalText = document.getElementById("scanningModalText");
const scanPercentText = document.getElementById("scanPercentText");
const miniProgressFill = document.getElementById("miniProgressFill");
const miniReceipt = document.getElementById("miniReceipt");

const deleteConfirmModal = document.getElementById("deleteConfirmModal");
const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");

const invalidReceiptModal = document.getElementById("invalidReceiptModal");
const closeInvalidReceiptBtn = document.getElementById("closeInvalidReceiptBtn");

const defaultCategories = [
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

const storeScanThemes = {
    savemore: {
        receipt: "#FFF5D8",
        progress: "#B48A28"
    },
    puregold: {
        receipt: "#EEF6F0",
        progress: "#6C9278"
    },
    mercury: {
        receipt: "#FFE8EE",
        progress: "#C85F72"
    },
    seveneleven: {
        receipt: "#FFF1E8",
        progress: "#E98B5F"
    },
    "7eleven": {
        receipt: "#FFF1E8",
        progress: "#E98B5F"
    },
    "711": {
        receipt: "#FFF1E8",
        progress: "#E98B5F"
    },
    alfamart: {
        receipt: "#FFE6E6",
        progress: "#D66B6B"
    },
    unknown: {
        receipt: "#EAF3F8",
        progress: "#5A8DA8"
    }
};

document.addEventListener("DOMContentLoaded", () => {
    setPageMode("scan");
    bindScannerActions();
    startCamera();
});

function bindScannerActions() {
    if (scanBackBtn) {
        scanBackBtn.addEventListener("click", () => {
            window.location.href = "home.html";
        });
    }

    if (captureScanBtn) {
        captureScanBtn.addEventListener("click", captureAndScan);
    }

    if (receiptUpload) {
        receiptUpload.addEventListener("change", uploadReceipt);
    }

    if (rescanBtn) {
        rescanBtn.addEventListener("click", showScanView);
    }

    if (saveExpensesBtn) {
        saveExpensesBtn.addEventListener("click", saveExpenses);
    }

    if (cancelDeleteBtn) {
        cancelDeleteBtn.addEventListener("click", closeDeleteModal);
    }

    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener("click", () => {
            if (pendingDeleteItemId) {
                deleteItem(pendingDeleteItemId);
            }

            closeDeleteModal();
        });
    }

    if (closeInvalidReceiptBtn) {
        closeInvalidReceiptBtn.addEventListener("click", closeInvalidReceiptModal);
    }
}

function setPageMode(mode) {
    if (!scannerPage) return;

    if (mode === "review") {
        scannerPage.classList.remove("scan-mode");
        scannerPage.classList.add("review-mode");
    } else {
        scannerPage.classList.remove("review-mode");
        scannerPage.classList.add("scan-mode");
    }
}

async function startCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        cameraStream = null;

        if (scannerCameraCard) {
            scannerCameraCard.classList.remove("camera-active");
        }

        return;
    }

    try {
        cameraStream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: "environment"
            },
            audio: false
        });

        if (cameraPreview) {
            cameraPreview.srcObject = cameraStream;
        }

        if (scannerCameraCard) {
            scannerCameraCard.classList.add("camera-active");
        }

        replayInstructionAnimation();
    } catch (error) {
        cameraStream = null;

        if (scannerCameraCard) {
            scannerCameraCard.classList.remove("camera-active");
        }

        showToast("Camera permission is needed, or upload a receipt image instead.");
    }
}

function replayInstructionAnimation() {
    if (!scanInstruction || !scannerCameraCard) return;

    if (!scannerCameraCard.classList.contains("camera-active")) {
        return;
    }

    scanInstruction.style.animation = "none";
    void scanInstruction.offsetWidth;
    scanInstruction.style.animation = "instructionFade 3s ease forwards";
}

function captureAndScan() {
    if (!cameraStream || !cameraPreview || !captureCanvas) {
        showToast("Camera is unavailable. Upload a receipt image instead.");
        return;
    }

    const context = captureCanvas.getContext("2d");

    captureCanvas.width = cameraPreview.videoWidth || 1280;
    captureCanvas.height = cameraPreview.videoHeight || 720;

    context.drawImage(cameraPreview, 0, 0, captureCanvas.width, captureCanvas.height);

    currentReceiptImage = captureCanvas.toDataURL("image/png");
    scanImage(currentReceiptImage);
}

function uploadReceipt(event) {
    const file = event.target.files && event.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
        currentReceiptImage = reader.result;

        if (receiptUpload) {
            receiptUpload.value = "";
        }

        scanImage(currentReceiptImage);
    };

    reader.onerror = () => {
        showToast("Could not read the selected receipt image.");
    };

    reader.readAsDataURL(file);
}

async function scanImage(imageSource) {
    if (isScanning) return;

    if (!window.AndroidOCR || typeof window.AndroidOCR.scanReceipt !== "function") {
        showToast("Receipt scanner is unavailable. Check MainActivity.kt.");
        return;
    }

    if (typeof parseKabalikatReceipt !== "function") {
        showToast("Receipt parser file is missing.");
        return;
    }

    isScanning = true;
    setScanningStoreTheme("unknown");

    mlKitFakeProgress = 0;
    mlKitProgressMessage = "Preparing receipt...";
    showScanningModal(mlKitProgressMessage, 0);
    startMlKitProgressLoop();

    try {
        const preparedImage = await prepareImageForNativeOcr(imageSource);

        currentReceiptImage = preparedImage;

        mlKitProgressMessage = "Reading receipt text...";
        window.AndroidOCR.scanReceipt(preparedImage);
    } catch (error) {
        console.error(error);
        stopMlKitProgressLoop();
        hideScanningModal();
        showToast("Could not prepare receipt image.");
        isScanning = false;
    }
}

async function handleMlKitOcrResult(payload) {
    try {
        const result = typeof payload === "string" ? JSON.parse(payload) : payload;

        if (!result || !result.success) {
            throw new Error(result && result.error ? result.error : "Receipt OCR failed.");
        }

        const mlKitText = result.text || "";

        mlKitProgressMessage = "Checking receipt details...";
        showScanningModal(mlKitProgressMessage, Math.max(mlKitFakeProgress, 86));

        if (
            window.KabalikatProductMatcher &&
            typeof window.KabalikatProductMatcher.load === "function"
        ) {
            mlKitProgressMessage = "Loading product database...";
            showScanningModal(mlKitProgressMessage, Math.max(mlKitFakeProgress, 78));

            await window.KabalikatProductMatcher.load({ forceRefresh: true });
            console.log("Product matcher stats:", window.KabalikatProductMatcher.stats());
        }

        window.KABALIKAT_USE_DB_FOR_PRODUCT_NAMES = true;

        let parsedReceipt = parseKabalikatReceipt(mlKitText, currentReceiptImage, {
            primarySource: "mlkit"
        });

        const storeId = normalizeStoreId(parsedReceipt.store.id);

        switch (storeId) {

            case "savemore":

                parsedReceipt =
                    repairReceiptItemsFromRawProductSequence(
                        parsedReceipt,
                        mlKitText
                    );

                if (!parsedReceipt.sequenceRepaired) {

                    parsedReceipt =
                        rescueStandaloneProductCodeRows(
                            parsedReceipt,
                            mlKitText
                        );
                }

                break;

            case "seveneleven":

                /*
                    7-Eleven parser already produces final rows.
                    No quantity inference.
                    No subtotal repair.
                    No rescue.
                */

                break;

            default:

                break;
        }

        parsedReceipt.items =
            applyFinalDatabaseProductNames(
                parsedReceipt.items,
                parsedReceipt
            );

        if (!isLikelyReceipt(mlKitText, parsedReceipt)) {
            stopMlKitProgressLoop();
            hideScanningModal();
            showInvalidReceiptModal();
            isScanning = false;
            return;
        }

        const themeStoreId = normalizeStoreId(getStoreId(parsedReceipt));
        setScanningStoreTheme(themeStoreId);

        mlKitProgressMessage = "Finalizing receipt...";
        await finishMlKitProgress();

        renderReview(parsedReceipt, mlKitText);
        hideScanningModal();
        showReviewView();
        isScanning = false;
    } catch (error) {
        console.error(error);
        stopMlKitProgressLoop();
        hideScanningModal();
        showToast("Receipt scan failed. Try a clearer receipt image.");
        isScanning = false;
    }
}

function applyFinalDatabaseProductNames(items, receipt) {
    if (!Array.isArray(items)) {
        return [];
    }

    if (
        !window.KabalikatProductMatcher ||
        typeof window.KabalikatProductMatcher.findBest !== "function"
    ) {
        return items;
    }

    const storeName = getReceiptStoreNameForMatcher(receipt);

    return items.map(item => {
        if (item && item.preserveOcrName === true) {
            return item;
        }

        const candidates = getFinalMatcherCandidates(item);

        let best = null;

        for (const candidate of candidates) {
            const match = window.KabalikatProductMatcher.findBest(candidate, {
                storeName,
                storeId: storeName
            });

            if (!match) continue;

            const candidateKey = normalizeScannerProductKey(candidate);
            const currentNameKey = normalizeScannerProductKey(item.name || "");

            /*
                Do not allow the current displayed name to reinforce itself
                if rawName/cleanedText exists and points elsewhere.
            */
            const candidateIsCurrentDisplayedName =
                currentNameKey &&
                candidateKey === currentNameKey;

            if (candidateIsCurrentDisplayedName && candidates.length > 1) {
                continue;
            }

            if (!best || Number(match.score || 0) > Number(best.score || 0)) {
                best = match;
            }
        }

        if (best && Number(best.score || 0) >= 0.70) {
            return {
                ...item,
                name: best.canonicalName || item.name,
                suggestedName: best.canonicalName || item.suggestedName || item.name,
                category: best.category || item.category || "Groceries",
                matchedProductId: best.productId || item.matchedProductId || null,
                matchedAliasId: best.aliasId || item.matchedAliasId || null,
                matchedAliasText: best.aliasText || item.matchedAliasText || "",
                matchScore: best.score || item.matchScore || 0,
                matchStatus: Number(best.score || 0) >= 0.90 ? "matched" : "suggested",
                matchSource: best.source || item.matchSource || "",
                matchReason: best.reason || item.matchReason || "",
                productFamily: best.productFamily || item.productFamily || "",
                variantText: best.variantText || item.variantText || "",
                productBrand: best.brand || item.productBrand || ""
            };
        }

        return item;
    });
}

function getFinalMatcherCandidates(item) {
    /*
        Priority:
        1. rawName / cleanedText / normalizedText / sourceLine
        2. only use item.name last

        Why:
        item.name may already be wrong from an earlier weak match.
        Example:
        rawName = CreamSilkCon180ml
        item.name = Magic Flakes Butter Cream

        We should trust OCR/raw code before the existing displayed name.
    */
    const primaryValues = [
        item?.rawName,
        item?.cleanedText,
        item?.normalizedText,
        item?.sourceLine
    ];

    const fallbackValues = [
        item?.suggestedName,
        item?.name
    ];

    const candidates = [
        ...primaryValues,
        ...fallbackValues
    ]
        .map(value => String(value || "").trim())
        .filter(Boolean)
        .flatMap(value => {
            return [
                value,
                stripFinalCandidateNoise(value)
            ];
        })
        .map(value => String(value || "").trim())
        .filter(Boolean);

    const normalizedSeen = new Set();

    return candidates.filter(candidate => {
        const key = normalizeScannerProductKey(candidate);

        if (!key || normalizedSeen.has(key)) {
            return false;
        }

        normalizedSeen.add(key);
        return true;
    });
}

function stripFinalCandidateNoise(value) {
    return String(value || "")
        .split("|")[0]
        .replace(/price from savemore price column/gi, " ")
        .replace(/repaired by subtotal check/gi, " ")
        .replace(/[₱]/g, " ")
        .replace(/\bPHP\b/gi, " ")
        .replace(/@\s*\d{1,6}(?:[.,]\d{2})?/g, " ")
        .replace(/\d{1,3}(?:,\d{3})*[.,]\d{2}/g, " ")
        .replace(/\d{1,6}[.,]\d{2}/g, " ")
        .replace(/^\s*\d{1,3}\s+/, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function repairReceiptItemsFromRawProductSequence(receipt, rawText) {
    if (!receipt || !Array.isArray(receipt.items)) {
        return receipt;
    }

    const rawRows = extractRawProductSequenceRows(rawText);

    if (rawRows.length === 0) {
        return receipt;
    }

    const expectedQuantity = getExpectedItemQuantityFromReceipt(receipt, rawText);
    const parsedQuantity = receipt.items.reduce((sum, item) => {
        return sum + Number(item.quantity || 0);
    }, 0);

    const expectedTotal = getExpectedTotalFromReceipt(receipt, rawText);

    const shouldRepair =
        rawRows.length >= receipt.items.length ||
        (expectedQuantity > 0 && parsedQuantity < expectedQuantity);

    if (!shouldRepair) {
        return receipt;
    }

    const repairedRows = inferMissingQuantitiesForRawRows(rawRows, receipt, rawText);
    const rawUnitPriceQueue = extractRawUnitPriceQueue(rawText);
    const alignedUnitPrices = alignUnitPriceQueueToProductRows(repairedRows, rawUnitPriceQueue);

    const parserPriceQueue = receipt.items
        .map(item => Number(item.price || item.lineTotal || 0))
        .filter(price => price > 0);

    let repairedItems = repairedRows.map((row, index) => {
        const quantity = Number(row.quantity || 1);

        let unitPrice = Number(row.unitPrice || 0);
        let lineTotal = Number(row.lineTotal || 0);

        /*
            Do not blindly use rawUnitPriceQueue[index].
            If one item row has missing @ price, index-based price assignment shifts everything.
        */
        if (unitPrice <= 0 && alignedUnitPrices[index] > 0) {
            unitPrice = alignedUnitPrices[index];
        }

        if (lineTotal <= 0 && unitPrice > 0) {
            lineTotal = roundMoney(unitPrice * quantity);
        }

        /*
            Only use old parser price queue when item counts line up exactly.
            Otherwise it can shift prices to the wrong products.
        */
        if (
            lineTotal <= 0 &&
            parserPriceQueue.length === repairedRows.length &&
            parserPriceQueue[index] > 0
        ) {
            lineTotal = parserPriceQueue[index];
            unitPrice = quantity > 0 ? roundMoney(lineTotal / quantity) : lineTotal;
        }

        const tempItem = {
            id: makeItemId(),
            name: row.code,
            rawName: row.code,
            cleanedText: row.code,
            normalizedText: normalizeScannerProductKey(row.code),
            quantity,
            unitPrice,
            price: lineTotal,
            lineTotal,
            category: "Groceries",
            sourceLine: row.originalLine,
            ocrLineIndex: row.lineIndex,
            ocrPosition: row.position,
            sequenceRepaired: true,
            quantitySmartRepaired: row.quantitySmartRepaired === true,
            needsReview: lineTotal <= 0
        };

        if (
            window.KabalikatProductMatcher &&
            typeof window.KabalikatProductMatcher.matchItem === "function"
        ) {
            return window.KabalikatProductMatcher.matchItem(tempItem, {
                storeName: getReceiptStoreNameForMatcher(receipt),
                storeId: getReceiptStoreNameForMatcher(receipt)
            });
        }

        return tempItem;
    });

    /*
        Example:
        LKYMEPCNTONKLM60G has no quantity/price line, but the item count says
        there are 14 total quantities. If it is the only missing price, infer it
        from receipt math or from a nearby same-family item.
    */
    repairedItems = inferMissingPricesFromReceiptMathOrNearbyProduct(
        repairedItems,
        expectedTotal
    );

    const repairedQuantity = repairedItems.reduce((sum, item) => {
        return sum + Number(item.quantity || 0);
    }, 0);

    const repairedTotal = roundMoney(
        repairedItems.reduce((sum, item) => {
            return sum + Number(item.price || item.lineTotal || 0);
        }, 0)
    );

    const quantityLooksValid =
        expectedQuantity <= 0 ||
        repairedQuantity === expectedQuantity;

    const totalLooksValid =
        expectedTotal <= 0 ||
        Math.abs(repairedTotal - expectedTotal) <= 0.05;

    const hasZeroPricedProduct =
        repairedItems.some(item => Number(item.price || item.lineTotal || 0) <= 0);

    if (
        repairedItems.length >= receipt.items.length &&
        quantityLooksValid &&
        totalLooksValid &&
        !hasZeroPricedProduct
    ) {
        receipt.items = dedupeAndSortReceiptItems(repairedItems, rawText);
        receipt.sequenceRepaired = true;
        return receipt;
    }

    console.warn("Sequence repair rejected.", {
        rawRows,
        repairedRows,
        rawUnitPriceQueue,
        alignedUnitPrices,
        repairedQuantity,
        expectedQuantity,
        repairedTotal,
        expectedTotal
    });

    receipt.sequenceRepaired = false;
    return receipt;
}

function extractRawUnitPriceQueue(rawText) {
    const lines = String(rawText || "")
        .split(/\n+/)
        .map(line => line.trim())
        .filter(Boolean);

    const prices = [];

    lines.forEach(line => {
        const matches = [...String(line).matchAll(/@\s*(\d{1,4}(?:[.,]\d{2})?)/g)];

        matches.forEach(match => {
            const value = parseReceiptMoney(match[1]);

            if (value > 0) {
                prices.push(value);
            }
        });
    });

    return prices;
}

function alignUnitPriceQueueToProductRows(rows, rawUnitPriceQueue) {
    const result = new Array(rows.length).fill(0);

    if (!Array.isArray(rows) || rows.length === 0) {
        return result;
    }

    if (!Array.isArray(rawUnitPriceQueue) || rawUnitPriceQueue.length === 0) {
        return result;
    }

    let queueIndex = 0;
    const missingQueueCount = rows.length - rawUnitPriceQueue.length;

    rows.forEach((row, index) => {
        if (Number(row.unitPrice || 0) > 0) {
            result[index] = Number(row.unitPrice || 0);
            return;
        }

        const shouldSkipThisRow =
            missingQueueCount > 0 &&
            (
                row.quantitySmartRepaired === true ||
                row.quantityMissing === true
            );

        /*
            If one OCR item row has no @ price, skip that row instead of shifting
            all later prices.
        */
        if (shouldSkipThisRow) {
            result[index] = 0;
            return;
        }

        result[index] = Number(rawUnitPriceQueue[queueIndex] || 0);
        queueIndex++;
    });

    return result;
}

function inferMissingPricesFromReceiptMathOrNearbyProduct(items, expectedTotal) {
    if (!Array.isArray(items) || items.length === 0) {
        return items;
    }

    const missingIndexes = [];

    items.forEach((item, index) => {
        const price = Number(item.price || item.lineTotal || 0);

        if (price <= 0) {
            missingIndexes.push(index);
        }
    });

    if (missingIndexes.length !== 1) {
        return items;
    }

    const missingIndex = missingIndexes[0];
    const missingItem = items[missingIndex];
    const quantity = Number(missingItem.quantity || 1);

    if (!quantity || quantity <= 0) {
        return items;
    }

    const knownTotal = roundMoney(
        items.reduce((sum, item, index) => {
            if (index === missingIndex) {
                return sum;
            }

            return sum + Number(item.price || item.lineTotal || 0);
        }, 0)
    );

    /*
        Best case: OCR found the printed TOTAL DUE.
    */
    if (expectedTotal > 0) {
        const missingTotal = roundMoney(expectedTotal - knownTotal);

        if (missingTotal > 0 && missingTotal < 10000) {
            return items.map((item, index) => {
                if (index !== missingIndex) {
                    return item;
                }

                return {
                    ...item,
                    price: missingTotal,
                    lineTotal: missingTotal,
                    unitPrice: roundMoney(missingTotal / quantity),
                    priceMissing: false,
                    needsReview: true,
                    smartPriceRepaired: true,
                    repairReason: "Price inferred from receipt total."
                };
            });
        }
    }

    /*
        Fallback: if the missing item is near another same-family item,
        use the nearby unit price.

        This handles:
        1 Lucky Me Pancit Canton Original 60g @16.50
        2 Lucky Me Pancit Canton Kalamansi 60g missing @ price
    */
    const nearbyUnitPrice = findNearbyCompatibleUnitPrice(items, missingIndex);

    if (nearbyUnitPrice > 0) {
        const inferredTotal = roundMoney(nearbyUnitPrice * quantity);

        return items.map((item, index) => {
            if (index !== missingIndex) {
                return item;
            }

            return {
                ...item,
                price: inferredTotal,
                lineTotal: inferredTotal,
                unitPrice: nearbyUnitPrice,
                priceMissing: false,
                needsReview: true,
                smartPriceRepaired: true,
                repairReason: "Price inferred from nearby same-family product."
            };
        });
    }

    return items;
}

function findNearbyCompatibleUnitPrice(items, missingIndex) {
    const missingItem = items[missingIndex];

    for (let distance = 1; distance <= 3; distance++) {
        const left = items[missingIndex - distance];

        if (
            left &&
            Number(left.unitPrice || 0) > 0 &&
            areLikelySameProductFamily(missingItem, left)
        ) {
            return roundMoney(left.unitPrice);
        }

        const right = items[missingIndex + distance];

        if (
            right &&
            Number(right.unitPrice || 0) > 0 &&
            areLikelySameProductFamily(missingItem, right)
        ) {
            return roundMoney(right.unitPrice);
        }
    }

    return 0;
}

function areLikelySameProductFamily(firstItem, secondItem) {
    const firstName = String(firstItem?.name || firstItem?.rawName || "");
    const secondName = String(secondItem?.name || secondItem?.rawName || "");

    const firstFamily = normalizeScannerProductKey(firstItem?.productFamily || "");
    const secondFamily = normalizeScannerProductKey(secondItem?.productFamily || "");

    const firstSize = extractScannerSizeToken(firstName);
    const secondSize = extractScannerSizeToken(secondName);

    if (firstSize && secondSize && firstSize !== secondSize) {
        return false;
    }

    if (firstFamily && secondFamily && firstFamily === secondFamily) {
        return true;
    }

    const firstTokens = getComparableProductTokens(firstName);
    const secondTokens = getComparableProductTokens(secondName);

    let sharedCount = 0;

    firstTokens.forEach(token => {
        if (secondTokens.includes(token)) {
            sharedCount++;
        }
    });

    return sharedCount >= 3;
}

function getComparableProductTokens(value) {
    const ignored = new Set([
        "ORIGINAL",
        "KALAMANSI",
        "CHILIMANSI",
        "SWEET",
        "SPICY",
        "HOT",
        "MILD",
        "REGULAR",
        "CLASSIC",
        "FLAVOR",
        "FLAVOUR"
    ]);

    return String(value || "")
        .toUpperCase()
        .replace(/(\d+)\s*(KG|G|ML|L|S)\b/g, "$1$2")
        .replace(/[^A-Z0-9]+/g, " ")
        .trim()
        .split(/\s+/)
        .map(token => normalizeScannerProductKey(token))
        .filter(Boolean)
        .filter(token => !ignored.has(token));
}

function extractScannerSizeToken(value) {
    const text = normalizeScannerProductKey(value);
    const match = text.match(/\d+(KG|G|ML|L|S)\b/);

    return match ? match[0] : "";
}

function extractRawProductSequenceRows(rawText) {
    const lines = String(rawText || "")
        .split(/\n+/)
        .map((line, index) => ({
            originalLine: line.trim(),
            lineIndex: index
        }))
        .filter(row => row.originalLine);

    const rows = [];
    let insideItemSection = false;

    lines.forEach(row => {
        const original = row.originalLine;
        const upper = original.toUpperCase();

        if (
            upper.includes("QTY") ||
            upper.includes("ITEM DESCRIPTION") ||
            upper.includes("UNIT PRICE") ||
            upper.includes("AMOUNT")
        ) {
            insideItemSection = true;
            return;
        }

        if (
            upper.includes("ITEM COUNT") ||
            upper.includes("TOTAL DUE") ||
            upper.includes("VATABLE") ||
            upper.includes("CASH") ||
            upper.includes("CHANGE")
        ) {
            insideItemSection = false;
        }

        /*
            For Savemore generated receipts, item lines can still appear even if
            OCR does not preserve the item header well, so we do not require
            insideItemSection strictly. We use product-code validation instead.
        */
        const parsed = parseRawProductCodeLine(original);

        if (!parsed) {
            return;
        }

        rows.push({
            ...parsed,
            originalLine: original,
            lineIndex: row.lineIndex,
            position: getRawTextLinePosition(rawText, original, row.lineIndex)
        });
    });

    return dedupeRawProductRows(rows);
}

function parseRawProductCodeLine(line) {
    const original = String(line || "").trim();

    if (!original) return null;

    if (isExactReceiptMetaCode(original)) {
        return null;
    }

    if (isReceiptNoiseLine(original)) {
        return null;
    }

    const quantityMatch = original.match(/^\s*(\d{1,3})\s+(.+)$/);

    if (quantityMatch) {
        const quantity = Number(quantityMatch[1]);
        let productPart = quantityMatch[2] || "";

        const unitPriceMatch = productPart.match(/@\s*(\d{1,4}(?:[.,]\d{2})?)/);
        const unitPrice = unitPriceMatch ? parseReceiptMoney(unitPriceMatch[1]) : 0;

        const moneyValues = extractReceiptMoneyValues(productPart);
        const lineTotal = moneyValues.length > 0
            ? moneyValues[moneyValues.length - 1]
            : 0;

        productPart = productPart
            .split("@")[0]
            .replace(/[₱]/g, " ")
            .replace(/\bPHP\b/gi, " ")
            .replace(/\d{1,3}(?:,\d{3})*[.,]\d{2}/g, " ")
            .replace(/\s+/g, " ")
            .trim();

        const code = normalizeScannerProductKey(productPart);

        if (isStandaloneProductCode(code)) {
            return {
                quantity,
                quantityMissing: false,
                code,
                unitPrice,
                lineTotal
            };
        }
    }

    const compact = normalizeScannerProductKey(original);
    const attached = splitAttachedQuantityFromCode(compact);

    if (attached.quantity > 0 && isStandaloneProductCode(attached.code)) {
        return {
            quantity: attached.quantity,
            quantityMissing: false,
            code: attached.code,
            unitPrice: 0,
            lineTotal: 0
        };
    }

    if (isStandaloneProductCode(compact)) {
        return {
            quantity: null,
            quantityMissing: true,
            code: compact,
            unitPrice: 0,
            lineTotal: 0
        };
    }

    return null;
}

function splitAttachedQuantityFromCode(value) {
    const text = normalizeScannerProductKey(value);

    /*
        Handles OCR cases like:
        1DATUPTISOY1L

        But do not strip codes like 555SARDSPANSH155 because 555 is part of the product.
    */
    const match = text.match(/^([1-9])([A-Z][A-Z0-9]{6,})$/);

    if (!match) {
        return {
            quantity: 0,
            code: text
        };
    }

    const quantity = Number(match[1]);
    const code = match[2];

    if (quantity > 0 && isStandaloneProductCode(code)) {
        return {
            quantity,
            code
        };
    }

    return {
        quantity: 0,
        code: text
    };
}

function inferMissingQuantitiesForRawRows(rows, receipt, rawText) {
    const expectedQuantity = getExpectedItemQuantityFromReceipt(receipt, rawText);

    if (expectedQuantity <= 0) {
        return rows.map(row => ({
            ...row,
            quantity: Number(row.quantity || 1)
        }));
    }

    const knownQuantity = rows.reduce((sum, row) => {
        return sum + Number(row.quantity || 0);
    }, 0);

    const unknownRows = rows.filter(row => !Number(row.quantity || 0));
    const missingQuantity = expectedQuantity - knownQuantity;

    if (unknownRows.length === 1 && missingQuantity > 0) {
        return rows.map(row => {
            if (row === unknownRows[0]) {
                return {
                    ...row,
                    quantity: missingQuantity,
                    quantityMissing: false,
                    quantitySmartRepaired: true
                };
            }

            return row;
        });
    }

    return rows.map(row => ({
        ...row,
        quantity: Number(row.quantity || 1)
    }));
}

function dedupeRawProductRows(rows) {
    const map = new Map();

    rows.forEach(row => {
        const attached = splitAttachedQuantityFromCode(row.code);
        const cleanCode = attached.quantity > 0 ? attached.code : row.code;
        const key = normalizeScannerProductKey(cleanCode);

        if (!key) return;

        const cleanedRow = {
            ...row,
            code: cleanCode,
            quantity: Number(row.quantity || 0) > 0
                ? row.quantity
                : attached.quantity || row.quantity
        };

        if (!map.has(key)) {
            map.set(key, cleanedRow);
            return;
        }

        const existing = map.get(key);

        if (!existing.quantity && cleanedRow.quantity) {
            map.set(key, cleanedRow);
            return;
        }

        if (
            Number(cleanedRow.lineTotal || 0) > Number(existing.lineTotal || 0)
        ) {
            map.set(key, cleanedRow);
        }
    });

    return [...map.values()]
        .sort((a, b) => a.position - b.position);
}

function isReceiptNoiseLine(line) {
    const text = normalizeScannerProductKey(line);

    if (!text) return true;

    const blocked = [
        "SAVEMORE",
        "MARKET",
        "RECEIPT",
        "INVOICE",
        "PERMIT",
        "TERMINAL",
        "TOTAL",
        "CASH",
        "CHANGE",
        "VATABLE",
        "VATEXEMPT",
        "ZERORATED",
        "AMOUNT",
        "BALANCE",
        "AUTHCODE",
        "DATE",
        "TIME",
        "TIN",
        "THANKYOU",
        "OFFICIALRECEIPT"
    ];

    return blocked.some(word => text.includes(word));
}

function isExactReceiptMetaCode(text) {
    const value = normalizeScannerProductKey(text);

    return (
        value === "MIN" ||
        value === "TIN" ||
        value === "SI" ||
        value === "OR" ||
        value === "VAT"
    );
}

function rescueStandaloneProductCodeRows(receipt, rawText) {
    if (!receipt || !Array.isArray(receipt.items)) {
        return receipt;
    }

    const normalItems = receipt.items.map((item, index) => {
        return {
            ...item,
            ocrPosition: getItemOcrPosition(item, rawText, index),
            rescueOnly: false
        };
    });

    const existingKeys = new Set(
        normalItems
            .map(item => getLooseItemIdentityKey(item))
            .filter(Boolean)
    );

    const standaloneRows = extractStandaloneProductCodeRows(rawText)
        .filter(row => !existingKeys.has(normalizeScannerProductKey(row.code)));

    if (standaloneRows.length === 0) {
        receipt.items = dedupeAndSortReceiptItems(normalItems, rawText);
        return receipt;
    }

    const rescuedItems = standaloneRows.map(row => {
        const tempItem = {
            id: makeItemId(),
            name: row.code,
            rawName: row.code,
            cleanedText: row.code,
            normalizedText: normalizeScannerProductKey(row.code),
            quantity: 1,
            unitPrice: 0,
            price: 0,
            category: "Groceries",
            sourceLine: row.originalLine,
            ocrLineIndex: row.lineIndex,
            ocrPosition: row.position,
            rescueOnly: true,
            priceMissing: true,
            quantityMissing: true,
            needsReview: true
        };

        if (
            window.KabalikatProductMatcher &&
            typeof window.KabalikatProductMatcher.matchItem === "function"
        ) {
            return window.KabalikatProductMatcher.matchItem(tempItem, {
                storeName: getReceiptStoreNameForMatcher(receipt),
                storeId: getReceiptStoreNameForMatcher(receipt)
            });
        }

        return tempItem;
    });

    const cleanedRescuedItems = rescuedItems.filter(item => {
        const key = getLooseItemIdentityKey(item);

        if (!key) return false;

        if (existingKeys.has(key)) {
            return false;
        }

        existingKeys.add(key);
        return true;
    });

    const inferredRescuedItems = inferMissingQuantityAndPriceIfSafe(
        cleanedRescuedItems,
        normalItems,
        receipt,
        rawText
    );

    receipt.items = dedupeAndSortReceiptItems(
        [
            ...normalItems,
            ...inferredRescuedItems
        ],
        rawText
    );

    return receipt;
}

function extractStandaloneProductCodeRows(rawText) {
    const lines = String(rawText || "")
        .split(/\n+/)
        .map((line, index) => ({
            originalLine: line.trim(),
            lineIndex: index
        }))
        .filter(row => row.originalLine);

    const rows = [];

    lines.forEach(row => {
        const original = row.originalLine;

        /*
            Rescue only standalone product-code lines.
            This prevents duplicating normal rows like:
            2 LM PC Kalamansi @49.50
            1 VITASOY SOYA OAT
        */
        if (/[₱@]/.test(original)) return;
        if (/\d+[.,]\d{2}/.test(original)) return;
        if (/^\s*\d{1,3}\s+[A-Z]/i.test(original)) return;

        const compact = normalizeScannerProductKey(original);

        if (!isStandaloneProductCode(compact)) return;

        rows.push({
            code: compact,
            originalLine: original,
            lineIndex: row.lineIndex,
            position: getRawTextLinePosition(rawText, original, row.lineIndex)
        });
    });

    return rows;
}

function isStandaloneProductCode(value) {
    const text = normalizeScannerProductKey(value);

    if (!text) return false;

    const blockedWords = [
        "SAVEMORE",
        "MARKET",
        "RECEIPT",
        "INVOICE",
        "PERMIT",
        "TERMINAL",
        "TOTAL",
        "CASH",
        "CHANGE",
        "VATABLE",
        "VATEXEMPT",
        "ZERORATED",
        "AMOUNT",
        "BALANCE",
        "AUTHCODE",
        "DATE",
        "TIME",
        "TIN"
    ];

    if (blockedWords.some(word => text.includes(word))) {
        return false;
    }

    const hasLetters = /[A-Z]/.test(text);
    const hasDigits = /\d/.test(text);
    const hasSizeEnding = /\d+(KG|G|ML|L|S)$/.test(text);

    return (
        hasLetters &&
        hasDigits &&
        hasSizeEnding &&
        text.length >= 8 &&
        text.length <= 30
    );
}

function inferMissingQuantityAndPriceIfSafe(rescuedItems, normalItems, receipt, rawText) {
    if (!Array.isArray(rescuedItems) || rescuedItems.length === 0) {
        return [];
    }

    const expectedQuantity = getExpectedItemQuantityFromReceipt(receipt, rawText);
    const currentQuantity = normalItems.reduce((sum, item) => {
        return sum + Number(item.quantity || 0);
    }, 0);

    const expectedTotal = getExpectedTotalFromReceipt(receipt, rawText);
    const currentTotal = normalItems.reduce((sum, item) => {
        return sum + Number(item.price || item.lineTotal || 0);
    }, 0);

    const missingQuantity = expectedQuantity > 0
        ? Math.max(0, expectedQuantity - currentQuantity)
        : 0;

    const missingTotal = expectedTotal > 0
        ? roundMoney(expectedTotal - currentTotal)
        : 0;

    /*
        Smart repair rule:
        Only infer quantity and price when exactly one standalone product code is missing.
        This prevents assigning another product's price to the wrong item.
    */
    if (
        rescuedItems.length === 1 &&
        missingQuantity > 0 &&
        missingTotal > 0.009 &&
        missingTotal < 10000
    ) {
        const item = {
            ...rescuedItems[0]
        };

        item.quantity = missingQuantity;
        item.price = missingTotal;
        item.lineTotal = missingTotal;
        item.unitPrice = roundMoney(missingTotal / missingQuantity);

        item.quantityMissing = false;
        item.priceMissing = false;
        item.needsReview = true;
        item.smartRepaired = true;
        item.repairReason = "Quantity and price inferred from receipt item count and total due.";

        return [item];
    }

    /*
        If there are multiple rescued rows, do not distribute prices.
        Show them for review instead.
    */
    return rescuedItems.map(item => ({
        ...item,
        price: Number(item.price || 0),
        lineTotal: Number(item.lineTotal || item.price || 0),
        unitPrice: Number(item.unitPrice || 0),
        priceMissing: true,
        quantityMissing: true,
        needsReview: true,
        smartRepaired: false
    }));
}

function dedupeAndSortReceiptItems(items, rawText) {
    const ranked = (items || []).map((item, index) => {
        return {
            item,
            originalIndex: index,
            receiptPosition: Number.isFinite(Number(item.ocrPosition))
                ? Number(item.ocrPosition)
                : getItemOcrPosition(item, rawText, index),
            qualityScore: getDetectedItemQualityScore(item)
        };
    });

    ranked.sort((a, b) => {
        if (a.receiptPosition !== b.receiptPosition) {
            return a.receiptPosition - b.receiptPosition;
        }

        return a.originalIndex - b.originalIndex;
    });

    const map = new Map();

    ranked.forEach(entry => {
        const key = getDetectedItemDedupeKey(entry.item);

        if (!key) {
            map.set(`unique-${entry.originalIndex}`, entry);
            return;
        }

        const existing = map.get(key);

        if (!existing || entry.qualityScore > existing.qualityScore) {
            map.set(key, entry);
        }
    });

    return [...map.values()]
        .sort((a, b) => {
            if (a.receiptPosition !== b.receiptPosition) {
                return a.receiptPosition - b.receiptPosition;
            }

            return a.originalIndex - b.originalIndex;
        })
        .map(entry => entry.item);
}

function getDetectedItemDedupeKey(item) {
    /*
        Dedupe by product identity only.
        Do not include quantity or price here because zero-price rescued items
        should collapse into the real priced version of the same product.
    */
    const identity = getLooseItemIdentityKey(item);

    return identity || "";
}

function getLooseItemIdentityKey(item) {
    return normalizeScannerProductKey(
        item.matchedProductId ||
        item.matchedAliasId ||
        item.suggestedName ||
        item.name ||
        item.rawName ||
        item.cleanedText ||
        item.sourceLine ||
        ""
    );
}

function getDetectedItemQualityScore(item) {
    let score = 0;

    if (!item.rescueOnly) score += 100;
    if (Number(item.price || item.lineTotal || 0) > 0) score += 80;
    if (item.smartRepaired) score += 70;
    if (item.matchedProductId) score += 60;
    if (item.matchedAliasId) score += 50;
    if (item.matchStatus === "matched") score += 30;
    if (item.matchStatus === "suggested") score += 20;
    if (!item.priceMissing) score += 10;
    if (!item.quantityMissing) score += 10;

    const name = String(item.name || "");
    const raw = String(item.rawName || "");

    if (name && name !== raw) score += 10;

    return score;
}

function getItemOcrPosition(item, rawText, fallbackIndex) {
    const normalizedRaw = normalizeScannerProductKey(rawText);

    const candidates = [
        item.sourceLine,
        item.rawName,
        item.cleanedText,
        item.name,
        item.suggestedName
    ]
        .map(normalizeScannerProductKey)
        .filter(Boolean)
        .sort((a, b) => b.length - a.length);

    for (const candidate of candidates) {
        const index = normalizedRaw.indexOf(candidate);

        if (index >= 0) {
            return index;
        }
    }

    return Number.MAX_SAFE_INTEGER - fallbackIndex;
}

function getRawTextLinePosition(rawText, lineText, lineIndex) {
    const lines = String(rawText || "").split(/\n+/);
    let position = 0;

    for (let index = 0; index < lines.length; index++) {
        if (index === lineIndex) {
            return position;
        }

        position += lines[index].length + 1;
    }

    const fallback = String(rawText || "").indexOf(lineText);
    return fallback >= 0 ? fallback : Number.MAX_SAFE_INTEGER;
}

function getExpectedItemQuantityFromReceipt(receipt, rawText) {
    const text = String(rawText || "");

    /*
        Raw OCR must be trusted first.
        The receipt object may already contain the wrong parsed item count.
    */
    const rawPatterns = [
        /ITEM\s*COUNT\s*:?\s*(\d{1,3})/i,
        /(\d{1,3})\s*ITEM\s*\(?S?\)?/i,
        /(\d{1,3})\s*ITEMS?\b/i
    ];

    for (const pattern of rawPatterns) {
        const match = text.match(pattern);

        if (match) {
            const value = Number(match[1] || 0);

            if (Number.isFinite(value) && value > 0) {
                return value;
            }
        }
    }

    /*
        Use parsed receipt count only as fallback.
    */
    const direct =
        Number(receipt?.itemCount || 0) ||
        Number(receipt?.itemsCount || 0) ||
        Number(receipt?.totalItems || 0);

    return Number.isFinite(direct) && direct > 0 ? direct : 0;
}

function getExpectedTotalFromReceipt(receipt, rawText) {
    const text = String(rawText || "");
    const lines = text
        .split(/\n+/)
        .map(line => line.trim())
        .filter(Boolean);

    const sameLinePatterns = [
        /TOTAL\s+DUE\s+(?:PHP\s*)?(\d{1,3}(?:,\d{3})*[.,]\d{2}|\d{1,6}[.,]\d{2})/i,
        /TOTAL\s+DU\s+(?:PHP\s*)?(\d{1,3}(?:,\d{3})*[.,]\d{2}|\d{1,6}[.,]\d{2})/i,
        /AMOUNT\s+DUE\s+(?:PHP\s*)?(\d{1,3}(?:,\d{3})*[.,]\d{2}|\d{1,6}[.,]\d{2})/i
    ];

    for (const pattern of sameLinePatterns) {
        const match = text.match(pattern);

        if (match) {
            const value = parseReceiptMoney(match[1]);

            if (value > 0) {
                return value;
            }
        }
    }

    for (let index = 0; index < lines.length; index++) {
        const upper = lines[index].toUpperCase();

        if (
            upper.includes("TOTAL DUE") ||
            upper.includes("TOTAL DU") ||
            upper.includes("AMOUNT DUE")
        ) {
            const sameLineValue = extractAnyReceiptMoney(lines[index]);

            if (sameLineValue > 0) {
                return sameLineValue;
            }

            for (let offset = 1; offset <= 6; offset++) {
                const nextLine = lines[index + offset];

                if (!nextLine) continue;

                const nextUpper = nextLine.toUpperCase();

                if (
                    nextUpper.includes("CASH") ||
                    nextUpper.includes("CHANGE") ||
                    nextUpper.includes("VATABLE") ||
                    nextUpper.includes("VAT AMOUNT") ||
                    nextUpper.includes("ZERO-RATED") ||
                    nextUpper.includes("VAT-EXEMPT")
                ) {
                    break;
                }

                const value = extractAnyReceiptMoney(nextLine);

                if (value > 0) {
                    return value;
                }
            }
        }
    }

    /*
        Do not fall back to receipt.total/subtotal here.
        That value may already be the wrong subtotal from shifted item prices.
    */
    return 0;
}

function getReceiptStoreNameForMatcher(receipt) {
    return String(
        receipt?.storeName ||
        receipt?.store?.name ||
        receipt?.store?.storeName ||
        receipt?.store ||
        "Savemore"
    );
}

function normalizeScannerProductKey(value) {
    if (
        window.KabalikatProductMatcher &&
        typeof window.KabalikatProductMatcher.normalize === "function"
    ) {
        return window.KabalikatProductMatcher.normalize(value);
    }

    return String(value || "")
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "");
}

function roundMoney(value) {
    return Math.round(Number(value || 0) * 100) / 100;
}

window.handleMlKitOcrResult = handleMlKitOcrResult;

function startMlKitProgressLoop() {
    stopMlKitProgressLoop();

    mlKitProgressPauseUntil = 0;

    mlKitProgressTimer = setInterval(() => {
        if (!isScanning) {
            stopMlKitProgressLoop();
            return;
        }

        const now = Date.now();

        if (now < mlKitProgressPauseUntil) {
            return;
        }

        if (
            mlKitFakeProgress >= 18 &&
            mlKitFakeProgress <= 88 &&
            Math.random() < 0.035
        ) {
            mlKitProgressPauseUntil = now + 1000;
            return;
        }

        let step = 0.25;

        if (mlKitFakeProgress < 18) {
            step = 2;
        } else if (mlKitFakeProgress < 42) {
            step = 1.15;
        } else if (mlKitFakeProgress < 70) {
            step = 0.75;
        } else if (mlKitFakeProgress < 90) {
            step = 0.45;
        } else {
            step = 0.18;
        }

        if (Math.random() < 0.22) {
            step += 0.35;
        }

        mlKitFakeProgress = Math.min(98, mlKitFakeProgress + step);

        showScanningModal(
            mlKitProgressMessage,
            Math.floor(mlKitFakeProgress)
        );
    }, 95);
}

function stopMlKitProgressLoop() {
    if (mlKitProgressTimer) {
        clearInterval(mlKitProgressTimer);
        mlKitProgressTimer = null;
    }
}

function finishMlKitProgress() {
    return new Promise(resolve => {
        stopMlKitProgressLoop();

        const finalTimer = setInterval(() => {
            if (mlKitFakeProgress >= 100) {
                clearInterval(finalTimer);
                showScanningModal(mlKitProgressMessage, 100);

                setTimeout(() => {
                    resolve();
                }, 180);

                return;
            }

            mlKitFakeProgress = Math.min(100, mlKitFakeProgress + 2);

            showScanningModal(
                mlKitProgressMessage,
                Math.floor(mlKitFakeProgress)
            );
        }, 28);
    });
}

function prepareImageForNativeOcr(imageSource) {
    return new Promise((resolve, reject) => {
        const image = new Image();

        image.onload = () => {
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");

            if (!context) {
                reject(new Error("Canvas is unavailable."));
                return;
            }

            const maxSide = 2000;
            const originalWidth = image.naturalWidth || image.width;
            const originalHeight = image.naturalHeight || image.height;

            let targetWidth = originalWidth;
            let targetHeight = originalHeight;

            if (Math.max(originalWidth, originalHeight) > maxSide) {
                const scale = maxSide / Math.max(originalWidth, originalHeight);
                targetWidth = Math.round(originalWidth * scale);
                targetHeight = Math.round(originalHeight * scale);
            }

            canvas.width = targetWidth;
            canvas.height = targetHeight;

            context.fillStyle = "#FFFFFF";
            context.fillRect(0, 0, canvas.width, canvas.height);
            context.drawImage(image, 0, 0, targetWidth, targetHeight);

            resolve(canvas.toDataURL("image/jpeg", 0.94));
        };

        image.onerror = () => {
            reject(new Error("Could not load receipt image."));
        };

        image.src = imageSource;
    });
}

function isNonProductDetectedItem(item) {
    const raw = [
        item?.name || "",
        item?.rawName || "",
        item?.sourceLine || ""
    ].join(" ");

    const text = String(raw)
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "");

    if (!text) return true;

    return (
        text.includes("SCPWD") ||
        text.includes("PWD") ||
        text.includes("SENIOR") ||
        text.includes("OSCA") ||
        text.includes("DISCOUNT") ||
        text.includes("LESS12VAT") ||
        text.includes("LESSVAT") ||
        text.includes("VATEXEMPT") ||
        text.includes("VATAMOUNT") ||
        text.includes("VATABLE") ||
        text.includes("ZERORATED") ||
        text.includes("TOTALDUE") ||
        text.includes("CHANGE") ||
        text.includes("CASH") ||
        text.includes("PAYMAYA") ||
        text.includes("BDOATM") ||
        text.includes("AUTHCODE") ||
        text.includes("CARDNO")
    );
}

function renderReview(receipt, rawText) {
    const parsedItems = Array.isArray(receipt.items) ? receipt.items : [];

    currentDetectedItems = dedupeAndSortReceiptItems(
        parsedItems.filter(item => !isNonProductDetectedItem(item)),
        rawText
    );

    currentDetectedItems = applyFinalDatabaseProductNames(
        currentDetectedItems,
        receipt
    );

    currentDetectedItems = dedupeAndSortReceiptItems(
        currentDetectedItems,
        rawText
    );
    currentReceiptAdjustment = calculateReceiptAdjustment(rawText, currentDetectedItems);

    const receiptPaper = document.getElementById("receiptPaper");
    const storeId = normalizeStoreId(getStoreId(receipt));

    if (receiptPaper) {
        receiptPaper.setAttribute("data-store", storeId);
    }

    setText("storeNameText", getStoreName(receipt));
    setText("receiptNumberText", receipt.receiptNumber || "N/A");
    setText("receiptDateText", receipt.receiptDate || "N/A");
    setText(
        "itemCountText",
        `${currentDetectedItems.length} item${currentDetectedItems.length === 1 ? "" : "s"}`
    );

    const rawTextOutput = document.getElementById("rawTextOutput");

    if (rawTextOutput) {
        rawTextOutput.value = rawText || "";
    }

    renderStoreLogo(receipt.store || {});
    renderDetectedItems(currentDetectedItems);
    renderReceiptAdjustmentSummary();
    updateSubtotalDisplay();
}

function renderStoreLogo(store) {
    const logo = document.getElementById("storeLogoImage");
    const fallback = document.getElementById("storeLogoFallback");

    if (!logo || !fallback) return;

    if (!store.logo) {
        logo.style.display = "none";
        fallback.style.display = "block";
        return;
    }

    logo.src = store.logo;

    logo.onload = () => {
        logo.style.display = "block";
        fallback.style.display = "none";
    };

    logo.onerror = () => {
        logo.style.display = "none";
        fallback.style.display = "block";
    };
}

function renderDetectedItems(items) {
    const list = document.getElementById("detectedItemsList");

    if (!list) return;

    if (!items || items.length === 0) {
        list.innerHTML = `
            <article class="receipt-item-card" data-category="Others">
                <div class="receipt-item-inner">
                    <div class="receipt-item-line">
                        <span class="receipt-item-qty">0</span>
                        <span class="receipt-item-name">No items detected</span>
                        <span class="receipt-item-price">₱0.00</span>
                    </div>
                </div>
            </article>
        `;
        return;
    }

    const categories = getCategoryList();

    list.innerHTML = items.map(item => {
        const itemId = item.id || makeItemId();
        const itemCategory = item.category || "Others";

        item.id = itemId;
        item.category = itemCategory;

        return `
            <article
                class="receipt-item-card"
                data-item-id="${escapeHtml(itemId)}"
                data-category="${escapeHtml(itemCategory)}">

                <button class="receipt-delete-button" type="button" data-delete-id="${escapeHtml(itemId)}">
                    <i class="bi bi-trash"></i>
                </button>

                <div class="receipt-item-inner">
                    <div class="receipt-item-line">
                        <span class="receipt-item-qty">${escapeHtml(item.quantity || 1)}</span>
                        <span class="receipt-item-name">${escapeHtml(item.name || "Unnamed Item")}</span>
                        <span class="receipt-item-price">${peso(item.price)}</span>
                    </div>

                    <select data-category-select="${escapeHtml(itemId)}">
                        ${categories.map(category => `
                            <option value="${escapeHtml(category)}" ${category === itemCategory ? "selected" : ""}>
                                ${escapeHtml(category)}
                            </option>
                        `).join("")}
                    </select>
                </div>
            </article>
        `;
    }).join("");

    bindItemControls();
}

function bindItemControls() {
    const list = document.getElementById("detectedItemsList");

    if (!list) return;

    list.querySelectorAll("select").forEach(select => {
        select.addEventListener("change", () => {
            const item = findItem(select.dataset.categorySelect);
            const card = select.closest(".receipt-item-card");

            if (item) {
                item.category = select.value;
            }

            if (card) {
                card.setAttribute("data-category", select.value);
            }
        });
    });

    list.querySelectorAll(".receipt-delete-button").forEach(button => {
        button.addEventListener("click", () => {
            openDeleteModal(button.dataset.deleteId);
        });
    });

    list.querySelectorAll(".receipt-item-card").forEach(card => {
        attachSwipeDelete(card);
    });
}

function findItem(itemId) {
    return currentDetectedItems.find(item => item.id === itemId);
}

function attachSwipeDelete(card) {
    let startX = 0;
    let currentX = 0;
    let isSwiping = false;
    let isMouseDown = false;

    card.addEventListener("touchstart", event => {
        if (event.target.closest("select") || event.target.closest("button")) return;

        startX = event.touches[0].clientX;
        currentX = startX;
        isSwiping = true;
    });

    card.addEventListener("touchmove", event => {
        if (!isSwiping) return;

        currentX = event.touches[0].clientX;
        handleSwipe(card, currentX - startX);
    });

    card.addEventListener("touchend", () => {
        isSwiping = false;
    });

    card.addEventListener("mousedown", event => {
        if (event.target.closest("select") || event.target.closest("button")) return;

        startX = event.clientX;
        currentX = startX;
        isMouseDown = true;
    });

    card.addEventListener("mousemove", event => {
        if (!isMouseDown) return;

        currentX = event.clientX;
        handleSwipe(card, currentX - startX);
    });

    card.addEventListener("mouseup", () => {
        isMouseDown = false;
    });

    card.addEventListener("mouseleave", () => {
        isMouseDown = false;
    });
}

function handleSwipe(card, diffX) {
    if (diffX < -35) {
        closeOtherDeletePanels(card);
        card.classList.add("reveal-delete");
    }

    if (diffX > 25) {
        card.classList.remove("reveal-delete");
    }
}

function closeOtherDeletePanels(activeCard) {
    document.querySelectorAll(".receipt-item-card").forEach(card => {
        if (card !== activeCard) {
            card.classList.remove("reveal-delete");
        }
    });
}

function openDeleteModal(itemId) {
    pendingDeleteItemId = itemId;

    if (deleteConfirmModal) {
        deleteConfirmModal.classList.remove("hidden");
    } else {
        deleteItem(itemId);
    }
}

function closeDeleteModal() {
    pendingDeleteItemId = null;

    if (deleteConfirmModal) {
        deleteConfirmModal.classList.add("hidden");
    }

    document.querySelectorAll(".receipt-item-card").forEach(card => {
        card.classList.remove("reveal-delete");
    });
}

function deleteItem(itemId) {
    currentDetectedItems = currentDetectedItems.filter(item => item.id !== itemId);

    currentReceiptAdjustment = null;
    renderDetectedItems(currentDetectedItems);
    renderReceiptAdjustmentSummary();
    updateSubtotalDisplay();

    setText("itemCountText", `${currentDetectedItems.length} item${currentDetectedItems.length === 1 ? "" : "s"}`);
}

function updateSubtotalDisplay() {
    const productSubtotal = getProductSubtotal();
    let finalTotal = productSubtotal;

    if (currentReceiptAdjustment && currentReceiptAdjustment.amount > 0) {
        finalTotal = currentReceiptAdjustment.finalTotal;
    }

    setText("productSubtotalText", peso(productSubtotal));
    setText("totalSubtotalText", peso(finalTotal));
}

function getProductSubtotal() {
    return roundMoney(
        currentDetectedItems.reduce((sum, item) => {
            return sum + Number(item.price || 0);
        }, 0)
    );
}

function renderReceiptAdjustmentSummary() {
    const summaryBox = document.getElementById("receiptAdjustmentSummary");
    const discountRow = document.getElementById("discountAdjustmentRow");
    const discountLabel = document.getElementById("discountAdjustmentLabel");
    const discountAmount = document.getElementById("discountAdjustmentAmount");

    if (!summaryBox || !discountRow || !discountLabel || !discountAmount) {
        return;
    }

    if (!currentReceiptAdjustment || currentReceiptAdjustment.amount <= 0) {
        summaryBox.classList.add("hidden");
        discountRow.classList.add("hidden");
        return;
    }

    summaryBox.classList.remove("hidden");
    discountRow.classList.remove("hidden");

    discountLabel.textContent = currentReceiptAdjustment.label;
    discountAmount.textContent = `-${peso(currentReceiptAdjustment.amount)}`;
}

function calculateReceiptAdjustment(rawText, items) {
    const productSubtotal = roundMoney(
        (items || []).reduce((sum, item) => {
            return sum + Number(item.price || 0);
        }, 0)
    );

    if (productSubtotal <= 0) {
        return null;
    }

    if (!hasScPwdDiscountSignal(rawText)) {
        return null;
    }

    const finalPaidTotal = extractFinalPaidTotal(rawText);

    if (finalPaidTotal > 0 && finalPaidTotal < productSubtotal) {
        const discountAmount = roundMoney(productSubtotal - finalPaidTotal);

        if (discountAmount > 0 && discountAmount < productSubtotal) {
            return {
                label: "SC/PWD Discount",
                amount: discountAmount,
                productSubtotal,
                finalTotal: finalPaidTotal
            };
        }
    }

    const explicitDiscount = extractScPwdDiscountAmount(rawText, productSubtotal);

    if (explicitDiscount <= 0 || explicitDiscount >= productSubtotal) {
        return null;
    }

    const finalTotal = roundMoney(productSubtotal - explicitDiscount);

    if (finalTotal <= 0) {
        return null;
    }

    return {
        label: "SC/PWD Discount",
        amount: explicitDiscount,
        productSubtotal,
        finalTotal
    };
}

function detectReceiptDiscountLabel(rawText) {
    return "SC/PWD Discount";
}

function hasScPwdDiscountSignal(rawText) {
    const text = String(rawText || "").toUpperCase();
    const compact = normalizeDiscountOcrText(rawText);

    const hasPersonSignal =
        /\bPWD\b/i.test(text) ||
        /\bP\.?W\.?D\.?\b/i.test(text) ||
        /\bOSCA\b/i.test(text) ||
        /\bSENIOR\b/i.test(text) ||
        /\bSENIOR\s+CITIZEN\b/i.test(text) ||
        /\bSC\s*\/\s*PWD\b/i.test(text) ||
        /\bSC\s*5\s*%?/i.test(text) ||
        compact.includes("PWDDISC") ||
        compact.includes("PWDISCOUNT") ||
        compact.includes("SCDISC") ||
        compact.includes("SCDISCOUNT") ||
        compact.includes("SENIORCITIZEN") ||
        compact.includes("SC5") ||
        compact.includes("PWD5");

    const hasDiscountSignal =
        /\bDISC\b/i.test(text) ||
        /\bDISCOUNT\b/i.test(text) ||
        /\bLESS\b/i.test(text) ||
        /LESS\s*12\s*%?\s*VAT/i.test(text) ||
        /LESS\s*VAT/i.test(text) ||
        compact.includes("DISC") ||
        compact.includes("DISCOUNT") ||
        compact.includes("LESSVAT") ||
        compact.includes("LESS12VAT") ||
        compact.includes("VATEXEMPT") ||
        compact.includes("VATEXEMPTSALES") ||
        compact.includes("SC5") ||
        compact.includes("PWD5");

    return hasPersonSignal && hasDiscountSignal;
}

function extractScPwdDiscountAmount(rawText, productSubtotal) {
    const lines = String(rawText || "")
        .split(/\n+/)
        .map(line => line.trim())
        .filter(Boolean);

    const values = [];

    for (let index = 0; index < lines.length; index++) {
        const line = lines[index];
        const nearbyText = [
            lines[index - 2] || "",
            lines[index - 1] || "",
            line,
            lines[index + 1] || "",
            lines[index + 2] || ""
        ].join(" ");

        if (!isScPwdDiscountContext(nearbyText)) {
            continue;
        }

        const sameLineValues = extractReceiptMoneyValues(line)
            .filter(value => isValidScPwdDiscountValue(value, productSubtotal));

        sameLineValues.forEach(value => values.push(value));

        for (let offset = 1; offset <= 3; offset++) {
            const nextLine = lines[index + offset];

            if (!nextLine) continue;

            const nextUpper = nextLine.toUpperCase();

            if (
                nextUpper.includes("TOTAL DUE") ||
                nextUpper.includes("TOTAL DU") ||
                nextUpper.includes("CASH") ||
                nextUpper.includes("CHANGE") ||
                nextUpper.includes("VATABLE SALES") ||
                nextUpper.includes("VATABLE") ||
                nextUpper.includes("VAT AMOUNT")
            ) {
                break;
            }

            const nextValue = extractStandaloneReceiptMoney(nextLine);

            if (isValidScPwdDiscountValue(nextValue, productSubtotal)) {
                values.push(nextValue);
                break;
            }
        }
    }

    const cleanedValues = values
        .map(value => roundMoney(value))
        .filter(value => value > 0);

    if (cleanedValues.length === 0) {
        return 0;
    }

    const uniqueValues = [...new Set(cleanedValues.map(value => value.toFixed(2)))]
        .map(value => Number(value));

    return roundMoney(
        uniqueValues.reduce((sum, value) => sum + value, 0)
    );
}

function isScPwdDiscountContext(text) {
    const raw = String(text || "").toUpperCase();
    const compact = normalizeDiscountOcrText(text);

    const hasPersonSignal =
        /\bPWD\b/i.test(raw) ||
        /\bP\.?W\.?D\.?\b/i.test(raw) ||
        /\bOSCA\b/i.test(raw) ||
        /\bSENIOR\b/i.test(raw) ||
        /\bSC\s*\/\s*PWD\b/i.test(raw) ||
        /\bSC\s*5\s*%?/i.test(raw) ||
        compact.includes("PWDDISC") ||
        compact.includes("PWDISCOUNT") ||
        compact.includes("SCDISC") ||
        compact.includes("SCDISCOUNT") ||
        compact.includes("SENIORCITIZEN") ||
        compact.includes("SC5") ||
        compact.includes("PWD5");

    const hasDiscountSignal =
        /\bDISC\b/i.test(raw) ||
        /\bDISCOUNT\b/i.test(raw) ||
        /\bLESS\b/i.test(raw) ||
        /LESS\s*12\s*%?\s*VAT/i.test(raw) ||
        /LESS\s*VAT/i.test(raw) ||
        compact.includes("DISC") ||
        compact.includes("DISCOUNT") ||
        compact.includes("LESSVAT") ||
        compact.includes("LESS12VAT") ||
        compact.includes("VATEXEMPT") ||
        compact.includes("VATEXEMPTSALES") ||
        compact.includes("SC5") ||
        compact.includes("PWD5");

    return hasPersonSignal && hasDiscountSignal;
}

function isValidScPwdDiscountValue(value, productSubtotal) {
    const amount = Number(value || 0);

    if (amount <= 0) return false;
    if (amount >= productSubtotal) return false;

    return amount <= productSubtotal * 0.50;
}

function normalizeDiscountOcrText(value) {
    return String(value || "")
        .toUpperCase()
        .replace(/₱/g, "")
        .replace(/[%]/g, "")
        .replace(/[^A-Z0-9]/g, "");
}

function extractExplicitScPwdDiscountAmount(rawText, productSubtotal) {
    const lines = String(rawText || "")
        .split(/\n+/)
        .map(line => line.trim())
        .filter(Boolean);

    const discountValues = [];

    lines.forEach(line => {
        const upper = line.toUpperCase();

        const isScPwdDiscountLine =
            /\bPWD\b/.test(upper) ||
            /\bOSCA\b/.test(upper) ||
            /\bSENIOR\b/.test(upper) ||
            /\bSC\s*\/\s*PWD\b/.test(upper) ||
            /\bSC\s*5\s*%/.test(upper) ||
            /\bPWD\s*5\s*%/.test(upper) ||
            /\bSC\s*DISCOUNT\b/.test(upper) ||
            /\bPWD\s*DISCOUNT\b/.test(upper);

        const isScPwdVatLine =
            (
                upper.includes("LESS 12% VAT") ||
                upper.includes("LESS VAT")
            ) &&
            hasScPwdDiscountSignal(rawText);

        if (!isScPwdDiscountLine && !isScPwdVatLine) {
            return;
        }

        const value = extractScPwdDiscountMoneyFromLine(line, productSubtotal);

        if (value > 0) {
            discountValues.push(value);
        }
    });

    if (discountValues.length === 0) {
        return 0;
    }

    const uniqueValues = [...new Set(discountValues.map(value => value.toFixed(2)))]
        .map(value => Number(value));

    return roundMoney(
        uniqueValues.reduce((sum, value) => sum + value, 0)
    );
}

function extractScPwdDiscountMoneyFromLine(line, productSubtotal) {
    const values = extractReceiptMoneyValues(line)
        .filter(value => {
            return (
                value > 0 &&
                value < productSubtotal &&
                value <= productSubtotal * 0.50
            );
        });

    if (values.length === 0) {
        return 0;
    }

    values.sort((a, b) => a - b);

    return values[0];
}

function extractFinalPaidTotal(rawText) {
    const text = String(rawText || "");
    const lines = text
        .split(/\n+/)
        .map(line => line.trim())
        .filter(Boolean);

    const sameLinePatterns = [
        /TOTAL\s*DUE\s+(?:PHP\s*)?(\d{1,3}(?:,\d{3})*[.,]\d{2}|\d{1,6}[.,]\d{2}|\d{1,3}(?:,\d{3})+,\d{2})/i,
        /TOTAL\s*DU\s+(?:PHP\s*)?(\d{1,3}(?:,\d{3})*[.,]\d{2}|\d{1,6}[.,]\d{2}|\d{1,3}(?:,\d{3})+,\d{2})/i,
        /TOTALDUE\s+(?:PHP\s*)?(\d{1,3}(?:,\d{3})*[.,]\d{2}|\d{1,6}[.,]\d{2}|\d{1,3}(?:,\d{3})+,\d{2})/i,
        /TOTAL\s+AMOUNT\s+(?:PHP\s*)?(\d{1,3}(?:,\d{3})*[.,]\d{2}|\d{1,6}[.,]\d{2}|\d{1,3}(?:,\d{3})+,\d{2})/i,
        /AMOUNT\s+DUE\s+(?:PHP\s*)?(\d{1,3}(?:,\d{3})*[.,]\d{2}|\d{1,6}[.,]\d{2}|\d{1,3}(?:,\d{3})+,\d{2})/i,
        /PHP\s+(\d{1,3}(?:,\d{3})*[.,]\d{2}|\d{1,6}[.,]\d{2}|\d{1,3}(?:,\d{3})+,\d{2})/i
    ];

    for (const pattern of sameLinePatterns) {
        const match = text.match(pattern);

        if (match) {
            const value = parseReceiptMoney(match[1]);

            if (value > 0) {
                return value;
            }
        }
    }

    for (let index = 0; index < lines.length; index++) {
        const upper = lines[index].toUpperCase();

        if (
            upper.includes("TOTAL DUE") ||
            upper.includes("TOTAL DU") ||
            upper.includes("TOTALDUE") ||
            upper.includes("TOTAL AMOUNT") ||
            upper.includes("AMOUNT DUE")
        ) {
            const sameLineValue = extractAnyReceiptMoney(lines[index]);

            if (sameLineValue > 0) {
                return sameLineValue;
            }

            for (let offset = 1; offset <= 8; offset++) {
                const nextLine = lines[index + offset];

                if (!nextLine) continue;

                const nextUpper = nextLine.toUpperCase();

                if (
                    nextUpper.includes("VATABLE") ||
                    nextUpper.includes("VAT AMOUNT") ||
                    nextUpper.includes("ZERO-RATED") ||
                    nextUpper.includes("VAT-EXEMPT") ||
                    nextUpper.includes("CASH") ||
                    nextUpper.includes("CHANGE") ||
                    nextUpper.includes("CARD")
                ) {
                    continue;
                }

                const value = extractAnyReceiptMoney(nextLine);

                if (value > 0) {
                    return value;
                }
            }
        }
    }

    return 0;
}

function extractExplicitReceiptDiscountAmount(rawText, productSubtotal) {
    const lines = String(rawText || "")
        .split(/\n+/)
        .map(line => line.trim())
        .filter(Boolean);

    for (let index = 0; index < lines.length; index++) {
        const line = lines[index];
        const upper = line.toUpperCase();

        const isScPwdDiscountLine =
            upper.includes("SC 5%") ||
            upper.includes("SC5") ||
            upper.includes("PWD 5%") ||
            upper.includes("PWD5") ||
            upper.includes("SENIOR DISCOUNT") ||
            upper.includes("PWD DISCOUNT") ||
            upper.includes("SC DISCOUNT");

        if (!isScPwdDiscountLine) {
            continue;
        }

        const sameLineDiscount = extractDiscountMoneyFromLine(line, productSubtotal);

        if (sameLineDiscount > 0) {
            return sameLineDiscount;
        }

        for (let offset = 1; offset <= 3; offset++) {
            const nextLine = lines[index + offset];

            if (!nextLine) continue;

            const nextUpper = nextLine.toUpperCase();

            if (
                nextUpper.includes("ADD 12% VAT") ||
                nextUpper.includes("LESS 12% VAT") ||
                nextUpper.includes("TOTAL") ||
                nextUpper.includes("VATABLE") ||
                nextUpper.includes("VAT AMOUNT")
            ) {
                continue;
            }

            const nextValue = extractAnyReceiptMoney(nextLine);

            if (nextValue > 0 && nextValue < productSubtotal) {
                return nextValue;
            }
        }
    }

    for (let index = 0; index < lines.length; index++) {
        const line = lines[index];
        const upper = line.toUpperCase();

        if (!upper.includes("DISCOUNT")) {
            continue;
        }

        if (
            upper.includes("LESS 12% VAT") ||
            upper.includes("VAT AMOUNT") ||
            upper.includes("VATABLE")
        ) {
            continue;
        }

        const value = extractDiscountMoneyFromLine(line, productSubtotal);

        if (value > 0) {
            return value;
        }
    }

    return 0;
}

function extractDiscountMoneyFromLine(line, productSubtotal) {
    const values = extractReceiptMoneyValues(line)
        .filter(value => value > 0 && value < productSubtotal);

    if (values.length === 0) {
        return 0;
    }

    values.sort((a, b) => a - b);

    return values[0];
}

function extractReceiptMoneyValues(line) {
    const text = String(line || "")
        .replace(/[₱]/g, "")
        .trim();

    const matches = [...text.matchAll(/(?:PHP\s*)?(\d{1,3}(?:,\d{3})*[.,]\d{2}|\d{1,6}[.,]\d{2}|\d{1,3}(?:,\d{3})+,\d{2})/gi)];

    return matches
        .map(match => parseReceiptMoney(match[1]))
        .filter(value => value > 0);
}

function extractAnyReceiptMoney(line) {
    const clean = String(line || "")
        .trim()
        .replace(/[₱]/g, "")
        .trim();

    const match = clean.match(/(?:PHP\s*)?(\d{1,3}(?:,\d{3})*[.,]\d{2}|\d{1,6}[.,]\d{2}|\d{1,3}(?:,\d{3})+,\d{2})/i);

    if (!match) {
        return 0;
    }

    return parseReceiptMoney(match[1]);
}

function extractStandaloneReceiptMoney(line) {
    const clean = String(line || "")
        .trim()
        .replace(/[₱]/g, "")
        .replace(/^PHP\s+/i, "")
        .trim();

    const match = clean.match(/^(\d{1,3}(?:,\d{3})*[.,]\d{2}|\d{1,6}[.,]\d{2}|\d{1,3}(?:,\d{3})+,\d{2})$/);

    if (!match) {
        return 0;
    }

    return parseReceiptMoney(match[1]);
}

function parseReceiptMoney(value) {
    let text = String(value || "")
        .trim()
        .replace(/[₱\s]/g, "");

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

    return isNaN(number) ? 0 : roundMoney(number);
}

function roundMoney(value) {
    return Math.round(Number(value || 0) * 100) / 100;
}

function showReviewView() {
    if (scanView) {
        scanView.classList.remove("active");
    }

    if (reviewView) {
        reviewView.classList.add("active");
    }

    setPageMode("review");

    if (reviewActionBar) {
        reviewActionBar.classList.remove("hidden");
    }

    const receiptPaper = document.getElementById("receiptPaper");

    if (receiptPaper) {
        receiptPaper.classList.remove("printing-receipt");
        void receiptPaper.offsetWidth;
        receiptPaper.classList.add("printing-receipt");
    }

    const scrollArea = document.querySelector(".scanner-scroll-area");

    if (scrollArea) {
        scrollArea.scrollTo(0, 0);
    }
}

function showScanView() {
    if (reviewView) {
        reviewView.classList.remove("active");
    }

    if (scanView) {
        scanView.classList.add("active");
    }

    setPageMode("scan");

    if (reviewActionBar) {
        reviewActionBar.classList.add("hidden");
    }

    replayInstructionAnimation();

    const scrollArea = document.querySelector(".scanner-scroll-area");

    if (scrollArea) {
        scrollArea.scrollTo(0, 0);
    }
}

function saveExpenses() {
    if (!currentDetectedItems || currentDetectedItems.length === 0) {
        showToast("No detected items to save.");
        return;
    }

    const savedExpenses = JSON.parse(localStorage.getItem("kabalikat_scanned_expenses")) || [];

    const newExpenses = currentDetectedItems.map(item => ({
        id: item.id || makeItemId(),
        title: item.name || "Unnamed Item",
        rawTitle: item.rawName || item.name || "Unnamed Item",
        quantity: Number(item.quantity || 1),
        category: item.category || "Others",
        amount: Number(item.price || 0),
        receiptImage: item.receiptImage || currentReceiptImage,
        addedBy: "Shared",
        source: "OCR Receipt Scanner",
        createdAt: new Date().toISOString()
    }));

    if (currentReceiptAdjustment && currentReceiptAdjustment.amount > 0) {
        newExpenses.push({
            id: makeItemId(),
            title: currentReceiptAdjustment.label,
            rawTitle: currentReceiptAdjustment.label,
            quantity: 1,
            category: "Others",
            amount: -Number(currentReceiptAdjustment.amount || 0),
            receiptImage: currentReceiptImage,
            addedBy: "Shared",
            source: "OCR Receipt Scanner",
            createdAt: new Date().toISOString()
        });
    }

    localStorage.setItem(
        "kabalikat_scanned_expenses",
        JSON.stringify([...newExpenses, ...savedExpenses])
    );

    showToast("Scanned expenses saved.");
}

function showScanningModal(message, percent = 0) {
    const safePercent = Math.round(Math.min(Math.max(percent, 0), 100));
    const receiptHeight = 22 + safePercent * 0.95;

    if (scanningModalText) {
        scanningModalText.textContent = message;
    }

    if (scanPercentText) {
        scanPercentText.textContent = `${safePercent}%`;
    }

    if (miniProgressFill) {
        miniProgressFill.style.width = `${safePercent}%`;
    }

    if (miniReceipt) {
        miniReceipt.style.setProperty("--receipt-print-height", `${receiptHeight}px`);
    }

    if (scanningModal) {
        scanningModal.classList.remove("hidden");
    }
}

function hideScanningModal() {
    if (scanningModal) {
        scanningModal.classList.add("hidden");
    }

    if (scanPercentText) {
        scanPercentText.textContent = "0%";
    }

    if (miniProgressFill) {
        miniProgressFill.style.width = "0%";
    }

    if (miniReceipt) {
        miniReceipt.style.setProperty("--receipt-print-height", "22px");
    }
}

function setScanningStoreTheme(storeId) {
    const normalizedStoreId = normalizeStoreId(storeId);
    const theme = storeScanThemes[normalizedStoreId] || storeScanThemes.unknown;

    document.documentElement.style.setProperty("--scan-receipt-color", theme.receipt);
    document.documentElement.style.setProperty("--scan-progress-color", theme.progress);
}

function isLikelyReceipt(rawText, parsedReceipt) {
    const text = String(rawText || "").toUpperCase();
    const items = parsedReceipt && parsedReceipt.items ? parsedReceipt.items : [];
    const storeId = normalizeStoreId(getStoreId(parsedReceipt));

    const supportedStoreWords = [
        "SAVEMORE",
        "SAVE MORE",
        "SANFORD",
        "PUREGOLD",
        "PURE GOLD",
        "MERCURY",
        "7-ELEVEN",
        "7 ELEVEN",
        "711",
        "ALFAMART",
        "ALFA MART",
        "ALFAMETRO"
    ];

    const receiptWords = [
        "RECEIPT",
        "INVOICE",
        "TOTAL",
        "AMOUNT",
        "CASH",
        "CHANGE",
        "VAT",
        "TIN",
        "DATE",
        "QTY",
        "SUBTOTAL",
        "ITEM",
        "SALES"
    ];

    const hasSupportedStoreName = supportedStoreWords.some(word => text.includes(word));
    const hasReceiptWord = receiptWords.some(word => text.includes(word));
    const hasMoneyPattern = /(\d+\.\d{2})|₱|PHP|PESO/.test(text);
    const hasDatePattern = /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}/.test(text);
    const hasEnoughItems = items.length >= 1;
    const hasTotalLikeValue = items.some(item => Number(item.price || 0) > 0);
    const hasSupportedStore = storeId !== "unknown";

    return (
        (hasSupportedStore && hasMoneyPattern) ||
        (hasSupportedStoreName && hasMoneyPattern) ||
        (hasReceiptWord && hasMoneyPattern) ||
        (hasEnoughItems && hasMoneyPattern && hasTotalLikeValue) ||
        (hasDatePattern && hasMoneyPattern && hasReceiptWord)
    );
}

function extractPrintedItemCount(text) {
    const match = String(text || "").match(/(\d{1,3})\s*ITEM\s*\(?S?\)?/i);

    if (!match) return 0;

    const value = Number(match[1]);

    return isNaN(value) ? 0 : value;
}

function extractPrintedTotalDue(text) {
    const raw = String(text || "");

    const patterns = [
        /TOTAL\s+DUE\s+(?:PHP\s*)?(\d{1,3}(?:,\d{3})*\.\d{2}|\d{1,6}[.,]\d{2})/i,
        /TOTAL\s+DUE\s+PHP\s+(\d{1,3}(?:,\d{3})*\.\d{2}|\d{1,6}[.,]\d{2})/i,
        /TOTAL\s+(?:PHP\s*)?(\d{1,3}(?:,\d{3})*\.\d{2}|\d{1,6}[.,]\d{2})/i
    ];

    for (const pattern of patterns) {
        const match = raw.match(pattern);

        if (match) {
            return Number(String(match[1]).replace(",", "."));
        }
    }

    return 0;
}

function showInvalidReceiptModal() {
    if (invalidReceiptModal) {
        invalidReceiptModal.classList.remove("hidden");
    }
}

function closeInvalidReceiptModal() {
    if (invalidReceiptModal) {
        invalidReceiptModal.classList.add("hidden");
    }
}

function normalizeStoreId(storeId) {
    const value = String(storeId || "unknown")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");

    if (
        value.includes("savemore") ||
        value.includes("savem0re") ||
        value.includes("smmarket") ||
        value.includes("sanford")
    ) {
        return "savemore";
    }

    if (value.includes("puregold")) {
        return "puregold";
    }

    if (value.includes("mercury")) {
        return "mercury";
    }

    if (value.includes("7eleven") || value.includes("711") || value.includes("seveneleven")) {
        return "seveneleven";
    }

    if (value.includes("alfamart") || value.includes("alfametro")) {
        return "alfamart";
    }

    return "unknown";
}

function getStoreId(receipt) {
    if (!receipt || !receipt.store) {
        return "unknown";
    }

    return receipt.store.id || receipt.store.key || receipt.store.name || "unknown";
}

function getStoreName(receipt) {
    if (!receipt || !receipt.store) {
        return "Unknown Store";
    }

    return receipt.store.name || "Unknown Store";
}

function getCategoryList() {
    if (typeof KABALIKAT_CATEGORIES !== "undefined" && Array.isArray(KABALIKAT_CATEGORIES)) {
        return KABALIKAT_CATEGORIES;
    }

    return defaultCategories;
}

function makeItemId() {
    return `item-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

function setText(id, value) {
    const element = document.getElementById(id);

    if (element) {
        element.textContent = value;
    }
}

function peso(value) {
    return `₱${Number(value || 0).toLocaleString("en-PH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
}

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function showToast(message) {
    const toast = document.getElementById("toast");

    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}
