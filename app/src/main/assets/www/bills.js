/* =========================================================
   KABALIKAT Bills & Debt
   - Local persistence through a separate IndexedDB database
   - Reads the signed-in user/family from the existing auth DB
   - Opens the Android Calendar app through a native bridge
   - Schedules Android notification reminders through WorkManager
   ========================================================= */

const AUTH_DB_NAME = "kabalikat_auth_language_db";
const BILLS_DB_NAME = "kabalikat_bills_db";
const BILLS_DB_VERSION = 1;

let authDb = null;
let billsDb = null;
let currentUser = null;
let currentFamily = null;
let familyMembers = [];
let entries = [];

let selectedTypeFilter = "all";
let selectedEntryType = "bill";
let selectedFrequency = "monthly";
let showAllPayments = false;

const PAYMENT_VISUALS = {
    electric: { icon: "bi-lightning-charge", soft: "#FFF1C9", accent: "#D89B15" },
    water: { icon: "bi-droplet", soft: "#EAF3F8", accent: "#4E8EB5" },
    internet: { icon: "bi-wifi", soft: "#F1EDFF", accent: "#8057D8" },
    housing: { icon: "bi-house-door", soft: "#FFF1E8", accent: "#C96E4B" },
    debt: { icon: "bi-person", soft: "#F1EDFF", accent: "#8057D8" },
    health: { icon: "bi-heart-pulse", soft: "#EEF6F0", accent: "#5C8F6C" },
    education: { icon: "bi-book", soft: "#FFF5D8", accent: "#A77E20" },
    subscription: { icon: "bi-arrow-repeat", soft: "#EAF3F8", accent: "#4F7F99" },
    default: { icon: "bi-receipt", soft: "#FFF1E8", accent: "#C96E4B" }
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
        category: "Utilities",
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
        category: "Utilities",
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

document.addEventListener("DOMContentLoaded", initializeBillsPage);

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

        renderAll();
        updateCalendarConnectionNote();
    } catch (error) {
        console.error("Bills page initialization failed:", error);
        showToast("The Bills page could not be fully initialized.");
    }
}

function bindEvents() {
    document.getElementById("openAddBill")?.addEventListener("click", () => openAddPanel("bill"));
    document.getElementById("openAddDebt")?.addEventListener("click", () => openAddPanel("debt"));
    document.getElementById("closeAddPanelTop")?.addEventListener("click", closeAddPanel);
    document.getElementById("cancelAddEntry")?.addEventListener("click", closeAddPanel);

    document.querySelectorAll("[data-entry-type]").forEach(button => {
        button.addEventListener("click", () => {
            selectedEntryType = button.dataset.entryType;
            updateEntryTypeUI();
        });
    });

    document.querySelectorAll("[data-frequency]").forEach(button => {
        button.addEventListener("click", () => {
            selectedFrequency = button.dataset.frequency;
            updateFrequencyUI();
        });
    });

    document.querySelectorAll("[data-type-filter]").forEach(button => {
        button.addEventListener("click", () => {
            selectedTypeFilter = button.dataset.typeFilter;
            showAllPayments = false;
            renderTypeFilter();
            renderPayments();
        });
    });

    document.getElementById("periodScopeSelect")?.addEventListener("change", event => {
        populatePeriodValueOptions(event.target.value);
        showAllPayments = false;
        renderAll();
    });

    document.getElementById("periodValueSelect")?.addEventListener("change", () => {
        showAllPayments = false;
        renderAll();
    });

    document.getElementById("viewAllPayments")?.addEventListener("click", () => {
        showAllPayments = !showAllPayments;
        renderPayments();
    });

    document.getElementById("viewDebtDetails")?.addEventListener("click", () => {
        selectedTypeFilter = "debt";
        showAllPayments = true;
        renderTypeFilter();
        renderPayments();
        document.querySelector(".bills-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    document.getElementById("billDebtForm")?.addEventListener("submit", saveEntry);

    document.getElementById("navHome")?.addEventListener("click", () => navigateTo("home.html"));
    document.getElementById("navExpenses")?.addEventListener("click", () => navigateTo("expenses.html"));
    document.getElementById("navScan")?.addEventListener("click", () => navigateTo("scanner.html"));
    document.getElementById("navProfile")?.addEventListener("click", () => showToast("Profile will be added next."));


    document.querySelectorAll("[data-panel-nav]").forEach(button => {
        button.addEventListener("click", () => {
            const destination = button.dataset.panelNav;
            if (destination === "home") navigateTo("home.html");
            if (destination === "expenses") navigateTo("expenses.html");
            if (destination === "scan") navigateTo("scanner.html");
            if (destination === "profile") showToast("Profile will be added next.");
        });
    });
}

function navigateTo(page) {
    window.location.href = page;
}

/* =========================================================
   Authentication context
   ========================================================= */

function openAuthDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(AUTH_DB_NAME);

        request.onupgradeneeded = event => {
            const database = event.target.result;

            if (!database.objectStoreNames.contains("users")) {
                const users = database.createObjectStore("users", { keyPath: "id" });
                users.createIndex("email", "email", { unique: true });
                users.createIndex("familyCode", "familyCode", { unique: false });
            }

            if (!database.objectStoreNames.contains("families")) {
                database.createObjectStore("families", { keyPath: "familyCode" });
            }

            if (!database.objectStoreNames.contains("sessions")) {
                database.createObjectStore("sessions", { keyPath: "id" });
            }
        };

        request.onsuccess = event => resolve(event.target.result);
        request.onerror = () => reject(request.error);
    });
}

async function loadCurrentUserContext() {
    const session = await getRecordFromDatabase(authDb, "sessions", "current");

    if (session?.userId) {
        currentUser = await getRecordFromDatabase(authDb, "users", session.userId);
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

    currentFamily = await getRecordFromDatabase(authDb, "families", currentUser.familyCode);

    if (!currentFamily) {
        currentFamily = {
            familyCode: currentUser.familyCode || "KABA-4821",
            familyName: "Dela Cruz Family",
            monthlyBudget: 25000
        };
    }

    familyMembers = await getRecordsByIndex(authDb, "users", "familyCode", currentFamily.familyCode);
}

function getRecordFromDatabase(database, storeName, key) {
    return new Promise((resolve, reject) => {
        if (!database.objectStoreNames.contains(storeName)) {
            resolve(null);
            return;
        }

        const request = database.transaction(storeName, "readonly").objectStore(storeName).get(key);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
    });
}

function getRecordsByIndex(database, storeName, indexName, value) {
    return new Promise((resolve, reject) => {
        if (!database.objectStoreNames.contains(storeName)) {
            resolve([]);
            return;
        }

        const objectStore = database.transaction(storeName, "readonly").objectStore(storeName);
        if (!objectStore.indexNames.contains(indexName)) {
            resolve([]);
            return;
        }

        const request = objectStore.index(indexName).getAll(value);
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
    });
}

/* =========================================================
   Bills database
   ========================================================= */

function openBillsDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(BILLS_DB_NAME, BILLS_DB_VERSION);

        request.onupgradeneeded = event => {
            const database = event.target.result;

            if (!database.objectStoreNames.contains("entries")) {
                const store = database.createObjectStore("entries", { keyPath: "id" });
                store.createIndex("familyCode", "familyCode", { unique: false });
                store.createIndex("dueDate", "dueDate", { unique: false });
                store.createIndex("type", "type", { unique: false });
            }
        };

        request.onsuccess = event => resolve(event.target.result);
        request.onerror = () => reject(request.error);
    });
}

function billsStore(mode = "readonly") {
    return billsDb.transaction("entries", mode).objectStore("entries");
}

function putEntry(entry) {
    return new Promise((resolve, reject) => {
        const request = billsStore("readwrite").put(entry);
        request.onsuccess = () => resolve(entry);
        request.onerror = () => reject(request.error);
    });
}

function deleteEntry(id) {
    return new Promise((resolve, reject) => {
        const request = billsStore("readwrite").delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

function getEntriesForFamily(familyCode) {
    return new Promise((resolve, reject) => {
        const request = billsStore().index("familyCode").getAll(familyCode);
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
    });
}

async function loadEntries() {
    entries = await getEntriesForFamily(currentFamily.familyCode);
}

async function seedDemoEntriesIfNeeded() {
    if (currentFamily.familyCode !== "KABA-4821" || entries.length > 0) {
        return;
    }

    for (const entry of DEMO_ENTRIES) {
        await putEntry(entry);
    }
}

/* =========================================================
   Period and filtering
   ========================================================= */

function initializePeriodControls() {
    const scope = document.getElementById("periodScopeSelect");
    if (scope) scope.value = "month";
    populatePeriodValueOptions("month");
}

function populatePeriodValueOptions(scope) {
    const select = document.getElementById("periodValueSelect");
    if (!select) return;

    const now = new Date();
    select.innerHTML = "";
    select.disabled = scope === "all";

    if (scope === "all") {
        select.innerHTML = '<option value="all">All Dates</option>';
        return;
    }

    if (scope === "year") {
        for (let year = now.getFullYear() - 2; year <= now.getFullYear() + 2; year += 1) {
            const option = document.createElement("option");
            option.value = String(year);
            option.textContent = String(year);
            if (year === now.getFullYear()) option.selected = true;
            select.appendChild(option);
        }
        return;
    }

    for (let offset = -12; offset <= 12; offset += 1) {
        const date = new Date(now.getFullYear(), now.getMonth() + offset, 1);
        const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        const option = document.createElement("option");
        option.value = value;
        option.textContent = date.toLocaleDateString("en-PH", { month: "long", year: "numeric" });
        if (offset === 0) option.selected = true;
        select.appendChild(option);
    }
}

function getPeriodScope() {
    return document.getElementById("periodScopeSelect")?.value || "month";
}

function getPeriodValue() {
    return document.getElementById("periodValueSelect")?.value || "all";
}

function entryMatchesPeriod(entry) {
    const scope = getPeriodScope();
    if (scope === "all") return true;

    const dueDate = parseLocalDate(entry.dueDate);
    if (Number.isNaN(dueDate.getTime())) return false;

    const value = getPeriodValue();

    if (scope === "year") {
        return dueDate.getFullYear() === Number(value);
    }

    const [year, month] = value.split("-").map(Number);
    return dueDate.getFullYear() === year && dueDate.getMonth() === month - 1;
}

function getPeriodEntries() {
    return entries.filter(entryMatchesPeriod);
}

function getFilteredEntries() {
    return getPeriodEntries()
        .filter(entry => selectedTypeFilter === "all" || entry.type === selectedTypeFilter)
        .sort((first, second) => {
            if (Boolean(first.paid) !== Boolean(second.paid)) {
                return Number(first.paid) - Number(second.paid);
            }
            return parseLocalDate(first.dueDate) - parseLocalDate(second.dueDate);
        });
}

/* =========================================================
   Rendering
   ========================================================= */

function renderAll() {
    renderTypeFilter();
    renderSummary();
    renderPayments();
    renderDebtOverview();
}

function renderTypeFilter() {
    document.querySelectorAll("[data-type-filter]").forEach(button => {
        button.classList.toggle("active", button.dataset.typeFilter === selectedTypeFilter);
    });
}

function renderSummary() {
    const periodEntries = getPeriodEntries();
    const unpaid = periodEntries.filter(entry => !entry.paid);
    const billsDue = unpaid
        .filter(entry => entry.type === "bill")
        .reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
    const debtDue = unpaid
        .filter(entry => entry.type === "debt")
        .reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
    const paidCount = periodEntries.filter(entry => entry.paid).length;
    const totalCount = periodEntries.length;
    const paidPercent = totalCount > 0 ? Math.round((paidCount / totalCount) * 100) : 0;

    setText("totalDueAmount", peso(billsDue + debtDue));
    setText("billsDueAmount", peso(billsDue));
    setText("debtDueAmount", peso(debtDue));
    setText("paidCountText", `${paidCount} of ${totalCount}`);

    const progress = document.getElementById("paidProgressFill");
    if (progress) progress.style.width = `${paidPercent}%`;
}

function renderPayments() {
    const container = document.getElementById("paymentsList");
    const viewAllButton = document.getElementById("viewAllPayments");
    if (!container) return;

    const filteredEntries = getFilteredEntries();
    const visible = showAllPayments ? filteredEntries : filteredEntries.slice(0, 4);

    if (viewAllButton) {
        viewAllButton.textContent = showAllPayments ? "Show Less" : "View All";
        viewAllButton.hidden = filteredEntries.length <= 4;
    }

    if (!visible.length) {
        container.innerHTML = `
            <div class="empty-payments">
                <i class="bi bi-calendar2-check"></i>
                <strong>No payments found</strong>
                <span>Add a bill or debt for the selected period.</span>
            </div>
        `;
        return;
    }

    container.innerHTML = visible.map(entry => {
        const visual = getPaymentVisual(entry);
        const statusClass = entry.paid ? "paid" : entry.type === "debt" ? "debt" : "";
        const statusLabel = entry.paid ? "Paid" : capitalize(entry.type);

        return `
            <button class="payment-row" type="button" data-entry-id="${escapeHtml(entry.id)}">
                <span class="payment-icon" style="--payment-soft:${escapeHtml(visual.soft)}; --payment-accent:${escapeHtml(visual.accent)}">
                    <i class="bi ${escapeHtml(visual.icon)}"></i>
                </span>

                <span class="payment-main">
                    <h3>${escapeHtml(entry.name)}</h3>
                    <span>${escapeHtml(entry.provider || entry.category || "Payment")}</span>
                    <small class="payment-due-date">
                        <i class="bi bi-calendar3"></i>
                        Due ${escapeHtml(formatDate(entry.dueDate))}
                    </small>
                </span>

                <span class="payment-value">
                    <strong>${peso(entry.amount)}</strong>
                    <small class="payment-type-chip ${statusClass}">${escapeHtml(statusLabel)}</small>
                </span>

                <i class="bi bi-chevron-right payment-chevron"></i>
            </button>
        `;
    }).join("");

    container.querySelectorAll("[data-entry-id]").forEach(button => {
        button.addEventListener("click", () => handleEntryClick(button.dataset.entryId));
    });
}

function renderDebtOverview() {
    const debts = getPeriodEntries().filter(entry => entry.type === "debt");
    const paidBack = debts.filter(entry => entry.paid).reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
    const baseOwedToYou = 1600;
    const adjusted = Math.max(baseOwedToYou - paidBack, 0);

    setText("owedToYouAmount", peso(adjusted));
    setText("owedPeopleCount", adjusted > 0 ? "2" : "0");
}

function getPaymentVisual(entry) {
    const search = `${entry.name} ${entry.provider} ${entry.category}`.toLowerCase();

    if (entry.type === "debt") return PAYMENT_VISUALS.debt;
    if (search.includes("electric")) return PAYMENT_VISUALS.electric;
    if (search.includes("water")) return PAYMENT_VISUALS.water;
    if (search.includes("internet") || search.includes("wifi")) return PAYMENT_VISUALS.internet;
    if (search.includes("rent") || search.includes("housing")) return PAYMENT_VISUALS.housing;
    if (search.includes("health") || search.includes("medicine")) return PAYMENT_VISUALS.health;
    if (search.includes("school") || search.includes("education")) return PAYMENT_VISUALS.education;
    if (search.includes("subscription") || search.includes("mobile")) return PAYMENT_VISUALS.subscription;

    return PAYMENT_VISUALS.default;
}

async function handleEntryClick(id) {
    const entry = entries.find(
        item => item.id === id
    );

    if (!entry) {
        return;
    }

    const action = window.confirm(
        `${entry.name}\n` +
        `${peso(entry.amount)} due ` +
        `${formatDate(entry.dueDate)}\n\n` +
        `Press OK to mark this payment as ` +
        `${entry.paid ? "unpaid" : "paid"}.`
    );

    if (!action) {
        return;
    }

    entry.paid = !entry.paid;
    entry.updatedAt =
        new Date().toISOString();

    if (entry.paid) {
        cancelNativeReminder(entry.id);
        entry.nativeReminderScheduled = false;
    } else if (entry.reminder) {
        scheduleNativeReminder(entry);
        entry.nativeReminderScheduled = true;
    }

    await putEntry(entry);
    await loadEntries();
    renderAll();

    showToast(
        entry.paid
            ? "Payment marked as paid. Reminders were cancelled."
            : "Payment marked as unpaid. Reminders were restored."
    );
}

/* =========================================================
   Add Bill / Debt form
   ========================================================= */

function openAddPanel(type) {
    selectedEntryType = type;
    selectedFrequency = "monthly";
    resetForm();
    updateEntryTypeUI();
    updateFrequencyUI();

    const panel = document.getElementById("addBillDebtPanel");
    if (panel) {
        panel.hidden = false;
        panel.querySelector(".bill-panel-scroll")?.scrollTo({ top: 0, behavior: "instant" });
    }
}

function closeAddPanel() {
    const panel = document.getElementById("addBillDebtPanel");
    if (panel) panel.hidden = true;
}

function resetForm() {
    const form = document.getElementById("billDebtForm");
    form?.reset();
    setDefaultFormValues();
    document.getElementById("reminderToggle").checked = true;
    document.getElementById("sharedToggle").checked = false;
}

function setDefaultFormValues() {
    const dueDate = document.getElementById("entryDueDate");
    if (!dueDate) return;

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const value = toDateInputValue(tomorrow);

    dueDate.min = toDateInputValue(new Date());
    dueDate.value = value;
}

function updateEntryTypeUI() {
    document.querySelectorAll("[data-entry-type]").forEach(button => {
        button.classList.toggle("active", button.dataset.entryType === selectedEntryType);
    });

    const isDebt = selectedEntryType === "debt";
    setText("entryNameLegend", isDebt ? "Debt Name" : "Bill Name");
    setText("providerLegend", isDebt ? "Lender / Payee" : "Provider / Payee");
    setText("saveEntryButton", isDebt ? "Save Debt" : "Save Bill");

    const nameInput = document.getElementById("entryName");
    const providerInput = document.getElementById("entryProvider");
    const categorySelect = document.getElementById("entryCategory");

    if (nameInput) nameInput.placeholder = isDebt ? "e.g., Loan from Maria" : "e.g., Electric Bill";
    if (providerInput) providerInput.placeholder = isDebt ? "e.g., Maria Santos" : "e.g., Meralco";
    if (categorySelect && !categorySelect.value) categorySelect.value = isDebt ? "Loan" : "Utilities";
}

function updateFrequencyUI() {
    document.querySelectorAll("[data-frequency]").forEach(button => {
        button.classList.toggle("active", button.dataset.frequency === selectedFrequency);
    });
}

async function saveEntry(event) {
    event.preventDefault();

    const formData = collectFormData();

    if (!formData) {
        return;
    }

    const saveButton =
        document.getElementById("saveEntryButton");

    if (saveButton) {
        saveButton.disabled = true;
        saveButton.textContent = "Saving...";
    }

    const entry = {
        id: createId("payment"),
        familyCode: currentFamily.familyCode,
        type: selectedEntryType,
        name: formData.name,
        provider: formData.provider,
        amount: formData.amount,
        dueDate: formData.dueDate,
        category: formData.category,
        frequency: selectedFrequency,
        reminder: formData.reminder,
        shared: formData.shared,
        notes: formData.notes,
        paid: false,
        createdBy: currentUser.id,
        createdAt: new Date().toISOString(),
        calendarStatus: "pending"
    };

    try {
        /*
         * Save locally before opening Calendar.
         */
        await putEntry(entry);

        const nativeResult =
            sendEntryToAndroid(entry);

        if (nativeResult.ok) {
            entry.calendarStatus =
                "calendar-review";

            entry.nativeReminderScheduled =
                Boolean(entry.reminder);

            entry.calendarRequestedAt =
                new Date().toISOString();

            showToast(
                entry.reminder
                    ? "Saved. Review the Calendar event and allow notifications."
                    : "Saved. Review the Calendar event and tap Save."
            );
        } else {
            entry.calendarStatus = "local-only";
            entry.nativeReminderScheduled = false;
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
            saveButton.disabled = false;
            saveButton.textContent =
                selectedEntryType === "debt"
                    ? "Save Debt"
                    : "Save Bill";
        }
    }
}

function sendEntryToAndroid(entry) {
    const bridge = window.KabalikatAndroid;

    if (
        !bridge ||
        typeof bridge.addBill !== "function"
    ) {
        return {
            ok: false,
            message:
                "Android Calendar bridge is unavailable."
        };
    }

    try {
        const result = bridge.addBill(
            JSON.stringify({
                id: entry.id,
                type: entry.type,
                name: entry.name,
                provider: entry.provider,
                amount: Number(entry.amount || 0),
                dueDate: entry.dueDate,
                category: entry.category,
                frequency: entry.frequency,
                reminder: Boolean(entry.reminder),
                shared: Boolean(entry.shared),
                notes: entry.notes || ""
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
            message: String(
                error?.message || error
            )
        };
    }
}

function scheduleNativeReminder(entry) {
    const bridge = window.KabalikatAndroid;

    if (
        !bridge ||
        typeof bridge.scheduleBillReminders !==
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
                amount: Number(entry.amount || 0),
                dueDate: entry.dueDate,
                frequency: entry.frequency
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
    const bridge = window.KabalikatAndroid;

    if (
        !bridge ||
        typeof bridge.cancelBillReminders !==
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

function collectFormData() {
    const name = document.getElementById("entryName")?.value.trim() || "";
    const provider = document.getElementById("entryProvider")?.value.trim() || "";
    const amount = Number(document.getElementById("entryAmount")?.value || 0);
    const dueDate = document.getElementById("entryDueDate")?.value || "";
    const category = document.getElementById("entryCategory")?.value || "";
    const notes = document.getElementById("entryNotes")?.value.trim() || "";
    const reminder = Boolean(document.getElementById("reminderToggle")?.checked);
    const shared = Boolean(document.getElementById("sharedToggle")?.checked);

    if (!name || !provider || !(amount > 0) || !dueDate || !category) {
        showToast("Complete all required fields.");
        return null;
    }

    return { name, provider, amount, dueDate, category, notes, reminder, shared };
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
            typeof window.KabalikatAndroid.addBill ===
                "function"
        );

    if (bridgeAvailable) {
        noteText.textContent =
            "Saving opens your Calendar app and schedules reminders 5 days, 3 days, 1 day, and on the due date.";

        note.classList.remove("warning");
    } else {
        noteText.textContent =
            "Calendar and notification reminders are available when running inside the Android app.";

        note.classList.remove("warning");
    }
}

/* =========================================================
   Helpers
   ========================================================= */

function parseLocalDate(value) {
    const [year, month, day] = String(value || "").split("-").map(Number);
    return new Date(year, month - 1, day);
}

function formatDate(value) {
    const date = parseLocalDate(value);
    if (Number.isNaN(date.getTime())) return "Unknown date";

    return date.toLocaleDateString("en-PH", {
        month: "short",
        day: "numeric",
        year: "numeric"
    });
}

function toDateInputValue(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function createId(prefix) {
    if (window.crypto?.randomUUID) {
        return `${prefix}-${crypto.randomUUID()}`;
    }

    return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function formatFrequency(value) {
    if (value === "one-time") return "One-time";
    return capitalize(value);
}

function capitalize(value) {
    const text = String(value || "");
    return text.charAt(0).toUpperCase() + text.slice(1);
}

function peso(value) {
    return `₱${Number(value || 0).toLocaleString("en-PH", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    })}`;
}

function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
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
    const toast = document.getElementById("billToast");
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("show");

    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => {
        toast.classList.remove("show");
    }, 3200);
}
