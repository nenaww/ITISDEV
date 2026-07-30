const PLAN_TYPE_PALETTES = {
    Holiday: {
        icon: "bi-gift",
        card: "#F5ECF6",
        iconPanel: "#E7D4EA",
        accent: "#A05AA0",
        button: "#D3B5D8"
    },
    Education: {
        icon: "bi-book",
        card: "#FFF1E8",
        iconPanel: "#F8D8C6",
        accent: "#C96E4B",
        button: "#F0C1A8"
    },
    Vacation: {
        icon: "bi-airplane",
        card: "#EAF3F8",
        iconPanel: "#D6E7F0",
        accent: "#50849F",
        button: "#BDD6E2"
    },
    Event: {
        icon: "bi-calendar-event",
        card: "#FFF5D8",
        iconPanel: "#F5E8B5",
        accent: "#A97F24",
        button: "#E9D994"
    },
    Emergency: {
        icon: "bi-shield-check",
        card: "#EEF6F0",
        iconPanel: "#D9EBDD",
        accent: "#5E8F6C",
        button: "#BFD9C6"
    },
    Custom: {
        icon: "bi-stars",
        card: "#F1EDFF",
        iconPanel: "#E2DBF4",
        accent: "#75639B",
        button: "#CBC2E2"
    }
};

let selectedPlanType = "Holiday";

let plans = [
    {
        id: 1,
        name: "Christmas Fund",
        category: "Holiday",
        target: 10000,
        saved: 3200,
        monthly: 1500,
        icon: "bi-gift"
    },
    {
        id: 2,
        name: "School Opening",
        category: "Education",
        target: 5000,
        saved: 1850,
        monthly: 800,
        icon: "bi-book"
    }
];

function peso(value) {
    return `₱${Number(value || 0).toLocaleString("en-US")}`;
}

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function getPlanPalette(category) {
    return (
        PLAN_TYPE_PALETTES[
            String(category || "Custom")
        ] ||
        PLAN_TYPE_PALETTES.Custom
    );
}

function renderPlans() {
    const container =
        document.getElementById("plans-container");

    const totals = plans.reduce(
        (summary, plan) => {
            summary.saved += Number(plan.saved || 0);
            summary.target += Number(plan.target || 0);
            summary.monthly += Number(plan.monthly || 0);
            return summary;
        },
        {
            saved: 0,
            target: 0,
            monthly: 0
        }
    );

    document.getElementById("totalSaved").textContent =
        peso(totals.saved);

    document.getElementById("activePlanCount").textContent =
        String(plans.length);

    document.getElementById("totalTarget").textContent =
        peso(totals.target);

    document.getElementById(
        "monthlyContributionSummary"
    ).textContent =
        `${peso(totals.monthly)} monthly`;

    container.innerHTML = plans
        .map(plan => {
            const palette =
                getPlanPalette(plan.category);

            const target =
                Number(plan.target || 0);

            const saved =
                Number(plan.saved || 0);

            const progress =
                target > 0
                    ? Math.min(
                        Math.round(
                            (saved / target) * 100
                        ),
                        100
                    )
                    : 0;

            return `
                <article
                    class="seasonal-plan-card"
                    style="
                        --plan-card:${escapeHtml(
                            palette.card
                        )};
                        --plan-icon:${escapeHtml(
                            palette.iconPanel
                        )};
                        --plan-accent:${escapeHtml(
                            palette.accent
                        )};
                        --plan-button:${escapeHtml(
                            palette.button
                        )};
                    "
                >
                    <div class="seasonal-plan-header">
                        <span class="seasonal-plan-icon">
                            <i class="bi ${escapeHtml(
                                plan.icon ||
                                palette.icon
                            )}"></i>
                        </span>

                        <div class="seasonal-plan-copy">
                            <strong>${escapeHtml(plan.name)}</strong>
                            <span>${escapeHtml(plan.category)}</span>
                        </div>

                        <strong class="seasonal-plan-percent">
                            ${progress}%
                        </strong>
                    </div>

                    <div
                        class="seasonal-progress"
                        aria-label="${progress}% complete"
                    >
                        <span style="width:${progress}%"></span>
                    </div>

                    <div class="seasonal-plan-details">
                        <div>
                            <span>Saved</span>
                            <strong>${peso(saved)}</strong>
                        </div>

                        <div>
                            <span>Monthly Contribution</span>
                            <strong>${peso(plan.monthly)}</strong>
                        </div>
                    </div>

                    <button
                        class="seasonal-plan-action"
                        type="button"
                        data-add-savings="${escapeHtml(plan.id)}"
                    >
                        + Add Savings
                    </button>
                </article>
            `;
        })
        .join("");

    container
        .querySelectorAll("[data-add-savings]")
        .forEach(button => {
            button.addEventListener("click", () => {
                addSavings(button.dataset.addSavings);
            });
        });
}

function addSavings(id) {
    const amount =
        Number(
            window.prompt("Enter amount to add:")
        );

    if (!amount || amount <= 0) {
        return;
    }

    const plan =
        plans.find(
            item =>
                String(item.id) ===
                String(id)
        );

    if (!plan) {
        return;
    }

    plan.saved =
        Number(plan.saved || 0) +
        amount;

    renderPlans();

    showSeasonalToast(
        `${peso(amount)} added to ${plan.name}.`
    );
}

function renderPlanTypes() {
    const picker =
        document.getElementById("planTypePicker");

    picker.innerHTML =
        Object.entries(PLAN_TYPE_PALETTES)
            .map(([type, meta]) => {
                const active =
                    selectedPlanType === type
                        ? "active"
                        : "";

                return `
                    <button
                        class="add-category-option ${active}"
                        type="button"
                        data-plan-type="${escapeHtml(type)}"
                        style="
                            --type-soft:${escapeHtml(
                                meta.iconPanel
                            )};
                            --type-accent:${escapeHtml(
                                meta.accent
                            )};
                        "
                    >
                        <i class="bi ${escapeHtml(meta.icon)}"></i>
                        <span>${escapeHtml(type)}</span>
                    </button>
                `;
            })
            .join("");

    picker
        .querySelectorAll("[data-plan-type]")
        .forEach(button => {
            button.addEventListener("click", () => {
                selectedPlanType =
                    button.dataset.planType || "Holiday";

                renderPlanTypes();
                syncCustomPlanType();
            });
        });
}

function syncCustomPlanType() {
    const customField =
        document.getElementById("customPlanTypeField");

    customField.hidden =
        selectedPlanType !== "Custom";

    if (customField.hidden) {
        document.getElementById(
            "customPlanType"
        ).value = "";
    }
}

function openAddPanel() {
    selectedPlanType = "Holiday";
    renderPlanTypes();
    syncCustomPlanType();

    const panel =
        document.getElementById("addPlanPanel");

    panel.hidden = false;
    panel.scrollTop = 0;
}

function closeAddPanel() {
    document.getElementById(
        "addPlanPanel"
    ).hidden = true;
}

function createPlan(event) {
    event?.preventDefault();

    const name =
        document.getElementById("planName")
            .value
            .trim();

    const target =
        Number(
            document.getElementById("target").value
        );

    const saved =
        Number(
            document.getElementById("saved").value
        ) || 0;

    const monthly =
        Number(
            document.getElementById("monthly").value
        ) || 0;

    const customType =
        document.getElementById("customPlanType")
            .value
            .trim();

    const category =
        selectedPlanType === "Custom"
            ? customType
            : selectedPlanType;

    if (!category) {
        showSeasonalToast(
            "Enter a custom plan type."
        );
        return;
    }

    if (!name || !target || target <= 0) {
        showSeasonalToast(
            "Complete the required fields."
        );
        return;
    }

    if (saved < 0 || monthly < 0) {
        showSeasonalToast(
            "Amounts cannot be negative."
        );
        return;
    }

    if (saved > target) {
        showSeasonalToast(
            "Current savings cannot exceed the target."
        );
        return;
    }

    const palette =
        getPlanPalette(selectedPlanType);

    plans.push({
        id: Date.now(),
        name,
        category,
        target,
        saved,
        monthly,
        icon: palette.icon
    });

    document.getElementById(
        "addPlanForm"
    ).reset();

    closeAddPanel();
    renderPlans();
    showPlanSuccess();
}

function showPlanSuccess() {
    const overlay =
        document.getElementById(
            "planSuccessOverlay"
        );

    overlay.hidden = false;
    overlay.classList.remove("show");

    void overlay.offsetWidth;

    overlay.classList.add("show");

    window.setTimeout(() => {
        overlay.classList.remove("show");

        window.setTimeout(() => {
            overlay.hidden = true;
        }, 260);
    }, 1700);
}

function showSeasonalToast(message) {
    const toast =
        document.getElementById("seasonalToast");

    toast.textContent = message;
    toast.classList.add("show");

    window.clearTimeout(showSeasonalToast.timeout);

    showSeasonalToast.timeout =
        window.setTimeout(() => {
            toast.classList.remove("show");
        }, 2200);
}

function bindBottomNavigation() {
    const destinations = {
        navHome: "home.html",
        navExpenses: "expenses.html",
        navScan: "scanner.html",
        navBills: "bills.html",
        navSavings: "savings.html"
    };

    Object.entries(destinations)
        .forEach(([id, page]) => {
            document.getElementById(id)
                ?.addEventListener("click", () => {
                    window.location.href = page;
                });
        });
}

document.addEventListener("DOMContentLoaded", () => {
    bindBottomNavigation();
    renderPlanTypes();
    syncCustomPlanType();
    renderPlans();

    document.getElementById(
        "seasonalBackButton"
    ).addEventListener("click", () => {
        window.location.href = "savings.html";
    });

    document.getElementById(
        "openAddPlan"
    ).addEventListener("click", openAddPanel);

    document.querySelectorAll(
        "[data-close-plan-panel]"
    ).forEach(button => {
        button.addEventListener(
            "click",
            closeAddPanel
        );
    });

    document.getElementById(
        "savePlanTop"
    ).addEventListener("click", () => {
        document.getElementById(
            "addPlanForm"
        ).requestSubmit();
    });

    document.getElementById(
        "addPlanForm"
    ).addEventListener(
        "submit",
        createPlan
    );
});
