const VAULT_TICKET_KEY = "kabalikat_vault_unlock_ticket_v3";
const IDLE_LIMIT = 5 * 60 * 1000;

let user = null;
let actor = null;
let vault = null;
let state = null;
let selectedFileId = "";
let activeFolder = "all";
let idleTimer = null;
let toastTimer = null;

const filters = {
    type: "all",
    search: "",
    month: "",
    year: ""
};

const el = {};

window.addEventListener("DOMContentLoaded", async () => {
    try {
        user = await KabalikatAuth.getCurrentUser();

        if (!user || !consumeTicket(user)) {
            window.location.replace("profile.html");
            return;
        }

        actor = {
            id: user.id,
            name: firstName(user.name),
            role: user.role
        };

        vault = KabalikatVault.forFamily(user.familyCode);

        collectElements();
        bindEvents();
        renderAll();
        setupAutoLock();
    } catch (error) {
        console.error(error);
        window.location.replace("profile.html");
    }
});

function consumeTicket(currentUser) {
    const rawTicket = sessionStorage.getItem(VAULT_TICKET_KEY);
    sessionStorage.removeItem(VAULT_TICKET_KEY);

    if (!rawTicket) return false;

    try {
        const ticket = JSON.parse(rawTicket);

        return (
            ticket.userId === currentUser.id &&
            ticket.familyCode === currentUser.familyCode &&
            Number(ticket.expiresAt) > Date.now()
        );
    } catch {
        return false;
    }
}

function collectElements() {
    [
        "vaultBackButton", "vaultAddButton", "vaultFamilyTitle",
        "vaultSearchInput", "clearVaultSearch", "vaultTypeFilters",
        "vaultMonthFilter", "vaultYearFilter", "clearVaultDateFilter",
        "vaultTotalCount", "vaultReceiptCount", "vaultWarrantyCount", "vaultDocumentCount",
        "openVaultTrashButton", "vaultCreateFolderButton", "vaultFolderGrid",
        "vaultFilesLabel", "vaultFilesHeading", "vaultVisibleCount", "vaultFileList",
        "vaultAddBackdrop", "vaultAddSheet", "closeVaultAddSheet",
        "vaultScanReceiptOption", "vaultUploadReceiptOption", "vaultUploadDocumentOption",
        "vaultNewFolderOption", "vaultReceiptUploadInput", "vaultDocumentUploadInput",
        "vaultFolderBackdrop", "vaultFolderSheet", "closeVaultFolderSheet",
        "vaultFolderNameInput", "saveVaultFolderButton",
        "vaultFileOptionsBackdrop", "vaultFileOptionsSheet", "vaultOptionsFileName",
        "vaultOptionsFileMeta", "vaultPreviewOption", "vaultRenameOption",
        "vaultMoveOption", "vaultDownloadOption", "vaultTrashOption",
        "vaultRenameBackdrop", "vaultRenameSheet", "closeVaultRenameSheet",
        "vaultRenameInput", "saveVaultRenameButton",
        "vaultMoveBackdrop", "vaultMoveSheet", "closeVaultMoveSheet", "vaultMoveFolderList",
        "vaultPreviewBackdrop", "vaultPreviewSheet", "closeVaultPreviewSheet",
        "vaultPreviewTitle", "vaultPreviewContent",
        "vaultTrashBackdrop", "vaultTrashSheet", "closeVaultTrashSheet",
        "vaultTrashList", "emptyVaultTrashButton",
        "vaultNavHome", "vaultNavExpenses", "vaultNavScan", "vaultNavBills", "vaultNavSavings",
        "vaultToast"
    ].forEach(id => {
        el[id] = document.getElementById(id);
    });
}

function bindEvents() {
    el.vaultBackButton.addEventListener("click", () => {
        window.location.href = "profile.html";
    });

    el.vaultAddButton.addEventListener("click", openAddSheet);
    el.vaultCreateFolderButton.addEventListener("click", openFolderSheet);
    el.openVaultTrashButton.addEventListener("click", openTrashSheet);

    el.vaultSearchInput.addEventListener("input", () => {
        filters.search = el.vaultSearchInput.value.trim().toLowerCase();
        el.clearVaultSearch.hidden = !filters.search;
        renderFiles();
    });

    el.clearVaultSearch.addEventListener("click", () => {
        el.vaultSearchInput.value = "";
        filters.search = "";
        el.clearVaultSearch.hidden = true;
        renderFiles();
    });

    el.vaultTypeFilters.querySelectorAll("[data-vault-type]").forEach(button => {
        button.addEventListener("click", () => {
            filters.type = button.dataset.vaultType;

            el.vaultTypeFilters.querySelectorAll("[data-vault-type]").forEach(item => {
                item.classList.toggle("active", item === button);
            });

            renderFiles();
        });
    });

    el.vaultMonthFilter.addEventListener("change", () => {
        filters.month = el.vaultMonthFilter.value;
        renderFiles();
    });

    el.vaultYearFilter.addEventListener("change", () => {
        filters.year = el.vaultYearFilter.value;
        renderFiles();
    });

    el.clearVaultDateFilter.addEventListener("click", () => {
        filters.month = "";
        filters.year = "";
        el.vaultMonthFilter.value = "";
        el.vaultYearFilter.value = "";
        renderFiles();
    });

    bindBackdrop(el.vaultAddBackdrop, closeAddSheet);
    bindBackdrop(el.vaultFolderBackdrop, closeFolderSheet);
    bindBackdrop(el.vaultFileOptionsBackdrop, closeOptionsSheet);
    bindBackdrop(el.vaultRenameBackdrop, closeRenameSheet);
    bindBackdrop(el.vaultMoveBackdrop, closeMoveSheet);
    bindBackdrop(el.vaultPreviewBackdrop, closePreviewSheet);
    bindBackdrop(el.vaultTrashBackdrop, closeTrashSheet);

    el.closeVaultAddSheet.addEventListener("click", closeAddSheet);
    el.closeVaultFolderSheet.addEventListener("click", closeFolderSheet);
    el.closeVaultRenameSheet.addEventListener("click", closeRenameSheet);
    el.closeVaultMoveSheet.addEventListener("click", closeMoveSheet);
    el.closeVaultPreviewSheet.addEventListener("click", closePreviewSheet);
    el.closeVaultTrashSheet.addEventListener("click", closeTrashSheet);

    el.vaultScanReceiptOption.addEventListener("click", () => {
        window.location.href = "scanner.html";
    });

    el.vaultUploadReceiptOption.addEventListener("click", () => {
        el.vaultReceiptUploadInput.click();
    });

    el.vaultUploadDocumentOption.addEventListener("click", () => {
        el.vaultDocumentUploadInput.click();
    });

    el.vaultNewFolderOption.addEventListener("click", () => {
        closeAddSheet();
        openFolderSheet();
    });

    el.vaultReceiptUploadInput.addEventListener("change", () => {
        uploadFile(el.vaultReceiptUploadInput.files?.[0], "receipt");
        el.vaultReceiptUploadInput.value = "";
    });

    el.vaultDocumentUploadInput.addEventListener("change", () => {
        uploadFile(el.vaultDocumentUploadInput.files?.[0], "document");
        el.vaultDocumentUploadInput.value = "";
    });

    el.saveVaultFolderButton.addEventListener("click", createFolder);
    el.vaultFolderNameInput.addEventListener("keydown", event => {
        if (event.key === "Enter") createFolder();
    });

    el.vaultPreviewOption.addEventListener("click", () => {
        const fileId = selectedFileId;
        closeOptionsSheet();
        openPreview(fileId);
    });

    el.vaultRenameOption.addEventListener("click", openRenameSheet);
    el.vaultMoveOption.addEventListener("click", openMoveSheet);
    el.vaultDownloadOption.addEventListener("click", downloadSelectedFile);
    el.vaultTrashOption.addEventListener("click", moveSelectedFileToTrash);
    el.saveVaultRenameButton.addEventListener("click", saveRename);
    el.emptyVaultTrashButton.addEventListener("click", emptyTrash);

    el.vaultNavHome.addEventListener("click", () => window.location.href = "home.html");
    el.vaultNavExpenses.addEventListener("click", () => window.location.href = "expenses.html");
    el.vaultNavScan.addEventListener("click", () => window.location.href = "scanner.html");
    el.vaultNavBills.addEventListener("click", () => window.location.href = "bills.html");
    el.vaultNavSavings.addEventListener("click", () => window.location.href = "expenses.html#budget-overview");
}

function renderAll() {
    state = vault.load();
    el.vaultFamilyTitle.textContent = `${user.familyCode} Family Vault`;
    renderYears();
    renderSummary();
    renderFolders();
    renderFiles();
    renderTrash();
}

function getActiveFiles() {
    return state.files.filter(file => !file.trashedAt);
}

function renderSummary() {
    const files = getActiveFiles();

    el.vaultTotalCount.textContent = files.length;
    el.vaultReceiptCount.textContent = files.filter(file => file.type === "receipt").length;
    el.vaultWarrantyCount.textContent = files.filter(file => file.type === "warranty").length;
    el.vaultDocumentCount.textContent = files.filter(file => file.type === "document").length;
}

function renderYears() {
    const years = new Set([String(new Date().getFullYear())]);

    state.files.forEach(file => {
        const year = String(file.date || "").slice(0, 4);
        if (year) years.add(year);
    });

    el.vaultYearFilter.innerHTML = `
        <option value="">All years</option>
        ${[...years].sort((a, b) => Number(b) - Number(a)).map(year => `
            <option value="${year}">${year}</option>
        `).join("")}
    `;

    el.vaultYearFilter.value = filters.year;
}

function renderFolders() {
    const files = getActiveFiles();
    const folders = [{ id: "all", name: "All Files" }, ...state.folders];

    el.vaultFolderGrid.innerHTML = folders.map(folder => {
        const count = folder.id === "all"
            ? files.length
            : files.filter(file => file.folderId === folder.id).length;

        return `
            <button class="vault-folder-card ${activeFolder === folder.id ? "active" : ""}"
                            type="button"
                            data-folder-id="${escapeHtml(folder.id)}">
                <i class="bi ${folder.id === "all" ? "bi-collection" : "bi-folder-fill"}"></i>
                <strong>${escapeHtml(folder.name)}</strong>
                <span>${count} ${count === 1 ? "item" : "items"}</span>
            </button>
        `;
    }).join("");

    el.vaultFolderGrid.querySelectorAll("[data-folder-id]").forEach(button => {
        button.addEventListener("click", () => {
            activeFolder = button.dataset.folderId;
            renderFolders();
            renderFiles();
        });
    });
}

function getVisibleFiles() {
    return getActiveFiles()
        .filter(file => filters.type === "all" || file.type === filters.type)
        .filter(file => activeFolder === "all" || file.folderId === activeFolder)
        .filter(file => !filters.month || String(file.date).slice(5, 7) === filters.month)
        .filter(file => !filters.year || String(file.date).slice(0, 4) === filters.year)
        .filter(file => {
            if (!filters.search) return true;

            const searchable = [
                file.title,
                file.merchant,
                file.uploadedByName,
                file.linkedExpense,
                getFolderName(file.folderId)
            ].join(" ").toLowerCase();

            return searchable.includes(filters.search);
        })
        .sort((first, second) => String(second.date).localeCompare(String(first.date)));
}

function renderFiles() {
    const files = getVisibleFiles();

    el.vaultVisibleCount.textContent = `${files.length} ${files.length === 1 ? "item" : "items"}`;
    el.vaultFilesLabel.textContent = activeFolder === "all" ? "FILES" : "FOLDER";
    el.vaultFilesHeading.textContent = activeFolder === "all"
        ? "Recent Files"
        : getFolderName(activeFolder);

    if (!files.length) {
        el.vaultFileList.innerHTML = '<div class="vault-empty">No files match your current filters.</div>';
        return;
    }

    el.vaultFileList.innerHTML = files.map(file => `
        <article class="vault-file-row">
            <span class="vault-file-icon ${escapeHtml(file.type)}">
                <i class="bi ${getFileIcon(file.type)}"></i>
            </span>

            <button class="vault-file-copy" type="button" data-preview-file="${escapeHtml(file.id)}">
                <strong>${escapeHtml(file.title)}</strong>
                <span>${file.amount > 0 ? `${peso(file.amount)} • ` : ""}${capitalize(file.type)}</span>
                <small>${formatDate(file.date)} • ${escapeHtml(file.uploadedByName)}</small>
            </button>

            <button class="vault-file-menu-button" type="button" data-menu-file="${escapeHtml(file.id)}">
                <i class="bi bi-three-dots-vertical"></i>
            </button>
        </article>
    `).join("");

    el.vaultFileList.querySelectorAll("[data-preview-file]").forEach(button => {
        button.addEventListener("click", () => openPreview(button.dataset.previewFile));
    });

    el.vaultFileList.querySelectorAll("[data-menu-file]").forEach(button => {
        button.addEventListener("click", () => openOptions(button.dataset.menuFile));
    });
}

function renderTrash() {
    const files = state.files.filter(file => file.trashedAt);
    el.emptyVaultTrashButton.hidden = !isHead();
    el.emptyVaultTrashButton.disabled = files.length === 0;

    if (!files.length) {
        el.vaultTrashList.innerHTML = '<div class="vault-empty">Trash is empty.</div>';
        return;
    }

    el.vaultTrashList.innerHTML = files.map(file => `
        <article class="vault-file-row">
            <span class="vault-file-icon ${escapeHtml(file.type)}">
                <i class="bi ${getFileIcon(file.type)}"></i>
            </span>

            <div class="vault-file-copy">
                <strong>${escapeHtml(file.title)}</strong>
                <small>Deleted ${formatDateTime(file.trashedAt)}</small>
            </div>

            <div class="vault-trash-actions">
                ${canManage(file) ? `
                    <button type="button" data-restore-file="${escapeHtml(file.id)}">
                        <i class="bi bi-arrow-counterclockwise"></i>
                    </button>
                ` : ""}

                ${isHead() ? `
                    <button type="button" data-delete-file="${escapeHtml(file.id)}">
                        <i class="bi bi-trash3"></i>
                    </button>
                ` : ""}
            </div>
        </article>
    `).join("");

    el.vaultTrashList.querySelectorAll("[data-restore-file]").forEach(button => {
        button.addEventListener("click", () => {
            performAction(
                () => vault.restoreFile(button.dataset.restoreFile, actor),
                "File restored."
            );
        });
    });

    el.vaultTrashList.querySelectorAll("[data-delete-file]").forEach(button => {
        button.addEventListener("click", () => {
            if (!window.confirm("Permanently delete this file?")) return;

            performAction(
                () => vault.deleteFile(button.dataset.deleteFile, actor),
                "File permanently deleted."
            );
        });
    });
}

function openOptions(fileId) {
    selectedFileId = fileId;
    const file = getSelectedFile();
    if (!file) return;

    const manageable = canManage(file);

    el.vaultOptionsFileName.textContent = file.title;
    el.vaultOptionsFileMeta.textContent = `${capitalize(file.type)} • ${formatDate(file.date)}`;
    el.vaultRenameOption.hidden = !manageable;
    el.vaultMoveOption.hidden = !manageable;
    el.vaultTrashOption.hidden = !manageable;

    openSheet(el.vaultFileOptionsBackdrop, el.vaultFileOptionsSheet);
}

function openRenameSheet() {
    const file = getSelectedFile();
    if (!file || !canManage(file)) return;

    closeOptionsSheet();
    el.vaultRenameInput.value = file.title;
    openSheet(el.vaultRenameBackdrop, el.vaultRenameSheet);
}

function openMoveSheet() {
    const file = getSelectedFile();
    if (!file || !canManage(file)) return;

    closeOptionsSheet();

    el.vaultMoveFolderList.innerHTML = `
        <button type="button" data-move-folder="">
            <i class="bi bi-folder2"></i>
            <span><strong>Unfiled</strong></span>
        </button>
        ${state.folders.map(folder => `
            <button type="button" data-move-folder="${escapeHtml(folder.id)}">
                <i class="bi bi-folder-fill"></i>
                <span><strong>${escapeHtml(folder.name)}</strong></span>
            </button>
        `).join("")}
    `;

    el.vaultMoveFolderList.querySelectorAll("[data-move-folder]").forEach(button => {
        button.addEventListener("click", () => {
            performAction(
                () => vault.updateFile(selectedFileId, { folderId: button.dataset.moveFolder }, actor),
                "File moved."
            );
            closeMoveSheet();
        });
    });

    openSheet(el.vaultMoveBackdrop, el.vaultMoveSheet);
}

function openPreview(fileId) {
    selectedFileId = fileId;
    const file = getSelectedFile();
    if (!file) return;

    el.vaultPreviewTitle.textContent = file.title;

    const visual = file.dataUrl && file.mimeType.startsWith("image/")
        ? `<img class="vault-preview-image" src="${file.dataUrl}" alt="${escapeHtml(file.title)}">`
        : `<div class="vault-empty"><i class="bi ${getFileIcon(file.type)}"></i><br>${escapeHtml(file.title)}</div>`;

    el.vaultPreviewContent.innerHTML = `
        ${visual}
        <div class="vault-preview-meta">
            <div><span>Type</span><strong>${capitalize(file.type)}</strong></div>
            <div><span>Date</span><strong>${formatDate(file.date)}</strong></div>
            <div><span>Amount</span><strong>${file.amount > 0 ? peso(file.amount) : "Not specified"}</strong></div>
            <div><span>Folder</span><strong>${escapeHtml(getFolderName(file.folderId))}</strong></div>
            <div><span>Uploaded by</span><strong>${escapeHtml(file.uploadedByName)}</strong></div>
            <div><span>Linked expense</span><strong>${escapeHtml(file.linkedExpense || "Not linked")}</strong></div>
        </div>
    `;

    openSheet(el.vaultPreviewBackdrop, el.vaultPreviewSheet);
}

async function uploadFile(file, type) {
    if (!file) return;

    if (file.size > 1.5 * 1024 * 1024) {
        showToast("Files must be below 1.5 MB for this prototype.");
        return;
    }

    try {
        const dataUrl = await readAsDataUrl(file);

        vault.addFile({
            title: removeExtension(file.name),
            type,
            date: new Date().toISOString().slice(0, 10),
            folderId: activeFolder === "all" ? "" : activeFolder,
            mimeType: file.type,
            dataUrl
        }, actor);

        closeAddSheet();
        renderAll();
        showToast(type === "receipt" ? "Receipt saved to the Family Vault." : "Document uploaded.");
    } catch (error) {
        showToast(error.message || "File could not be uploaded.");
    }
}

function createFolder() {
    const name = el.vaultFolderNameInput.value.trim();

    if (!name) {
        showToast("Enter a folder name.");
        return;
    }

    try {
        vault.createFolder(name, actor);
        closeFolderSheet();
        renderAll();
        showToast("Folder created.");
    } catch (error) {
        showToast(error.message);
    }
}

function saveRename() {
    const name = el.vaultRenameInput.value.trim();
    if (!name) return showToast("Enter a file name.");

    performAction(
        () => vault.updateFile(selectedFileId, { title: name }, actor),
        "File renamed."
    );

    closeRenameSheet();
}

function moveSelectedFileToTrash() {
    performAction(
        () => vault.moveToTrash(selectedFileId, actor),
        "File moved to Trash."
    );

    closeOptionsSheet();
}

function downloadSelectedFile() {
    const file = getSelectedFile();
    if (!file) return;

    const anchor = document.createElement("a");

    if (file.dataUrl) {
        anchor.href = file.dataUrl;
        anchor.download = `${safeName(file.title)}.${extensionFor(file.mimeType)}`;
    } else {
        const blob = new Blob([JSON.stringify(file, null, 2)], { type: "application/json" });
        anchor.href = URL.createObjectURL(blob);
        anchor.download = `${safeName(file.title)}.json`;
    }

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    closeOptionsSheet();
    showToast("Download started.");
}

function emptyTrash() {
    if (!window.confirm("Permanently delete all files in Trash?")) return;

    performAction(
        () => vault.emptyTrash(actor),
        "Trash emptied."
    );
}

function performAction(callback, successMessage) {
    try {
        callback();
        renderAll();
        showToast(successMessage);
    } catch (error) {
        showToast(error.message || "Action could not be completed.");
    }
}

function setupAutoLock() {
    const reset = () => {
        window.clearTimeout(idleTimer);
        idleTimer = window.setTimeout(() => {
            window.location.replace("profile.html");
        }, IDLE_LIMIT);
    };

    ["click", "touchstart", "keydown", "scroll"].forEach(eventName => {
        document.addEventListener(eventName, reset, { passive: eventName !== "keydown" });
    });

    reset();
}

function openAddSheet() {
    openSheet(el.vaultAddBackdrop, el.vaultAddSheet);
}

function closeAddSheet() {
    closeSheet(el.vaultAddBackdrop, el.vaultAddSheet);
}

function openFolderSheet() {
    el.vaultFolderNameInput.value = "";
    openSheet(el.vaultFolderBackdrop, el.vaultFolderSheet);
}

function closeFolderSheet() {
    closeSheet(el.vaultFolderBackdrop, el.vaultFolderSheet);
}

function closeOptionsSheet() {
    closeSheet(el.vaultFileOptionsBackdrop, el.vaultFileOptionsSheet);
}

function closeRenameSheet() {
    closeSheet(el.vaultRenameBackdrop, el.vaultRenameSheet);
}

function closeMoveSheet() {
    closeSheet(el.vaultMoveBackdrop, el.vaultMoveSheet);
}

function closePreviewSheet() {
    closeSheet(el.vaultPreviewBackdrop, el.vaultPreviewSheet);
}

function openTrashSheet() {
    state = vault.load();
    renderTrash();
    openSheet(el.vaultTrashBackdrop, el.vaultTrashSheet);
}

function closeTrashSheet() {
    closeSheet(el.vaultTrashBackdrop, el.vaultTrashSheet);
}

function openSheet(backdrop, sheet) {
    backdrop.hidden = false;
    sheet.hidden = false;

    requestAnimationFrame(() => {
        backdrop.classList.add("show");
        sheet.classList.add("show");
    });
}

function closeSheet(backdrop, sheet) {
    backdrop.classList.remove("show");
    sheet.classList.remove("show");

    window.setTimeout(() => {
        backdrop.hidden = true;
        sheet.hidden = true;
    }, 240);
}

function bindBackdrop(backdrop, closeFunction) {
    backdrop.addEventListener("click", closeFunction);
}

function getSelectedFile() {
    state = vault.load();
    return state.files.find(file => file.id === selectedFileId) || null;
}

function getFolderName(folderId) {
    if (!folderId) return "Unfiled";
    return state.folders.find(folder => folder.id === folderId)?.name || "Unfiled";
}

function isHead() {
    return /head/i.test(String(actor.role || ""));
}

function canManage(file) {
    return isHead() || file.uploadedById === actor.id;
}

function firstName(name) {
    return String(name || "Family Member").trim().split(/\s+/)[0];
}

function getFileIcon(type) {
    return {
        receipt: "bi-receipt-cutoff",
        warranty: "bi-shield-check",
        document: "bi-file-earmark-text"
    }[type] || "bi-file-earmark";
}

function readAsDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ""));
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function removeExtension(name) {
    return String(name || "").replace(/\.[^/.]+$/, "");
}

function peso(value) {
    return `₱${Number(value || 0).toLocaleString("en-PH")}`;
}

function formatDate(value) {
    const dateValue = new Date(`${value}T00:00:00`);
    return Number.isNaN(dateValue.getTime())
        ? "No date"
        : dateValue.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
}

function formatDateTime(value) {
    const dateValue = new Date(value);
    return Number.isNaN(dateValue.getTime())
        ? ""
        : dateValue.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
}

function capitalize(value) {
    const text = String(value || "");
    return text.charAt(0).toUpperCase() + text.slice(1);
}

function safeName(value) {
    return String(value || "file").replace(/[<>:"/\\|?*]+/g, "-");
}

function extensionFor(mimeType) {
    return {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
        "application/pdf": "pdf"
    }[mimeType] || "file";
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
    window.clearTimeout(toastTimer);
    el.vaultToast.textContent = message;
    el.vaultToast.classList.add("show");

    toastTimer = window.setTimeout(() => {
        el.vaultToast.classList.remove("show");
    }, 2400);
}