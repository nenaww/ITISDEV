/* =========================================================
   KABALIKAT Bills & Debt
   - Local persistence through IndexedDB
   - Reads the signed-in user and family from the auth database
   - Opens the Android Calendar app through a native bridge
   - Schedules Android notification reminders through WorkManager
   - Provides an in-app calendar for paid and unpaid due dates
   ========================================================= */

const AUTH_DB_NAME = "kabalikat_auth_language_db";
const BILLS_DB_NAME = "kabalikat_bills_db";
const BILLS_DB_VERSION = 1;

let authDb = null;
let billsDb = null;
let currentUser = null;
let currentFamily = null;
let entries = [];

let selectedTypeFilter = "all";
let selectedEntryType = "bill";
let selectedFrequency = "monthly";
let selectedDebtDirection = "payable";
let showAllPayments = false;
let selectedCompletedFilter = "all";

let calendarViewDate = new Date();
let calendarSelectedDate = toDateInputValue(new Date());
let calendarPickerContext = "calendar";

const BILL_CATEGORIES = [
    "Electricity",
    "Water",
    "Internet",
    "Housing",
    "Subscription",
    "Credit Card",
    "Education",
    "Health",
    "Utilities",
    "Other"
];

const DEBT_CATEGORIES = [
    "Loan",
    "Credit Card",
    "Personal",
    "Education",
    "Health",
    "Housing",
    "Other"
];


const CUSTOM_BILL_VALUE =
    "__custom_bill__";

const CUSTOM_PROVIDER_VALUE =
    "__custom_provider__";

const BILL_PRESETS = {
    "Electric Bill": {
        category: "Electricity",
        providerMode: "select",
        providers: [
            "Meralco",
            "Visayan Electric",
            "Davao Light",
            "MORE Power"
        ],
        customProviderLabel:
            "Other Electric Utility / Cooperative",
        customProviderFieldLabel:
            "Electric Utility / Cooperative",
        customProviderPlaceholder:
            "Enter electric utility or cooperative"
    },

    "Water Bill": {
        category: "Water",
        providerMode: "select",
        providers: [
            "Manila Water",
            "Maynilad Water Services",
            "PrimeWater"
        ],
        customProviderLabel:
            "Other Water District / Concessionaire",
        customProviderFieldLabel:
            "Water District / Concessionaire",
        customProviderPlaceholder:
            "Enter water district or concessionaire"
    },

    "Internet Bill": {
        category: "Internet",
        providerMode: "select",
        providers: [
            "PLDT Home",
            "Globe At Home",
            "Converge ICT",
            "DITO Home WoWFi"
        ],
        customProviderLabel:
            "Other Internet Provider",
        customProviderFieldLabel:
            "Internet Service Provider",
        customProviderPlaceholder:
            "Enter internet provider"
    },

    "Mobile Plan": {
        category: "Subscription",
        providerMode: "select",
        providers: [
            "Globe Postpaid",
            "Smart Postpaid",
            "DITO Postpaid"
        ],
        customProviderLabel:
            "Other Mobile Provider",
        customProviderFieldLabel:
            "Mobile Service Provider",
        customProviderPlaceholder:
            "Enter mobile provider"
    },

    "House Rent": {
        category: "Housing",
        providerMode: "text",
        providerLabel:
            "Landlord / Property Manager",
        providerPlaceholder:
            "Enter landlord or property manager"
    },

    "Subscription": {
        category: "Subscription",
        providerMode: "select",
        providers: [
            "Netflix",
            "Spotify",
            "YouTube Premium",
            "Disney+"
        ],
        customProviderLabel:
            "Other Subscription Provider",
        customProviderFieldLabel:
            "Subscription Provider",
        customProviderPlaceholder:
            "Enter subscription provider"
    },

    "Credit Card Bill": {
        category: "Credit Card",
        providerMode: "select",
        providers: [
            "BDO",
            "BPI",
            "Metrobank",
            "PNB",
            "RCBC",
            "UnionBank",
            "Security Bank",
            "EastWest Bank"
        ],
        customProviderLabel:
            "Other Philippine Bank / Card Issuer",
        customProviderFieldLabel:
            "Philippine Bank / Card Issuer",
        customProviderPlaceholder:
            "Enter Philippine bank or card issuer"
    },

    "Tuition / School Fees": {
        category: "Education",
        providerMode: "text",
        providerLabel:
            "School / University",
        providerPlaceholder:
            "Enter school or university"
    },

    "Health / Insurance": {
        category: "Health",
        providerMode: "select",
        providers: [
            "PhilHealth",
            "Maxicare",
            "MediCard",
            "Intellicare"
        ],
        customProviderLabel:
            "Other HMO / Insurer / Medical Provider",
        customProviderFieldLabel:
            "HMO / Insurer / Medical Provider",
        customProviderPlaceholder:
            "Enter HMO, insurer, hospital, or clinic"
    }
};

const PAYMENT_VISUALS = {
    electric: {
        icon: "bi-lightning-charge-fill",
        soft: "#FFF1C9",
        accent: "#D89B15"
    },

    water: {
        icon: "bi-droplet-fill",
        soft: "#EAF3F8",
        accent: "#4E8EB5"
    },

    internet: {
        icon: "bi-router-fill",
        soft: "#EAF3F8",
        accent: "#4F7F99"
    },

    mobile: {
        icon: "bi-broadcast-pin",
        soft: "#EEF6F0",
        accent: "#4F916B"
    },

    housing: {
        icon: "bi-house-door-fill",
        soft: "#FFF1E8",
        accent: "#C96E4B"
    },

    debtPayable: {
        icon: "bi-arrow-up-right-circle-fill",
        soft: "#FFF1E8",
        accent: "#C96E4B"
    },

    debtReceivable: {
        icon: "bi-arrow-down-left-circle-fill",
        soft: "#EEF6F0",
        accent: "#4F916B"
    },

    health: {
        icon: "bi-heart-pulse-fill",
        soft: "#EEF6F0",
        accent: "#5C8F6C"
    },

    education: {
        icon: "bi-mortarboard-fill",
        soft: "#FFF5D8",
        accent: "#A77E20"
    },

    subscription: {
        icon: "bi-arrow-repeat",
        soft: "#F1EDFF",
        accent: "#8057D8"
    },

    default: {
        icon: "bi-receipt-cutoff",
        soft: "#FFF1E8",
        accent: "#C96E4B"
    }
};

const DEMO_ENTRIES = [
    {
        id: "demo-electric",
        familyCode: "KABA-4821",
        type: "bill",
        name: "Electric Bill",
        provider: "Meralco",
        amount: 1420,
        dueDate: "2026-07-18",
        category: "Electricity",
        frequency: "monthly",
        reminder: true,
        shared: true,
        notes: "Monthly household electricity bill.",
        paid: false,
        createdBy: "sample-head",
        createdAt: "2026-07-01T08:00:00.000Z"
    },
    {
        id: "demo-water",
        familyCode: "KABA-4821",
        type: "bill",
        name: "Water Bill",
        provider: "Manila Water",
        amount: 650,
        dueDate: "2026-07-22",
        category: "Water",
        frequency: "monthly",
        reminder: true,
        shared: true,
        notes: "",
        paid: false,
        createdBy: "sample-head",
        createdAt: "2026-07-01T08:00:00.000Z"
    },
    {
        id: "demo-maria",
        familyCode: "KABA-4821",
        type: "debt",
        debtDirection: "payable",
        name: "Loan from Maria",
        provider: "Maria Santos",
        amount: 1000,
        dueDate: "2026-07-24",
        category: "Loan",
        frequency: "one-time",
        reminder: true,
        shared: false,
        notes: "Personal debt payment.",
        paid: false,
        createdBy: "sample-head",
        createdAt: "2026-07-01T08:00:00.000Z"
    },
    {
        id: "demo-internet",
        familyCode: "KABA-4821",
        type: "bill",
        name: "Internet Bill",
        provider: "PLDT Home",
        amount: 750,
        dueDate: "2026-07-25",
        category: "Internet",
        frequency: "monthly",
        reminder: true,
        shared: true,
        notes: "",
        paid: false,
        createdBy: "sample-head",
        createdAt: "2026-07-01T08:00:00.000Z"
    },
    {
        id: "demo-rent",
        completedAt: "2026-07-05T08:00:00.000Z",
        familyCode: "KABA-4821",
        type: "bill",
        name: "House Rent",
        provider: "Landlord",
        amount: 1200,
        dueDate: "2026-07-05",
        category: "Housing",
        frequency: "monthly",
        reminder: true,
        shared: true,
        notes: "",
        paid: true,
        createdBy: "sample-head",
        createdAt: "2026-07-01T08:00:00.000Z"
    },
    {
        id: "demo-phone",
        completedAt: "2026-07-10T08:00:00.000Z",
        familyCode: "KABA-4821",
        type: "bill",
        name: "Mobile Plan",
        provider: "Globe",
        amount: 500,
        dueDate: "2026-07-10",
        category: "Subscription",
        frequency: "monthly",
        reminder: true,
        shared: false,
        notes: "",
        paid: true,
        createdBy: "sample-head",
        createdAt: "2026-07-01T08:00:00.000Z"
    }
];

document.addEventListener(
    "DOMContentLoaded",
    initializeBillsPage
);

/* =========================================================
   Initialization and events
   ========================================================= */

async function initializeBillsPage() {
    try {
        bindEvents();
        setDefaultFormValues();
        initializePeriodControls();
        updateEntryTypeUI();

        authDb = await openAuthDatabase();
        await loadCurrentUserContext();

        billsDb = await openBillsDatabase();

        await loadEntries();
        await seedDemoEntriesIfNeeded();
        await loadEntries();
        await normalizeExistingBillCategories();
        await loadEntries();

        renderAll();
        updateCalendarConnectionNote();
    } catch (error) {
        console.error(
            "Bills page initialization failed:",
            error
        );

        showToast(
            "The Bills page could not be fully initialized."
        );
    }
}

function bindEvents() {
    document
        .getElementById("openAddEntry")
        ?.addEventListener(
            "click",
            () => openAddPanel("bill")
        );

    document
        .getElementById("closeAddPanelTop")
        ?.addEventListener(
            "click",
            closeAddPanel
        );

    document
        .getElementById("saveEntryTop")
        ?.addEventListener(
            "click",
            () => {
                document
                    .getElementById("billDebtForm")
                    ?.requestSubmit();
            }
        );

    document
        .getElementById("cancelAddEntry")
        ?.addEventListener(
            "click",
            closeAddPanel
        );

    document
        .querySelectorAll("[data-entry-type]")
        .forEach(button => {
            button.addEventListener("click", () => {
                const nextType =
                    button.dataset.entryType;

                if (
                    nextType ===
                    selectedEntryType
                ) {
                    return;
                }

                selectedEntryType =
                    nextType;

                selectedFrequency =
                    nextType === "debt"
                        ? "one-time"
                        : "monthly";

                selectedDebtDirection =
                    "payable";

                resetForm();
                updateEntryTypeUI();
            });
        });

    document
        .getElementById(
            "entryBillName"
        )
        ?.addEventListener(
            "change",
            () => {
                updateBillProviderOptions(
                    false
                );
            }
        );

    document
        .getElementById(
            "entryBillProvider"
        )
        ?.addEventListener(
            "change",
            updateCustomBillFields
        );

    document
        .querySelectorAll("[data-frequency]")
        .forEach(button => {
            button.addEventListener("click", () => {
                selectedFrequency =
                    button.dataset.frequency;

                updateFrequencyUI();
            });
        });

    document
        .querySelectorAll("[data-debt-direction]")
        .forEach(button => {
            button.addEventListener("click", () => {
                selectedDebtDirection =
                    button.dataset.debtDirection ===
                    "receivable"
                        ? "receivable"
                        : "payable";

                updateDebtDirectionUI();
                updateEntryTypeUI();
            });
        });

    document
        .querySelectorAll("[data-type-filter]")
        .forEach(button => {
            button.addEventListener("click", () => {
                selectedTypeFilter =
                    button.dataset.typeFilter;

                showAllPayments = false;

                renderTypeFilter();
                renderPayments();
            });
        });

    document
        .getElementById("periodValueSelect")
        ?.addEventListener("change", () => {
            updateBillsPeriodPicker();

            showAllPayments = false;
            renderAll();
        });

    document
        .getElementById("openBillsPeriodPicker")
        ?.addEventListener("click", () => {
            openCalendarMonthYearPicker(
                "main"
            );
        });

    document
        .getElementById("viewAllPayments")
        ?.addEventListener("click", () => {
            showAllPayments = !showAllPayments;
            renderPayments();
        });

    document
        .getElementById("viewDebtDetails")
        ?.addEventListener(
            "click",
            () => navigateTo(
                "debt-details.html"
            )
        );

    document
        .getElementById("viewBillsDetails")
        ?.addEventListener(
            "click",
            () => navigateTo(
                `bills-details.html?month=${encodeURIComponent(
                    getPeriodValue()
                )}`
            )
        );

    document
        .getElementById("openCompletedPayments")
        ?.addEventListener(
            "click",
            openCompletedPayments
        );

    document
        .getElementById("closeCompletedPayments")
        ?.addEventListener(
            "click",
            closeCompletedPayments
        );

    document
        .getElementById("openCompletedPeriodPicker")
        ?.addEventListener(
            "click",
            () => {
                openCalendarMonthYearPicker(
                    "completed"
                );
            }
        );

    document
        .querySelectorAll(
            "[data-completed-filter]"
        )
        .forEach(button => {
            button.addEventListener(
                "click",
                () => {
                    selectedCompletedFilter =
                        button.dataset
                            .completedFilter;

                    renderCompletedPayments();
                }
            );
        });

    document
        .getElementById("billDebtForm")
        ?.addEventListener(
            "submit",
            saveEntry
        );

    const dueDateInput =
        document.getElementById(
            "entryDueDate"
        );

    dueDateInput?.addEventListener(
        "input",
        updateDateInputDisplay
    );

    dueDateInput?.addEventListener(
        "change",
        updateDateInputDisplay
    );

    document
        .getElementById("openBillsCalendar")
        ?.addEventListener(
            "click",
            openBillsCalendar
        );

    document
        .getElementById("closeBillsCalendar")
        ?.addEventListener(
            "click",
            closeBillsCalendar
        );

    document
        .getElementById("calendarPreviousMonth")
        ?.addEventListener(
            "click",
            () => changeCalendarMonth(-1)
        );

    document
        .getElementById("calendarNextMonth")
        ?.addEventListener(
            "click",
            () => changeCalendarMonth(1)
        );

    document
        .getElementById("calendarTodayButton")
        ?.addEventListener(
            "click",
            goToCalendarToday
        );

    document
        .getElementById("openCalendarMonthYearPicker")
        ?.addEventListener("click", () => {
            openCalendarMonthYearPicker(
                "calendar"
            );
        });

    document
        .getElementById("closeCalendarMonthYearPicker")
        ?.addEventListener(
            "click",
            closeCalendarMonthYearPicker
        );

    document
        .getElementById("cancelCalendarMonthYearPicker")
        ?.addEventListener(
            "click",
            closeCalendarMonthYearPicker
        );

    document
        .getElementById("calendarPickerBackdrop")
        ?.addEventListener(
            "click",
            closeCalendarMonthYearPicker
        );

    document
        .getElementById("applyCalendarMonthYearPicker")
        ?.addEventListener(
            "click",
            applyCalendarMonthYearPicker
        );

    document
        .getElementById("navHome")
        ?.addEventListener(
            "click",
            () => navigateTo("home.html")
        );

    document
        .getElementById("navExpenses")
        ?.addEventListener(
            "click",
            () => navigateTo("expenses.html")
        );

    document
        .getElementById("navScan")
        ?.addEventListener(
            "click",
            () => navigateTo("scanner.html")
        );

    document
        .getElementById("navSavings")
        ?.addEventListener(
            "click",
            () => navigateTo("expenses.html#budget-overview")
        );

    document
        .querySelectorAll("[data-panel-nav]")
        .forEach(button => {
            button.addEventListener("click", () => {
                const destination =
                    button.dataset.panelNav;

                if (destination === "home") {
                    navigateTo("home.html");
                }

                if (destination === "expenses") {
                    navigateTo("expenses.html");
                }

                if (destination === "scan") {
                    navigateTo("scanner.html");
                }

                if (destination === "savings") {
                    navigateTo("expenses.html#budget-overview");
                }
            });
        });
}

function navigateTo(page) {
    window.location.href = page;
}

/* =========================================================
   Authentication database
   ========================================================= */

function openAuthDatabase() {
    return new Promise((resolve, reject) => {
        const request =
            indexedDB.open(AUTH_DB_NAME);

        request.onupgradeneeded = event => {
            const database =
                event.target.result;

            if (
                !database.objectStoreNames.contains(
                    "users"
                )
            ) {
                const users =
                    database.createObjectStore(
                        "users",
                        {
                            keyPath: "id"
                        }
                    );

                users.createIndex(
                    "email",
                    "email",
                    {
                        unique: true
                    }
                );

                users.createIndex(
                    "familyCode",
                    "familyCode",
                    {
                        unique: false
                    }
                );
            }

            if (
                !database.objectStoreNames.contains(
                    "families"
                )
            ) {
                database.createObjectStore(
                    "families",
                    {
                        keyPath: "familyCode"
                    }
                );
            }

            if (
                !database.objectStoreNames.contains(
                    "sessions"
                )
            ) {
                database.createObjectStore(
                    "sessions",
                    {
                        keyPath: "id"
                    }
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

async function loadCurrentUserContext() {
    const session =
        await getRecordFromDatabase(
            authDb,
            "sessions",
            "current"
        );

    if (session?.userId) {
        currentUser =
            await getRecordFromDatabase(
                authDb,
                "users",
                session.userId
            );
    }

    if (!currentUser) {
        currentUser = {
            id: "sample-head",
            name: "Elena Dela Cruz",
            email: "elena@test.com",
            role: "Household Head",
            familyCode: "KABA-4821"
        };
    }

    currentFamily =
        await getRecordFromDatabase(
            authDb,
            "families",
            currentUser.familyCode
        );

    if (!currentFamily) {
        currentFamily = {
            familyCode:
                currentUser.familyCode ||
                "KABA-4821",

            familyName:
                "Dela Cruz Family",

            monthlyBudget:
                25000
        };
    }

}

function getRecordFromDatabase(
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

        const transaction =
            database.transaction(
                storeName,
                "readonly"
            );

        const objectStore =
            transaction.objectStore(storeName);

        const request =
            objectStore.get(key);

        request.onsuccess = () => {
            resolve(request.result || null);
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
}

function getRecordsByIndex(
    database,
    storeName,
    indexName,
    value
) {
    return new Promise((resolve, reject) => {
        if (
            !database.objectStoreNames.contains(
                storeName
            )
        ) {
            resolve([]);
            return;
        }

        const transaction =
            database.transaction(
                storeName,
                "readonly"
            );

        const objectStore =
            transaction.objectStore(storeName);

        if (
            !objectStore.indexNames.contains(
                indexName
            )
        ) {
            resolve([]);
            return;
        }

        const request =
            objectStore
                .index(indexName)
                .getAll(value);

        request.onsuccess = () => {
            resolve(request.result || []);
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
}

/* =========================================================
   Bills database
   ========================================================= */

function openBillsDatabase() {
    return new Promise((resolve, reject) => {
        const request =
            indexedDB.open(
                BILLS_DB_NAME,
                BILLS_DB_VERSION
            );

        request.onupgradeneeded = event => {
            const database =
                event.target.result;

            if (
                !database.objectStoreNames.contains(
                    "entries"
                )
            ) {
                const store =
                    database.createObjectStore(
                        "entries",
                        {
                            keyPath: "id"
                        }
                    );

                store.createIndex(
                    "familyCode",
                    "familyCode",
                    {
                        unique: false
                    }
                );

                store.createIndex(
                    "dueDate",
                    "dueDate",
                    {
                        unique: false
                    }
                );

                store.createIndex(
                    "type",
                    "type",
                    {
                        unique: false
                    }
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

function billsStore(mode = "readonly") {
    return billsDb
        .transaction("entries", mode)
        .objectStore("entries");
}

function putEntry(entry) {
    return new Promise((resolve, reject) => {
        const request =
            billsStore("readwrite")
                .put(entry);

        request.onsuccess = () => {
            resolve(entry);
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
}

function deleteEntry(id) {
    return new Promise((resolve, reject) => {
        const request =
            billsStore("readwrite")
                .delete(id);

        request.onsuccess = () => {
            resolve();
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
}

function getEntriesForFamily(familyCode) {
    return new Promise((resolve, reject) => {
        const request =
            billsStore()
                .index("familyCode")
                .getAll(familyCode);

        request.onsuccess = () => {
            resolve(request.result || []);
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
}

async function loadEntries() {
    entries =
        await getEntriesForFamily(
            currentFamily.familyCode
        );
}

async function normalizeExistingBillCategories() {
    const updates = [];

    entries.forEach(entry => {
        if (
            entry.type !== "bill" ||
            entry.category !== "Utilities"
        ) {
            return;
        }

        const search =
            `${entry.name || ""} ` +
            `${entry.provider || ""}`;

        const normalized =
            search.toLowerCase();

        let nextCategory = null;

        if (
            normalized.includes(
                "electric"
            ) ||
            normalized.includes(
                "meralco"
            )
        ) {
            nextCategory =
                "Electricity";
        } else if (
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
            nextCategory =
                "Water";
        }

        if (!nextCategory) {
            return;
        }

        entry.category =
            nextCategory;

        entry.updatedAt =
            new Date().toISOString();

        updates.push(
            putEntry(entry)
        );
    });

    if (updates.length) {
        await Promise.all(updates);
    }
}

async function seedDemoEntriesIfNeeded() {
    if (
        currentFamily.familyCode !==
            "KABA-4821" ||
        entries.length > 0
    ) {
        return;
    }

    for (const entry of DEMO_ENTRIES) {
        await putEntry(entry);
    }
}

/* =========================================================
   Period filters
   ========================================================= */

function initializePeriodControls() {
    populatePeriodValueOptions();
    updateBillsPeriodPicker();
}

function populatePeriodValueOptions() {
    const select =
        document.getElementById(
            "periodValueSelect"
        );

    if (!select) {
        return;
    }

    const now = new Date();

    const requestedValue =
        new URLSearchParams(
            window.location.search
        ).get("month");

    const validRequestedValue =
        /^\d{4}-\d{2}$/.test(
            requestedValue || ""
        )
            ? requestedValue
            : null;

    const options = [];
    const includedValues = new Set();

    for (
        let offset = -12;
        offset <= 12;
        offset += 1
    ) {
        const date = new Date(
            now.getFullYear(),
            now.getMonth() + offset,
            1
        );

        const value =
            `${date.getFullYear()}-` +
            `${String(
                date.getMonth() + 1
            ).padStart(2, "0")}`;

        includedValues.add(value);
        options.push({ value, date });
    }

    if (
        validRequestedValue &&
        !includedValues.has(
            validRequestedValue
        )
    ) {
        const [year, month] =
            validRequestedValue
                .split("-")
                .map(Number);

        options.push({
            value: validRequestedValue,
            date: new Date(
                year,
                month - 1,
                1
            )
        });
    }

    options.sort(
        (first, second) =>
            first.date -
            second.date
    );

    select.innerHTML = "";

    const currentValue =
        `${now.getFullYear()}-` +
        `${String(
            now.getMonth() + 1
        ).padStart(2, "0")}`;

    options.forEach(({ value, date }) => {
        const option =
            document.createElement(
                "option"
            );

        option.value = value;

        option.textContent =
            date.toLocaleDateString(
                "en-PH",
                {
                    month: "long",
                    year: "numeric"
                }
            );

        option.selected =
            validRequestedValue
                ? value ===
                    validRequestedValue
                : value ===
                    currentValue;

        select.appendChild(option);
    });

    updateBillsPeriodPicker();
}

function updateBillsPeriodPicker() {
    const button =
        document.getElementById(
            "openBillsPeriodPicker"
        );

    const label =
        document.getElementById(
            "billsPeriodPickerLabel"
        );

    const select =
        document.getElementById(
            "periodValueSelect"
        );

    if (!button || !label || !select) {
        return;
    }

    const selectedOption =
        select.options[
            select.selectedIndex
        ];

    label.textContent =
        selectedOption?.textContent ||
        new Date().toLocaleDateString(
            "en-PH",
            {
                month: "long",
                year: "numeric"
            }
        );

    button.disabled = false;

    button.setAttribute(
        "aria-label",
        `Select month and year. Currently ${label.textContent}`
    );
}

function getPeriodValue() {
    const selectedValue =
        document.getElementById(
            "periodValueSelect"
        )?.value;

    if (
        selectedValue &&
        /^\d{4}-\d{2}$/.test(
            selectedValue
        )
    ) {
        return selectedValue;
    }

    const today = new Date();

    return (
        `${today.getFullYear()}-` +
        `${String(
            today.getMonth() + 1
        ).padStart(2, "0")}`
    );
}

function entryMatchesPeriod(entry) {
    const dueDate =
        parseLocalDate(entry.dueDate);

    if (
        Number.isNaN(
            dueDate.getTime()
        )
    ) {
        return false;
    }

    const value =
        getPeriodValue();

    const [year, month] =
        value
            .split("-")
            .map(Number);

    return (
        dueDate.getFullYear() === year &&
        dueDate.getMonth() ===
            month - 1
    );
}

function getPeriodEntries() {
    return entries.filter(
        entryMatchesPeriod
    );
}

function getFilteredEntries() {
    const todayValue =
        toDateInputValue(
            new Date()
        );

    return getPeriodEntries()
        .filter(entry => {
            const requiresPayment =
                !entry.paid &&
                (
                    entry.type === "bill" ||
                    (
                        entry.type === "debt" &&
                        getDebtDirection(entry) ===
                            "payable"
                    )
                );

            const matchesType =
                selectedTypeFilter === "all" ||
                entry.type ===
                    selectedTypeFilter;

            return (
                requiresPayment &&
                matchesType
            );
        })
        .sort((first, second) => {
            const firstOverdue =
                first.dueDate <
                todayValue;

            const secondOverdue =
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
                parseLocalDate(
                    first.dueDate
                ) -
                parseLocalDate(
                    second.dueDate
                )
            );
        });
}

/* =========================================================
   Main page rendering
   ========================================================= */

function renderAll() {
    renderTypeFilter();
    renderSummary();
    renderPayments();
    renderBillsOverview();
    renderDebtOverview();

    const completedPanel =
        document.getElementById(
            "completedPaymentsPanel"
        );

    if (
        completedPanel &&
        !completedPanel.hidden
    ) {
        renderCompletedPayments();
    }

    const calendarPanel =
        document.getElementById(
            "billsCalendarPanel"
        );

    if (
        calendarPanel &&
        !calendarPanel.hidden
    ) {
        renderBillsCalendar();
    }
}

function renderTypeFilter() {
    document
        .querySelectorAll(
            "[data-type-filter]"
        )
        .forEach(button => {
            button.classList.toggle(
                "active",
                button.dataset.typeFilter ===
                    selectedTypeFilter
            );
        });
}

function renderSummary() {
    const outgoingEntries =
        getPeriodEntries().filter(entry => {
            return (
                entry.type === "bill" ||
                (
                    entry.type === "debt" &&
                    getDebtDirection(entry) ===
                        "payable"
                )
            );
        });

    const unpaid =
        outgoingEntries.filter(
            entry => !entry.paid
        );

    const billsDue =
        unpaid
            .filter(
                entry =>
                    entry.type === "bill"
            )
            .reduce(
                (sum, entry) =>
                    sum +
                    Number(
                        entry.amount || 0
                    ),
                0
            );

    const debtDue =
        unpaid
            .filter(
                entry =>
                    entry.type === "debt"
            )
            .reduce(
                (sum, entry) =>
                    sum +
                    Number(
                        entry.amount || 0
                    ),
                0
            );

    const paidCount =
        outgoingEntries.filter(
            entry => entry.paid
        ).length;

    const totalCount =
        outgoingEntries.length;

    const paidPercent =
        totalCount > 0
            ? Math.round(
                (
                    paidCount /
                    totalCount
                ) * 100
            )
            : 0;

    setText(
        "totalDueAmount",
        peso(billsDue + debtDue)
    );

    setText(
        "billsDueAmount",
        peso(billsDue)
    );

    setText(
        "debtDueAmount",
        peso(debtDue)
    );

    setText(
        "paidCountText",
        `${paidCount} of ${totalCount}`
    );

    const progress =
        document.getElementById(
            "paidProgressFill"
        );

    if (progress) {
        progress.style.width =
            `${paidPercent}%`;
    }
}

function renderPayments() {
    const container =
        document.getElementById(
            "paymentsList"
        );

    const viewAllButton =
        document.getElementById(
            "viewAllPayments"
        );

    if (!container) {
        return;
    }

    const filteredEntries =
        getFilteredEntries();

    const todayValue =
        toDateInputValue(
            new Date()
        );

    const visible =
        showAllPayments
            ? filteredEntries
            : filteredEntries.slice(
                0,
                4
            );

    if (viewAllButton) {
        viewAllButton.textContent =
            showAllPayments
                ? "Show Less"
                : "View All";

        viewAllButton.hidden =
            filteredEntries.length <= 4;
    }

    if (!visible.length) {
        container.innerHTML = `
            <div class="empty-payments">
                <i class="bi bi-calendar2-check"></i>

                <strong>
                    No unpaid payments
                </strong>

                <span>
                    You have no unpaid bills or payable debts for this period.
                </span>
            </div>
        `;

        return;
    }

    container.innerHTML =
        visible
            .map(entry => {
                const visual =
                    getPaymentVisual(
                        entry
                    );

                const isDebt =
                    entry.type ===
                    "debt";

                const isOverdue =
                    entry.dueDate <
                    todayValue;

                const statusClass =
                    isOverdue
                        ? "overdue"
                        : isDebt
                            ? "debt"
                            : "";

                const statusLabel =
                    isOverdue
                        ? "Past Due"
                        : isDebt
                            ? "To Pay"
                            : "Bill";

                return `
                    <button
                        class="payment-row ${isOverdue ? "overdue" : ""}"
                        type="button"
                        data-entry-id="${escapeHtml(entry.id)}"
                    >
                        <span
                            class="payment-icon"
                            style="
                                --payment-soft:${escapeHtml(visual.soft)};
                                --payment-accent:${escapeHtml(visual.accent)}
                            "
                        >
                            <i class="bi ${escapeHtml(visual.icon)}"></i>
                        </span>

                        <span class="payment-main">
                            <h3>
                                ${escapeHtml(entry.name)}
                            </h3>

                            <span>
                                ${escapeHtml(
                                    entry.provider ||
                                    entry.category ||
                                    "Payment"
                                )}
                            </span>

                            <small class="payment-due-date">
                                <i class="bi bi-calendar3"></i>

                                Due
                                ${escapeHtml(
                                    formatDate(
                                        entry.dueDate
                                    )
                                )}
                            </small>

                        </span>

                        <span class="payment-value">
                            <strong>
                                ${peso(entry.amount)}
                            </strong>

                            <small
                                class="payment-type-chip ${statusClass}"
                            >
                                ${escapeHtml(statusLabel)}
                            </small>
                        </span>

                        <i class="bi bi-chevron-right payment-chevron"></i>
                    </button>
                `;
            })
            .join("");

    container
        .querySelectorAll(
            "[data-entry-id]"
        )
        .forEach(button => {
            button.addEventListener(
                "click",
                () => {
                    handleEntryClick(
                        button.dataset.entryId
                    );
                }
            );
        });
}

function renderBillsOverview() {
    const todayValue =
        toDateInputValue(
            new Date()
        );

    const bills =
        getPeriodEntries().filter(
            entry =>
                entry.type === "bill"
        );

    const remainingBills =
        bills.filter(
            entry => !entry.paid
        );

    const paidBills =
        bills.filter(
            entry => entry.paid
        );

    const remainingAmount =
        remainingBills.reduce(
            (sum, entry) =>
                sum +
                Number(
                    entry.amount || 0
                ),
            0
        );

    const paidAmount =
        paidBills.reduce(
            (sum, entry) =>
                sum +
                Number(
                    entry.amount || 0
                ),
            0
        );

    const overdueCount =
        remainingBills.filter(
            entry =>
                entry.dueDate <
                todayValue
        ).length;

    setText(
        "remainingBillsAmount",
        peso(remainingAmount)
    );

    setText(
        "paidBillsAmount",
        peso(paidAmount)
    );

    setText(
        "remainingBillsCount",
        String(remainingBills.length)
    );

    setText(
        "paidBillsCount",
        String(paidBills.length)
    );

    setText(
        "remainingBillsCountLabel",
        remainingBills.length === 1
            ? "bill remaining"
            : "bills remaining"
    );

    setText(
        "paidBillsCountLabel",
        paidBills.length === 1
            ? "bill paid"
            : "bills paid"
    );

    const notice =
        document.getElementById(
            "billsOverdueNotice"
        );

    if (notice) {
        notice.hidden =
            overdueCount === 0;
    }

    setText(
        "billsOverdueText",
        overdueCount === 1
            ? "1 overdue bill needs immediate attention"
            : `${overdueCount} overdue bills need immediate attention`
    );
}

function renderDebtOverview() {
    const todayValue =
        toDateInputValue(
            new Date()
        );

    const activeDebts =
        getPeriodEntries().filter(entry => {
            return (
                entry.type === "debt" &&
                !entry.paid
            );
        });

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

    const youOweAmount =
        payableDebts.reduce(
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

    const owedToYouAmount =
        receivableDebts.reduce(
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

    const overdueCount =
        activeDebts.filter(entry => {
            return (
                entry.dueDate <
                todayValue
            );
        }).length;

    setText(
        "youOweAmount",
        peso(youOweAmount)
    );

    setText(
        "owedToYouAmount",
        peso(owedToYouAmount)
    );

    setText(
        "youOweCount",
        String(payableDebts.length)
    );

    setText(
        "owedToYouCount",
        String(receivableDebts.length)
    );

    setText(
        "youOweCountLabel",
        payableDebts.length === 1
            ? "active debt"
            : "active debts"
    );

    setText(
        "owedToYouCountLabel",
        receivableDebts.length === 1
            ? "active debt"
            : "active debts"
    );

    const overdueNotice =
        document.getElementById(
            "debtOverdueNotice"
        );

    const overdueText =
        document.getElementById(
            "debtOverdueText"
        );

    if (overdueNotice) {
        overdueNotice.hidden =
            overdueCount === 0;
    }

    if (overdueText) {
        overdueText.textContent =
            overdueCount === 1
                ? "1 overdue debt needs attention"
                : `${overdueCount} overdue debts need attention`;
    }
}

function getDebtDirection(entry) {
    return (
        entry?.debtDirection ===
        "receivable"
            ? "receivable"
            : "payable"
    );
}

function getPaymentVisual(entry) {
    const search =
        `${entry.name} ` +
        `${entry.provider} ` +
        `${entry.category}`;

    const normalized =
        search.toLowerCase();

    if (entry.type === "debt") {
        return (
            getDebtDirection(entry) ===
            "receivable"
                ? PAYMENT_VISUALS.debtReceivable
                : PAYMENT_VISUALS.debtPayable
        );
    }

    if (
        normalized.includes(
            "electric"
        )
    ) {
        return PAYMENT_VISUALS.electric;
    }

    if (
        normalized.includes(
            "water"
        )
    ) {
        return PAYMENT_VISUALS.water;
    }

    if (
        normalized.includes("mobile") ||
        normalized.includes("cellular") ||
        normalized.includes("phone plan") ||
        normalized.includes("globe") ||
        normalized.includes("smart") ||
        normalized.includes("dito")
    ) {
        return PAYMENT_VISUALS.mobile;
    }

    if (
        normalized.includes("internet") ||
        normalized.includes("wifi") ||
        normalized.includes("router") ||
        normalized.includes("broadband") ||
        normalized.includes("fiber") ||
        normalized.includes("pldt") ||
        normalized.includes("converge")
    ) {
        return PAYMENT_VISUALS.internet;
    }

    if (
        normalized.includes(
            "rent"
        ) ||
        normalized.includes(
            "housing"
        )
    ) {
        return PAYMENT_VISUALS.housing;
    }

    if (
        normalized.includes(
            "health"
        ) ||
        normalized.includes(
            "medicine"
        )
    ) {
        return PAYMENT_VISUALS.health;
    }

    if (
        normalized.includes(
            "school"
        ) ||
        normalized.includes(
            "education"
        )
    ) {
        return PAYMENT_VISUALS.education;
    }

    if (
        normalized.includes("subscription") ||
        normalized.includes("membership") ||
        normalized.includes("netflix") ||
        normalized.includes("spotify") ||
        normalized.includes("disney") ||
        normalized.includes("youtube premium")
    ) {
        return PAYMENT_VISUALS.subscription;
    }

    return PAYMENT_VISUALS.default;
}

async function handleEntryClick(id) {
    const entry =
        entries.find(
            item => item.id === id
        );

    if (!entry) {
        return;
    }

    const debtDirection =
        getDebtDirection(entry);

    const isReceivable =
        entry.type === "debt" &&
        debtDirection === "receivable";

    const action =
        window.confirm(
            `${entry.name}\n` +
            `${peso(entry.amount)} ` +
            `${isReceivable ? "expected" : "due"} ` +
            `${formatDate(entry.dueDate)}\n\n` +
            `Press OK to mark this as ` +
            `${
                entry.paid
                    ? isReceivable
                        ? "not collected"
                        : "unpaid"
                    : isReceivable
                        ? "collected"
                        : "paid"
            }.`
        );

    if (!action) {
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
        cancelNativeReminder(
            entry.id
        );

        entry.nativeReminderScheduled =
            false;
    } else if (entry.reminder) {
        scheduleNativeReminder(
            entry
        );

        entry.nativeReminderScheduled =
            true;
    }

    await putEntry(entry);
    await loadEntries();

    renderAll();

    showToast(
        entry.paid
            ? isReceivable
                ? "Debt marked as collected. Reminders were cancelled."
                : "Payment marked as paid. Reminders were cancelled."
            : isReceivable
                ? "Debt marked as not collected. Reminders were restored."
                : "Payment marked as unpaid. Reminders were restored."
    );
}

/* =========================================================
   Completed payments panel
   ========================================================= */

function openCompletedPayments() {
    const panel =
        document.getElementById(
            "completedPaymentsPanel"
        );

    if (!panel) {
        return;
    }

    selectedCompletedFilter =
        "all";

    panel.hidden =
        false;

    panel
        .querySelector(
            ".completed-payments-scroll"
        )
        ?.scrollTo({
            top: 0,
            behavior: "instant"
        });

    renderCompletedPayments();
}

function closeCompletedPayments() {
    closeCalendarMonthYearPicker();

    const panel =
        document.getElementById(
            "completedPaymentsPanel"
        );

    if (panel) {
        panel.hidden =
            true;
    }
}

function getCompletedPayments() {
    return getPeriodEntries()
        .filter(entry => {
            const isOutgoingPayment =
                entry.type === "bill" ||
                (
                    entry.type === "debt" &&
                    getDebtDirection(entry) ===
                        "payable"
                );

            const matchesFilter =
                selectedCompletedFilter ===
                    "all" ||
                entry.type ===
                    selectedCompletedFilter;

            return (
                entry.paid &&
                isOutgoingPayment &&
                matchesFilter
            );
        })
        .sort((first, second) => {
            return (
                getCompletedPaymentTimestamp(
                    second
                ) -
                getCompletedPaymentTimestamp(
                    first
                )
            );
        });
}

function renderCompletedPayments() {
    document
        .querySelectorAll(
            "[data-completed-filter]"
        )
        .forEach(button => {
            button.classList.toggle(
                "active",
                button.dataset
                    .completedFilter ===
                    selectedCompletedFilter
            );
        });

    const periodSelect =
        document.getElementById(
            "periodValueSelect"
        );

    const selectedOption =
        periodSelect?.options[
            periodSelect.selectedIndex
        ];

    setText(
        "completedPeriodLabel",
        selectedOption?.textContent ||
        formatCompletedPeriod(
            getPeriodValue()
        )
    );

    const completedEntries =
        getCompletedPayments();

    const totalPaid =
        completedEntries.reduce(
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

    setText(
        "completedTotalPaid",
        peso(totalPaid)
    );

    setText(
        "completedCountText",
        completedEntries.length === 1
            ? "1 completed payment"
            : `${completedEntries.length} completed payments`
    );

    setText(
        "completedRecordCount",
        completedEntries.length === 1
            ? "1 record"
            : `${completedEntries.length} records`
    );

    const container =
        document.getElementById(
            "completedPaymentsList"
        );

    if (!container) {
        return;
    }

    if (!completedEntries.length) {
        container.innerHTML = `
            <div class="completed-empty-state">
                <i class="bi bi-check2-circle"></i>

                <strong>
                    No completed payments
                </strong>

                <span>
                    No paid bills or payable debts were found for this month and filter.
                </span>
            </div>
        `;

        return;
    }

    container.innerHTML =
        completedEntries
            .map(entry => {
                const visual =
                    getPaymentVisual(
                        entry
                    );

                const typeLabel =
                    entry.type === "debt"
                        ? "Debt"
                        : "Bill";

                return `
                    <article class="completed-payment-row">
                        <span
                            class="completed-payment-icon"
                            style="
                                --payment-soft:${escapeHtml(visual.soft)};
                                --payment-accent:${escapeHtml(visual.accent)}
                            "
                        >
                            <i class="bi ${escapeHtml(visual.icon)}"></i>
                        </span>

                        <span class="completed-payment-main">
                            <strong>
                                ${escapeHtml(entry.name)}
                            </strong>

                            <span>
                                ${escapeHtml(
                                    entry.provider ||
                                    entry.category ||
                                    typeLabel
                                )}
                                ·
                                ${escapeHtml(
                                    entry.category ||
                                    typeLabel
                                )}
                            </span>

                            <small>
                                ${escapeHtml(
                                    formatCompletedPaymentDate(
                                        entry
                                    )
                                )}
                            </small>
                        </span>

                        <span class="completed-payment-value">
                            <strong>
                                ${peso(entry.amount)}
                            </strong>

                            <span>
                                Paid
                            </span>
                        </span>
                    </article>
                `;
            })
            .join("");
}

function getCompletedPaymentTimestamp(entry) {
    const value =
        entry.completedAt ||
        entry.updatedAt ||
        entry.dueDate;

    const date =
        new Date(value);

    return Number.isNaN(
        date.getTime()
    )
        ? 0
        : date.getTime();
}

function formatCompletedPaymentDate(entry) {
    if (entry.completedAt) {
        const date =
            new Date(
                entry.completedAt
            );

        if (
            !Number.isNaN(
                date.getTime()
            )
        ) {
            return (
                "Paid " +
                date.toLocaleDateString(
                    "en-PH",
                    {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                    }
                )
            );
        }
    }

    if (entry.updatedAt) {
        const date =
            new Date(
                entry.updatedAt
            );

        if (
            !Number.isNaN(
                date.getTime()
            )
        ) {
            return (
                "Paid status updated " +
                date.toLocaleDateString(
                    "en-PH",
                    {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                    }
                )
            );
        }
    }

    return (
        "Completion date unavailable · Due " +
        formatDate(
            entry.dueDate
        )
    );
}

function formatCompletedPeriod(value) {
    const [year, month] =
        String(value || "")
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

/* =========================================================
   In-app bills calendar
   ========================================================= */

function openBillsCalendar() {
    const panel =
        document.getElementById(
            "billsCalendarPanel"
        );

    if (!panel) {
        return;
    }

    const periodValue =
        getPeriodValue();

    const today =
        new Date();

    if (
        /^\d{4}-\d{2}$/.test(
            periodValue
        )
    ) {
        const [year, month] =
            periodValue
                .split("-")
                .map(Number);

        calendarViewDate =
            new Date(
                year,
                month - 1,
                1
            );

        const isCurrentMonth =
            today.getFullYear() ===
                year &&
            today.getMonth() ===
                month - 1;

        calendarSelectedDate =
            isCurrentMonth
                ? toDateInputValue(
                    today
                )
                : `${periodValue}-01`;
    } else {
        calendarViewDate =
            new Date(
                today.getFullYear(),
                today.getMonth(),
                1
            );

        calendarSelectedDate =
            toDateInputValue(today);
    }

    panel.hidden = false;

    renderBillsCalendar();
}

function closeBillsCalendar() {
    closeCalendarMonthYearPicker();

    const panel =
        document.getElementById(
            "billsCalendarPanel"
        );

    if (panel) {
        panel.hidden = true;
    }
}

function changeCalendarMonth(offset) {
    calendarViewDate =
        new Date(
            calendarViewDate.getFullYear(),
            calendarViewDate.getMonth() +
                offset,
            1
        );

    calendarSelectedDate =
        toDateInputValue(
            new Date(
                calendarViewDate.getFullYear(),
                calendarViewDate.getMonth(),
                1
            )
        );

    renderBillsCalendar();
}

function goToCalendarToday() {
    const today = new Date();

    calendarViewDate =
        new Date(
            today.getFullYear(),
            today.getMonth(),
            1
        );

    calendarSelectedDate =
        toDateInputValue(today);

    renderBillsCalendar();
}

function openCalendarMonthYearPicker(
    context = "calendar"
) {
    const picker =
        document.getElementById(
            "calendarMonthYearPicker"
        );

    const monthSelect =
        document.getElementById(
            "calendarMonthSelect"
        );

    const yearSelect =
        document.getElementById(
            "calendarYearSelect"
        );

    const monthField =
        document.getElementById(
            "calendarMonthPickerField"
        );

    const pickerTitle =
        document.getElementById(
            "calendarPickerTitle"
        );

    if (
        !picker ||
        !monthSelect ||
        !yearSelect
    ) {
        return;
    }

    calendarPickerContext = context;

    let sourceDate =
        calendarViewDate;

    if (
        context === "main" ||
        context === "completed"
    ) {
        const value =
            getPeriodValue();

        if (/^\d{4}-\d{2}$/.test(value)) {
            const [year, month] =
                value
                    .split("-")
                    .map(Number);

            sourceDate =
                new Date(
                    year,
                    month - 1,
                    1
                );
        }
    }

    populateCalendarYearOptions(
        sourceDate.getFullYear()
    );

    monthSelect.value =
        String(
            sourceDate.getMonth()
        );

    yearSelect.value =
        String(
            sourceDate.getFullYear()
        );

    if (monthField) {
        monthField.hidden = false;
    }

    monthSelect.disabled = false;

    if (pickerTitle) {
        pickerTitle.textContent =
            "Select month and year";
    }

    picker.hidden = false;

    document
        .getElementById(
            "openCalendarMonthYearPicker"
        )
        ?.setAttribute(
            "aria-expanded",
            context === "calendar"
                ? "true"
                : "false"
        );

    document
        .getElementById(
            "openBillsPeriodPicker"
        )
        ?.setAttribute(
            "aria-expanded",
            context === "main"
                ? "true"
                : "false"
        );

    document
        .getElementById(
            "openCompletedPeriodPicker"
        )
        ?.setAttribute(
            "aria-expanded",
            context === "completed"
                ? "true"
                : "false"
        );

    window.setTimeout(() => {
        monthSelect.focus();
    }, 50);
}

function closeCalendarMonthYearPicker() {
    const picker =
        document.getElementById(
            "calendarMonthYearPicker"
        );

    if (picker) {
        picker.hidden = true;
    }

    document
        .getElementById(
            "openCalendarMonthYearPicker"
        )
        ?.setAttribute(
            "aria-expanded",
            "false"
        );

    document
        .getElementById(
            "openBillsPeriodPicker"
        )
        ?.setAttribute(
            "aria-expanded",
            "false"
        );

    document
        .getElementById(
            "openCompletedPeriodPicker"
        )
        ?.setAttribute(
            "aria-expanded",
            "false"
        );
}

function populateCalendarYearOptions(
    preferredYear =
        calendarViewDate.getFullYear()
) {
    const yearSelect =
        document.getElementById(
            "calendarYearSelect"
        );

    if (!yearSelect) {
        return;
    }

    const currentYear =
        new Date().getFullYear();

    const entryYears =
        entries
            .map(entry => {
                return parseLocalDate(
                    entry.dueDate
                ).getFullYear();
            })
            .filter(year => {
                return Number.isFinite(year);
            });

    const relevantYears = [
        currentYear,
        preferredYear,
        calendarViewDate.getFullYear(),
        ...entryYears
    ];

    const minimumYear =
        Math.min(...relevantYears) - 10;

    const maximumYear =
        Math.max(...relevantYears) + 10;

    yearSelect.innerHTML = "";

    for (
        let year = minimumYear;
        year <= maximumYear;
        year += 1
    ) {
        const option =
            document.createElement(
                "option"
            );

        option.value =
            String(year);

        option.textContent =
            String(year);

        yearSelect.appendChild(option);
    }
}

function ensurePeriodOption(
    value,
    label
) {
    const select =
        document.getElementById(
            "periodValueSelect"
        );

    if (!select) {
        return;
    }

    const exists =
        Array.from(select.options)
            .some(option => {
                return option.value === value;
            });

    if (!exists) {
        const option =
            document.createElement(
                "option"
            );

        option.value = value;
        option.textContent = label;
        select.appendChild(option);
    }
}

function applyCalendarMonthYearPicker() {
    const monthSelect =
        document.getElementById(
            "calendarMonthSelect"
        );

    const yearSelect =
        document.getElementById(
            "calendarYearSelect"
        );

    if (
        !monthSelect ||
        !yearSelect
    ) {
        return;
    }

    const selectedMonth =
        Number(monthSelect.value);

    const selectedYear =
        Number(yearSelect.value);

    if (
        !Number.isInteger(selectedYear)
    ) {
        return;
    }

    if (
        calendarPickerContext === "main" ||
        calendarPickerContext === "completed"
    ) {
        const periodSelect =
            document.getElementById(
                "periodValueSelect"
            );

        if (!periodSelect) {
            return;
        }

        if (
            !Number.isInteger(selectedMonth) ||
            selectedMonth < 0 ||
            selectedMonth > 11
        ) {
            return;
        }

        const value =
            `${selectedYear}-` +
            `${String(
                selectedMonth + 1
            ).padStart(2, "0")}`;

        const label =
            new Date(
                selectedYear,
                selectedMonth,
                1
            ).toLocaleDateString(
                "en-PH",
                {
                    month: "long",
                    year: "numeric"
                }
            );

        ensurePeriodOption(
            value,
            label
        );

        periodSelect.value = value;

        updateBillsPeriodPicker();

        showAllPayments = false;

        closeCalendarMonthYearPicker();
        renderAll();
        return;
    }

    if (
        !Number.isInteger(
            selectedMonth
        ) ||
        selectedMonth < 0 ||
        selectedMonth > 11
    ) {
        return;
    }

    calendarViewDate =
        new Date(
            selectedYear,
            selectedMonth,
            1
        );

    calendarSelectedDate =
        toDateInputValue(
            calendarViewDate
        );

    closeCalendarMonthYearPicker();
    renderBillsCalendar();
}

function renderBillsCalendar() {
    const grid =
        document.getElementById(
            "billsCalendarGrid"
        );

    const monthLabel =
        document.getElementById(
            "calendarMonthLabel"
        );

    if (!grid || !monthLabel) {
        return;
    }

    const visibleYear =
        calendarViewDate.getFullYear();

    const visibleMonth =
        calendarViewDate.getMonth();

    monthLabel.textContent =
        calendarViewDate
            .toLocaleDateString(
                "en-PH",
                {
                    month: "long",
                    year: "numeric"
                }
            );

    const firstDayOfMonth =
        new Date(
            visibleYear,
            visibleMonth,
            1
        );

    const gridStart =
        new Date(
            visibleYear,
            visibleMonth,
            1 -
                firstDayOfMonth.getDay()
        );

    const todayValue =
        toDateInputValue(
            new Date()
        );

    const cells = [];

    for (
        let index = 0;
        index < 42;
        index += 1
    ) {
        const date =
            new Date(
                gridStart.getFullYear(),
                gridStart.getMonth(),
                gridStart.getDate() +
                    index
            );

        const dateValue =
            toDateInputValue(date);

        const dayEntries =
            getCalendarEntriesForDate(
                dateValue
            );

        const hasPaid =
            dayEntries.some(
                entry => entry.paid
            );

        const hasUnpaid =
            dayEntries.some(
                entry => !entry.paid
            );

        const hasOverdue =
            dayEntries.some(entry => {
                return (
                    !entry.paid &&
                    dateValue <
                        todayValue
                );
            });

        const classes =
            ["calendar-day"];

        if (
            date.getMonth() !==
            visibleMonth
        ) {
            classes.push(
                "outside-month"
            );
        }

        if (
            dateValue ===
            todayValue
        ) {
            classes.push("today");
        }

        if (
            dateValue ===
            calendarSelectedDate
        ) {
            classes.push(
                "selected"
            );
        }

        const markers = [];

        if (hasPaid) {
            markers.push(
                `<span
                    class="calendar-marker paid"
                    aria-hidden="true"
                ></span>`
            );
        }

        if (
            hasUnpaid &&
            !hasOverdue
        ) {
            markers.push(
                `<span
                    class="calendar-marker unpaid"
                    aria-hidden="true"
                ></span>`
            );
        }

        if (hasOverdue) {
            markers.push(
                `<span
                    class="calendar-marker overdue"
                    aria-hidden="true"
                ></span>`
            );
        }

        const dayItemIcons =
            dayEntries
                .slice(0, 2)
                .map(entry => {
                    const visual =
                        getPaymentVisual(entry);

                    return `
                        <span
                            class="calendar-day-entry-icon"
                            style="
                                --entry-soft:${escapeHtml(visual.soft)};
                                --entry-accent:${escapeHtml(visual.accent)}
                            "
                            title="${escapeHtml(entry.name)}"
                            aria-hidden="true"
                        >
                            <i class="bi ${escapeHtml(visual.icon)}"></i>
                        </span>
                    `;
                });

        if (dayEntries.length > 2) {
            dayItemIcons.push(`
                <span
                    class="calendar-day-more"
                    aria-hidden="true"
                >
                    +${dayEntries.length - 2}
                </span>
            `);
        }

        const accessibleStatus =
            buildCalendarDayStatus(
                dateValue,
                dayEntries
            );

        cells.push(`
            <button
                class="${classes.join(" ")}"
                type="button"
                data-calendar-date="${escapeHtml(dateValue)}"
                aria-label="${escapeHtml(accessibleStatus)}"
            >
                <span class="calendar-day-number">
                    ${date.getDate()}
                </span>

                <span class="calendar-day-items">
                    ${dayItemIcons.join("")}
                </span>

                <span class="calendar-day-markers">
                    ${markers.join("")}
                </span>
            </button>
        `);
    }

    grid.innerHTML =
        cells.join("");

    grid
        .querySelectorAll(
            "[data-calendar-date]"
        )
        .forEach(button => {
            button.addEventListener(
                "click",
                () => {
                    calendarSelectedDate =
                        button.dataset.calendarDate;

                    const chosenDate =
                        parseLocalDate(
                            calendarSelectedDate
                        );

                    if (
                        chosenDate.getFullYear() !==
                            visibleYear ||
                        chosenDate.getMonth() !==
                            visibleMonth
                    ) {
                        calendarViewDate =
                            new Date(
                                chosenDate.getFullYear(),
                                chosenDate.getMonth(),
                                1
                            );
                    }

                    renderBillsCalendar();
                }
            );
        });

    renderSelectedCalendarDate();
}

function renderSelectedCalendarDate() {
    const dateLabel =
        document.getElementById(
            "calendarSelectedDateLabel"
        );

    const countLabel =
        document.getElementById(
            "calendarSelectedCount"
        );

    const container =
        document.getElementById(
            "calendarSelectedEntries"
        );

    if (
        !dateLabel ||
        !countLabel ||
        !container
    ) {
        return;
    }

    const selectedDate =
        parseLocalDate(
            calendarSelectedDate
        );

    const selectedEntries =
        getCalendarEntriesForDate(
            calendarSelectedDate
        ).sort((first, second) => {
            if (
                Boolean(first.paid) !==
                Boolean(second.paid)
            ) {
                return (
                    Number(first.paid) -
                    Number(second.paid)
                );
            }

            return String(first.name)
                .localeCompare(
                    String(second.name)
                );
        });

    dateLabel.textContent =
        selectedDate.toLocaleDateString(
            "en-PH",
            {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric"
            }
        );

    countLabel.textContent =
        `${selectedEntries.length} ` +
        `${
            selectedEntries.length === 1
                ? "item"
                : "items"
        }`;

    if (!selectedEntries.length) {
        container.innerHTML = `
            <div class="calendar-empty-date">
                <i class="bi bi-calendar2"></i>

                <strong>
                    No payment due
                </strong>

                <span>
                    There are no saved bills or debts due on this date.
                </span>
            </div>
        `;

        return;
    }

    const todayValue =
        toDateInputValue(
            new Date()
        );

    container.innerHTML =
        selectedEntries
            .map(entry => {
                const visual =
                    getPaymentVisual(
                        entry
                    );

                let statusClass =
                    "unpaid";

                let statusText =
                    "Unpaid";

                if (entry.paid) {
                    statusClass =
                        "paid";

                    statusText =
                        entry.type === "debt" &&
                        getDebtDirection(entry) ===
                            "receivable"
                            ? "Collected"
                            : "Paid";
                } else if (
                    entry.dueDate <
                    todayValue
                ) {
                    statusClass =
                        "overdue";

                    statusText =
                        "Overdue";
                }

                return `
                    <button
                        class="calendar-entry-row"
                        type="button"
                        data-calendar-entry-id="${escapeHtml(entry.id)}"
                    >
                        <span
                            class="calendar-entry-icon"
                            style="
                                --payment-soft:${escapeHtml(visual.soft)};
                                --payment-accent:${escapeHtml(visual.accent)}
                            "
                        >
                            <i class="bi ${escapeHtml(visual.icon)}"></i>
                        </span>

                        <span class="calendar-entry-main">
                            <strong>
                                ${escapeHtml(entry.name)}
                            </strong>

                            <span>
                                ${escapeHtml(
                                    entry.provider ||
                                    entry.category ||
                                    capitalize(
                                        entry.type
                                    )
                                )}
                            </span>
                        </span>

                        <span class="calendar-entry-value">
                            <strong>
                                ${peso(entry.amount)}
                            </strong>

                            <small
                                class="calendar-entry-status ${statusClass}"
                            >
                                ${statusText}
                            </small>
                        </span>
                    </button>
                `;
            })
            .join("");

    container
        .querySelectorAll(
            "[data-calendar-entry-id]"
        )
        .forEach(button => {
            button.addEventListener(
                "click",
                async () => {
                    await handleEntryClick(
                        button.dataset
                            .calendarEntryId
                    );
                }
            );
        });
}

function getCalendarEntriesForDate(
    dateValue
) {
    return entries.filter(
        entry =>
            entry.dueDate ===
            dateValue
    );
}

function buildCalendarDayStatus(
    dateValue,
    dayEntries
) {
    const date =
        parseLocalDate(dateValue);

    const dateText =
        date.toLocaleDateString(
            "en-PH",
            {
                month: "long",
                day: "numeric",
                year: "numeric"
            }
        );

    if (!dayEntries.length) {
        return (
            `${dateText}, ` +
            "no payments due"
        );
    }

    const paidCount =
        dayEntries.filter(
            entry => entry.paid
        ).length;

    const unpaidCount =
        dayEntries.length -
        paidCount;

    const todayValue =
        toDateInputValue(
            new Date()
        );

    const overdueCount =
        dayEntries.filter(entry => {
            return (
                !entry.paid &&
                entry.dueDate <
                    todayValue
            );
        }).length;

    const parts = [
        `${dayEntries.length} payments`
    ];

    if (paidCount) {
        parts.push(
            `${paidCount} paid`
        );
    }

    if (unpaidCount) {
        parts.push(
            `${unpaidCount} unpaid`
        );
    }

    if (overdueCount) {
        parts.push(
            `${overdueCount} overdue`
        );
    }

    return (
        `${dateText}, ` +
        parts.join(", ")
    );
}

/* =========================================================
   Add Bill and Debt form
   ========================================================= */

function openAddPanel(type) {
    selectedEntryType = type;
    selectedFrequency =
        type === "debt"
            ? "one-time"
            : "monthly";

    if (type === "debt") {
        selectedDebtDirection =
            "payable";
    }

    resetForm();
    updateEntryTypeUI();

    const panel =
        document.getElementById(
            "addBillDebtPanel"
        );

    if (panel) {
        panel.hidden = false;

        panel
            .querySelector(
                ".bill-panel-scroll"
            )
            ?.scrollTo({
                top: 0,
                behavior: "instant"
            });
    }
}

function closeAddPanel() {
    const panel =
        document.getElementById(
            "addBillDebtPanel"
        );

    if (panel) {
        panel.hidden = true;
    }
}

function resetForm() {
    const form =
        document.getElementById(
            "billDebtForm"
        );

    form?.reset();

    setDefaultFormValues();

    const reminderToggle =
        document.getElementById(
            "reminderToggle"
        );

    const sharedToggle =
        document.getElementById(
            "sharedToggle"
        );

    if (reminderToggle) {
        reminderToggle.checked = true;
    }

    if (sharedToggle) {
        sharedToggle.checked = false;
    }

    const categorySelect =
        document.getElementById(
            "entryCategory"
        );

    const billNameSelect =
        document.getElementById(
            "entryBillName"
        );

    const billProviderSelect =
        document.getElementById(
            "entryBillProvider"
        );

    const customBillName =
        document.getElementById(
            "customBillName"
        );

    const customBillProvider =
        document.getElementById(
            "customBillProvider"
        );

    if (categorySelect) {
        categorySelect.value =
            "";
    }

    if (billNameSelect) {
        billNameSelect.value =
            "";
    }

    if (billProviderSelect) {
        billProviderSelect.innerHTML = `
            <option value="">
                Select bill name first
            </option>
        `;

        billProviderSelect.disabled =
            true;
    }

    if (customBillName) {
        customBillName.value =
            "";
    }

    if (customBillProvider) {
        customBillProvider.value =
            "";
    }

    const debtName =
        document.getElementById(
            "entryName"
        );

    const debtProvider =
        document.getElementById(
            "entryProvider"
        );

    const amount =
        document.getElementById(
            "entryAmount"
        );

    const dueDate =
        document.getElementById(
            "entryDueDate"
        );

    const notes =
        document.getElementById(
            "entryNotes"
        );

    if (debtName) {
        debtName.value = "";
    }

    if (debtProvider) {
        debtProvider.value = "";
    }

    if (amount) {
        amount.value = "";
    }

    if (dueDate) {
        dueDate.value = "";
    }

    if (notes) {
        notes.value = "";
    }

    updateCustomBillFields();
}

function setDefaultFormValues() {
    const dueDate =
        document.getElementById(
            "entryDueDate"
        );

    if (!dueDate) {
        return;
    }

    dueDate.value = "";
    dueDate.removeAttribute("min");
    updateDateInputDisplay();
}

function updateDateInputDisplay() {
    const dueDate =
        document.getElementById(
            "entryDueDate"
        );

    const display =
        document.getElementById(
            "entryDueDateDisplay"
        );

    if (!dueDate || !display) {
        return;
    }

    if (!dueDate.value) {
        display.textContent = "mm/dd/yyyy";
        display.classList.add(
            "placeholder"
        );
        return;
    }

    const date =
        parseLocalDate(
            dueDate.value
        );

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        display.textContent = "mm/dd/yyyy";
        display.classList.add(
            "placeholder"
        );
        return;
    }

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");

    display.textContent =
        `${month}/${day}/${date.getFullYear()}`;

    display.classList.remove(
        "placeholder"
    );
}

function updateEntryTypeUI() {
    document
        .querySelectorAll(
            "[data-entry-type]"
        )
        .forEach(button => {
            button.classList.toggle(
                "active",
                button.dataset.entryType ===
                    selectedEntryType
            );
        });

    const isDebt =
        selectedEntryType === "debt";

    const isReceivable =
        isDebt &&
        selectedDebtDirection ===
            "receivable";

    setText(
        "entryNameLegend",
        "Debt Name"
    );

    setText(
        "providerLegend",
        isReceivable
            ? "Borrower / Payer"
            : "Lender / Payee"
    );

    setText(
        "dueDateLegend",
        isReceivable
            ? "Expected Date"
            : "Due Date"
    );

    setText(
        "saveEntryButton",
        isDebt
            ? "Save Debt"
            : "Save Bill"
    );

    const nameInput =
        document.getElementById(
            "entryName"
        );

    const providerInput =
        document.getElementById(
            "entryProvider"
        );

    const frequencyField =
        document.getElementById(
            "frequencyField"
        );

    const debtDirectionField =
        document.getElementById(
            "debtDirectionField"
        );

    if (nameInput) {
        nameInput.placeholder =
            isReceivable
                ? "e.g., Loan to Juan"
                : "e.g., Loan from Maria";
    }

    if (providerInput) {
        providerInput.placeholder =
            isReceivable
                ? "e.g., Juan Dela Cruz"
                : "e.g., Maria Santos";
    }

    if (frequencyField) {
        frequencyField.hidden =
            isDebt;
    }

    if (debtDirectionField) {
        debtDirectionField.hidden =
            !isDebt;
    }

    if (isDebt) {
        selectedFrequency =
            "one-time";
    }

    updateDebtDirectionUI();
    updateFrequencyUI();
    updateCategoryOptions();
    updateBillAndDebtFields();
}

function updateCategoryOptions() {
    const select =
        document.getElementById(
            "entryCategory"
        );

    if (!select) {
        return;
    }

    const previousValue =
        select.value;

    const categories =
        selectedEntryType === "debt"
            ? DEBT_CATEGORIES
            : BILL_CATEGORIES;

    select.innerHTML = `
        <option value="">
            Select category
        </option>
    `;

    categories.forEach(category => {
        const option =
            document.createElement(
                "option"
            );

        option.value =
            category;

        option.textContent =
            category;

        select.appendChild(
            option
        );
    });

    if (
        categories.includes(
            previousValue
        )
    ) {
        select.value =
            previousValue;
    }
}

function populateBillNameOptions() {
    const select =
        document.getElementById(
            "entryBillName"
        );

    if (!select) {
        return;
    }

    const previousValue =
        select.value;

    select.innerHTML = `
        <option value="">
            Select bill type
        </option>
    `;

    Object.keys(
        BILL_PRESETS
    ).forEach(name => {
        const option =
            document.createElement(
                "option"
            );

        option.value =
            name;

        option.textContent =
            name;

        select.appendChild(
            option
        );
    });

    const otherOption =
        document.createElement(
            "option"
        );

    otherOption.value =
        CUSTOM_BILL_VALUE;

    otherOption.textContent =
        "Other Bill";

    select.appendChild(
        otherOption
    );

    if (
        previousValue &&
        (
            BILL_PRESETS[
                previousValue
            ] ||
            previousValue ===
                CUSTOM_BILL_VALUE
        )
    ) {
        select.value =
            previousValue;
    }
}

function updateBillAndDebtFields() {
    const isBill =
        selectedEntryType ===
        "bill";

    const billNameField =
        document.getElementById(
            "billNameField"
        );

    const debtNameField =
        document.getElementById(
            "debtNameField"
        );

    const billProviderField =
        document.getElementById(
            "billProviderField"
        );

    const debtProviderField =
        document.getElementById(
            "debtProviderField"
        );

    if (billNameField) {
        billNameField.hidden =
            !isBill;
    }

    if (debtNameField) {
        debtNameField.hidden =
            isBill;
    }

    if (billProviderField) {
        billProviderField.hidden =
            !isBill;
    }

    if (debtProviderField) {
        debtProviderField.hidden =
            isBill;
    }

    populateBillNameOptions();

    if (isBill) {
        updateBillProviderOptions(
            true
        );
    } else {
        const customBillNameField =
            document.getElementById(
                "customBillNameField"
            );

        const customProviderField =
            document.getElementById(
                "customBillProviderField"
            );

        if (customBillNameField) {
            customBillNameField.hidden =
                true;
        }

        if (customProviderField) {
            customProviderField.hidden =
                true;
        }
    }

    updateCustomBillFields();
}

function updateBillProviderOptions(
    preserveSelection = true
) {
    const billSelect =
        document.getElementById(
            "entryBillName"
        );

    const providerSelect =
        document.getElementById(
            "entryBillProvider"
        );

    const categorySelect =
        document.getElementById(
            "entryCategory"
        );

    const billProviderField =
        document.getElementById(
            "billProviderField"
        );

    const textProviderField =
        document.getElementById(
            "customBillProviderField"
        );

    const textProviderLegend =
        document.getElementById(
            "customBillProviderLegend"
        );

    const textProviderInput =
        document.getElementById(
            "customBillProvider"
        );

    if (
        !billSelect ||
        !providerSelect
    ) {
        return;
    }

    const previousSelectValue =
        preserveSelection
            ? providerSelect.value
            : "";

    const previousTextValue =
        preserveSelection
            ? textProviderInput?.value ||
                ""
            : "";

    const billValue =
        billSelect.value;

    const preset =
        BILL_PRESETS[
            billValue
        ];

    providerSelect.innerHTML =
        "";

    if (textProviderInput) {
        textProviderInput.value =
            previousTextValue;
    }

    if (!billValue) {
        const option =
            document.createElement(
                "option"
            );

        option.value =
            "";

        option.textContent =
            "Select bill name first";

        providerSelect.appendChild(
            option
        );

        providerSelect.disabled =
            true;

        if (billProviderField) {
            billProviderField.hidden =
                false;
        }

        if (textProviderField) {
            textProviderField.hidden =
                true;
        }

        updateCustomBillFields();
        return;
    }

    if (
        categorySelect
    ) {
        categorySelect.value =
            preset?.category ||
            "Other";
    }

    const usesProviderSelect =
        preset?.providerMode ===
        "select";

    if (billProviderField) {
        billProviderField.hidden =
            !usesProviderSelect;
    }

    if (textProviderField) {
        textProviderField.hidden =
            usesProviderSelect;
    }

    if (!usesProviderSelect) {
        providerSelect.disabled =
            true;

        const option =
            document.createElement(
                "option"
            );

        option.value =
            "";

        option.textContent =
            "Provider entered below";

        providerSelect.appendChild(
            option
        );

        if (textProviderLegend) {
            textProviderLegend.textContent =
                preset?.providerLabel ||
                "Provider / Payee";
        }

        if (textProviderInput) {
            textProviderInput.placeholder =
                preset?.providerPlaceholder ||
                "Enter provider or payee";

            if (!preserveSelection) {
                textProviderInput.value =
                    "";
            }
        }

        updateCustomBillFields();
        return;
    }

    providerSelect.disabled =
        false;

    const placeholder =
        document.createElement(
            "option"
        );

    placeholder.value =
        "";

    placeholder.textContent =
        "Select provider / payee";

    providerSelect.appendChild(
        placeholder
    );

    preset.providers
        .forEach(provider => {
            const option =
                document.createElement(
                    "option"
                );

            option.value =
                provider;

            option.textContent =
                provider;

            providerSelect.appendChild(
                option
            );
        });

    const customOption =
        document.createElement(
            "option"
        );

    customOption.value =
        CUSTOM_PROVIDER_VALUE;

    customOption.textContent =
        preset.customProviderLabel ||
        "Other Provider";

    providerSelect.appendChild(
        customOption
    );

    const availableValues =
        Array.from(
            providerSelect.options
        ).map(option => {
            return option.value;
        });

    if (
        previousSelectValue &&
        availableValues.includes(
            previousSelectValue
        )
    ) {
        providerSelect.value =
            previousSelectValue;
    }

    if (textProviderLegend) {
        textProviderLegend.textContent =
            preset
                .customProviderFieldLabel ||
            "Other Provider / Payee";
    }

    if (textProviderInput) {
        textProviderInput.placeholder =
            preset
                .customProviderPlaceholder ||
            "Enter provider name";

        if (!preserveSelection) {
            textProviderInput.value =
                "";
        }
    }

    updateCustomBillFields();
}

function updateCustomBillFields() {
    const isBill =
        selectedEntryType ===
        "bill";

    const billNameSelect =
        document.getElementById(
            "entryBillName"
        );

    const providerSelect =
        document.getElementById(
            "entryBillProvider"
        );

    const customNameField =
        document.getElementById(
            "customBillNameField"
        );

    const billProviderField =
        document.getElementById(
            "billProviderField"
        );

    const textProviderField =
        document.getElementById(
            "customBillProviderField"
        );

    const customNameInput =
        document.getElementById(
            "customBillName"
        );

    const textProviderInput =
        document.getElementById(
            "customBillProvider"
        );

    const debtNameInput =
        document.getElementById(
            "entryName"
        );

    const debtProviderInput =
        document.getElementById(
            "entryProvider"
        );

    const selectedBillValue =
        billNameSelect?.value ||
        "";

    const preset =
        BILL_PRESETS[
            selectedBillValue
        ];

    const isCustomBill =
        selectedBillValue ===
        CUSTOM_BILL_VALUE;

    const usesProviderSelect =
        preset?.providerMode ===
        "select";

    const showCustomName =
        isBill &&
        isCustomBill;

    const showTextProvider =
        isBill &&
        (
            isCustomBill ||
            preset?.providerMode ===
                "text" ||
            (
                usesProviderSelect &&
                providerSelect?.value ===
                    CUSTOM_PROVIDER_VALUE
            )
        );

    const textProviderLegend =
        document.getElementById(
            "customBillProviderLegend"
        );

    if (
        isCustomBill &&
        textProviderLegend
    ) {
        textProviderLegend.textContent =
            "Provider / Payee";
    }

    if (
        isCustomBill &&
        textProviderInput
    ) {
        textProviderInput.placeholder =
            "Enter provider or payee";
    }

    if (
        isBill &&
        preset?.providerMode ===
            "select" &&
        providerSelect?.value ===
            CUSTOM_PROVIDER_VALUE
    ) {
        if (textProviderLegend) {
            textProviderLegend.textContent =
                preset
                    .customProviderFieldLabel ||
                "Other Provider / Payee";
        }

        if (textProviderInput) {
            textProviderInput.placeholder =
                preset
                    .customProviderPlaceholder ||
                "Enter provider name";
        }
    }

    if (customNameField) {
        customNameField.hidden =
            !showCustomName;
    }

    if (billProviderField) {
        billProviderField.hidden =
            !isBill ||
            (
                Boolean(selectedBillValue) &&
                !usesProviderSelect &&
                !isCustomBill
            ) ||
            isCustomBill;
    }

    if (textProviderField) {
        textProviderField.hidden =
            !showTextProvider;
    }

    if (billNameSelect) {
        billNameSelect.required =
            isBill;
    }

    if (providerSelect) {
        providerSelect.required =
            isBill &&
            usesProviderSelect;
    }

    if (customNameInput) {
        customNameInput.required =
            showCustomName;
    }

    if (textProviderInput) {
        textProviderInput.required =
            showTextProvider;
    }

    if (debtNameInput) {
        debtNameInput.required =
            !isBill;
    }

    if (debtProviderInput) {
        debtProviderInput.required =
            !isBill;
    }
}

function updateDebtDirectionUI() {
    document
        .querySelectorAll(
            "[data-debt-direction]"
        )
        .forEach(button => {
            button.classList.toggle(
                "active",
                button.dataset.debtDirection ===
                    selectedDebtDirection
            );
        });
}

function updateFrequencyUI() {
    document
        .querySelectorAll(
            "[data-frequency]"
        )
        .forEach(button => {
            button.classList.toggle(
                "active",
                button.dataset.frequency ===
                    selectedFrequency
            );
        });
}

async function saveEntry(event) {
    event.preventDefault();

    const formData =
        collectFormData();

    if (!formData) {
        return;
    }

    const saveButton =
        document.getElementById(
            "saveEntryButton"
        );

    const topSaveButton =
        document.getElementById(
            "saveEntryTop"
        );

    if (saveButton) {
        saveButton.disabled = true;
        saveButton.textContent =
            "Saving...";
    }

    if (topSaveButton) {
        topSaveButton.disabled = true;
    }

    const entry = {
        id: createId("payment"),

        familyCode:
            currentFamily.familyCode,

        type:
            selectedEntryType,

        debtDirection:
            selectedEntryType === "debt"
                ? selectedDebtDirection
                : null,

        name:
            formData.name,

        provider:
            formData.provider,

        amount:
            formData.amount,

        dueDate:
            formData.dueDate,

        category:
            formData.category,

        frequency:
            selectedFrequency,

        reminder:
            formData.reminder,

        shared:
            formData.shared,

        notes:
            formData.notes,

        paid:
            false,

        createdBy:
            currentUser.id,

        createdAt:
            new Date().toISOString(),

        calendarStatus:
            "pending"
    };

    try {
        await putEntry(entry);

        const nativeResult =
            sendEntryToAndroid(
                entry
            );

        if (nativeResult.ok) {
            entry.calendarStatus =
                "calendar-review";

            entry.nativeReminderScheduled =
                Boolean(
                    entry.reminder
                );

            entry.calendarRequestedAt =
                new Date()
                    .toISOString();

            showToast(
                entry.reminder
                    ? "Saved. Review the Calendar event and allow notifications."
                    : "Saved. Review the Calendar event and tap Save."
            );
        } else {
            entry.calendarStatus =
                "local-only";

            entry.nativeReminderScheduled =
                false;

            entry.calendarError =
                nativeResult.message;

            showToast(
                "Saved locally. Calendar access is available in the Android app."
            );
        }

        await putEntry(entry);
        await loadEntries();

        renderAll();
        closeAddPanel();
        resetForm();
    } catch (error) {
        console.error(
            "Saving payment failed:",
            error
        );

        showToast(
            "The bill or debt could not be saved."
        );
    } finally {
        if (saveButton) {
            saveButton.disabled =
                false;

            saveButton.textContent =
                selectedEntryType ===
                "debt"
                    ? "Save Debt"
                    : "Save Bill";
        }

        if (topSaveButton) {
            topSaveButton.disabled = false;
        }
    }
}

function collectFormData() {
    const billNameValue =
        document
            .getElementById(
                "entryBillName"
            )
            ?.value ||
        "";

    const billProviderValue =
        document
            .getElementById(
                "entryBillProvider"
            )
            ?.value ||
        "";

    const name =
        selectedEntryType ===
        "bill"
            ? billNameValue ===
                CUSTOM_BILL_VALUE
                ? document
                    .getElementById(
                        "customBillName"
                    )
                    ?.value
                    .trim() ||
                    ""
                : billNameValue
            : document
                .getElementById(
                    "entryName"
                )
                ?.value
                .trim() ||
                "";

    const selectedBillPreset =
        BILL_PRESETS[
            billNameValue
        ];

    const usesBillProviderSelect =
        selectedBillPreset
            ?.providerMode ===
            "select";

    const provider =
        selectedEntryType ===
        "bill"
            ? usesBillProviderSelect &&
                billProviderValue !==
                    CUSTOM_PROVIDER_VALUE
                ? billProviderValue
                : document
                    .getElementById(
                        "customBillProvider"
                    )
                    ?.value
                    .trim() ||
                    ""
            : document
                .getElementById(
                    "entryProvider"
                )
                ?.value
                .trim() ||
                "";

    const amount =
        Number(
            document
                .getElementById(
                    "entryAmount"
                )
                ?.value ||
            0
        );

    const dueDate =
        document
            .getElementById(
                "entryDueDate"
            )
            ?.value ||
        "";

    const category =
        document
            .getElementById(
                "entryCategory"
            )
            ?.value ||
        "";

    const notes =
        document
            .getElementById(
                "entryNotes"
            )
            ?.value
            .trim() ||
        "";

    const reminder =
        Boolean(
            document
                .getElementById(
                    "reminderToggle"
                )
                ?.checked
        );

    const shared =
        Boolean(
            document
                .getElementById(
                    "sharedToggle"
                )
                ?.checked
        );

    if (
        !name ||
        !provider ||
        !(amount > 0) ||
        !dueDate ||
        !category
    ) {
        showToast(
            "Complete all required fields."
        );

        return null;
    }

    return {
        name,
        provider,
        amount,
        dueDate,
        category,
        notes,
        reminder,
        shared
    };
}

/* =========================================================
   Android Calendar and reminders
   ========================================================= */

function sendEntryToAndroid(entry) {
    const bridge =
        window.KabalikatAndroid;

    if (
        !bridge ||
        typeof bridge.addBill !==
            "function"
    ) {
        return {
            ok: false,
            message:
                "Android Calendar bridge is unavailable."
        };
    }

    try {
        const result =
            bridge.addBill(
                JSON.stringify({
                    id: entry.id,
                    type: entry.type,
                    debtDirection:
                        entry.debtDirection ||
                        null,
                    name: entry.name,
                    provider:
                        entry.provider,
                    amount:
                        Number(
                            entry.amount ||
                            0
                        ),
                    dueDate:
                        entry.dueDate,
                    category:
                        entry.category,
                    frequency:
                        entry.frequency,
                    reminder:
                        Boolean(
                            entry.reminder
                        ),
                    shared:
                        Boolean(
                            entry.shared
                        ),
                    notes:
                        entry.notes ||
                        ""
                })
            );

        return {
            ok: result === "ok",
            message: result || ""
        };
    } catch (error) {
        console.error(
            "Android Calendar bridge failed:",
            error
        );

        return {
            ok: false,
            message:
                String(
                    error?.message ||
                    error
                )
        };
    }
}

function scheduleNativeReminder(entry) {
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
                id:
                    entry.id,

                name:
                    entry.name,

                provider:
                    entry.provider,

                amount:
                    Number(
                        entry.amount ||
                        0
                    ),

                dueDate:
                    entry.dueDate,

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

function cancelNativeReminder(entryId) {
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

function updateCalendarConnectionNote() {
    const note =
        document.getElementById(
            "calendarConnectionNote"
        );

    if (!note) {
        return;
    }

    const noteText =
        note.querySelector("span");

    if (!noteText) {
        return;
    }

    const bridgeAvailable =
        Boolean(
            window.KabalikatAndroid &&
            typeof window
                .KabalikatAndroid
                .addBill ===
                "function"
        );

    if (bridgeAvailable) {
        noteText.textContent =
            "Saving opens your Calendar app and schedules reminders 5 days, 3 days, 1 day, and on the due date.";

        note.classList.remove(
            "warning"
        );
    } else {
        noteText.textContent =
            "Calendar and notification reminders are available when running inside the Android app.";

        note.classList.remove(
            "warning"
        );
    }
}

/* =========================================================
   Helpers
   ========================================================= */

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

function createId(prefix) {
    if (
        window.crypto?.randomUUID
    ) {
        return (
            `${prefix}-` +
            crypto.randomUUID()
        );
    }

    return (
        `${prefix}-` +
        `${Date.now()}-` +
        `${Math.random()
            .toString(16)
            .slice(2)}`
    );
}

function formatFrequency(value) {
    if (value === "one-time") {
        return "One-time";
    }

    return capitalize(value);
}

function capitalize(value) {
    const text =
        String(value || "");

    return (
        text.charAt(0).toUpperCase() +
        text.slice(1)
    );
}

function peso(value) {
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

function setText(id, value) {
    const element =
        document.getElementById(id);

    if (element) {
        element.textContent = value;
    }
}

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );
}

function showToast(message) {
    const toast =
        document.getElementById(
            "billToast"
        );

    if (!toast) {
        return;
    }

    toast.textContent = message;
    toast.classList.add("show");

    window.clearTimeout(
        showToast.timer
    );

    showToast.timer =
        window.setTimeout(
            () => {
                toast.classList.remove(
                    "show"
                );
            },
            3200
        );
}