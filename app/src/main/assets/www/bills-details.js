const AUTH_DB_NAME = "kabalikat_auth_language_db";
const BILLS_DB_NAME = "kabalikat_bills_db";
const BILLS_DB_VERSION = 1;

function openKabalikatDatabase(name, version = undefined) {
    return new Promise((resolve, reject) => {
        const request = version
            ? indexedDB.open(name, version)
            : indexedDB.open(name);

        request.onupgradeneeded = event => {
            if (name !== BILLS_DB_NAME) {
                return;
            }

            const database = event.target.result;

            if (!database.objectStoreNames.contains("entries")) {
                const store = database.createObjectStore(
                    "entries",
                    { keyPath: "id" }
                );

                store.createIndex(
                    "familyCode",
                    "familyCode",
                    { unique: false }
                );

                store.createIndex(
                    "dueDate",
                    "dueDate",
                    { unique: false }
                );

                store.createIndex(
                    "type",
                    "type",
                    { unique: false }
                );
            }
        };

        request.onsuccess = event => {
            resolve(event.target.result);
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
}

function readKabalikatRecord(
    database,
    storeName,
    key
) {
    return new Promise((resolve, reject) => {
        if (
            !database.objectStoreNames.contains(
                storeName
            )
        ) {
            resolve(null);
            return;
        }

        const request =
            database
                .transaction(
                    storeName,
                    "readonly"
                )
                .objectStore(
                    storeName
                )
                .get(key);

        request.onsuccess = () => {
            resolve(request.result || null);
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
}

async function loadKabalikatUserContext(
    authDatabase
) {
    const session =
        await readKabalikatRecord(
            authDatabase,
            "sessions",
            "current"
        );

    let user = null;

    if (session?.userId) {
        user =
            await readKabalikatRecord(
                authDatabase,
                "users",
                session.userId
            );
    }

    if (!user) {
        user = {
            id: "sample-head",
            familyCode: "KABA-4821"
        };
    }

    let family =
        await readKabalikatRecord(
            authDatabase,
            "families",
            user.familyCode
        );

    if (!family) {
        family = {
            familyCode:
                user.familyCode ||
                "KABA-4821"
        };
    }

    return {
        user,
        family
    };
}

function loadKabalikatFamilyEntries(
    database,
    familyCode
) {
    return new Promise((resolve, reject) => {
        if (
            !database.objectStoreNames.contains(
                "entries"
            )
        ) {
            resolve([]);
            return;
        }

        const transaction =
            database.transaction(
                "entries",
                "readonly"
            );

        const store =
            transaction.objectStore(
                "entries"
            );

        let request = null;

        if (
            store.indexNames.contains(
                "familyCode"
            )
        ) {
            request =
                store
                    .index(
                        "familyCode"
                    )
                    .getAll(
                        familyCode
                    );
        } else {
            request =
                store.getAll();
        }

        request.onsuccess = () => {
            const records =
                request.result || [];

            resolve(
                records.filter(entry => {
                    return (
                        !familyCode ||
                        entry.familyCode ===
                            familyCode
                    );
                })
            );
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
}

function saveKabalikatEntry(
    database,
    entry
) {
    return new Promise((resolve, reject) => {
        const request =
            database
                .transaction(
                    "entries",
                    "readwrite"
                )
                .objectStore(
                    "entries"
                )
                .put(entry);

        request.onsuccess = () => {
            resolve(entry);
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
}

function getRequestedBillsPeriod() {
    const requested =
        new URLSearchParams(
            window.location.search
        ).get("month");

    if (
        /^\d{4}-\d{2}$/.test(
            requested || ""
        )
    ) {
        return requested;
    }

    const today = new Date();

    return (
        `${today.getFullYear()}-` +
        `${String(
            today.getMonth() + 1
        ).padStart(2, "0")}`
    );
}

function setRequestedBillsPeriod(
    periodValue
) {
    window.history.replaceState(
        null,
        "",
        `?month=${encodeURIComponent(
            periodValue
        )}`
    );
}

function formatBillsPeriod(
    periodValue
) {
    const [year, month] =
        periodValue
            .split("-")
            .map(Number);

    return new Date(
        year,
        month - 1,
        1
    ).toLocaleDateString(
        "en-PH",
        {
            month: "long",
            year: "numeric"
        }
    );
}

function entryMatchesBillsPeriod(
    entry,
    periodValue
) {
    return String(
        entry.dueDate || ""
    ).startsWith(
        periodValue
    );
}

function parseBillsDate(value) {
    const [year, month, day] =
        String(value || "")
            .split("-")
            .map(Number);

    return new Date(
        year,
        month - 1,
        day
    );
}

function formatBillsDate(value) {
    const date =
        parseBillsDate(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "Unknown date";
    }

    return date.toLocaleDateString(
        "en-PH",
        {
            month: "short",
            day: "numeric",
            year: "numeric"
        }
    );
}

function getTodayDateValue() {
    const today = new Date();

    return (
        `${today.getFullYear()}-` +
        `${String(
            today.getMonth() + 1
        ).padStart(2, "0")}-` +
        `${String(
            today.getDate()
        ).padStart(2, "0")}`
    );
}

function formatPeso(value) {
    return (
        `₱` +
        Number(value || 0)
            .toLocaleString(
                "en-PH",
                {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2
                }
            )
    );
}

function setPageText(id, value) {
    const element =
        document.getElementById(id);

    if (element) {
        element.textContent = value;
    }
}

function escapePageHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function getStoredDebtDirection(entry) {
    return (
        entry?.debtDirection ===
        "receivable"
            ? "receivable"
            : "payable"
    );
}

function normalizeStoredBillCategory(
    entry
) {
    if (
        entry.type !== "bill" ||
        entry.category !== "Utilities"
    ) {
        return (
            entry.category ||
            "Other"
        );
    }

    const normalized =
        (
            `${entry.name || ""} ` +
            `${entry.provider || ""}`
        ).toLowerCase();

    if (
        normalized.includes(
            "electric"
        ) ||
        normalized.includes(
            "meralco"
        )
    ) {
        return "Electricity";
    }

    if (
        normalized.includes(
            "water"
        ) ||
        normalized.includes(
            "maynilad"
        ) ||
        normalized.includes(
            "manila water"
        )
    ) {
        return "Water";
    }

    return "Utilities";
}

function formatStoredFrequency(
    value
) {
    if (value === "one-time") {
        return "One-time";
    }

    const text =
        String(value || "");

    return (
        text.charAt(0).toUpperCase() +
        text.slice(1)
    );
}

function scheduleStoredReminder(entry) {
    const bridge =
        window.KabalikatAndroid;

    if (
        !bridge ||
        typeof bridge
            .scheduleBillReminders !==
            "function"
    ) {
        return;
    }

    try {
        bridge.scheduleBillReminders(
            JSON.stringify({
                id: entry.id,
                name: entry.name,
                provider: entry.provider,
                amount: Number(
                    entry.amount || 0
                ),
                dueDate: entry.dueDate,
                debtDirection:
                    entry.debtDirection ||
                    null,
                frequency:
                    entry.frequency
            })
        );
    } catch (error) {
        console.error(
            "Could not schedule Android reminders:",
            error
        );
    }
}

function cancelStoredReminder(entryId) {
    const bridge =
        window.KabalikatAndroid;

    if (
        !bridge ||
        typeof bridge
            .cancelBillReminders !==
            "function"
    ) {
        return;
    }

    try {
        bridge.cancelBillReminders(
            String(entryId)
        );
    } catch (error) {
        console.error(
            "Could not cancel Android reminders:",
            error
        );
    }
}

function populateMonthAndYearSelects(
    monthSelect,
    yearSelect,
    entries,
    selectedPeriod
) {
    const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
    ];

    monthSelect.innerHTML =
        monthNames
            .map(
                (month, index) =>
                    `<option value="${index}">${month}</option>`
            )
            .join("");

    const currentYear =
        new Date().getFullYear();

    const [selectedYear] =
        selectedPeriod
            .split("-")
            .map(Number);

    const entryYears =
        entries
            .map(entry => {
                return parseBillsDate(
                    entry.dueDate
                ).getFullYear();
            })
            .filter(year => {
                return Number.isFinite(year);
            });

    const minimumYear =
        Math.min(
            currentYear,
            selectedYear,
            ...entryYears
        ) - 5;

    const maximumYear =
        Math.max(
            currentYear,
            selectedYear,
            ...entryYears
        ) + 5;

    yearSelect.innerHTML = "";

    for (
        let year = minimumYear;
        year <= maximumYear;
        year += 1
    ) {
        yearSelect.insertAdjacentHTML(
            "beforeend",
            `<option value="${year}">${year}</option>`
        );
    }
}

let authDb = null;
let billsDb = null;
let currentUser = null;
let currentFamily = null;
let allEntries = [];
let bills = [];

let selectedPeriod =
    getRequestedBillsPeriod();

let selectedStatus = "all";
let showAllCategories = false;
let selectedCategory = null;

const expandedBillIds =
    new Set();

const BILL_CATEGORY_STYLES = {
    Electricity: {
        icon: "bi-lightning-charge",
        soft: "#FFF1C9",
        accent: "#D89B15"
    },

    Water: {
        icon: "bi-droplet",
        soft: "#EAF3F8",
        accent: "#4E8EB5"
    },

    Internet: {
        icon: "bi-router",
        soft: "#EAF3F8",
        accent: "#4F7F99"
    },

    Housing: {
        icon: "bi-house-door",
        soft: "#FFF1E8",
        accent: "#C96E4B"
    },

    Subscription: {
        icon: "bi-arrow-repeat",
        soft: "#F1EDFF",
        accent: "#8057D8"
    },

    "Credit Card": {
        icon: "bi-credit-card",
        soft: "#FCEAF2",
        accent: "#B35A82"
    },

    Education: {
        icon: "bi-book",
        soft: "#FFF0E5",
        accent: "#D78958"
    },

    Health: {
        icon: "bi-heart-pulse",
        soft: "#EEF6F0",
        accent: "#5C8F6C"
    },

    Utilities: {
        icon: "bi-tools",
        soft: "#FFF5D8",
        accent: "#A77E20"
    },

    Other: {
        icon: "bi-three-dots",
        soft: "#EEEAF8",
        accent: "#6E618E"
    }
};

document.addEventListener(
    "DOMContentLoaded",
    initializeBillsDetails
);

async function initializeBillsDetails() {
    try {
        bindBillsDetailsEvents();

        authDb =
            await openKabalikatDatabase(
                AUTH_DB_NAME
            );

        const context =
            await loadKabalikatUserContext(
                authDb
            );

        currentUser =
            context.user;

        currentFamily =
            context.family;

        billsDb =
            await openKabalikatDatabase(
                BILLS_DB_NAME,
                BILLS_DB_VERSION
            );

        await loadBillsDetailsEntries();

        populateBillsDetailsMonthPicker();

        renderBillsDetails();
    } catch (error) {
        console.error(
            "Bills Details initialization failed:",
            error
        );

        setPageText(
            "detailsMonthLabel",
            formatBillsPeriod(
                selectedPeriod
            )
        );

        setPageText(
            "detailsSummaryLabel",
            "Bills unavailable"
        );

        setPageText(
            "detailsSummaryAmount",
            "₱0"
        );

        setPageText(
            "detailsSummaryCount",
            "The saved bills could not be loaded."
        );

        setPageText(
            "billRecordCount",
            "0 records"
        );

        const categoryGrid =
            document.getElementById(
                "categoryGrid"
            );

        if (categoryGrid) {
            categoryGrid.innerHTML = `
                <div class="category-empty">
                    Category totals are unavailable.
                </div>
            `;
        }

        const records =
            document.getElementById(
                "billRecordsList"
            );

        if (records) {
            records.innerHTML = `
                <div class="empty-bill-records">
                    Bills Details could not access the saved Bills database.
                </div>
            `;
        }

        showBillsDetailsToast(
            "Bills Details could not be loaded."
        );
    }
}

function bindBillsDetailsEvents() {
    document
        .getElementById(
            "backToBills"
        )
        ?.addEventListener(
            "click",
            () => {
                window.location.href =
                    `bills.html?month=${encodeURIComponent(
                        selectedPeriod
                    )}`;
            }
        );

    document
        .querySelectorAll(
            "[data-status-filter]"
        )
        .forEach(button => {
            button.addEventListener(
                "click",
                () => {
                    selectedStatus =
                        button.dataset
                            .statusFilter;

                    selectedCategory =
                        null;

                    showAllCategories =
                        false;

                    renderBillsDetails();
                }
            );
        });

    document
        .getElementById(
            "toggleCategories"
        )
        ?.addEventListener(
            "click",
            () => {
                showAllCategories =
                    !showAllCategories;

                renderBillCategories();
            }
        );

    document
        .getElementById(
            "clearCategoryFilter"
        )
        ?.addEventListener(
            "click",
            () => {
                selectedCategory =
                    null;

                renderBillCategories();
                renderActiveCategoryNotice();
                renderBillRecords();
            }
        );

    document
        .getElementById(
            "detailsMonthButton"
        )
        ?.addEventListener(
            "click",
            openBillsDetailsMonthPicker
        );

    document
        .getElementById(
            "detailsMonthBackdrop"
        )
        ?.addEventListener(
            "click",
            closeBillsDetailsMonthPicker
        );

    document
        .getElementById(
            "closeDetailsMonthPicker"
        )
        ?.addEventListener(
            "click",
            closeBillsDetailsMonthPicker
        );

    document
        .getElementById(
            "cancelDetailsMonthPicker"
        )
        ?.addEventListener(
            "click",
            closeBillsDetailsMonthPicker
        );

    document
        .getElementById(
            "applyDetailsMonthPicker"
        )
        ?.addEventListener(
            "click",
            applyBillsDetailsMonthPicker
        );
}

async function loadBillsDetailsEntries() {
    allEntries =
        await loadKabalikatFamilyEntries(
            billsDb,
            currentFamily.familyCode
        );

    const updates = [];

    allEntries.forEach(entry => {
        const normalizedCategory =
            normalizeStoredBillCategory(
                entry
            );

        if (
            entry.type === "bill" &&
            normalizedCategory !==
                entry.category
        ) {
            entry.category =
                normalizedCategory;

            entry.updatedAt =
                new Date().toISOString();

            updates.push(
                saveKabalikatEntry(
                    billsDb,
                    entry
                )
            );
        }
    });

    if (updates.length) {
        await Promise.all(updates);
    }

    bills =
        allEntries.filter(entry => {
            return (
                entry.type === "bill" &&
                entryMatchesBillsPeriod(
                    entry,
                    selectedPeriod
                )
            );
        });
}

function getStatusFilteredBills() {
    return bills.filter(entry => {
        if (
            selectedStatus === "active"
        ) {
            return !entry.paid;
        }

        if (
            selectedStatus === "paid"
        ) {
            return Boolean(
                entry.paid
            );
        }

        return true;
    });
}

function getVisibleBillRecords() {
    return getStatusFilteredBills()
        .filter(entry => {
            return (
                !selectedCategory ||
                entry.category ===
                    selectedCategory
            );
        });
}

function renderBillsDetails() {
    setPageText(
        "detailsMonthLabel",
        formatBillsPeriod(
            selectedPeriod
        )
    );

    renderBillsStatusFilter();
    renderBillsDetailsSummary();
    renderBillCategories();
    renderActiveCategoryNotice();
    renderBillRecords();
}

function renderBillsStatusFilter() {
    document
        .querySelectorAll(
            "[data-status-filter]"
        )
        .forEach(button => {
            button.classList.toggle(
                "active",
                button.dataset
                    .statusFilter ===
                    selectedStatus
            );
        });
}

function renderBillsDetailsSummary() {
    const activeBills =
        bills.filter(
            entry => !entry.paid
        );

    const paidBills =
        bills.filter(
            entry => entry.paid
        );

    let summaryBills =
        bills;

    let summaryLabel =
        "Total Bills";

    if (
        selectedStatus === "active"
    ) {
        summaryBills =
            activeBills;

        summaryLabel =
            "Bills Due";
    } else if (
        selectedStatus === "paid"
    ) {
        summaryBills =
            paidBills;

        summaryLabel =
            "Bills Paid";
    }

    const amount =
        summaryBills.reduce(
            (sum, entry) => {
                return (
                    sum +
                    Number(
                        entry.amount || 0
                    )
                );
            },
            0
        );

    setPageText(
        "detailsSummaryLabel",
        summaryLabel
    );

    setPageText(
        "detailsSummaryAmount",
        formatPeso(amount)
    );

    setPageText(
        "detailsSummaryCount",
        `${activeBills.length} remaining · ${paidBills.length} paid`
    );
}

function getBillCategoryTotals() {
    const totals =
        new Map();

    getStatusFilteredBills()
        .forEach(entry => {
            const category =
                entry.category ||
                "Other";

            totals.set(
                category,
                (
                    totals.get(
                        category
                    ) || 0
                ) +
                Number(
                    entry.amount || 0
                )
            );
        });

    return [
        ...totals.entries()
    ]
        .filter(
            ([, amount]) =>
                amount > 0
        )
        .sort(
            (first, second) =>
                second[1] -
                first[1]
        );
}

function renderBillCategories() {
    const grid =
        document.getElementById(
            "categoryGrid"
        );

    const toggle =
        document.getElementById(
            "toggleCategories"
        );

    if (!grid || !toggle) {
        return;
    }

    const totals =
        getBillCategoryTotals();

    const visible =
        showAllCategories
            ? totals
            : totals.slice(
                0,
                4
            );

    toggle.hidden =
        totals.length <= 4;

    toggle.textContent =
        showAllCategories
            ? "Show Less"
            : "View All";

    if (!visible.length) {
        grid.innerHTML = `
            <div class="category-empty">
                No categories with an amount for this filter.
            </div>
        `;

        return;
    }

    grid.innerHTML =
        visible
            .map(
                ([category, amount]) => {
                    const style =
                        BILL_CATEGORY_STYLES[
                            category
                        ] ||
                        BILL_CATEGORY_STYLES
                            .Other;

                    return `
                        <button
                            class="category-card ${
                                selectedCategory ===
                                category
                                    ? "active"
                                    : ""
                            }"
                            type="button"
                            data-category="${escapePageHtml(category)}"
                            style="background:${style.soft}"
                        >
                            <span
                                class="category-icon"
                                style="color:${style.accent}"
                            >
                                <i class="bi ${style.icon}"></i>
                            </span>

                            <span class="category-copy">
                                <strong>
                                    ${escapePageHtml(category)}
                                </strong>

                                <span>
                                    ${formatPeso(amount)}
                                </span>
                            </span>
                        </button>
                    `;
                }
            )
            .join("");

    grid
        .querySelectorAll(
            "[data-category]"
        )
        .forEach(button => {
            button.addEventListener(
                "click",
                () => {
                    selectedCategory =
                        selectedCategory ===
                        button.dataset.category
                            ? null
                            : button.dataset
                                .category;

                    renderBillCategories();
                    renderActiveCategoryNotice();
                    renderBillRecords();
                }
            );
        });
}

function renderActiveCategoryNotice() {
    const notice =
        document.getElementById(
            "activeCategoryNotice"
        );

    if (!notice) {
        return;
    }

    notice.hidden =
        !selectedCategory;

    setPageText(
        "activeCategoryText",
        selectedCategory
            ? `Showing ${selectedCategory} bills`
            : "Category"
    );
}

function renderBillRecords() {
    const container =
        document.getElementById(
            "billRecordsList"
        );

    if (!container) {
        return;
    }

    const todayValue =
        getTodayDateValue();

    const records =
        getVisibleBillRecords()
            .sort(
                (first, second) => {
                    if (
                        selectedStatus ===
                        "paid"
                    ) {
                        return (
                            getCompletionTimestamp(
                                second
                            ) -
                            getCompletionTimestamp(
                                first
                            )
                        );
                    }

                    const firstOverdue =
                        !first.paid &&
                        first.dueDate <
                            todayValue;

                    const secondOverdue =
                        !second.paid &&
                        second.dueDate <
                            todayValue;

                    if (
                        firstOverdue !==
                        secondOverdue
                    ) {
                        return firstOverdue
                            ? -1
                            : 1;
                    }

                    return (
                        parseBillsDate(
                            first.dueDate
                        ) -
                        parseBillsDate(
                            second.dueDate
                        )
                    );
                }
            );

    setPageText(
        "billRecordCount",
        records.length === 1
            ? "1 record"
            : `${records.length} records`
    );

    if (!records.length) {
        container.innerHTML = `
            <div class="empty-bill-records">
                No bill records found for the selected filters.
            </div>
        `;

        return;
    }

    container.innerHTML =
        records
            .map(entry => {
                const style =
                    BILL_CATEGORY_STYLES[
                        entry.category
                    ] ||
                    BILL_CATEGORY_STYLES
                        .Other;

                const overdue =
                    !entry.paid &&
                    entry.dueDate <
                        todayValue;

                const expanded =
                    expandedBillIds.has(
                        entry.id
                    );

                const status =
                    entry.paid
                        ? "Paid"
                        : overdue
                            ? "Past Due"
                            : "Unpaid";

                const statusClass =
                    entry.paid
                        ? "paid"
                        : overdue
                            ? "overdue"
                            : "";

                return `
                    <article
                        class="bill-record-card ${overdue ? "overdue" : ""}"
                    >
                        <button
                            class="bill-record-summary"
                            type="button"
                            data-expand="${escapePageHtml(entry.id)}"
                            aria-expanded="${expanded}"
                        >
                            <span class="bill-record-top">
                                <span
                                    class="bill-record-icon"
                                    style="
                                        --soft:${style.soft};
                                        --accent:${style.accent}
                                    "
                                >
                                    <i class="bi ${style.icon}"></i>
                                </span>

                                <span class="bill-record-title">
                                    <strong>
                                        ${escapePageHtml(entry.name)}
                                    </strong>

                                    <small>
                                        ${escapePageHtml(
                                            entry.provider ||
                                            "No provider"
                                        )}
                                    </small>
                                </span>

                                <span class="bill-record-amount">
                                    ${formatPeso(entry.amount)}
                                </span>
                            </span>

                            <span class="bill-record-meta">
                                <span class="bill-tag category">
                                    ${escapePageHtml(
                                        entry.category ||
                                        "Other"
                                    )}
                                </span>

                                <span
                                    class="bill-tag status ${statusClass}"
                                >
                                    ${status}
                                </span>
                            </span>

                            <span class="expand-prompt">
                                <span>
                                    ${expanded ? "Hide details" : "View details"}
                                </span>

                                <i class="bi bi-chevron-down"></i>
                            </span>
                        </button>

                        <div
                            class="bill-record-details"
                            ${expanded ? "" : "hidden"}
                        >
                            <div class="bill-information">
                                ${createBillInformationRow(
                                    "bi-building",
                                    "Provider",
                                    entry.provider ||
                                    "Not provided"
                                )}

                                ${createBillInformationRow(
                                    "bi-calendar3",
                                    "Due date",
                                    formatBillsDate(
                                        entry.dueDate
                                    )
                                )}

                                ${createBillInformationRow(
                                    "bi-tag",
                                    "Category",
                                    entry.category ||
                                    "Other"
                                )}

                                ${createBillInformationRow(
                                    "bi-arrow-repeat",
                                    "Frequency",
                                    formatStoredFrequency(
                                        entry.frequency
                                    )
                                )}

                                ${createBillInformationRow(
                                    "bi-bell",
                                    "Reminder",
                                    entry.reminder
                                        ? "Enabled"
                                        : "Disabled"
                                )}

                                ${createBillInformationRow(
                                    "bi-people",
                                    "Family visibility",
                                    entry.shared
                                        ? "Shared"
                                        : "Private"
                                )}
                            </div>

                            ${
                                entry.notes
                                    ? `
                                        <div class="bill-record-notes">
                                            <span>Notes</span>
                                            <p>${escapePageHtml(entry.notes)}</p>
                                        </div>
                                    `
                                    : ""
                            }

                            <button
                                class="bill-record-action ${
                                    entry.paid
                                        ? "completed"
                                        : ""
                                }"
                                type="button"
                                data-toggle-paid="${escapePageHtml(entry.id)}"
                            >
                                ${
                                    entry.paid
                                        ? "Mark as Unpaid"
                                        : "Mark as Paid"
                                }
                            </button>
                        </div>
                    </article>
                `;
            })
            .join("");

    container
        .querySelectorAll(
            "[data-expand]"
        )
        .forEach(button => {
            button.addEventListener(
                "click",
                () => {
                    const id =
                        button.dataset.expand;

                    if (
                        expandedBillIds.has(
                            id
                        )
                    ) {
                        expandedBillIds.delete(
                            id
                        );
                    } else {
                        expandedBillIds.add(
                            id
                        );
                    }

                    renderBillRecords();
                }
            );
        });

    container
        .querySelectorAll(
            "[data-toggle-paid]"
        )
        .forEach(button => {
            button.addEventListener(
                "click",
                async event => {
                    event.stopPropagation();

                    await toggleStoredBillStatus(
                        button.dataset
                            .togglePaid
                    );
                }
            );
        });
}

async function toggleStoredBillStatus(id) {
    const entry =
        allEntries.find(
            item => item.id === id
        );

    if (!entry) {
        return;
    }

    entry.paid =
        !entry.paid;

    entry.completedAt =
        entry.paid
            ? new Date().toISOString()
            : null;

    entry.updatedAt =
        new Date().toISOString();

    if (entry.paid) {
        cancelStoredReminder(
            entry.id
        );

        entry.nativeReminderScheduled =
            false;
    } else if (
        entry.reminder
    ) {
        scheduleStoredReminder(
            entry
        );

        entry.nativeReminderScheduled =
            true;
    }

    await saveKabalikatEntry(
        billsDb,
        entry
    );

    await loadBillsDetailsEntries();

    renderBillsDetails();

    showBillsDetailsToast(
        entry.paid
            ? "Bill marked as paid."
            : "Bill marked as unpaid."
    );
}

function createBillInformationRow(
    icon,
    label,
    value
) {
    return `
        <div class="bill-information-row">
            <i class="bi ${icon}"></i>
            <span>${escapePageHtml(label)}</span>
            <strong>${escapePageHtml(value)}</strong>
        </div>
    `;
}

function getCompletionTimestamp(entry) {
    const date =
        new Date(
            entry.completedAt ||
            entry.updatedAt ||
            entry.dueDate
        );

    return Number.isNaN(
        date.getTime()
    )
        ? 0
        : date.getTime();
}

function populateBillsDetailsMonthPicker() {
    populateMonthAndYearSelects(
        document.getElementById(
            "detailsMonthSelect"
        ),
        document.getElementById(
            "detailsYearSelect"
        ),
        allEntries,
        selectedPeriod
    );
}

function openBillsDetailsMonthPicker() {
    const [year, month] =
        selectedPeriod
            .split("-")
            .map(Number);

    document.getElementById(
        "detailsMonthSelect"
    ).value =
        String(month - 1);

    document.getElementById(
        "detailsYearSelect"
    ).value =
        String(year);

    document.getElementById(
        "detailsMonthPicker"
    ).hidden =
        false;
}

function closeBillsDetailsMonthPicker() {
    document.getElementById(
        "detailsMonthPicker"
    ).hidden =
        true;
}

async function applyBillsDetailsMonthPicker() {
    const month =
        Number(
            document.getElementById(
                "detailsMonthSelect"
            ).value
        );

    const year =
        Number(
            document.getElementById(
                "detailsYearSelect"
            ).value
        );

    selectedPeriod =
        `${year}-` +
        `${String(
            month + 1
        ).padStart(2, "0")}`;

    setRequestedBillsPeriod(
        selectedPeriod
    );

    selectedCategory =
        null;

    showAllCategories =
        false;

    await loadBillsDetailsEntries();

    closeBillsDetailsMonthPicker();

    renderBillsDetails();
}

function showBillsDetailsToast(
    message
) {
    const toast =
        document.getElementById(
            "detailsToast"
        );

    if (!toast) {
        return;
    }

    toast.textContent =
        message;

    toast.classList.add(
        "show"
    );

    window.clearTimeout(
        showBillsDetailsToast.timer
    );

    showBillsDetailsToast.timer =
        window.setTimeout(
            () => {
                toast.classList.remove(
                    "show"
                );
            },
            2800
        );
}