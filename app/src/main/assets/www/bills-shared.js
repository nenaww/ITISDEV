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
        const request =
            database
                .transaction(
                    "entries",
                    "readonly"
                )
                .objectStore(
                    "entries"
                )
                .index(
                    "familyCode"
                )
                .getAll(
                    familyCode
                );

        request.onsuccess = () => {
            resolve(request.result || []);
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
        `${entry.name || ""} ` +
        `${entry.provider || ""}`
            .toLowerCase();

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