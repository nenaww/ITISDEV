let cameraStream = null;
let isScanning = false;
let currentReceiptImage = "";
let currentDetectedItems = [];
let pendingDeleteItemId = null;
let currentReceiptAdjustment = null;

let mlKitProgressTimer = null;
let mlKitFakeProgress = 35;

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
        showToast("ML Kit OCR bridge is missing. Check MainActivity.kt.");
        return;
    }

    if (typeof parseKabalikatReceipt !== "function") {
        showToast("Receipt parser file is missing.");
        return;
    }

    isScanning = true;
    setScanningStoreTheme("unknown");
    showScanningModal("Preparing receipt image...", 8);

    try {
        const preparedImage = await prepareImageForNativeOcr(imageSource);

        currentReceiptImage = preparedImage;

        showScanningModal("Reading receipt with ML Kit...", 35);
        startMlKitProgressLoop();

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
            throw new Error(result && result.error ? result.error : "ML Kit OCR failed.");
        }

        const mlKitText = result.text || "";

        stopMlKitProgressLoop();
        showScanningModal("Checking receipt details...", 86);

        const parsedReceipt = parseKabalikatReceipt(mlKitText, currentReceiptImage, {
            primarySource: "mlkit"
        });

        if (!isLikelyReceipt(mlKitText, parsedReceipt)) {
            hideScanningModal();
            showInvalidReceiptModal();
            isScanning = false;
            return;
        }

        const storeId = normalizeStoreId(getStoreId(parsedReceipt));

        setScanningStoreTheme(storeId);
        showScanningModal("Receipt scan complete.", 100);

        setTimeout(() => {
            renderReview(parsedReceipt, mlKitText);
            hideScanningModal();
            showReviewView();
            isScanning = false;
        }, 650);
    } catch (error) {
        console.error(error);
        stopMlKitProgressLoop();
        hideScanningModal();
        showToast("ML Kit scan failed. Try a clearer receipt image.");
        isScanning = false;
    }
}

window.handleMlKitOcrResult = handleMlKitOcrResult;

function startMlKitProgressLoop() {
    stopMlKitProgressLoop();

    mlKitFakeProgress = 35;

    mlKitProgressTimer = setInterval(() => {
        if (!isScanning) {
            stopMlKitProgressLoop();
            return;
        }

        if (mlKitFakeProgress < 84) {
            mlKitFakeProgress += Math.random() * 3.5;
            showScanningModal("Reading receipt with ML Kit...", Math.round(mlKitFakeProgress));
        }
    }, 350);
}

function stopMlKitProgressLoop() {
    if (mlKitProgressTimer) {
        clearInterval(mlKitProgressTimer);
        mlKitProgressTimer = null;
    }
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

function renderReview(receipt, rawText) {
    currentDetectedItems = receipt.items || [];
    currentReceiptAdjustment = calculateReceiptAdjustment(rawText, currentDetectedItems);

    const receiptPaper = document.getElementById("receiptPaper");
    const storeId = normalizeStoreId(getStoreId(receipt));

    if (receiptPaper) {
        receiptPaper.setAttribute("data-store", storeId);
    }

    setText("storeNameText", getStoreName(receipt));
    setText("receiptNumberText", receipt.receiptNumber || "N/A");
    setText("receiptDateText", receipt.receiptDate || "N/A");
    setText("itemCountText", `${currentDetectedItems.length} item${currentDetectedItems.length === 1 ? "" : "s"}`);

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

    let finalTotal = extractFinalPaidTotal(rawText);
    const explicitDiscount = extractExplicitReceiptDiscountAmount(rawText, productSubtotal);

    if (
        explicitDiscount > 0 &&
        (
            !finalTotal ||
            finalTotal <= 0 ||
            finalTotal >= productSubtotal ||
            roundMoney(productSubtotal - finalTotal) <= 0.50
        )
    ) {
        finalTotal = roundMoney(productSubtotal - explicitDiscount);
    }

    if (!finalTotal || finalTotal <= 0) {
        return null;
    }

    if (finalTotal >= productSubtotal) {
        return null;
    }

    const discountAmount = roundMoney(productSubtotal - finalTotal);

    if (discountAmount <= 0.50) {
        return null;
    }

    return {
        label: detectReceiptDiscountLabel(rawText),
        amount: discountAmount,
        productSubtotal,
        finalTotal
    };
}

function detectReceiptDiscountLabel(rawText) {
    const text = String(rawText || "").toUpperCase();

    if (
        text.includes("PWD") ||
        text.includes("OSCA") ||
        text.includes("SENIOR") ||
        text.includes("SC 5%") ||
        text.includes("SC5") ||
        text.includes("LESS 12% VAT")
    ) {
        return "SC/PWD Discount";
    }

    if (
        text.includes("DISCOUNT") ||
        text.includes("DISC") ||
        text.includes("LESS")
    ) {
        return "Receipt Discount";
    }

    return "Receipt Adjustment";
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
    const safePercent = Math.min(Math.max(percent, 0), 100);
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