let homeCurrentLanguage = localStorage.getItem("kabalikat_language") || "en";
let homeCurrentEventIndex = 0;
let homeCurrentEvents = [];
let expandedFamilyMemberIndex = -1;

const KABALIKAT_PET_KEY = "kabalikat_pet_state_v1";

const defaultPetState = {
    ownerName: "Elena",
    pigName: "Porky",
    equippedIcon: "images/icon1.png",
    level: 1,
    exp: 80,
    streak: 3,
    mood: "Happy"
};

const homeText = {
    en: {
        language: "English",
        householdHead: "Head",
        code: "Code",
        thisMonth: "This Month",
        familyBudget: "Family Budget",
        view: "View",
        spent: "Spent",
        remaining: "Remaining",
        upcomingEvents: "Upcoming Events",
        spendingOverview: "Spending Overview",
        recentTransactions: "Recent Transactions",
        viewAll: "View All",
        quickExpense: "Add Expense",
        quickBills: "Bills",
        quickMembers: "Members",
        comingSoon: "This feature will be added next.",
        scanReady: "OCR receipt scanner will be added next.",
        noAmount: "No amount",

        debtSummary: "Debt Summary",
        totalDebtBalance: "Total Debt Balance",
        paidThisMonth: "Paid This Month",
        owedToYou: "Owed to You",
        paymentStatus: "Payment Status",
        paidOfTracked: "paid of tracked debt",

        familySpending: "Family Spending",
        topCategory: "Top Category",
        remainingBudget: "Remaining Budget",
        share: "Share"
    },

    tl: {
        language: "Tagalog",
        householdHead: "Head",
        code: "Code",
        thisMonth: "Ngayong Buwan",
        familyBudget: "Budget ng Pamilya",
        view: "Tingnan",
        spent: "Nagamit",
        remaining: "Natitira",
        upcomingEvents: "Paparating na Events",
        spendingOverview: "Buod ng Gastos",
        recentTransactions: "Recent Transactions",
        viewAll: "Tingnan Lahat",
        quickExpense: "Add Expense",
        quickBills: "Bills",
        quickMembers: "Members",
        comingSoon: "Susunod pang idaragdag ang feature na ito.",
        scanReady: "Susunod pang idaragdag ang OCR receipt scanner.",
        noAmount: "Walang amount",

        debtSummary: "Utang Summary",
        totalDebtBalance: "Kabuuang Utang",
        paidThisMonth: "Nabayaran Ngayong Buwan",
        owedToYou: "Utang Sa Iyo",
        paymentStatus: "Payment Status",
        paidOfTracked: "nabayaran sa tracked na utang",

        familySpending: "Gastos ng Pamilya",
        topCategory: "Top Category",
        remainingBudget: "Natitirang Budget",
        share: "Share"
    }
};

const sampleUser = {
    name: "Elena Dela Cruz",
    role: "Head",
    familyCode: "KABA-4821"
};

const sampleDashboard = {
    monthlyBudget: 25000,
    totalSpent: 5750,
    remaining: 19250,

    debt: {
        totalBalance: 3250,
        paidThisMonth: 1000,
        owedToYou: 1600
    },

    categories: [
        {
            name: "Food",
            spent: 3200,
            color: "#C9A1C8"
        },
        {
            name: "Utilities",
            spent: 1420,
            color: "#F3D86B"
        },
        {
            name: "Transportation",
            spent: 720,
            color: "#AFCBDD"
        },
        {
            name: "Health",
            spent: 410,
            color: "#CBE1D2"
        }
    ],

    familyMembers: [
        {
            name: "Elena",
            role: "Head",
            totalSpent: 3270,
            topCategory: "Food",
            initials: "ED",
            folderColor: "#F6EAF6",
            accentColor: "#B96FB4"
        },
        {
            name: "Ana",
            role: "Member",
            totalSpent: 1200,
            topCategory: "Education",
            initials: "AD",
            folderColor: "#FFF7D6",
            accentColor: "#B48A28"
        },
        {
            name: "Marco",
            role: "Member",
            totalSpent: 780,
            topCategory: "Health",
            initials: "MD",
            folderColor: "#EAF3F8",
            accentColor: "#5A8DA8"
        },
        {
            name: "Lolo Ben",
            role: "Member",
            totalSpent: 500,
            topCategory: "Medicine",
            initials: "LB",
            folderColor: "#EEF6F0",
            accentColor: "#6C9278"
        }
    ],

    expenses: [
        {
            title: "Weekly groceries",
            category: "Food",
            amount: 850,
            addedBy: "Elena",
            icon: "bi-basket",
            color: "#F6EAF6"
        },
        {
            title: "Electric bill",
            category: "Utilities",
            amount: 1420,
            addedBy: "Elena",
            icon: "bi-lightning-charge",
            color: "#FFF7D6"
        },
        {
            title: "Jeepney fare",
            category: "Transportation",
            amount: 120,
            addedBy: "Ana",
            icon: "bi-bus-front",
            color: "#EAF3F8"
        },
        {
            title: "Medicine",
            category: "Health",
            amount: 360,
            addedBy: "Marco",
            icon: "bi-capsule",
            color: "#EEF6F0"
        }
    ],

    events: [
        {
            month: "JUL",
            day: "05",
            time: "8:00 AM - 9:00 AM",
            title: "Electric Bill Payment Reminder",
            type: "Bill Payment",
            amount: 1420,
            icon: "bi-lightning-charge",
            theme: "theme-lavender"
        },
        {
            month: "JUL",
            day: "08",
            time: "9:00 AM - 10:00 AM",
            title: "Water Bill Due Date",
            type: "Bill Payment",
            amount: 520,
            icon: "bi-droplet",
            theme: "theme-blue"
        },
        {
            month: "JUL",
            day: "12",
            time: "5:00 PM - 5:30 PM",
            title: "Review Weekly Household Expenses",
            type: "Budget Review",
            amount: 0,
            icon: "bi-journal-check",
            theme: "theme-green"
        },
        {
            month: "JUL",
            day: "15",
            time: "7:30 PM - 8:00 PM",
            title: "Internet Bill Payment Reminder",
            type: "Bill Payment",
            amount: 1699,
            icon: "bi-wifi",
            theme: "theme-yellow"
        }
    ]
};

document.addEventListener("DOMContentLoaded", () => {
    renderHomeDashboard();
    bindHomeActions();
});

function renderHomeDashboard() {
    const firstName = sampleUser.name.split(" ")[0];

    setProfileInitials(sampleUser.name);

    setText("homeDateText", getTodayHeaderText());
    setText("homeGreetingName", `Welcome, ${firstName}`);
    setText("homeRoleChip", homeText[homeCurrentLanguage].householdHead);
    setText("homeFamilyCodeChip", `${homeText[homeCurrentLanguage].code}: ${sampleUser.familyCode}`);

    setText("homeMonthLabel", getCurrentMonthText());
    setText("homeBudgetTitle", homeText[homeCurrentLanguage].familyBudget);
    setText("homeBudgetAmount", peso(sampleDashboard.monthlyBudget));
    setText("homeSpentLabel", homeText[homeCurrentLanguage].spent);
    setText("homeSpentAmount", peso(sampleDashboard.totalSpent));
    setText("homeRemainingLabel", homeText[homeCurrentLanguage].remaining);
    setText("homeRemainingAmount", peso(sampleDashboard.remaining));


    setText("debtHeading", homeText[homeCurrentLanguage].debtSummary);
    setText("debtViewAll", homeText[homeCurrentLanguage].viewAll);
    setText("debtTotalLabel", homeText[homeCurrentLanguage].totalDebtBalance);
    setText("debtPaidLabel", homeText[homeCurrentLanguage].paidThisMonth);
    setText("debtOwedToYouLabel", homeText[homeCurrentLanguage].owedToYou);
    setText("debtProgressLabel", homeText[homeCurrentLanguage].paymentStatus);

    setText("overviewHeading", homeText[homeCurrentLanguage].spendingOverview);
    setText("overviewFilter", homeText[homeCurrentLanguage].thisMonth);
    setText("donutCenterLabel", homeText[homeCurrentLanguage].thisMonth);
    setText("familySpendingHeading", homeText[homeCurrentLanguage].familySpending);
    setText("familySpendingViewAll", homeText[homeCurrentLanguage].viewAll);

    setText("transactionsHeading", homeText[homeCurrentLanguage].recentTransactions);
    setText("transactionsViewAll", homeText[homeCurrentLanguage].viewAll);

    setText("eventsHeading", homeText[homeCurrentLanguage].upcomingEvents);
    setText("eventsViewAll", homeText[homeCurrentLanguage].viewAll);

    setText("homeBudgetViewButton", homeText[homeCurrentLanguage].view);

    const usedPercent = Math.min((sampleDashboard.totalSpent / sampleDashboard.monthlyBudget) * 100, 100);
    const progress = document.getElementById("homeBudgetFill");

    if (progress) {
        progress.style.width = `${usedPercent}%`;
    }

    renderQuickActions();
    renderDebtSummary(sampleDashboard.debt);
    renderSpendingOverview(sampleDashboard.categories);
    renderFamilySpending(sampleDashboard.familyMembers);
    renderTransactions(sampleDashboard.expenses);

    homeCurrentEvents = sampleDashboard.events;
    renderHomePetIcon();
    renderEventCarousel();
}

function bindHomeActions() {
    const petButton = document.getElementById("homePetButton");
    const scanButton = document.getElementById("navScan");
    const expenseButtons = ["quickAddExpense", "navExpenses", "homeBudgetViewButton", "overviewFilter", "transactionsViewAll"];
    const actionButtons = [
        "quickBills",
        "quickMembers",
        "navBills",
        "navProfile",
        "debtViewAll",
        "familySpendingViewAll",
        "eventsViewAll"
    ];

    if (petButton) {
        petButton.addEventListener("click", () => {
            window.location.href = "farm.html";
        });
    }

    if (scanButton) {
        scanButton.addEventListener("click", () => {
            window.location.href = "scanner.html";
        });
    }

    expenseButtons.forEach(id => {
        const button = document.getElementById(id);

        if (button) {
            button.addEventListener("click", () => {
                window.location.href = "expenses.html";
            });
        }
    });

    actionButtons.forEach(id => {
        const button = document.getElementById(id);

        if (button) {
            button.addEventListener("click", () => {
                showToast(homeText[homeCurrentLanguage].comingSoon);
            });
        }
    });
}

function getPetState() {
    try {
        const saved = localStorage.getItem(KABALIKAT_PET_KEY);

        if (!saved) {
            localStorage.setItem(KABALIKAT_PET_KEY, JSON.stringify(defaultPetState));
            return { ...defaultPetState };
        }

        return {
            ...defaultPetState,
            ...JSON.parse(saved)
        };
    } catch (error) {
        return { ...defaultPetState };
    }
}

function renderHomePetIcon() {
    const pet = getPetState();
    const icon = document.getElementById("homePetIcon");

    if (icon) {
        icon.src = pet.equippedIcon || "images/icon1.png";
    }
}

function renderQuickActions() {
    const addButton = document.getElementById("quickAddExpense");
    const billsButton = document.getElementById("quickBills");
    const membersButton = document.getElementById("quickMembers");

    if (addButton) {
        addButton.innerHTML = `
            <i class="bi bi-plus-circle"></i>
            <span>${homeText[homeCurrentLanguage].quickExpense}</span>
        `;
    }

    if (billsButton) {
        billsButton.innerHTML = `
            <i class="bi bi-calendar2-check"></i>
            <span>${homeText[homeCurrentLanguage].quickBills}</span>
        `;
    }

    if (membersButton) {
        membersButton.innerHTML = `
            <i class="bi bi-people"></i>
            <span>${homeText[homeCurrentLanguage].quickMembers}</span>
        `;
    }
}

function renderDebtSummary(debt) {
    const totalTrackedDebt = Number(debt.totalBalance || 0) + Number(debt.paidThisMonth || 0);
    const paidPercent = totalTrackedDebt > 0
        ? Math.min(Math.round((Number(debt.paidThisMonth || 0) / totalTrackedDebt) * 100), 100)
        : 0;

    setText("debtTotalAmount", peso(debt.totalBalance));
    setText("debtPaidAmount", peso(debt.paidThisMonth));
    setText("debtOwedToYouAmount", peso(debt.owedToYou));
    setText("debtProgressPercent", `${paidPercent}%`);

    setText(
        "debtProgressText",
        `${peso(debt.paidThisMonth)} ${homeText[homeCurrentLanguage].paidOfTracked} ${peso(totalTrackedDebt)}`
    );

    const fill = document.getElementById("debtProgressFill");

    if (fill) {
        fill.style.width = `${paidPercent}%`;
    }
}

function renderSpendingOverview(categories) {
    const donut = document.getElementById("homeDonutChart");
    const legend = document.getElementById("homeDonutLegend");

    if (!donut || !legend) {
        return;
    }

    const totalSpent = categories.reduce((sum, category) => {
        return sum + Number(category.spent || 0);
    }, 0);

    setText("donutCenterAmount", peso(totalSpent));

    let currentAngle = 0;

    const gradientParts = categories.map(category => {
        const spent = Number(category.spent || 0);
        const share = totalSpent > 0 ? spent / totalSpent : 0;
        const nextAngle = currentAngle + share * 360;
        const gradientPart = `${category.color} ${currentAngle.toFixed(2)}deg ${nextAngle.toFixed(2)}deg`;

        currentAngle = nextAngle;
        return gradientPart;
    });

    if (gradientParts.length > 0 && totalSpent > 0) {
        donut.style.background = `conic-gradient(${gradientParts.join(", ")})`;
    } else {
        donut.style.background = "#F4EFEC";
    }

    legend.innerHTML = categories.map(category => {
        const percent = totalSpent > 0
            ? Math.round((Number(category.spent || 0) / totalSpent) * 100)
            : 0;

        return `
            <div class="home-donut-legend-item">
                <span class="home-donut-color" style="background: ${escapeHtml(category.color)};"></span>
                <span class="home-donut-name">${escapeHtml(category.name)}</span>
                <span class="home-donut-percent">${percent}%</span>
            </div>
        `;
    }).join("");
}

function renderFamilySpending(members) {
    const container = document.getElementById("homeFamilySpendingStack");

    if (!container) {
        return;
    }

    const totalFamilySpent = members.reduce((sum, member) => {
        return sum + Number(member.totalSpent || 0);
    }, 0);

    const sortedMembers = [...members].sort((first, second) => {
        return Number(second.totalSpent || 0) - Number(first.totalSpent || 0);
    });

    container.innerHTML = sortedMembers.slice(0, 2).map((member, index) => {
        const familySharePercent = totalFamilySpent > 0
            ? Math.round((Number(member.totalSpent || 0) / totalFamilySpent) * 100)
            : 0;

        const remainingBudget = Math.max(sampleDashboard.monthlyBudget - Number(member.totalSpent || 0), 0);

        const isActive = index === expandedFamilyMemberIndex ? "active" : "";

        return `
            <button
                class="home-family-folder ${isActive}"
                type="button"
                data-family-index="${index}"
                style="--folder-bg: ${escapeHtml(member.folderColor)}; --folder-accent: ${escapeHtml(member.accentColor)};">

                <div class="home-family-folder-header">
                    <div class="home-member-avatar">${escapeHtml(member.initials)}</div>

                    <div class="home-member-info">
                        <h4>${escapeHtml(member.name)}</h4>
                        <p>${escapeHtml(member.role)} • ${familySharePercent}% ${homeText[homeCurrentLanguage].share}</p>
                    </div>

                    <strong class="home-member-spent">${peso(member.totalSpent)}</strong>
                </div>

                <div class="home-member-details">
                    <div class="home-member-detail-grid">
                        <div>
                            <span>${homeText[homeCurrentLanguage].topCategory}</span>
                            <strong>${escapeHtml(member.topCategory)}</strong>
                        </div>

                        <div>
                            <span>${homeText[homeCurrentLanguage].remainingBudget}</span>
                            <strong class="home-member-remaining">${peso(remainingBudget)}</strong>
                            <small class="home-member-budget-base">out of ${peso(sampleDashboard.monthlyBudget)}</small>
                        </div>
                    </div>
                </div>
            </button>
        `;
    }).join("");

    container.querySelectorAll(".home-family-folder").forEach(folder => {
        folder.addEventListener("click", () => {
            const selectedIndex = Number(folder.dataset.familyIndex || 0);
            expandedFamilyMemberIndex = expandedFamilyMemberIndex === selectedIndex ? -1 : selectedIndex;
            renderFamilySpending(sampleDashboard.familyMembers);
        });
    });
}

function renderTransactions(expenses) {
    const container = document.getElementById("homeRecentTransactions");

    if (!container) {
        return;
    }

    container.innerHTML = expenses.slice(0, 3).map(expense => `
        <article class="home-transaction-scan-card">
            <span class="scan-corner top-left"></span>
            <span class="scan-corner top-right"></span>
            <span class="scan-corner bottom-left"></span>
            <span class="scan-corner bottom-right"></span>

            <div class="home-transaction-icon" style="background: ${escapeHtml(expense.color)};">
                <i class="bi ${escapeHtml(expense.icon)}"></i>
            </div>

            <div class="home-transaction-info">
                <h3>${escapeHtml(expense.category)}</h3>
                <p>${escapeHtml(expense.title)} • ${escapeHtml(expense.addedBy)}</p>
            </div>

            <div class="home-transaction-amount">-${peso(expense.amount)}</div>
        </article>
    `).join("");
}

function renderEventCarousel() {
    const viewport = document.getElementById("homeEventViewport");
    const dots = document.getElementById("homeEventDots");

    if (!viewport || homeCurrentEvents.length === 0) {
        return;
    }

    if (homeCurrentEventIndex < 0 || homeCurrentEventIndex >= homeCurrentEvents.length) {
        homeCurrentEventIndex = 0;
    }

    const event = homeCurrentEvents[homeCurrentEventIndex];

    viewport.innerHTML = `
        <article class="home-event-card ${escapeHtml(event.theme)}">
            <div class="home-event-top">
                <div class="home-event-date">
                    <div>
                        <span>${escapeHtml(event.month)}</span>
                        <strong>${escapeHtml(event.day)}</strong>
                    </div>
                </div>

                <div class="home-event-main">
                    <div class="home-event-time">
                        <span>${escapeHtml(event.time)}</span>
                    </div>

                    <h3 class="home-event-title">${escapeHtml(event.title)}</h3>
                </div>
            </div>

            <div class="home-event-bottom">
                <span class="home-event-type">
                    <i class="bi ${escapeHtml(event.icon)}"></i>
                    ${escapeHtml(event.type)}
                </span>

                <strong class="home-event-amount">
                    ${Number(event.amount || 0) > 0 ? peso(event.amount) : homeText[homeCurrentLanguage].noAmount}
                </strong>
            </div>
        </article>
    `;

    if (dots) {
        dots.innerHTML = homeCurrentEvents.map((item, index) => `
            <button
                class="${index === homeCurrentEventIndex ? "active" : ""}"
                type="button"
                data-event-index="${index}"
                aria-label="Show event ${index + 1}">
            </button>
        `).join("");

        dots.querySelectorAll("button").forEach(button => {
            button.addEventListener("click", () => {
                homeCurrentEventIndex = Number(button.dataset.eventIndex || 0);
                renderEventCarousel();
            });
        });
    }

    attachEventSwipe();
}

function attachEventSwipe() {
    const viewport = document.getElementById("homeEventViewport");

    if (!viewport) {
        return;
    }

    let startX = 0;
    let startY = 0;

    viewport.ontouchstart = event => {
        const touch = event.changedTouches[0];
        startX = touch.clientX;
        startY = touch.clientY;
    };

    viewport.ontouchend = event => {
        const touch = event.changedTouches[0];
        const diffX = touch.clientX - startX;
        const diffY = touch.clientY - startY;

        if (Math.abs(diffX) < 45 || Math.abs(diffX) < Math.abs(diffY)) {
            return;
        }

        if (diffX < 0) {
            moveEvent(1);
        } else {
            moveEvent(-1);
        }
    };
}

function moveEvent(direction) {
    homeCurrentEventIndex += direction;

    if (homeCurrentEventIndex >= homeCurrentEvents.length) {
        homeCurrentEventIndex = 0;
    }

    if (homeCurrentEventIndex < 0) {
        homeCurrentEventIndex = homeCurrentEvents.length - 1;
    }

    renderEventCarousel();
}

function getTodayHeaderText() {
    return new Date().toLocaleDateString("en-PH", {
        weekday: "long",
        month: "long",
        day: "numeric"
    });
}

function getCurrentMonthText() {
    return new Date().toLocaleDateString("en-PH", {
        month: "long",
        year: "numeric"
    });
}

function setProfileInitials(name) {
    const initialsBox = document.getElementById("homeProfileInitials");

    if (!initialsBox) {
        return;
    }

    const initials = String(name || "KABALIKAT")
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(part => part.charAt(0).toUpperCase())
        .join("");

    initialsBox.textContent = initials || "KB";
}

function peso(value) {
    return `₱${Number(value || 0).toLocaleString("en-PH", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    })}`;
}

function setText(id, value) {
    const element = document.getElementById(id);

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

function showToast(message) {
    const toast = document.getElementById("toast");

    if (!toast) {
        return;
    }

    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}