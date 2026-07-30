const SAVINGS_STATE_KEY =
    "kabalikat_savings_overview_state";

const THIRTEENTH_MONTH_STATE_KEY =
    "kabalikat_13th_month_state";

const DEFAULT_SAVINGS_STATE = {
    totalSavings: 32560,
    emergencyFund: 12000,
    monthlyExcess: 2350,
    activities: [
        {
            date: "JUL 20",
            title: "Monthly Excess Added",
            subtitle: "From Budget Allocation",
            amount: "+₱2,350",
            type: "income"
        },
        {
            date: "JUL 18",
            title: "13th Month Pay Added",
            subtitle: "Moved to Savings",
            amount: "+₱8,000",
            type: "income"
        },
        {
            date: "JUL 15",
            title: "Christmas Fund",
            subtitle: "Goal Allocation",
            amount: "-₱1,500",
            type: "expense"
        }
    ]
};

const DEFAULT_THIRTEENTH_MONTH_STATE = {
    received: false,
    amount: 0,
    savings: 0,
    goals: 0,
    expenses: 0
};

const DEFAULT_SAVINGS_GOALS = [
    {
        id: 1,
        name: "Christmas Fund",
        saved: 3200,
        target: 6000,
        icon: "bi-tree",
        style: "green"
    },
    {
        id: 2,
        name: "School Opening",
        saved: 1850,
        target: 4000,
        icon: "bi-mortarboard",
        style: "purple"
    }
];

const GOAL_TYPES = {
    Holiday: {
        icon: "bi-gift",
        soft: "#FFF1E8",
        accent: "#C96E4B",
        style: "green"
    },
    Education: {
        icon: "bi-book",
        soft: "#FBE5D8",
        accent: "#C96E4B",
        style: "purple"
    },
    Home: {
        icon: "bi-house-door",
        soft: "#F6E1EC",
        accent: "#B35A82",
        style: "peach"
    },
    Vacation: {
        icon: "bi-airplane",
        soft: "#EAF3F8",
        accent: "#4F7F99",
        style: "blue"
    },
    Emergency: {
        icon: "bi-shield-check",
        soft: "#EEF6F0",
        accent: "#5E7868",
        style: "green"
    },
    Custom: {
        icon: "bi-plus-lg",
        soft: "#F1EDFF",
        accent: "#8057D8",
        style: "purple"
    }
};


const GOAL_STYLE_PALETTES = {
    green: {
        card: "#EEF6F0",
        icon: "#D9EBDD",
        accent: "#5E8F6C",
        button: "#BFD9C6"
    },
    purple: {
        card: "#F5ECF6",
        icon: "#E7D4EA",
        accent: "#A05AA0",
        button: "#D3B5D8"
    },
    lavender: {
        card: "#F1EDFF",
        icon: "#E2DBF4",
        accent: "#75639B",
        button: "#CBC2E2"
    },
    blue: {
        card: "#EAF3F8",
        icon: "#D6E7F0",
        accent: "#50849F",
        button: "#BDD6E2"
    },
    peach: {
        card: "#FFF1E8",
        icon: "#F8D8C6",
        accent: "#C96E4B",
        button: "#F0C1A8"
    }
};


const savingsData = {
    ...readStoredJson(
        SAVINGS_STATE_KEY,
        DEFAULT_SAVINGS_STATE
    ),
    goals: [...DEFAULT_SAVINGS_GOALS]
};

let selectedGoalType = "Holiday";

function navigate(page) {
    window.location.href = page;
}

function readStoredJson(key, fallback) {
    try {
        const parsed = JSON.parse(
            localStorage.getItem(key) || "null"
        );

        return parsed &&
        typeof parsed === "object"
            ? {
                ...fallback,
                ...parsed
            }
            : {
                ...fallback
            };
    } catch (error) {
        return {
            ...fallback
        };
    }
}

function saveSavingsState() {
    localStorage.setItem(
        SAVINGS_STATE_KEY,
        JSON.stringify({
            totalSavings:
                savingsData.totalSavings,
            emergencyFund:
                savingsData.emergencyFund,
            monthlyExcess:
                savingsData.monthlyExcess,
            activities:
                savingsData.activities
        })
    );
}

function readStoredGoals() {
    try {
        const stored = JSON.parse(
            localStorage.getItem(
                "kabalikatGoals"
            ) ||
            "[]"
        );

        return Array.isArray(stored)
            ? stored
            : [];
    } catch (error) {
        return [];
    }
}

function loadStoredGoals() {
    const storedGoals =
        readStoredGoals();

    const existingIds =
        new Set(
            savingsData.goals.map(
                goal=>String(goal.id)
            )
        );

    storedGoals.forEach(goal=>{
        if(
            existingIds.has(
                String(goal.id)
            )
        ){
            return;
        }

        savingsData.goals.push({
            id:
                goal.id ||
                Date.now(),
            name:
                goal.name ||
                "Savings Goal",
            saved:
                Number(goal.saved || 0),
            target:
                Number(goal.target || 0),
            icon:
                goal.icon ||
                getGoalIcon(goal.category),
            style:
                goal.style ||
                getGoalStyle(goal.category)
        });
    });
}

function getGoalIcon(category) {
    const value =
        String(category || "")
            .toLowerCase();

    if(value.includes("holiday")){
        return "bi-gift";
    }

    if(value.includes("education")){
        return "bi-book";
    }

    if(value.includes("home")){
        return "bi-house-door";
    }

    if(value.includes("vacation")){
        return "bi-airplane";
    }

    if(value.includes("emergency")){
        return "bi-shield-check";
    }

    return "bi-bullseye";
}

function getGoalStyle(category) {
    const value =
        String(category || "")
            .toLowerCase();

    if(value.includes("vacation")){
        return "blue";
    }

    if(value.includes("home")){
        return "peach";
    }

    if(value.includes("holiday") ||
    value.includes("emergency")){
        return "green";
    }

    return "purple";
}

function renderOverview() {
    setText(
        "totalSavings",
        peso(
            savingsData.totalSavings
        )
    );

    setText(
        "emergencyFund",
        peso(
            savingsData.emergencyFund
        )
    );

    setText(
        "monthlyExcess",
        `+${peso(
            savingsData.monthlyExcess
        )} saved this month`
    );

    setText(
        "goalCount",
        `${savingsData.goals.length} ${
            savingsData.goals.length === 1
                ? "Goal"
                : "Goals"
        }`
    );
}

function readThirteenthMonthState() {
    try {
        const parsed =
            JSON.parse(
                sessionStorage.getItem(
                    THIRTEENTH_MONTH_STATE_KEY
                ) ||
                "null"
            );

        return parsed &&
        typeof parsed ===
        "object"
            ? {
                ...DEFAULT_THIRTEENTH_MONTH_STATE,
                ...parsed
            }
            : {
                ...DEFAULT_THIRTEENTH_MONTH_STATE
            };
    } catch (error) {
        return {
            ...DEFAULT_THIRTEENTH_MONTH_STATE
        };
    }
}


function resetThirteenthMonthStateOnReload() {
    const navigationEntry =
        performance
            .getEntriesByType(
                "navigation"
            )
            [0];

    if(
        navigationEntry
            ?.type ===
        "reload"
    ){
        sessionStorage.removeItem(
            THIRTEENTH_MONTH_STATE_KEY
        );
    }
}


function renderThirteenthMonthOverview() {
    const state =
        readThirteenthMonthState();

    const card =
        document.getElementById(
            "thirteenthMonthCard"
        );

    const action =
        document.getElementById(
            "thirteenthActionButton"
        );

    card?.classList.toggle(
        "not-received",
        !state.received
    );

    if(!state.received){
        setText(
            "thirteenthDashboardDescription",
            "Record it once your year-end pay arrives"
        );

        setText(
            "thirteenthPrimaryLabel",
            "Status"
        );

        setText(
            "thirteenthReceivedAmount",
            "Not Yet Received"
        );

        setText(
            "thirteenthSavingsAmount",
            "—"
        );

        if(action){
            action.textContent =
                "Mark as Received";
        }

        return;
    }

    setText(
        "thirteenthDashboardDescription",
        "Manage your bonus income"
    );

    setText(
        "thirteenthPrimaryLabel",
        "Received"
    );

    setText(
        "thirteenthReceivedAmount",
        peso(state.amount)
    );

    setText(
        "thirteenthSavingsAmount",
        peso(state.savings)
    );

    if(action){
        action.textContent =
            "View Allocation";
    }
}

function handleThirteenthMonthAction() {
    const state =
        readThirteenthMonthState();

    if(!state.received){
        state.received = true;

        sessionStorage.setItem(
            THIRTEENTH_MONTH_STATE_KEY,
            JSON.stringify(state)
        );
    }

    navigate(
        "13th-month.html"
    );
}

function getGoalPalette(style) {
    return (
        GOAL_STYLE_PALETTES[
            String(
                style ||
                "purple"
            )
        ] ||
        GOAL_STYLE_PALETTES.purple
    );
}


function renderGoalCollection(
    container,
    goals
) {
    if(!container){
        return;
    }

    container.innerHTML = "";

    goals.forEach(goal=>{
        const target =
            Number(goal.target || 0);

        const saved =
            Number(goal.saved || 0);

        const progress =
            target > 0
                ? Math.min(
                    Math.round(
                        (
                            saved /
                            target
                        ) *
                        100
                    ),
                    100
                )
                : 0;

        const palette =
            getGoalPalette(
                goal.style
            );

        container.insertAdjacentHTML(
            "beforeend",
            `
            <article
                class="goal-card"
                style="
                    --goal-card:${
                        escapeHtml(
                            palette.card
                        )
                    };
                    --goal-icon-panel:${
                        escapeHtml(
                            palette.icon
                        )
                    };
                    --goal-accent:${
                        escapeHtml(
                            palette.accent
                        )
                    };
                    --goal-button:${
                        escapeHtml(
                            palette.button
                        )
                    }
                "
            >
                <div class="goal-top">
                    <div class="goal-icon ${
                        escapeHtml(
                            goal.style ||
                            "purple"
                        )
                    }">
                        <i class="bi ${
                            escapeHtml(
                                goal.icon ||
                                "bi-bullseye"
                            )
                        }"></i>
                    </div>

                    <div class="goal-name">
                        <strong>
                            ${escapeHtml(goal.name)}
                        </strong>

                        <span>
                            ${peso(saved)}
                            /
                            ${peso(target)}
                        </span>
                    </div>

                    <strong class="goal-percent">
                        ${progress}%
                    </strong>
                </div>

                <div
                    class="progress"
                    aria-label="${progress}% complete"
                >
                    <span style="width:${progress}%"></span>
                </div>

                <button
                    type="button"
                    data-add-money="${escapeHtml(goal.id)}"
                >
                    + Add Money
                </button>
            </article>
            `
        );
    });

    container
        .querySelectorAll(
            "[data-add-money]"
        )
        .forEach(button=>{
            button.addEventListener(
                "click",
                ()=>{
                    addMoney(
                        button.dataset.addMoney
                    );
                }
            );
        });
}


function renderGoals() {
    renderGoalCollection(
        document.getElementById(
            "goal-container"
        ),
        savingsData.goals.slice(
            0,
            2
        )
    );

    renderGoalCollection(
        document.getElementById(
            "allGoalsContainer"
        ),
        savingsData.goals
    );
}


function addMoney(id) {
    const enteredAmount =
        window.prompt(
            "Enter amount to add:"
        );

    const amount =
        Number(enteredAmount);

    if(
        !amount ||
        amount <= 0
    ){
        return;
    }

    const goal =
        savingsData.goals.find(
            item=>
                String(item.id) ===
                String(id)
        );

    if(!goal){
        return;
    }

    goal.saved =
        Number(goal.saved || 0) +
        amount;

    savingsData.activities.unshift({
        date:
            "TODAY",
        title:
            `Added to ${goal.name}`,
        subtitle:
            "Goal contribution",
        amount:
            `+${peso(amount)}`,
        type:
            "income"
    });

    updateStoredGoal(goal);
    saveSavingsState();
    renderOverview();
    renderGoals();
    renderActivity();

    showSavingsToast(
        `${peso(amount)} added to ${goal.name}.`
    );
}

function updateStoredGoal(updatedGoal) {
    const storedGoals =
        readStoredGoals();

    const index =
        storedGoals.findIndex(
            goal=>
                String(goal.id) ===
                String(updatedGoal.id)
        );

    if(index < 0){
        return;
    }

    storedGoals[index] = {
        ...storedGoals[index],
        saved:
            updatedGoal.saved
    };

    localStorage.setItem(
        "kabalikatGoals",
        JSON.stringify(
            storedGoals
        )
    );
}

function getSavingsActivityMeta(item) {
    const text =
        `${
            item?.title ||
            ""
        } ${
            item?.subtitle ||
            ""
        }`
        .toLowerCase();

    if(
        text.includes(
            "13th month"
        )
    ){
        return {
            icon:
                "bi-gift",
            soft:
                "#FBE5D8"
        };
    }

    if(
        text.includes(
            "emergency"
        )
    ){
        return {
            icon:
                "bi-shield-check",
            soft:
                "#E5F1E8"
        };
    }

    if(
        text.includes(
            "goal"
        ) ||
        text.includes(
            "christmas"
        ) ||
        text.includes(
            "school"
        )
    ){
        return {
            icon:
                "bi-bullseye",
            soft:
                "#F0E0F2"
        };
    }

    if(
        text.includes(
            "monthly excess"
        ) ||
        text.includes(
            "budget allocation"
        )
    ){
        return {
            icon:
                "bi-wallet2",
            soft:
                "#E0EEF4"
        };
    }

    return {
        icon:
            "bi-piggy-bank-fill",
        soft:
            "#E5F1E8"
    };
}


function formatSavingsActivityDate(
    value
) {
    const text =
        String(
            value ||
            ""
        )
        .trim();

    if(
        !text
    ){
        return "Date unavailable";
    }

    if(
        text.toUpperCase() ===
        "TODAY"
    ){
        return "Today";
    }

    if(
        text.toUpperCase() ===
        "YESTERDAY"
    ){
        return "Yesterday";
    }

    if(
        /^\d{4}-\d{2}-\d{2}$/.test(
            text
        )
    ){
        const date =
            new Date(
                `${text}T00:00:00`
            );

        if(
            !Number.isNaN(
                date.getTime()
            )
        ){
            return date
                .toLocaleDateString(
                    "en-PH",
                    {
                        month:
                            "long",
                        day:
                            "numeric",
                        year:
                            "numeric"
                    }
                );
        }
    }

    return text;
}


function renderSavingsActivityRow(
    item
) {
    const meta =
        getSavingsActivityMeta(
            item
        );

    const amountClass =
        item.type ===
        "expense"
            ? "expense"
            : "income";

    return `
        <article class="dated-history-row">
            <span
                class="dated-history-icon"
                style="background:${
                    escapeHtml(meta.soft)
                }"
            >
                <i class="bi ${
                    escapeHtml(meta.icon)
                }"></i>
            </span>

            <div class="dated-history-copy">
                <h4>
                    ${escapeHtml(item.title)}
                </h4>

                <p>
                    ${escapeHtml(item.subtitle)}
                    <b>|</b>
                    Savings
                </p>
            </div>

            <strong
                class="dated-history-amount ${amountClass}"
            >
                ${escapeHtml(item.amount)}
            </strong>
        </article>
    `;
}


function renderActivity() {
    const container =
        document.getElementById(
            "activity-container"
        );

    if(!container){
        return;
    }

    if(
        !savingsData.activities.length
    ){
        container.innerHTML =
            '<p class="empty-state">No savings activity yet.</p>';

        return;
    }

    const grouped =
        new Map();

    savingsData.activities
        .forEach(item=>{
            const date =
                formatSavingsActivityDate(
                    item.date
                );

            if(
                !grouped.has(date)
            ){
                grouped.set(
                    date,
                    []
                );
            }

            grouped
                .get(date)
                .push(item);
        });

    container.innerHTML =
        [...grouped.entries()]
        .map(
            ([date,items])=>`
                <section class="dated-history-group">
                    <div class="dated-history-date">
                        ${escapeHtml(date)}
                    </div>

                    <div class="dated-history-rows">
                        ${
                            items
                                .map(
                                    renderSavingsActivityRow
                                )
                                .join("")
                        }
                    </div>
                </section>
            `
        )
        .join("");
}


function renderAddGoalTypes() {
    const picker =
        document.getElementById(
            "addGoalTypePicker"
        );

    if(!picker){
        return;
    }

    picker.innerHTML =
        Object.entries(
            GOAL_TYPES
        )
        .map(
            ([type,meta])=>{
                const active =
                    type ===
                    selectedGoalType
                        ? "active"
                        : "";

                return `
                    <button
                        class="add-category-option ${active}"
                        type="button"
                        data-goal-type="${
                            escapeHtml(type)
                        }"
                        style="
                            --category-soft:${
                                escapeHtml(meta.soft)
                            };
                            --category-accent:${
                                escapeHtml(meta.accent)
                            }
                        "
                    >
                        <i class="bi ${
                            escapeHtml(meta.icon)
                        }"></i>

                        <span>
                            ${escapeHtml(type)}
                        </span>
                    </button>
                `;
            }
        )
        .join("");

    picker
        .querySelectorAll(
            "[data-goal-type]"
        )
        .forEach(button=>{
            button.addEventListener(
                "click",
                ()=>{
                    selectedGoalType =
                        button.dataset.goalType ||
                        "Holiday";

                    renderAddGoalTypes();
                    syncCustomGoalTypeField();
                }
            );
        });
}

function syncCustomGoalTypeField() {
    const field =
        document.getElementById(
            "customGoalTypeField"
        );

    if(!field){
        return;
    }

    field.hidden =
        selectedGoalType !==
        "Custom";

    if(field.hidden){
        document
            .getElementById(
                "customGoalType"
            )
            .value = "";
    }
}

function openPanel(id) {
    const panel =
        document.getElementById(id);

    if(!panel){
        return;
    }

    panel.hidden = false;
    panel.scrollTop = 0;
}

function closePanel(panel) {
    if(panel){
        panel.hidden = true;
    }
}

function openAllGoalsPanel() {
    renderGoals();

    openPanel(
        "allGoalsPanel"
    );
}


function openAddGoalPanel() {
    selectedGoalType =
        "Holiday";

    renderAddGoalTypes();
    syncCustomGoalTypeField();
    openPanel(
        "addGoalPanel"
    );
}

function resetAddGoalForm() {
    document
        .getElementById(
            "addGoalForm"
        )
        ?.reset();

    selectedGoalType =
        "Holiday";

    renderAddGoalTypes();
    syncCustomGoalTypeField();
}

function saveGoal(event) {
    event?.preventDefault();

    const name =
        document
            .getElementById(
                "newGoalName"
            )
            .value
            .trim();

    const target =
        Number(
            document
                .getElementById(
                    "newGoalTarget"
                )
                .value
        );

    const initial =
        Number(
            document
                .getElementById(
                    "newGoalInitial"
                )
                .value
        ) ||
        0;

    const targetDate =
        document
            .getElementById(
                "newGoalDate"
            )
            .value;

    const notes =
        document
            .getElementById(
                "newGoalNotes"
            )
            .value
            .trim();

    let category =
        selectedGoalType;

    if(
        selectedGoalType ===
        "Custom"
    ){
        category =
            document
                .getElementById(
                    "customGoalType"
                )
                .value
                .trim();

        if(!category){
            showSavingsToast(
                "Enter a custom goal type."
            );
            return;
        }
    }

    if(
        !name ||
        !target ||
        target <= 0
    ){
        showSavingsToast(
            "Complete the required fields."
        );
        return;
    }

    if(initial < 0){
        showSavingsToast(
            "Initial savings cannot be negative."
        );
        return;
    }

    if(initial > target){
        showSavingsToast(
            "Initial savings cannot exceed the target amount."
        );
        return;
    }

    const meta =
        GOAL_TYPES[
            selectedGoalType
        ] ||
        GOAL_TYPES.Custom;

    const goals =
        readStoredGoals();

    const newGoal = {
        id:
            Date.now(),
        name,
        category,
        target,
        saved:
            initial,
        targetDate,
        notes,
        icon:
            meta.icon,
        style:
            meta.style,
        createdAt:
            new Date()
                .toISOString()
    };

    goals.push(newGoal);

    localStorage.setItem(
        "kabalikatGoals",
        JSON.stringify(goals)
    );

    savingsData.goals.push({
        id:
            newGoal.id,
        name:
            newGoal.name,
        saved:
            newGoal.saved,
        target:
            newGoal.target,
        icon:
            newGoal.icon,
        style:
            newGoal.style
    });

    resetAddGoalForm();
    closePanel(
        document.getElementById(
            "addGoalPanel"
        )
    );

    renderOverview();
    renderGoals();

    showSaveSuccess(
        "Goal Created",
        "Your savings goal has been saved successfully."
    );
}

function renderSavingsDestinations() {
    const select =
        document.getElementById(
            "newSavingsDestination"
        );

    if(!select){
        return;
    }

    const fixedOptions = `
        <option value="general">
            General Savings
        </option>

        <option value="emergency">
            Emergency Fund
        </option>
    `;

    const goalOptions =
        savingsData.goals
            .map(
                goal=>`
                    <option value="goal:${
                        escapeHtml(goal.id)
                    }">
                        ${escapeHtml(goal.name)}
                    </option>
                `
            )
            .join("");

    select.innerHTML =
        fixedOptions +
        goalOptions;
}

function openAddSavingsPanel() {
    renderSavingsDestinations();

    const dateInput =
        document.getElementById(
            "newSavingsDate"
        );

    if(dateInput){
        dateInput.value =
            new Date()
                .toISOString()
                .slice(0,10);
    }

    openPanel(
        "addSavingsPanel"
    );
}

function saveNewSavings(event) {
    event?.preventDefault();

    const amount =
        Number(
            document
                .getElementById(
                    "newSavingsAmount"
                )
                .value
        );

    const destination =
        document
            .getElementById(
                "newSavingsDestination"
            )
            .value;

    const source =
        document
            .getElementById(
                "newSavingsSource"
            )
            .value;

    const date =
        document
            .getElementById(
                "newSavingsDate"
            )
            .value;

    if(
        !amount ||
        amount <= 0 ||
        !date
    ){
        showSavingsToast(
            "Complete the required fields."
        );
        return;
    }

    savingsData.totalSavings +=
        amount;

    let destinationLabel =
        "General Savings";

    if(
        destination ===
        "emergency"
    ){
        savingsData.emergencyFund +=
            amount;

        destinationLabel =
            "Emergency Fund";
    }

    if(
        destination.startsWith(
            "goal:"
        )
    ){
        const goalId =
            destination.slice(5);

        const goal =
            savingsData.goals.find(
                item=>
                    String(item.id) ===
                    String(goalId)
            );

        if(goal){
            goal.saved =
                Number(goal.saved || 0) +
                amount;

            updateStoredGoal(goal);

            destinationLabel =
                goal.name;
        }
    }

    savingsData.activities.unshift({
        date:
            formatActivityDate(date),
        title:
            `Added to ${destinationLabel}`,
        subtitle:
            source,
        amount:
            `+${peso(amount)}`,
        type:
            "income"
    });

    saveSavingsState();

    document
        .getElementById(
            "addSavingsForm"
        )
        ?.reset();

    closePanel(
        document.getElementById(
            "addSavingsPanel"
        )
    );

    renderOverview();
    renderGoals();
    renderActivity();

    showSaveSuccess(
        "Savings Added",
        "Your savings entry has been recorded successfully."
    );
}

function formatActivityDate(dateValue) {
    const date =
        new Date(
            `${dateValue}T00:00:00`
        );

    if(
        Number.isNaN(
            date.getTime()
        )
    ){
        return "TODAY";
    }

    return date
        .toLocaleDateString(
            "en-US",
            {
                month:
                    "short",
                day:
                    "numeric"
            }
        )
        .toUpperCase();
}

function showSaveSuccess(
    title,
    message
) {
    const overlay =
        document.getElementById(
            "savingsSuccessOverlay"
        );

    if(!overlay){
        showSavingsToast(title);
        return;
    }

    setText(
        "savingsSuccessTitle",
        title
    );

    setText(
        "savingsSuccessMessage",
        message
    );

    overlay.hidden = false;
    overlay.classList.remove(
        "show"
    );

    void overlay.offsetWidth;

    overlay.classList.add(
        "show"
    );

    window.setTimeout(
        ()=>{
            overlay.classList.remove(
                "show"
            );

            window.setTimeout(
                ()=>{
                    overlay.hidden =
                        true;
                },
                260
            );
        },
        1700
    );
}

function showSavingsToast(message) {
    const toast =
        document.getElementById(
            "savingsToast"
        );

    toast.textContent =
        message;

    toast.classList.add(
        "show"
    );

    window.clearTimeout(
        showSavingsToast.timeout
    );

    showSavingsToast.timeout =
        window.setTimeout(
            ()=>{
                toast.classList.remove(
                    "show"
                );
            },
            2200
        );
}

function bindBottomNavigation() {
    const destinations = {
        navHome:
            "home.html",
        navExpenses:
            "expenses.html",
        navScan:
            "scanner.html",
        navBills:
            "bills.html",
        navSavings:
            "savings.html"
    };

    Object.entries(
        destinations
    )
    .forEach(
        ([id,page])=>{
            document
                .getElementById(id)
                ?.addEventListener(
                    "click",
                    ()=>{
                        navigate(page);
                    }
                );
        }
    );
}

function setText(id,text) {
    const element =
        document.getElementById(id);

    if(element){
        element.textContent =
            text;
    }
}

function peso(value) {
    const amount =
        Number(value || 0);

    return `₱${
        amount.toLocaleString(
            "en-US"
        )
    }`;
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

document.addEventListener(
    "DOMContentLoaded",
    ()=>{
        loadStoredGoals();
        bindBottomNavigation();

        document
            .getElementById(
                "openAddGoal"
            )
            ?.addEventListener(
                "click",
                openAddGoalPanel
            );

        document
            .getElementById(
                "viewAllGoals"
            )
            ?.addEventListener(
                "click",
                openAllGoalsPanel
            );

        document
            .getElementById(
                "addGoalFromAllGoals"
            )
            ?.addEventListener(
                "click",
                ()=>{
                    closePanel(
                        document.getElementById(
                            "allGoalsPanel"
                        )
                    );

                    openAddGoalPanel();
                }
            );

        document
            .getElementById(
                "openAddSavings"
            )
            ?.addEventListener(
                "click",
                openAddSavingsPanel
            );

        document
            .getElementById(
                "openBudgetCalculator"
            )
            ?.addEventListener(
                "click",
                ()=>{
                    navigate(
                        "budget-calculator.html"
                    );
                }
            );

        document
            .getElementById(
                "thirteenthActionButton"
            )
            ?.addEventListener(
                "click",
                handleThirteenthMonthAction
            );

        document
            .querySelectorAll(
                ".full-panel [data-close-panel]"
            )
            .forEach(button=>{
                button.addEventListener(
                    "click",
                    ()=>{
                        closePanel(
                            button.closest(
                                ".full-panel"
                            )
                        );
                    }
                );
            });

        document
            .getElementById(
                "saveGoalTop"
            )
            ?.addEventListener(
                "click",
                ()=>{
                    document
                        .getElementById(
                            "addGoalForm"
                        )
                        ?.requestSubmit();
                }
            );

        document
            .getElementById(
                "saveSavingsTop"
            )
            ?.addEventListener(
                "click",
                ()=>{
                    document
                        .getElementById(
                            "addSavingsForm"
                        )
                        ?.requestSubmit();
                }
            );

        document
            .getElementById(
                "addGoalForm"
            )
            ?.addEventListener(
                "submit",
                saveGoal
            );

        document
            .getElementById(
                "addSavingsForm"
            )
            ?.addEventListener(
                "submit",
                saveNewSavings
            );

        document
            .querySelectorAll(
                "[data-navigate]"
            )
            .forEach(button=>{
                button.addEventListener(
                    "click",
                    ()=>{
                        navigate(
                            button.dataset.navigate
                        );
                    }
                );
            });

        renderAddGoalTypes();
        syncCustomGoalTypeField();
        renderOverview();
        resetThirteenthMonthStateOnReload();
        renderThirteenthMonthOverview();
        renderGoals();
        renderActivity();
    }
);
