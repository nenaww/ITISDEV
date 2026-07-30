const THIRTEENTH_MONTH_STATE_KEY =
    "kabalikat_13th_month_state";

const DEFAULT_THIRTEENTH_MONTH_STATE = {
    received: false,
    amount: 0,
    savings: 0,
    goals: 0,
    expenses: 0
};

let thirteenthState =
    readStoredState();

function readStoredState() {
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

function initializePage() {
    /*
       The received/not-received choice now belongs to the
       Savings overview. Direct access before it is marked
       received returns to that overview.
    */
    if(!thirteenthState.received){
        window.location.replace(
            "savings.html"
        );
        return;
    }

    setInputValue(
        "amountInput",
        thirteenthState.amount
    );

    setInputValue(
        "savingInput",
        thirteenthState.savings
    );

    setInputValue(
        "goalInput",
        thirteenthState.goals
    );

    setInputValue(
        "expenseInput",
        thirteenthState.expenses
    );

    bindBottomNavigation();
    bindPageEvents();
    calculate();
}

function bindPageEvents() {
    document
        .getElementById(
            "pageBackButton"
        )
        ?.addEventListener(
            "click",
            ()=>{
                window.location.href =
                    "savings.html";
            }
        );

    [
        "amountInput",
        "savingInput",
        "goalInput",
        "expenseInput"
    ]
    .forEach(id=>{
        document
            .getElementById(id)
            ?.addEventListener(
                "input",
                calculate
            );
    });

    document
        .getElementById(
            "reviewAllocation"
        )
        ?.addEventListener(
            "click",
            saveAllocation
        );
}

function calculate() {
    const amount =
        readAmount(
            "amountInput"
        );

    const savings =
        readAmount(
            "savingInput"
        );

    const goals =
        readAmount(
            "goalInput"
        );

    const expenses =
        readAmount(
            "expenseInput"
        );

    const allocated =
        savings +
        goals +
        expenses;

    const remaining =
        amount -
        allocated;

    setText(
        "displayAmount",
        peso(amount)
    );

    setText(
        "allocated",
        peso(allocated)
    );

    setText(
        "remaining",
        peso(remaining)
    );

    updateStatus(
        remaining
    );

    return {
        amount,
        savings,
        goals,
        expenses,
        allocated,
        remaining
    };
}

function updateStatus(remaining) {
    const badge =
        document.getElementById(
            "statusBadge"
        );

    if(!badge){
        return;
    }

    if(remaining > 0){
        badge.textContent =
            "Extra Funds Available";

        badge.style.color =
            "#4F7F99";
        return;
    }

    if(remaining === 0){
        badge.textContent =
            "Balanced";

        badge.style.color =
            "#5E7868";
        return;
    }

    if(
        Math.abs(remaining) <=
        1000
    ){
        badge.textContent =
            "Needs Adjustment";

        badge.style.color =
            "#C96E4B";
        return;
    }

    badge.textContent =
        "Overallocated";

    badge.style.color =
        "#B84747";
}

function saveAllocation() {
    const snapshot =
        calculate();

    if(
        !snapshot.amount ||
        snapshot.amount <= 0
    ){
        showToast(
            "Enter the amount received."
        );
        return;
    }

    if(snapshot.remaining < 0){
        showToast(
            "Your allocation exceeds the amount received."
        );
        return;
    }

    thirteenthState = {
        received: true,
        amount:
            snapshot.amount,
        savings:
            snapshot.savings,
        goals:
            snapshot.goals,
        expenses:
            snapshot.expenses
    };

    sessionStorage.setItem(
        THIRTEENTH_MONTH_STATE_KEY,
        JSON.stringify(
            thirteenthState
        )
    );

    showSaveSuccess();
}

function showSaveSuccess() {
    const overlay =
        document.getElementById(
            "thirteenthSuccessOverlay"
        );

    if(!overlay){
        showToast(
            "Allocation saved."
        );
        return;
    }

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

                    window.location.href =
                        "savings.html";
                },
                260
            );
        },
        1700
    );
}

function showToast(message) {
    const toast =
        document.getElementById(
            "thirteenthToast"
        );

    toast.textContent =
        message;

    toast.classList.add(
        "show"
    );

    window.clearTimeout(
        showToast.timeout
    );

    showToast.timeout =
        window.setTimeout(
            ()=>{
                toast.classList.remove(
                    "show"
                );
            },
            2300
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
                        window.location.href =
                            page;
                    }
                );
        }
    );
}

function readAmount(id) {
    return Number(
        document
            .getElementById(id)
            ?.value ||
        0
    );
}

function setInputValue(id,value) {
    const input =
        document.getElementById(id);

    if(input){
        input.value =
            Number(value || 0) >
            0
                ? String(
                    Number(value)
                )
                : "";
    }
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

document.addEventListener(
    "DOMContentLoaded",
    initializePage
);
