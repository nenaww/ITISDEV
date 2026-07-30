let income = 25000;

const categories = [
    { name: "Food", amount: 6000 },
    { name: "Transportation", amount: 2000 }
];

const seasonal = [
    { name: "Christmas", amount: 1500 }
];

const bills = [
    { name: "Electricity", amount: 2500 }
];

function addItem(type) {
    const name = window.prompt("Enter name:");
    if (!name?.trim()) return;

    getCollection(type).push({
        name: name.trim(),
        amount: 0
    });

    render();
    calculate();
}

function render() {
    renderList("categoryList", categories, "category");
    renderList("seasonalList", seasonal, "seasonal");
    renderList("billList", bills, "bill");
}

function renderList(id, items, type) {
    const container = document.getElementById(id);
    container.innerHTML = "";

    items.forEach((item, index) => {
        const row = document.createElement("div");
        row.className = "allocation-item";
        row.innerHTML = `
            <span>${escapeHtml(item.name)}</span>
            <label class="allocation-item-value">
                <b>₱</b>
                <input
                    type="number"
                    min="0"
                    value="${Number(item.amount || 0)}"
                    aria-label="${escapeHtml(item.name)} allocation"
                >
            </label>
            <button type="button" aria-label="Remove ${escapeHtml(item.name)}">
                <i class="bi bi-x-lg"></i>
            </button>
        `;

        row.querySelector("input").addEventListener("input", event => {
            updateAmount(type, index, event.target.value);
        });

        row.querySelector("button").addEventListener("click", () => {
            removeItem(type, index);
        });

        container.appendChild(row);
    });
}

function updateAmount(type, index, value) {
    const items = getCollection(type);
    items[index].amount = Number(value) || 0;
    calculate();
}

function removeItem(type, index) {
    getCollection(type).splice(index, 1);
    render();
    calculate();
}

function getCollection(type) {
    if (type === "category") return categories;
    if (type === "seasonal") return seasonal;
    return bills;
}

function calculate() {
    const categoryTotal = sumItems(categories);
    const seasonalTotal = sumItems(seasonal);
    const billTotal = sumItems(bills);
    const savings = Number(
        document.getElementById("savingsInput").value
    ) || 0;

    const allocated =
        categoryTotal +
        seasonalTotal +
        billTotal +
        savings;

    const remaining = income - allocated;

    setText("allocated", peso(allocated));
    setText("remaining", peso(remaining));
    setText("availableDisplay", peso(remaining));

    updateStatus(remaining);
}

function updateStatus(remaining) {
    const badge = document.getElementById("statusBadge");

    if (remaining > 0) {
        badge.textContent = "Extra Funds Available";
        badge.style.color = "#4F7F99";
    } else if (remaining === 0) {
        badge.textContent = "Balanced";
        badge.style.color = "#5E7868";
    } else if (Math.abs(remaining) <= 2000) {
        badge.textContent = "Needs Adjustment";
        badge.style.color = "#C96E4B";
    } else {
        badge.textContent = "Overallocated";
        badge.style.color = "#B84747";
    }
}

function saveBudget() {
    calculate();
    showBudgetToast("Budget plan saved.");
}

function sumItems(items) {
    return items.reduce(
        (sum, item) => sum + Number(item.amount || 0),
        0
    );
}

function peso(value) {
    const amount = Number(value || 0);
    const sign = amount < 0 ? "-" : "";
    return `${sign}₱${Math.abs(amount).toLocaleString("en-PH")}`;
}

function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
}

function showBudgetToast(message) {
    const toast = document.getElementById("budgetToast");
    toast.textContent = message;
    toast.classList.add("show");

    window.clearTimeout(showBudgetToast.timeout);
    showBudgetToast.timeout = window.setTimeout(() => {
        toast.classList.remove("show");
    }, 2200);
}

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function bindBottomNavigation() {
    const destinations = {
        navHome: "home.html",
        navExpenses: "expenses.html",
        navScan: "scanner.html",
        navBills: "bills.html",
        navSavings: "savings.html"
    };

    Object.entries(destinations).forEach(([id, page]) => {
        document.getElementById(id)?.addEventListener("click", () => {
            window.location.href = page;
        });
    });
}


document.addEventListener("DOMContentLoaded", () => {
    bindBottomNavigation();

    document.getElementById("pageBackButton").addEventListener(
        "click",
        () => history.back()
    );

    document.querySelectorAll("[data-add-item]").forEach(button => {
        button.addEventListener("click", () => {
            addItem(button.dataset.addItem);
        });
    });

    document.getElementById("savingsInput").addEventListener(
        "input",
        calculate
    );

    document.getElementById("saveBudgetButton").addEventListener(
        "click",
        saveBudget
    );

    setText("incomeDisplay", peso(income));
    render();
    calculate();
});
