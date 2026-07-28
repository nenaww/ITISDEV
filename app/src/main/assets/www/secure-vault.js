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
let pendingMonth = "";
let pendingYear = "";
let viewMode = localStorage.getItem("kabalikat_vault_view_mode") || "grid";
let browserMode = "";
let browserFolderId = "";
let selectedFolderId = "";
let browserSort = "date";

const filters = {
    type: "all",
    search: "",
    month: "",
    year: "",
    favoritesOnly: false
};

const el = {};

window.addEventListener("DOMContentLoaded", async () => {
    try {
        user = await KabalikatAuth.getCurrentUser();

        if (!user || !consumeTicket(user)) {
            window.location.replace("vault-unlock.html");
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

        const initialParams = new URLSearchParams(window.location.search);
        const initialVaultPage = initialParams.get("vaultPage");
        const initialFolderId = initialParams.get("folderId") || "";

        if (
            ["files", "folders", "favorites", "folder"].includes(initialVaultPage)
        ) {
            browserMode = initialVaultPage;
            browserFolderId =
                initialVaultPage === "folder" ? initialFolderId : "";

            renderBrowserPage();
            el.vaultBrowserPage.hidden = false;

            requestAnimationFrame(() => {
                el.vaultBrowserPage.classList.add("show");
            });
        }

        setupAutoLock();
    } catch (error) {
        console.error(error);
        window.location.replace("vault-unlock.html");
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
        "vaultBackButton",
        "vaultAddButton",
        "vaultSearchInput",
        "clearVaultSearch",
        "vaultTypeFilters",
        "openVaultDateFilter",
        "vaultDateFilterTitle",
        "vaultDateFilterSubtitle",
        "vaultDateBackdrop",
        "vaultDateSheet",
        "closeVaultDateSheet",
        "vaultMonthFilter",
        "vaultYearFilter",
        "vaultDateFilterHint",
        "clearVaultDateFilter",
        "applyVaultDateFilter",
        "vaultTotalCount",
        "vaultFolderCount",
        "vaultFavoriteCount",
        "vaultOverviewFiles",
        "vaultOverviewFolders",
        "vaultOverviewFavorites",
        "vaultFoldersViewAll",
        "vaultFilesViewAll",
        "vaultListViewButton",
        "vaultGridViewButton",
        "vaultBrowserPage",
        "vaultBrowserBackButton",
        "vaultBrowserTitle",
        "vaultBrowserMenuButton",
        "vaultBrowserSortButton",
        "vaultBrowserSortLabel",
        "vaultBrowserListViewButton",
        "vaultBrowserGridViewButton",
        "vaultBrowserBreadcrumb",
        "vaultBrowserContent",
        "vaultBrowserAddButton",
        "vaultFolderOptionsBackdrop",
        "vaultFolderOptionsSheet",
        "vaultFolderOptionsTitle",
        "closeVaultFolderOptionsSheet",
        "openSelectedFolderButton",
        "deleteSelectedFolderButton",
        "vaultSortBackdrop",
        "vaultSortSheet",
        "closeVaultSortSheet",
        "vaultAllFoldersBackdrop",
        "vaultAllFoldersSheet",
        "closeVaultAllFoldersSheet",
        "vaultAllFoldersList",
        "vaultCreateFolderButton",
        "vaultFolderGrid",
        "vaultFilesLabel",
        "vaultFilesHeading",
        "vaultVisibleCount",
        "vaultFileList",
        "vaultAddBackdrop",
        "vaultAddSheet",
        "closeVaultAddSheet",
        "vaultScanReceiptOption",
        "vaultUploadReceiptOption",
        "vaultUploadDocumentOption",
        "vaultNewFolderOption",
        "vaultReceiptUploadInput",
        "vaultDocumentUploadInput",
        "vaultFolderBackdrop",
        "vaultFolderSheet",
        "closeVaultFolderSheet",
        "vaultFolderNameInput",
        "vaultFolderSheetTitle",
        "vaultFolderLocationText",
        "saveVaultFolderButton",
        "vaultFileOptionsBackdrop",
        "vaultFileOptionsSheet",
        "vaultOptionsFileName",
        "vaultOptionsFileMeta",
        "vaultPreviewOption",
        "vaultRenameOption",
        "vaultMoveOption",
        "vaultFavoriteOption",
        "vaultFavoriteOptionText",
        "vaultDownloadOption",
        "vaultTrashOption",
        "vaultRenameBackdrop",
        "vaultRenameSheet",
        "closeVaultRenameSheet",
        "vaultRenameInput",
        "saveVaultRenameButton",
        "vaultMoveBackdrop",
        "vaultMoveSheet",
        "closeVaultMoveSheet",
        "vaultMoveFolderList",
        "vaultPreviewPage",
        "closeVaultPreviewPage",
        "vaultPreviewTitle",
        "vaultPreviewVisual",
        "vaultViewerFileName",
        "vaultViewerFileMeta",
        "vaultViewerShareButton",
        "vaultViewerDownloadButton",
        "vaultViewerFavoriteButton",
        "vaultViewerMoreActionButton",
        "vaultPreviewContent",
        "vaultTrashBackdrop",
        "vaultTrashSheet",
        "closeVaultTrashSheet",
        "vaultTrashList",
        "emptyVaultTrashButton",
        "vaultNavHome",
        "vaultNavExpenses",
        "vaultNavScan",
        "vaultNavBills",
        "vaultNavSavings",
        "vaultToast"
    ].forEach(id => {
        el[id] = document.getElementById(id);
    });
}

function bindEvents() {
    el.vaultBackButton.addEventListener("click", () => {
        window.location.href = "home.html";
    });

    el.vaultAddButton.addEventListener("click", openAddSheet);
    el.vaultCreateFolderButton.addEventListener("click", () => {
        closeAllFoldersSheet();
        window.setTimeout(openFolderSheet, 180);
    });

    el.vaultListViewButton.addEventListener("click", () => setViewMode("list"));
    el.vaultGridViewButton.addEventListener("click", () => setViewMode("grid"));

    el.vaultBrowserListViewButton.addEventListener("click", () => setViewMode("list"));
    el.vaultBrowserGridViewButton.addEventListener("click", () => setViewMode("grid"));
    el.vaultBrowserBackButton.addEventListener("click", closeBrowserPage);
    el.vaultBrowserMenuButton.addEventListener("click", openTrashSheet);
    el.vaultBrowserAddButton.addEventListener("click", handleBrowserAdd);
    el.vaultBrowserSortButton.addEventListener("click", openSortSheet);

    el.openVaultDateFilter.addEventListener("click", openDateSheet);
    el.closeVaultDateSheet.addEventListener("click", closeDateSheet);
    el.applyVaultDateFilter.addEventListener("click", applyDateFilter);
    el.clearVaultDateFilter.addEventListener("click", resetDateFilter);
    bindBackdrop(el.vaultDateBackdrop, closeDateSheet);

    el.vaultMonthFilter.addEventListener("change", updatePendingDateHint);
    el.vaultYearFilter.addEventListener("change", updatePendingDateHint);

    el.vaultOverviewFiles.addEventListener("click", () => {
        openBrowserPage("files");
    });

    el.vaultOverviewFolders.addEventListener("click", () => {
        openBrowserPage("folders");
    });

    el.vaultOverviewFavorites.addEventListener("click", () => {
        openBrowserPage("favorites");
    });

    el.vaultFoldersViewAll.addEventListener("click", () => {
        openBrowserPage("folders");
    });

    el.vaultFilesViewAll.addEventListener("click", () => {
        openBrowserPage("files");
    });

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
            const selectedType = button.dataset.vaultType;

            filters.favoritesOnly = selectedType === "favorite";
            filters.type = filters.favoritesOnly ? "all" : selectedType;

            el.vaultTypeFilters.querySelectorAll("[data-vault-type]").forEach(item => {
                item.classList.toggle("active", item === button);
            });

            updateOverviewSelection(filters.favoritesOnly ? "favorites" : "files");
            renderFiles();
        });
    });

    bindBackdrop(el.vaultAddBackdrop, closeAddSheet);
    bindBackdrop(el.vaultAllFoldersBackdrop, closeAllFoldersSheet);
    bindBackdrop(el.vaultFolderBackdrop, closeFolderSheet);
    bindBackdrop(el.vaultFileOptionsBackdrop, closeOptionsSheet);
    bindBackdrop(el.vaultRenameBackdrop, closeRenameSheet);
    bindBackdrop(el.vaultMoveBackdrop, closeMoveSheet);
    bindBackdrop(el.vaultTrashBackdrop, closeTrashSheet);
    bindBackdrop(el.vaultFolderOptionsBackdrop, closeFolderOptionsSheet);
    bindBackdrop(el.vaultSortBackdrop, closeSortSheet);

    el.closeVaultAddSheet.addEventListener("click", closeAddSheet);
    el.closeVaultAllFoldersSheet.addEventListener("click", closeAllFoldersSheet);
    el.closeVaultFolderSheet.addEventListener("click", closeFolderSheet);
    el.closeVaultRenameSheet.addEventListener("click", closeRenameSheet);
    el.closeVaultMoveSheet.addEventListener("click", closeMoveSheet);
    el.closeVaultTrashSheet.addEventListener("click", closeTrashSheet);
    el.closeVaultFolderOptionsSheet.addEventListener("click", closeFolderOptionsSheet);
    el.closeVaultSortSheet.addEventListener("click", closeSortSheet);

    el.openSelectedFolderButton.addEventListener("click", () => {
        const folderId = selectedFolderId;

        if (!folderId) {
            return;
        }

        closeFolderOptionsSheet();

        window.setTimeout(() => {
            openBrowserPage("folder", folderId);
        }, 220);
    });

    el.deleteSelectedFolderButton.addEventListener("click", deleteSelectedFolder);

    el.vaultSortSheet.querySelectorAll("[data-vault-sort]").forEach(button => {
        button.addEventListener("click", () => {
            browserSort = button.dataset.vaultSort;
            closeSortSheet();
            renderBrowserPage();
        });
    });

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

    el.closeVaultPreviewPage.addEventListener("click", closePreviewPage);
    el.vaultViewerDownloadButton.addEventListener("click", downloadSelectedFile);
    el.vaultViewerFavoriteButton.addEventListener("click", toggleSelectedFavorite);
    el.vaultViewerMoreActionButton.addEventListener("click", () => openOptions(selectedFileId));
    el.vaultViewerShareButton.addEventListener("click", shareSelectedFile);

    el.vaultRenameOption.addEventListener("click", openRenameSheet);
    el.vaultMoveOption.addEventListener("click", openMoveSheet);
    el.vaultFavoriteOption.addEventListener("click", toggleSelectedFavorite);
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
    renderYears();
    renderDateFilterDisplay();
    renderViewMode();
    renderSummary();
    renderFolders();
    renderAllFoldersList();
    renderFiles();
    renderTrash();
}

function getActiveFiles() {
    return state.files.filter(file => !file.trashedAt);
}

function renderSummary() {
    const files = getActiveFiles();
    const favorites = files.filter(file => file.favorite === true);

    el.vaultTotalCount.textContent = files.length;
    el.vaultFolderCount.textContent = state.folders.length;
    el.vaultFavoriteCount.textContent = favorites.length;
}

function renderYears() {
    const currentYear = new Date().getFullYear();
    const years = new Set();

    /*
     * Always provide a useful year range even when the sample files
     * only contain dates from one year.
     */
    for (let year = currentYear + 1; year >= currentYear - 5; year -= 1) {
        years.add(String(year));
    }

    state.files.forEach(file => {
        const year = String(file.date || "").slice(0, 4);

        if (/^\d{4}$/.test(year)) {
            years.add(year);
        }
    });

    const sortedYears = [...years].sort(
        (first, second) => Number(second) - Number(first)
    );

    el.vaultYearFilter.innerHTML = `
        <option value="">All years</option>
        ${sortedYears.map(year => `
            <option value="${year}">${year}</option>
        `).join("")}
    `;

    el.vaultYearFilter.value = filters.year;
}

function setViewMode(mode) {
    viewMode = mode === "list" ? "list" : "grid";
    localStorage.setItem("kabalikat_vault_view_mode", viewMode);

    renderViewMode();
    renderFolders();
    renderAllFoldersList();
    renderFiles();

    if (browserMode) {
        renderBrowserPage();
    }
}

function renderViewMode() {
    const isList = viewMode === "list";

    el.vaultListViewButton.classList.toggle("active", isList);
    el.vaultGridViewButton.classList.toggle("active", !isList);
    el.vaultBrowserListViewButton.classList.toggle("active", isList);
    el.vaultBrowserGridViewButton.classList.toggle("active", !isList);
}

function openBrowserPage(mode, folderId = "") {
    const supportedModes = ["files", "folders", "favorites", "folder"];

    if (!supportedModes.includes(mode)) {
        mode = "files";
    }

    browserMode = mode;
    browserFolderId = mode === "folder" ? folderId : "";
    el.vaultBrowserPage.hidden = false;

    const params = new URLSearchParams(window.location.search);
    params.set("vaultPage", mode);

    if (browserFolderId) {
        params.set("folderId", browserFolderId);
    } else {
        params.delete("folderId");
    }

    window.history.pushState(
        { vaultPage: mode, folderId: browserFolderId },
        "",
        `${window.location.pathname}?${params.toString()}`
    );

    renderBrowserPage();

    requestAnimationFrame(() => {
        el.vaultBrowserPage.classList.add("show");
    });
}

function closeBrowserPage() {
    if (browserMode === "folder") {
        const currentFolder =
            getFolderById(browserFolderId);

        if (currentFolder?.parentId) {
            openBrowserPage(
                "folder",
                currentFolder.parentId
            );
        } else {
            openBrowserPage("folders");
        }

        return;
    }

    browserMode = "";
    browserFolderId = "";
    el.vaultBrowserPage.classList.remove("show");

    window.setTimeout(() => {
        el.vaultBrowserPage.hidden = true;
    }, 220);

    const params = new URLSearchParams(window.location.search);
    params.delete("vaultPage");
    params.delete("folderId");

    const query = params.toString();

    window.history.pushState(
        {},
        "",
        query ? `${window.location.pathname}?${query}` : window.location.pathname
    );
}

function handleBrowserAdd() {
    if (browserMode === "folders") {
        openFolderSheet();
        return;
    }

    openAddSheet({
        hideNewFolder:
            browserMode === "files"
    });
}


function renderBrowserPage() {
    state = vault.load();
    renderBrowserBreadcrumb();

    const titles = {
        files: "Files",
        folders: "Folders",
        favorites: "Favorites"
    };

    if (browserMode === "folder") {
        el.vaultBrowserTitle.textContent = getFolderName(browserFolderId);
        el.vaultBrowserAddButton.setAttribute(
            "aria-label",
            "Add files or create a folder"
        );
    } else {
        el.vaultBrowserTitle.textContent = titles[browserMode] || "Files";
        el.vaultBrowserAddButton.setAttribute(
            "aria-label",
            browserMode === "folders"
                ? "Create a new folder"
                : "Add to Secure Vault"
        );
    }

    el.vaultBrowserSortLabel.textContent =
        browserSort === "name" ? "Name" : "Date modified";

    el.vaultSortSheet
        .querySelectorAll("[data-vault-sort]")
        .forEach(button => {
            button.classList.toggle(
                "active",
                button.dataset.vaultSort === browserSort
            );
        });

    if (browserMode === "folders") {
        renderBrowserFolders();
        return;
    }

    renderBrowserFiles();
}


function renderBrowserFolders() {
    let folders =
        sortBrowserFolders(
            getChildFolders("")
        );

    el.vaultBrowserContent.className =
        `vault-browser-content vault-browser-folders ${viewMode}-view`;

    if (!folders.length) {
        el.vaultBrowserContent.innerHTML = `
            <div class="vault-empty">
                No folders yet.
            </div>
        `;

        return;
    }

    el.vaultBrowserContent.innerHTML =
        folders.map(renderBrowserFolderCard).join("");

    bindBrowserFolderActions();
}

function renderBrowserFiles() {
    if (browserMode === "folder") {
        renderFolderContentsPage();
        return;
    }

    let files = getActiveFiles();

    if (browserMode === "favorites") {
        files = files.filter(file => file.favorite === true);
    }

    files = sortBrowserFiles(files);

    el.vaultBrowserContent.className =
        `vault-browser-content vault-browser-files ${viewMode}-view`;

    if (!files.length) {
        el.vaultBrowserContent.innerHTML = `
            <div class="vault-empty">
                No ${browserMode === "favorites" ? "favorite " : ""}files found.
            </div>
        `;

        return;
    }

    el.vaultBrowserContent.innerHTML =
        files.map(renderBrowserFileCard).join("");

    bindBrowserFileActions();
}

function renderFolderContentsPage() {
    let childFolders =
        getChildFolders(browserFolderId);

    let files =
        getActiveFiles().filter(
            file => file.folderId === browserFolderId
        );

    childFolders = sortBrowserFolders(childFolders);
    files = sortBrowserFiles(files);

    el.vaultBrowserContent.className =
        `vault-browser-content vault-folder-contents ${viewMode}-view`;

    const folderSection = childFolders.length
        ? `
            <section class="vault-folder-content-section">
                <div class="vault-folder-content-heading">
                    <h2>Folders</h2>
                    <span>${childFolders.length}</span>
                </div>

                <div class="vault-folder-content-grid vault-browser-folders ${viewMode}-view">
                    ${childFolders.map(renderBrowserFolderCard).join("")}
                </div>
            </section>
        `
        : "";

    const fileSection = `
        <section class="vault-folder-content-section">
            <div class="vault-folder-content-heading">
                <h2>Files</h2>
                <span>${files.length}</span>
            </div>

            <div class="vault-folder-content-grid vault-browser-files ${viewMode}-view">
                ${
                    files.length
                        ? files.map(renderBrowserFileCard).join("")
                        : `
                            <div class="vault-folder-content-empty">
                                This folder has no files yet.
                            </div>
                        `
                }
            </div>
        </section>
    `;

    el.vaultBrowserContent.innerHTML =
        folderSection + fileSection;

    bindBrowserFolderActions();
    bindBrowserFileActions();
}

function renderBrowserFolderCard(folder) {
    const childFolderCount =
        getChildFolders(folder.id).length;

    const fileCount =
        getActiveFiles().filter(
            file => file.folderId === folder.id
        ).length;

    const itemCount =
        childFolderCount + fileCount;

    return `
        <article class="vault-browser-folder-card">
            <button
                class="vault-browser-folder-open"
                type="button"
                data-browser-folder="${escapeHtml(folder.id)}"
            >
                <span class="vault-browser-folder-icon">
                    <i class="bi bi-folder-fill"></i>
                </span>

                <span class="vault-browser-folder-copy">
                    <strong>${escapeHtml(folder.name)}</strong>

                    <small>
                        ${itemCount}
                        ${itemCount === 1 ? "item" : "items"}
                    </small>
                </span>
            </button>

            <button
                class="vault-browser-folder-menu"
                type="button"
                data-browser-folder-menu="${escapeHtml(folder.id)}"
                aria-label="Folder options"
            >
                <i class="bi bi-three-dots-vertical"></i>
            </button>
        </article>
    `;
}

function renderBrowserFileCard(file) {
    const preview =
        file.dataUrl &&
        file.mimeType?.startsWith("image/")
            ? `<img src="${file.dataUrl}" alt="">`
            : `<i class="bi ${getFileIcon(file.type)}"></i>`;

    return `
        <article class="vault-browser-file-card">
            <button
                type="button"
                class="vault-browser-file-open"
                data-browser-file="${escapeHtml(file.id)}"
            >
                <span class="vault-browser-file-preview ${escapeHtml(file.type)}">
                    ${preview}
                </span>

                <span class="vault-browser-file-copy">
                    <strong>${escapeHtml(file.title)}</strong>

                    <small>
                        ${formatDate(file.date)}
                        •
                        ${escapeHtml(file.uploadedByName)}
                    </small>

                    <em>
                        ${capitalize(file.type)}
                        •
                        ${getFileSizeLabel(file)}
                    </em>
                </span>
            </button>

            <button
                type="button"
                class="vault-browser-file-menu"
                data-browser-menu="${escapeHtml(file.id)}"
                aria-label="File options"
            >
                <i class="bi bi-three-dots-vertical"></i>
            </button>
        </article>
    `;
}

function bindBrowserFolderActions() {
    el.vaultBrowserContent
        .querySelectorAll("[data-browser-folder]")
        .forEach(button => {
            button.addEventListener("click", () => {
                openBrowserPage(
                    "folder",
                    button.dataset.browserFolder
                );
            });
        });

    el.vaultBrowserContent
        .querySelectorAll("[data-browser-folder-menu]")
        .forEach(button => {
            button.addEventListener("click", event => {
                event.stopPropagation();

                openFolderOptions(
                    button.dataset.browserFolderMenu
                );
            });
        });
}

function openFolderOptions(folderId) {
    const folder = getFolderById(folderId);

    if (!folder) {
        return;
    }

    selectedFolderId = folder.id;
    el.vaultFolderOptionsTitle.textContent = folder.name;

    openSheet(
        el.vaultFolderOptionsBackdrop,
        el.vaultFolderOptionsSheet
    );
}

function closeFolderOptionsSheet() {
    closeSheet(
        el.vaultFolderOptionsBackdrop,
        el.vaultFolderOptionsSheet
    );
}

function deleteSelectedFolder() {
    const folder = getFolderById(selectedFolderId);

    if (!folder) {
        closeFolderOptionsSheet();
        return;
    }

    const containsSubfolders =
        getChildFolders(folder.id).length > 0;

    const containsFiles =
        getActiveFiles().some(
            file => file.folderId === folder.id
        );

    const message =
        containsSubfolders || containsFiles
            ? `Delete "${folder.name}" and all of its subfolders? Files inside it will be moved to Trash.`
            : `Delete "${folder.name}"?`;

    if (!window.confirm(message)) {
        return;
    }

    try {
        vault.deleteFolder(
            folder.id,
            actor
        );

        closeFolderOptionsSheet();
        selectedFolderId = "";
        state = vault.load();

        renderAll();

        if (browserMode === "folder" && browserFolderId === folder.id) {
            openBrowserPage("folders");
            return;
        }

        if (browserMode) {
            renderBrowserPage();
        }

        showToast("Folder deleted.");
    } catch (error) {
        showToast(
            error.message ||
            "Unable to delete the folder."
        );
    }
}

function bindBrowserFileActions() {
    el.vaultBrowserContent
        .querySelectorAll("[data-browser-file]")
        .forEach(button => {
            button.addEventListener("click", () => {
                openPreview(
                    button.dataset.browserFile
                );
            });
        });

    el.vaultBrowserContent
        .querySelectorAll("[data-browser-menu]")
        .forEach(button => {
            button.addEventListener("click", () => {
                openOptions(
                    button.dataset.browserMenu
                );
            });
        });
}

function sortBrowserFolders(folders) {
    return [...folders].sort((first, second) => {
        if (browserSort === "name") {
            return String(first.name).localeCompare(
                String(second.name)
            );
        }

        return String(second.createdAt || "").localeCompare(
            String(first.createdAt || "")
        );
    });
}

function sortBrowserFiles(files) {
    return [...files].sort((first, second) => {
        if (browserSort === "name") {
            return String(first.title).localeCompare(
                String(second.title)
            );
        }

        return String(second.date).localeCompare(
            String(first.date)
        );
    });
}

function getFolderById(folderId) {
    return state.folders.find(
        folder => folder.id === folderId
    ) || null;
}

function getChildFolders(parentId = "") {
    const normalizedParentId =
        String(parentId || "");

    return state.folders.filter(
        folder =>
            String(folder.parentId || "") ===
            normalizedParentId
    );
}

function getFolderPath(folderId) {
    const path = [];
    const visited = new Set();
    let current = getFolderById(folderId);

    while (
        current &&
        !visited.has(current.id)
    ) {
        visited.add(current.id);
        path.unshift(current);

        current = current.parentId
            ? getFolderById(current.parentId)
            : null;
    }

    return path;
}

function renderBrowserBreadcrumb() {
    const isFolderPage =
        browserMode === "folder";

    el.vaultBrowserBreadcrumb.hidden =
        !isFolderPage;

    if (!isFolderPage) {
        el.vaultBrowserBreadcrumb.innerHTML = "";
        return;
    }

    const path =
        getFolderPath(browserFolderId);

    el.vaultBrowserBreadcrumb.innerHTML = `
        <button
            type="button"
            data-breadcrumb-root
        >
            Folders
        </button>

        ${path.map((folder, index) => `
            <i class="bi bi-chevron-right"></i>

            <button
                type="button"
                data-breadcrumb-folder="${escapeHtml(folder.id)}"
                ${index === path.length - 1 ? "aria-current=\"page\"" : ""}
            >
                ${escapeHtml(folder.name)}
            </button>
        `).join("")}
    `;

    el.vaultBrowserBreadcrumb
        .querySelector("[data-breadcrumb-root]")
        ?.addEventListener("click", () => {
            openBrowserPage("folders");
        });

    el.vaultBrowserBreadcrumb
        .querySelectorAll("[data-breadcrumb-folder]")
        .forEach(button => {
            button.addEventListener("click", () => {
                const folderId =
                    button.dataset.breadcrumbFolder;

                if (folderId === browserFolderId) {
                    return;
                }

                openBrowserPage(
                    "folder",
                    folderId
                );
            });
        });
}

function openSortSheet() {
    openSheet(el.vaultSortBackdrop, el.vaultSortSheet);
}

function closeSortSheet() {
    closeSheet(el.vaultSortBackdrop, el.vaultSortSheet);
}

function renderFolders() {
    const files = getActiveFiles();
    const folders = [
        { id: "all", name: "All Files" },
        ...getChildFolders("")
    ];
    const previewFolders = folders.slice(0, 4);

    el.vaultFolderGrid.className = `vault-folder-grid ${viewMode}-view`;

    el.vaultFolderGrid.innerHTML = previewFolders.map(folder => {
        const count = folder.id === "all"
            ? files.length
            : files.filter(file => file.folderId === folder.id).length +
              getChildFolders(folder.id).length;

        return `
            <button
                class="vault-folder-card ${activeFolder === folder.id ? "active" : ""}"
                type="button"
                data-folder-id="${escapeHtml(folder.id)}"
            >
                <span class="vault-folder-card-icon">
                    <i class="bi ${folder.id === "all" ? "bi-collection" : "bi-folder-fill"}"></i>
                </span>

                <span class="vault-folder-card-copy">
                    <strong>${escapeHtml(folder.name)}</strong>
                    <small>${count} ${count === 1 ? "item" : "items"}</small>
                </span>

                <i class="bi bi-chevron-right vault-folder-card-chevron"></i>
            </button>
        `;
    }).join("");

    bindFolderSelection(el.vaultFolderGrid);
}

function renderAllFoldersList() {
    const files = getActiveFiles();
    const folders = [
        { id: "all", name: "All Files" },
        ...getChildFolders("")
    ];

    el.vaultAllFoldersList.className = `vault-all-folders-list ${viewMode}-view`;

    el.vaultAllFoldersList.innerHTML = folders.map(folder => {
        const count = folder.id === "all"
            ? files.length
            : files.filter(file => file.folderId === folder.id).length +
              getChildFolders(folder.id).length;

        return `
            <button
                class="vault-all-folders-row ${activeFolder === folder.id ? "active" : ""}"
                type="button"
                data-folder-id="${escapeHtml(folder.id)}"
            >
                <span class="vault-all-folders-row-icon">
                    <i class="bi ${folder.id === "all" ? "bi-collection" : "bi-folder-fill"}"></i>
                </span>

                <span class="vault-all-folders-row-copy">
                    <strong>${escapeHtml(folder.name)}</strong>
                    <small>${count} ${count === 1 ? "item" : "items"}</small>
                </span>

                <i class="bi bi-chevron-right"></i>
            </button>
        `;
    }).join("");

    bindFolderSelection(el.vaultAllFoldersList, true);
}

function bindFolderSelection(container, closeAfterSelection = false) {
    container
        .querySelectorAll("[data-folder-id]")
        .forEach(button => {
            button.addEventListener("click", () => {
                const folderId =
                    button.dataset.folderId;

                if (closeAfterSelection) {
                    closeAllFoldersSheet();
                }

                if (folderId === "all") {
                    window.setTimeout(() => {
                        openBrowserPage("files");
                    }, closeAfterSelection ? 220 : 0);

                    return;
                }

                window.setTimeout(() => {
                    openBrowserPage("folder", folderId);
                }, closeAfterSelection ? 220 : 0);
            });
        });
}

function getVisibleFiles() {
    return getActiveFiles()
        .filter(file => !filters.favoritesOnly || file.favorite === true)
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
    el.vaultFilesLabel.textContent = filters.favoritesOnly
        ? "FAVORITES"
        : activeFolder === "all"
            ? "FILES"
            : "FOLDER";

    el.vaultFilesHeading.textContent = filters.favoritesOnly
        ? "Favorite Files"
        : activeFolder === "all"
            ? "Recent Files"
            : getFolderName(activeFolder);

    el.vaultFileList.className = `vault-file-list ${viewMode}-view`;

    if (!files.length) {
        el.vaultFileList.innerHTML = '<div class="vault-empty">No files match your current filters.</div>';
        return;
    }

    el.vaultFileList.innerHTML = files.map(file => {
        const iconMarkup = file.dataUrl && file.mimeType?.startsWith("image/")
            ? `<img src="${file.dataUrl}" alt="">`
            : `<i class="bi ${getFileIcon(file.type)}"></i>`;

        return `
            <article class="vault-file-row">
                <button class="vault-file-preview-button" type="button" data-preview-file="${escapeHtml(file.id)}">
                    <span class="vault-file-icon ${escapeHtml(file.type)}">
                        ${iconMarkup}
                    </span>

                    <span class="vault-file-copy">
                        <strong>${escapeHtml(file.title)}</strong>
                        <span>${file.amount > 0 ? `${peso(file.amount)} • ` : ""}${capitalize(file.type)}</span>
                        <small>${formatDate(file.date)} • ${escapeHtml(file.uploadedByName)}</small>
                    </span>
                </button>

                <div class="vault-file-row-actions">
                    ${file.favorite ? '<i class="bi bi-heart-fill vault-favorite-indicator" aria-label="Favorite"></i>' : ""}

                    <button class="vault-file-menu-button" type="button" data-menu-file="${escapeHtml(file.id)}">
                        <i class="bi bi-three-dots-vertical"></i>
                    </button>
                </div>
            </article>
        `;
    }).join("");

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

function openDateSheet() {
    pendingMonth = filters.month;
    pendingYear = filters.year;

    el.vaultMonthFilter.value = pendingMonth;
    el.vaultYearFilter.value = pendingYear;

    updatePendingDateHint();
    openSheet(el.vaultDateBackdrop, el.vaultDateSheet);
}

function closeDateSheet() {
    closeSheet(el.vaultDateBackdrop, el.vaultDateSheet);
}

function updatePendingDateHint() {
    pendingMonth = el.vaultMonthFilter.value;
    pendingYear = el.vaultYearFilter.value;

    const monthName = getMonthName(pendingMonth);
    let message = "Choose a month and year to narrow the files shown.";

    if (pendingMonth && pendingYear) {
        message = `You will see files uploaded in ${monthName} ${pendingYear}.`;
    } else if (pendingYear) {
        message = `You will see files from all months in ${pendingYear}.`;
    } else if (pendingMonth) {
        message = `You will see files uploaded in ${monthName}, from any year.`;
    }

    el.vaultDateFilterHint.querySelector("span").textContent = message;
    el.applyVaultDateFilter.textContent = pendingMonth ? "View Month" : "View Year";
}

function applyDateFilter() {
    filters.month = pendingMonth;
    filters.year = pendingYear;

    closeDateSheet();
    renderDateFilterDisplay();
    renderFiles();
}

function resetDateFilter() {
    filters.month = "";
    filters.year = "";
    pendingMonth = "";
    pendingYear = "";

    el.vaultMonthFilter.value = "";
    el.vaultYearFilter.value = "";

    closeDateSheet();
    renderDateFilterDisplay();
    renderFiles();
}

function renderDateFilterDisplay() {
    const monthName = getMonthName(filters.month);

    if (filters.month && filters.year) {
        el.vaultDateFilterTitle.textContent = `${monthName} ${filters.year}`;
        el.vaultDateFilterSubtitle.textContent = "Showing one month";
        return;
    }

    if (filters.year) {
        el.vaultDateFilterTitle.textContent = filters.year;
        el.vaultDateFilterSubtitle.textContent = "All months";
        return;
    }

    if (filters.month) {
        el.vaultDateFilterTitle.textContent = monthName;
        el.vaultDateFilterSubtitle.textContent = "All years";
        return;
    }

    el.vaultDateFilterTitle.textContent = "All dates";
    el.vaultDateFilterSubtitle.textContent = "No date filter applied";
}

function showAllFiles() {
    filters.favoritesOnly = false;
    filters.type = "all";
    activeFolder = "all";

    setActiveTypePill("all");
    updateOverviewSelection("files");
    renderFolders();
    renderFiles();
    scrollToFiles();
}

function focusFolders() {
    updateOverviewSelection("folders");

    document.querySelector(".vault-section")?.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

function showFavorites() {
    filters.favoritesOnly = true;
    filters.type = "all";
    activeFolder = "all";

    setActiveTypePill("favorite");
    updateOverviewSelection("favorites");
    renderFolders();
    renderFiles();
    scrollToFiles();
}

function setActiveTypePill(type) {
    el.vaultTypeFilters.querySelectorAll("[data-vault-type]").forEach(button => {
        button.classList.toggle("active", button.dataset.vaultType === type);
    });
}

function updateOverviewSelection(activeItem) {
    el.vaultOverviewFiles.classList.toggle("active", activeItem === "files");
    el.vaultOverviewFolders.classList.toggle("active", activeItem === "folders");
    el.vaultOverviewFavorites.classList.toggle("active", activeItem === "favorites");
}

function scrollToFiles() {
    el.vaultFileList.closest(".vault-section")?.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

function getMonthName(monthValue) {
    if (!monthValue) return "";

    const monthIndex = Number(monthValue) - 1;
    return new Date(2026, monthIndex, 1).toLocaleDateString("en-PH", {
        month: "long"
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
    el.vaultFavoriteOptionText.textContent = file.favorite
        ? "Remove from Favorites"
        : "Add to Favorites";

    const favoriteIcon = el.vaultFavoriteOption.querySelector("i");
    favoriteIcon.className = file.favorite ? "bi bi-heart-fill" : "bi bi-heart";

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

    if (!file) {
        return;
    }

    const openedFromBrowserPage =
        Boolean(browserMode) &&
        !el.vaultBrowserPage.hidden;

    el.vaultPreviewPage.dataset.returnToBrowser =
        openedFromBrowserPage
            ? "true"
            : "false";

    el.vaultPreviewTitle.textContent = file.title;
    el.vaultViewerFileName.textContent = file.title;
    el.vaultViewerFileMeta.textContent = `${capitalize(file.type)} • ${getFileSizeLabel(file)}`;

    const visual = file.dataUrl && file.mimeType?.startsWith("image/")
        ? `<img class="vault-viewer-image" src="${file.dataUrl}" alt="${escapeHtml(file.title)}">`
        : createDocumentPreview(file);

    el.vaultPreviewVisual.innerHTML = visual;

    el.vaultPreviewContent.innerHTML = `
        <div>
            <span>Type</span>
            <strong>${capitalize(file.type)}</strong>
        </div>

        <div>
            <span>Date</span>
            <strong>${formatDate(file.date)}</strong>
        </div>

        <div>
            <span>Amount</span>
            <strong>${file.amount > 0 ? peso(file.amount) : "Not specified"}</strong>
        </div>

        <div>
            <span>Folder</span>
            <strong>${escapeHtml(getFolderName(file.folderId))}</strong>
        </div>

        <div>
            <span>Uploaded by</span>
            <strong>${escapeHtml(file.uploadedByName)}</strong>
        </div>

        <div>
            <span>Linked expense</span>
            <strong>${escapeHtml(file.linkedExpense || "Not linked")}</strong>
        </div>
    `;

    updateViewerFavoriteButton(file);
    el.vaultPreviewPage.hidden = false;
    requestAnimationFrame(() => el.vaultPreviewPage.classList.add("show"));
}

function closePreviewPage() {
    el.vaultPreviewPage.classList.remove("show");

    window.setTimeout(() => {
        el.vaultPreviewPage.hidden = true;
        delete el.vaultPreviewPage.dataset.returnToBrowser;
    }, 260);
}

function createDocumentPreview(file) {
    const merchant = escapeHtml(file.merchant || "KABALIKAT");
    const title = escapeHtml(file.title);
    const amount = file.amount > 0 ? peso(file.amount) : "—";

    return `
        <div class="vault-document-preview">
            <div class="vault-document-brand">
                <i class="bi ${getFileIcon(file.type)}"></i>
                <strong>${merchant}</strong>
            </div>

            <h4>${capitalize(file.type)}</h4>

            <div class="vault-document-line">
                <span>File</span>
                <strong>${title}</strong>
            </div>

            <div class="vault-document-line">
                <span>Date</span>
                <strong>${formatDate(file.date)}</strong>
            </div>

            <div class="vault-document-line">
                <span>Amount</span>
                <strong>${amount}</strong>
            </div>

            <div class="vault-document-divider"></div>

            <p>Stored securely in your shared Family Vault.</p>
        </div>
    `;
}

function updateViewerFavoriteButton(file) {
    const icon = el.vaultViewerFavoriteButton.querySelector("i");

    icon.className = file.favorite
        ? "bi bi-heart-fill"
        : "bi bi-heart";

    el.vaultViewerFavoriteButton.classList.toggle("active", file.favorite === true);
}

async function shareSelectedFile() {
    const file = getSelectedFile();

    if (!file) {
        return;
    }

    const shareData = {
        title: file.title,
        text: `${file.title} from the KABALIKAT Family Vault`
    };

    try {
        if (navigator.share) {
            await navigator.share(shareData);
            return;
        }

        await navigator.clipboard.writeText(shareData.text);
        showToast("File details copied for sharing.");
    } catch (error) {
        if (error?.name !== "AbortError") {
            showToast("This file could not be shared.");
        }
    }
}

function getFileSizeLabel(file) {
    if (!file.dataUrl) {
        return "Stored file";
    }

    const approximateBytes = Math.max(
        0,
        Math.round((file.dataUrl.length * 3) / 4)
    );

    if (approximateBytes < 1024) {
        return `${approximateBytes} B`;
    }

    if (approximateBytes < 1024 * 1024) {
        return `${Math.round(approximateBytes / 1024)} KB`;
    }

    return `${(approximateBytes / (1024 * 1024)).toFixed(1)} MB`;
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
            folderId:
                browserMode === "folder"
                    ? browserFolderId
                    : activeFolder === "all"
                        ? ""
                        : activeFolder,
            mimeType: file.type,
            dataUrl
        }, actor);

        closeAddSheet();
        renderAll();

        if (browserMode) {
            renderBrowserPage();
        }

        showToast(
            type === "receipt"
                ? "Receipt saved to the Family Vault."
                : "Document uploaded."
        );
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
        const parentId =
            browserMode === "folder"
                ? browserFolderId
                : "";

        vault.createFolder(
            name,
            actor,
            parentId
        );
        closeFolderSheet();
        renderAll();

        if (
            browserMode === "folders" ||
            browserMode === "folder"
        ) {
            renderBrowserPage();
        } else {
            window.setTimeout(
                openAllFoldersSheet,
                220
            );
        }

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

function toggleSelectedFavorite() {
    const file = getSelectedFile();

    if (!file) {
        return;
    }

    performAction(
        () => vault.updateFile(selectedFileId, { favorite: !file.favorite }, actor),
        file.favorite
            ? "Removed from Favorites."
            : "Added to Favorites."
    );

    const updatedFile = getSelectedFile();

    if (updatedFile && !el.vaultPreviewPage.hidden) {
        updateViewerFavoriteButton(updatedFile);
    }

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
            window.location.replace("vault-unlock.html");
        }, IDLE_LIMIT);
    };

    ["click", "touchstart", "keydown", "scroll"].forEach(eventName => {
        document.addEventListener(eventName, reset, { passive: eventName !== "keydown" });
    });

    reset();
}

function openAddSheet(options = {}) {
    const hideNewFolder =
        options.hideNewFolder === true;

    el.vaultNewFolderOption.hidden =
        hideNewFolder;

    openSheet(
        el.vaultAddBackdrop,
        el.vaultAddSheet
    );
}

function closeAddSheet() {
    closeSheet(
        el.vaultAddBackdrop,
        el.vaultAddSheet
    );

    window.setTimeout(() => {
        el.vaultNewFolderOption.hidden = false;
    }, 240);
}

function openAllFoldersSheet() {
    state = vault.load();
    renderAllFoldersList();
    setOverviewActive("folders");
    openSheet(el.vaultAllFoldersBackdrop, el.vaultAllFoldersSheet);
}

function closeAllFoldersSheet() {
    closeSheet(el.vaultAllFoldersBackdrop, el.vaultAllFoldersSheet);
}

function openFolderSheet() {
    el.vaultFolderNameInput.value = "";

    const currentFolder =
        browserMode === "folder"
            ? getFolderById(browserFolderId)
            : null;

    el.vaultFolderSheetTitle.textContent =
        currentFolder
            ? "Create Subfolder"
            : "Create Folder";

    el.vaultFolderLocationText.textContent =
        currentFolder
            ? `Create inside ${currentFolder.name}`
            : "Create in Family Vault";

    openSheet(
        el.vaultFolderBackdrop,
        el.vaultFolderSheet
    );
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

function scrollToSection(target) {
    if (!target) {
        return;
    }

    target.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

function showToast(message) {
    window.clearTimeout(toastTimer);
    el.vaultToast.textContent = message;
    el.vaultToast.classList.add("show");

    toastTimer = window.setTimeout(() => {
        el.vaultToast.classList.remove("show");
    }, 2400);
}

window.addEventListener("popstate", () => {
    const params = new URLSearchParams(window.location.search);
    const page = params.get("vaultPage");
    const folderId = params.get("folderId") || "";

    if (["files", "folders", "favorites", "folder"].includes(page)) {
        browserMode = page;
        browserFolderId = page === "folder" ? folderId : "";

        renderBrowserPage();
        el.vaultBrowserPage.hidden = false;

        requestAnimationFrame(() => {
            el.vaultBrowserPage.classList.add("show");
        });

        return;
    }

    browserMode = "";
    browserFolderId = "";
    el.vaultBrowserPage.classList.remove("show");

    window.setTimeout(() => {
        el.vaultBrowserPage.hidden = true;
    }, 220);
});