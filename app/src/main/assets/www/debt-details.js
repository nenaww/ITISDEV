/* =========================================================
   KABALIKAT Debt Details
   - Reads debt entries from the Bills IndexedDB database
   - Separates payable and receivable debt
   - Displays category, person, date, status, and notes
   - Allows debts to be marked paid, collected, or active again
   ========================================================= */

const AUTH_DB_NAME =
    "kabalikat_auth_language_db";

const BILLS_DB_NAME =
    "kabalikat_bills_db";

let authDb = null;
let billsDb = null;
let currentUser = null;
let currentFamily = null;
let allDebtEntries = [];
let debtEntries = [];

let selectedDebtFilter = "all";
let selectedStatusFilter = "all";
let selectedDebtCategory = null;
let selectedDebtPeriod =
    getRequestedDebtPeriod();

const expandedDebtIds = new Set();

const DEBT_CATEGORY_STYLES = {
    Loan: {
        icon: "bi-bank",
        soft: "#FFF1E8",
        accent: "#C96E4B"
    },

    "Credit Card": {
        icon: "bi-credit-card",
        soft: "#FCEAF2",
        accent: "#B35A82"
    },

    Personal: {
        icon: "bi-person",
        soft: "#EEEAF8",
        accent: "#6E618E"
    },

    Education: {
        icon: "bi-book",
        soft: "#FFF5D8",
        accent: "#A77E20"
    },

    Health: {
        icon: "bi-heart-pulse",
        soft: "#EEF6F0",
        accent: "#5C8F6C"
    },

    Housing: {
        icon: "bi-house-door",
        soft: "#EAF3F8",
        accent: "#4F7F99"
    },

    Other: {
        icon: "bi-three-dots",
        soft: "#EEEAF8",
        accent: "#6E618E"
    }
};

document.addEventListener(
    "DOMContentLoaded",
    initializeDebtDetailsPage
);

async function initializeDebtDetailsPage() {
    try {
        bindDebtDetailsEvents();

        authDb =
            await openDatabase(
                AUTH_DB_NAME
            );

        await loadCurrentUserContext();

        billsDb =
            await openDatabase(
                BILLS_DB_NAME
            );

        await loadDebtEntries();
        populateDebtMonthPicker();
        renderDebtDetailsPage();
    } catch (error) {
        console.error(
            "Debt Details initialization failed:",
            error
        );

        showDebtToast(
            "Debt details could not be loaded."
        );
    }
}

function bindDebtDetailsEvents() {
    document
        .getElementById("backToBills")
        ?.addEventListener(
            "click",
            () => navigateTo(
                `bills.html?month=${encodeURIComponent(
                    selectedDebtPeriod
                )}`
            )
        );

    document
        .querySelectorAll(
            "[data-debt-filter]"
        )
        .forEach(button => {
            button.addEventListener(
                "click",
                () => {
                    selectedDebtFilter =
                        button.dataset.debtFilter;

                    selectedDebtCategory =
                        null;

                    renderDebtFilter();
                    renderDebtCategories();
                    renderDebtRecords();
                }
            );
        });

    document
        .querySelectorAll(
            "[data-debt-status-filter]"
        )
        .forEach(button => {
            button.addEventListener(
                "click",
                () => {
                    selectedStatusFilter =
                        button.dataset
                            .debtStatusFilter;

                    selectedDebtCategory =
                        null;

                    renderDebtStatusFilter();
                    renderDebtCategories();
                    renderDebtRecords();
                }
            );
        });

    document
        .getElementById(
            "debtMonthButton"
        )
        ?.addEventListener(
            "click",
            openDebtMonthPicker
        );

    document
        .getElementById(
            "debtMonthBackdrop"
        )
        ?.addEventListener(
            "click",
            closeDebtMonthPicker
        );

    document
        .getElementById(
            "closeDebtMonthPicker"
        )
        ?.addEventListener(
            "click",
            closeDebtMonthPicker
        );

    document
        .getElementById(
            "cancelDebtMonthPicker"
        )
        ?.addEventListener(
            "click",
            closeDebtMonthPicker
        );

    document
        .getElementById(
            "applyDebtMonthPicker"
        )
        ?.addEventListener(
            "click",
            applyDebtMonthPicker
        );

    document
        .getElementById(
            "clearDebtCategory"
        )
        ?.addEventListener(
            "click",
            () => {
                selectedDebtCategory =
                    null;

                renderDebtCategories();
                renderDebtRecords();
            }
        );

    document
        .getElementById(
            "detailsNavHome"
        )
        ?.addEventListener(
            "click",
            () => navigateTo("home.html")
        );

    document
        .getElementById(
            "detailsNavExpenses"
        )
        ?.addEventListener(
            "click",
            () => navigateTo("expenses.html")
        );

    document
        .getElementById(
            "detailsNavScan"
        )
        ?.addEventListener(
            "click",
            () => navigateTo("scanner.html")
        );

    document
        .getElementById(
            "detailsNavBills"
        )
        ?.addEventListener(
            "click",
            () => navigateTo("bills.html")
        );

    document
        .getElementById(
            "detailsNavProfile"
        )
        ?.addEventListener(
            "click",
            () => showDebtToast(
                "Profile will be added next."
            )
        );
}

function navigateTo(page) {
    window.location.href = page;
}

function openDatabase(name) {
    return new Promise(
        (resolve, reject) => {
            const request =
                indexedDB.open(name);

            request.onsuccess =
                event => {
                    resolve(
                        event.target.result
                    );
                };

            request.onerror = () => {
                reject(request.error);
            };
        }
    );
}

async function loadCurrentUserContext() {
    const session =
        await getDatabaseRecord(
            authDb,
            "sessions",
            "current"
        );

    if (session?.userId) {
        currentUser =
            await getDatabaseRecord(
                authDb,
                "users",
                session.userId
            );
    }

    if (!currentUser) {
        currentUser = {
            id: "sample-head",
            familyCode: "KABA-4821"
        };
    }

    currentFamily =
        await getDatabaseRecord(
            authDb,
            "families",
            currentUser.familyCode
        );

    if (!currentFamily) {
        currentFamily = {
            familyCode:
                currentUser.familyCode ||
                "KABA-4821"
        };
    }
}

function getDatabaseRecord(
    database,
    storeName,
    key
) {
    return new Promise(
        (resolve, reject) => {
            if (
                !database
                    .objectStoreNames
                    .contains(storeName)
            ) {
                resolve(null);
                return;
            }

            const transaction =
                database.transaction(
                    storeName,
                    "readonly"
                );

            const request =
                transaction
                    .objectStore(storeName)
                    .get(key);

            request.onsuccess = () => {
                resolve(
                    request.result ||
                    null
                );
            };

            request.onerror = () => {
                reject(request.error);
            };
        }
    );
}

function debtStore(
    mode = "readonly"
) {
    return billsDb
        .transaction(
            "entries",
            mode
        )
        .objectStore("entries");
}

function getFamilyEntries(
    familyCode
) {
    return new Promise(
        (resolve, reject) => {
            const request =
                debtStore()
                    .index("familyCode")
                    .getAll(familyCode);

            request.onsuccess = () => {
                resolve(
                    request.result ||
                    []
                );
            };

            request.onerror = () => {
                reject(request.error);
            };
        }
    );
}

function putDebtEntry(entry) {
    return new Promise(
        (resolve, reject) => {
            const request =
                debtStore("readwrite")
                    .put(entry);

            request.onsuccess = () => {
                resolve(entry);
            };

            request.onerror = () => {
                reject(request.error);
            };
        }
    );
}

async function loadDebtEntries() {
    const entries =
        await getFamilyEntries(
            currentFamily.familyCode
        );

    allDebtEntries =
        entries
            .filter(entry => {
                return (
                    entry.type ===
                    "debt"
                );
            })
            .sort((first, second) => {
                if (
                    Boolean(first.paid) !==
                    Boolean(second.paid)
                ) {
                    return (
                        Number(first.paid) -
                        Number(second.paid)
                    );
                }

                return (
                    parseLocalDate(
                        first.dueDate
                    ) -
                    parseLocalDate(
                        second.dueDate
                    )
                );
            });

    filterDebtEntriesByPeriod();
}

function filterDebtEntriesByPeriod() {
    debtEntries =
        allDebtEntries.filter(
            entry =>
                String(
                    entry.dueDate || ""
                ).startsWith(
                    selectedDebtPeriod
                )
        );
}

function renderDebtDetailsPage() {
    setText(
        "debtMonthLabel",
        formatDebtPeriod(
            selectedDebtPeriod
        )
    );

    renderDebtSummary();
    renderDebtCategories();
    renderDebtFilter();
    renderDebtStatusFilter();
    renderDebtRecords();
}

function renderDebtSummary() {
    const activeDebts =
        debtEntries.filter(
            entry => !entry.paid
        );

    const payableDebts =
        activeDebts.filter(entry => {
            return (
                getDebtDirection(entry) ===
                "payable"
            );
        });

    const receivableDebts =
        activeDebts.filter(entry => {
            return (
                getDebtDirection(entry) ===
                "receivable"
            );
        });

    const payableAmount =
        sumDebtAmounts(
            payableDebts
        );

    const receivableAmount =
        sumDebtAmounts(
            receivableDebts
        );

    setText(
        "detailsYouOweAmount",
        peso(payableAmount)
    );

    setText(
        "detailsOwedToYouAmount",
        peso(receivableAmount)
    );

    setText(
        "detailsYouOweCount",
        formatActiveDebtCount(
            payableDebts.length
        )
    );

    setText(
        "detailsOwedToYouCount",
        formatActiveDebtCount(
            receivableDebts.length
        )
    );

    const todayValue =
        toDateInputValue(
            new Date()
        );

    const overdueCount =
        activeDebts.filter(entry => {
            return (
                entry.dueDate <
                todayValue
            );
        }).length;

    const notice =
        document.getElementById(
            "detailsOverdueNotice"
        );

    if (notice) {
        notice.hidden =
            overdueCount === 0;
    }

    setText(
        "detailsOverdueText",
        overdueCount === 1
            ? "1 overdue debt needs attention"
            : `${overdueCount} overdue debts need attention`
    );
}

function getDebtCategoryTotals() {
    const totals =
        new Map();

    debtEntries.forEach(entry => {
        const category =
            String(
                entry.category ||
                "Other"
            );

        totals.set(
            category,
            (
                totals.get(
                    category
                ) ||
                0
            ) +
            Number(
                entry.amount ||
                0
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

function renderDebtCategories() {
    const grid =
        document.getElementById(
            "debtCategoryGrid"
        );

    if (!grid) {
        return;
    }

    const totals =
        getDebtCategoryTotals();

    setText(
        "debtCategoryCount",
        totals.length === 1
            ? "1 category"
            : `${totals.length} categories`
    );

    const active =
        document.getElementById(
            "debtCategoryActive"
        );

    if (active) {
        active.hidden =
            !selectedDebtCategory;
    }

    setText(
        "debtCategoryActiveText",
        selectedDebtCategory
            ? `Showing ${selectedDebtCategory} debts`
            : "Category"
    );

    if (!totals.length) {
        grid.innerHTML = `
            <div class="debt-category-empty">
                No debt categories are used in this month.
            </div>
        `;

        return;
    }

    grid.innerHTML =
        totals
            .map(
                ([category, amount]) => {
                    const style =
                        DEBT_CATEGORY_STYLES[
                            category
                        ] ||
                        DEBT_CATEGORY_STYLES
                            .Other;

                    return `
                        <button
                            class="debt-category-card ${
                                selectedDebtCategory ===
                                category
                                    ? "active"
                                    : ""
                            }"
                            type="button"
                            data-debt-category="${escapeHtml(
                                category
                            )}"
                            style="
                                --category-soft:${escapeHtml(
                                    style.soft
                                )};
                                --category-accent:${escapeHtml(
                                    style.accent
                                )};
                            "
                        >
                            <span class="debt-category-icon">
                                <i class="bi ${escapeHtml(
                                    style.icon
                                )}"></i>
                            </span>

                            <span class="debt-category-copy">
                                <strong>
                                    ${escapeHtml(
                                        category
                                    )}
                                </strong>

                                <span>
                                    ${peso(
                                        amount
                                    )}
                                </span>
                            </span>
                        </button>
                    `;
                }
            )
            .join("");

    grid
        .querySelectorAll(
            "[data-debt-category]"
        )
        .forEach(button => {
            button.addEventListener(
                "click",
                () => {
                    selectedDebtCategory =
                        selectedDebtCategory ===
                        button.dataset
                            .debtCategory
                            ? null
                            : button.dataset
                                .debtCategory;

                    renderDebtCategories();
                    renderDebtRecords();
                }
            );
        });
}

function getRequestedDebtPeriod() {
    const requested =
        new URLSearchParams(
            window.location.search
        ).get(
            "month"
        );

    if (
        /^\d{4}-\d{2}$/.test(
            requested ||
            ""
        )
    ) {
        return requested;
    }

    const now =
        new Date();

    return (
        `${now.getFullYear()}-` +
        `${String(
            now.getMonth() + 1
        ).padStart(
            2,
            "0"
        )}`
    );
}

function formatDebtPeriod(value) {
    const [year, month] =
        String(
            value ||
            ""
        )
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

function populateDebtMonthPicker() {
    const monthSelect =
        document.getElementById(
            "debtMonthSelect"
        );

    const yearSelect =
        document.getElementById(
            "debtYearSelect"
        );

    if (
        !monthSelect ||
        !yearSelect
    ) {
        return;
    }

    const months = [
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
        months
            .map(
                (month, index) =>
                    `<option value="${index}">${month}</option>`
            )
            .join("");

    const selectedYear =
        Number(
            selectedDebtPeriod
                .slice(
                    0,
                    4
                )
        );

    const years =
        allDebtEntries
            .map(
                entry =>
                    parseLocalDate(
                        entry.dueDate
                    )
                        .getFullYear()
            )
            .filter(
                year =>
                    Number.isFinite(
                        year
                    )
            );

    const currentYear =
        new Date()
            .getFullYear();

    const minimum =
        Math.min(
            currentYear,
            selectedYear,
            ...years
        ) - 3;

    const maximum =
        Math.max(
            currentYear,
            selectedYear,
            ...years
        ) + 3;

    yearSelect.innerHTML =
        "";

    for (
        let year = minimum;
        year <= maximum;
        year += 1
    ) {
        yearSelect
            .insertAdjacentHTML(
                "beforeend",
                `<option value="${year}">${year}</option>`
            );
    }
}

function openDebtMonthPicker() {
    const [year, month] =
        selectedDebtPeriod
            .split("-")
            .map(Number);

    const monthSelect =
        document.getElementById(
            "debtMonthSelect"
        );

    const yearSelect =
        document.getElementById(
            "debtYearSelect"
        );

    if (
        monthSelect &&
        yearSelect
    ) {
        monthSelect.value =
            String(
                month - 1
            );

        yearSelect.value =
            String(
                year
            );
    }

    const picker =
        document.getElementById(
            "debtMonthPicker"
        );

    if (picker) {
        picker.hidden =
            false;
    }
}

function closeDebtMonthPicker() {
    const picker =
        document.getElementById(
            "debtMonthPicker"
        );

    if (picker) {
        picker.hidden =
            true;
    }
}

function applyDebtMonthPicker() {
    const month =
        Number(
            document.getElementById(
                "debtMonthSelect"
            )?.value
        );

    const year =
        Number(
            document.getElementById(
                "debtYearSelect"
            )?.value
        );

    selectedDebtPeriod =
        `${year}-` +
        `${String(
            month + 1
        ).padStart(
            2,
            "0"
        )}`;

    const url =
        new URL(
            window.location.href
        );

    url.searchParams.set(
        "month",
        selectedDebtPeriod
    );

    window.history.replaceState(
        null,
        "",
        url
    );

    selectedDebtCategory =
        null;

    filterDebtEntriesByPeriod();
    closeDebtMonthPicker();
    renderDebtDetailsPage();
}

function renderDebtFilter() {
    document
        .querySelectorAll(
            "[data-debt-filter]"
        )
        .forEach(button => {
            button.classList.toggle(
                "active",
                button.dataset.debtFilter ===
                    selectedDebtFilter
            );
        });
}

function renderDebtStatusFilter() {
    document
        .querySelectorAll(
            "[data-debt-status-filter]"
        )
        .forEach(button => {
            button.classList.toggle(
                "active",
                button.dataset
                    .debtStatusFilter ===
                    selectedStatusFilter
            );
        });
}

function getFilteredDebtEntries() {
    const todayValue =
        toDateInputValue(
            new Date()
        );

    return debtEntries.filter(entry => {
        const direction =
            getDebtDirection(entry);

        const matchesDirection =
            selectedDebtFilter ===
                "all" ||
            direction ===
                selectedDebtFilter;

        const matchesCategory =
            !selectedDebtCategory ||
            String(
                entry.category ||
                "Other"
            ) ===
                selectedDebtCategory;

        if (
            !matchesDirection ||
            !matchesCategory
        ) {
            return false;
        }

        if (
            selectedStatusFilter ===
            "active"
        ) {
            return !entry.paid;
        }

        if (
            selectedStatusFilter ===
            "completed"
        ) {
            return Boolean(entry.paid);
        }

        if (
            selectedStatusFilter ===
            "overdue"
        ) {
            return (
                !entry.paid &&
                entry.dueDate <
                    todayValue
            );
        }

        return true;
    });
}

function renderDebtRecords() {
    const container =
        document.getElementById(
            "debtRecordsList"
        );

    if (!container) {
        return;
    }

    const filtered =
        getFilteredDebtEntries();

    setText(
        "debtRecordHeading",
        getDebtRecordHeading()
    );

    setText(
        "debtRecordCount",
        filtered.length === 1
            ? "1 record"
            : `${filtered.length} records`
    );

    if (!filtered.length) {
        container.innerHTML = `
            <div class="debt-record-empty">
                <i class="bi bi-wallet2"></i>

                <strong>
                    No debt records found
                </strong>

                <span>
                    Try another direction or status filter.
                </span>
            </div>
        `;

        return;
    }

    container.innerHTML =
        filtered
            .map(
                buildDebtRecordCard
            )
            .join("");

    container
        .querySelectorAll(
            "[data-toggle-debt-details]"
        )
        .forEach(button => {
            button.addEventListener(
                "click",
                () => {
                    toggleDebtDetails(
                        button.dataset
                            .toggleDebtDetails
                    );
                }
            );
        });

    container
        .querySelectorAll(
            "[data-toggle-debt-id]"
        )
        .forEach(button => {
            button.addEventListener(
                "click",
                async event => {
                    event.stopPropagation();

                    await toggleDebtStatus(
                        button.dataset
                            .toggleDebtId
                    );
                }
            );
        });
}

function buildDebtRecordCard(entry) {
    const direction =
        getDebtDirection(entry);

    const isReceivable =
        direction === "receivable";

    const todayValue =
        toDateInputValue(
            new Date()
        );

    const isOverdue =
        !entry.paid &&
        entry.dueDate <
            todayValue;

    const statusClass =
        entry.paid
            ? "paid"
            : isOverdue
                ? "overdue"
                : "active";

    const statusText =
        entry.paid
            ? isReceivable
                ? "Collected"
                : "Paid"
            : isOverdue
                ? "Overdue"
                : isReceivable
                    ? "To Collect"
                    : "To Pay";

    const directionText =
        isReceivable
            ? "Owed to You"
            : "You Owe";

    const personLabel =
        isReceivable
            ? "Borrower"
            : "Lender / Payee";

    const dateLabel =
        isReceivable
            ? "Expected date"
            : "Due date";

    const actionText =
        entry.paid
            ? isReceivable
                ? "Mark as Not Collected"
                : "Mark as Unpaid"
            : isReceivable
                ? "Mark as Collected"
                : "Mark as Paid";

    const category =
        String(
            entry.category ||
            "Uncategorized"
        );

    const notes =
        String(
            entry.notes || ""
        ).trim();

    const isExpanded =
        expandedDebtIds.has(
            entry.id
        );

    const detailsId =
        `debt-record-details-${entry.id}`;

    return `
        <article
            class="debt-record-card ${direction} ${
                isExpanded
                    ? "expanded"
                    : ""
            }"
            data-debt-id="${escapeHtml(entry.id)}"
        >
            <button
                class="debt-record-summary"
                type="button"
                data-toggle-debt-details="${escapeHtml(entry.id)}"
                aria-expanded="${
                    isExpanded
                        ? "true"
                        : "false"
                }"
                aria-controls="${escapeHtml(detailsId)}"
            >
                <span class="debt-record-top">
                    <span
                        class="debt-record-icon"
                        aria-hidden="true"
                    >
                        <i class="bi ${
                            isReceivable
                                ? "bi-arrow-down-left"
                                : "bi-arrow-up-right"
                        }"></i>
                    </span>

                    <span class="debt-record-title">
                        <strong>
                            ${escapeHtml(entry.name)}
                        </strong>

                        <small>
                            ${escapeHtml(
                                entry.provider ||
                                "No person specified"
                            )}
                        </small>
                    </span>

                    <span class="debt-record-amount">
                        ${peso(entry.amount)}
                    </span>
                </span>

                <span class="debt-record-tags">
                    <span
                        class="debt-record-tag direction ${direction}"
                    >
                        <i class="bi ${
                            isReceivable
                                ? "bi-arrow-down-left"
                                : "bi-arrow-up-right"
                        }"></i>
                        ${directionText}
                    </span>

                    <span class="debt-record-tag category">
                        <i class="bi bi-tag"></i>
                        ${escapeHtml(category)}
                    </span>

                    <span
                        class="debt-record-tag status ${statusClass}"
                    >
                        ${statusText}
                    </span>
                </span>

                <span class="debt-record-expand-prompt">
                    <span>
                        ${
                            isExpanded
                                ? "Hide details"
                                : "View details"
                        }
                    </span>

                    <i
                        class="bi bi-chevron-down"
                        aria-hidden="true"
                    ></i>
                </span>
            </button>

            <div
                id="${escapeHtml(detailsId)}"
                class="debt-record-expandable"
                ${
                    isExpanded
                        ? ""
                        : "hidden"
                }
            >
                <div class="debt-record-information">
                    <div class="debt-information-row">
                        <i class="bi bi-person"></i>
                        <span>${personLabel}</span>
                        <strong>
                            ${escapeHtml(
                                entry.provider ||
                                "Not provided"
                            )}
                        </strong>
                    </div>

                    <div class="debt-information-row">
                        <i class="bi bi-calendar3"></i>
                        <span>${dateLabel}</span>
                        <strong>
                            ${escapeHtml(
                                formatDate(
                                    entry.dueDate
                                )
                            )}
                        </strong>
                    </div>

                    <div class="debt-information-row">
                        <i class="bi bi-tag"></i>
                        <span>Category</span>
                        <strong>
                            ${escapeHtml(category)}
                        </strong>
                    </div>

                    <div class="debt-information-row">
                        <i class="bi bi-bell"></i>
                        <span>Reminder</span>
                        <strong>
                            ${
                                entry.reminder
                                    ? "Enabled"
                                    : "Disabled"
                            }
                        </strong>
                    </div>

                    <div class="debt-information-row">
                        <i class="bi bi-people"></i>
                        <span>Family visibility</span>
                        <strong>
                            ${
                                entry.shared
                                    ? "Shared"
                                    : "Private"
                            }
                        </strong>
                    </div>
                </div>

                ${
                    notes
                        ? `
                            <div class="debt-record-notes">
                                <span>Notes</span>
                                <p>
                                    ${escapeHtml(notes)}
                                </p>
                            </div>
                        `
                        : ""
                }

                <div class="debt-record-actions">
                    <button
                        class="${
                            entry.paid
                                ? "completed"
                                : ""
                        }"
                        type="button"
                        data-toggle-debt-id="${escapeHtml(entry.id)}"
                    >
                        ${actionText}
                    </button>
                </div>
            </div>
        </article>
    `;
}

function toggleDebtDetails(id) {
    if (
        expandedDebtIds.has(id)
    ) {
        expandedDebtIds.delete(id);
    } else {
        expandedDebtIds.add(id);
    }

    renderDebtRecords();
}

async function toggleDebtStatus(id) {
    const entry =
        debtEntries.find(
            item => item.id === id
        );

    if (!entry) {
        return;
    }

    const direction =
        getDebtDirection(entry);

    const isReceivable =
        direction === "receivable";

    const nextPaidState =
        !entry.paid;

    const confirmation =
        window.confirm(
            `${
                nextPaidState
                    ? isReceivable
                        ? "Mark this debt as collected?"
                        : "Mark this debt as paid?"
                    : isReceivable
                        ? "Mark this debt as not collected?"
                        : "Mark this debt as unpaid?"
            }`
        );

    if (!confirmation) {
        return;
    }

    entry.paid =
        nextPaidState;

    entry.updatedAt =
        new Date().toISOString();

    await putDebtEntry(entry);
    await loadDebtEntries();

    renderDebtDetailsPage();

    showDebtToast(
        entry.paid
            ? isReceivable
                ? "Debt marked as collected."
                : "Debt marked as paid."
            : isReceivable
                ? "Debt marked as not collected."
                : "Debt marked as unpaid."
    );
}

function getDebtRecordHeading() {
    const directionLabel =
        selectedDebtFilter === "payable"
            ? "You Owe"
            : selectedDebtFilter === "receivable"
                ? "Owed to You"
                : "All Debts";

    if (
        selectedStatusFilter === "all"
    ) {
        return directionLabel;
    }

    const statusLabel =
        selectedStatusFilter === "active"
            ? "Active"
            : selectedStatusFilter === "overdue"
                ? "Overdue"
                : "Completed";

    if (
        selectedDebtFilter === "all"
    ) {
        return `${statusLabel} Debts`;
    }

    return `${statusLabel} · ${directionLabel}`;
}

function getDebtDirection(entry) {
    return (
        entry?.debtDirection ===
        "receivable"
            ? "receivable"
            : "payable"
    );
}

function sumDebtAmounts(list) {
    return list.reduce(
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
}

function formatActiveDebtCount(count) {
    return (
        `${count} ` +
        `${
            count === 1
                ? "active debt"
                : "active debts"
        }`
    );
}

function parseLocalDate(value) {
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

function formatDate(value) {
    const date =
        parseLocalDate(value);

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

function toDateInputValue(date) {
    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");

    return (
        `${year}-` +
        `${month}-` +
        `${day}`
    );
}

function peso(value) {
    return (
        "₱" +
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

function setText(id, value) {
    const element =
        document.getElementById(id);

    if (element) {
        element.textContent = value;
    }
}

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function showDebtToast(message) {
    const toast =
        document.getElementById(
            "debtDetailsToast"
        );

    if (!toast) {
        return;
    }

    toast.textContent = message;
    toast.classList.add("show");

    window.clearTimeout(
        showDebtToast.timer
    );

    showDebtToast.timer =
        window.setTimeout(
            () => {
                toast.classList.remove(
                    "show"
                );
            },
            3000
        );
}