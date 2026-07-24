const EXPENSE_CATEGORIES = {
    Food: { color: '#C9A1C8', soft: '#F0E0F2', icon: 'bi-basket' },
    Utilities: { color: '#F2D878', soft: '#FAF0C6', icon: 'bi-lightning-charge' },
    Transportation: { color: '#AFCBDD', soft: '#E0EEF4', icon: 'bi-bus-front' },
    Health: { color: '#BFDCC8', soft: '#E5F1E8', icon: 'bi-heart-pulse' },
    Education: { color: '#F3BF9F', soft: '#FBE5D8', icon: 'bi-book' },
    Rent: { color: '#E8B8D0', soft: '#F6E1EC', icon: 'bi-house-door' },
    Debt: { color: '#9BC8C0', soft: '#E0F0EC', icon: 'bi-wallet2' },
    Other: { color: '#D5CDE8', soft: '#EBE6F5', icon: 'bi-three-dots' }
};

const RECEIPTS_CATEGORY_NAME = 'Receipts';

const RECEIPTS_CATEGORY_META = {
    color: '#7F7874',
    soft: '#ECEAE8',
    icon: 'bi-receipt-cutoff'
};

/* Prototype-only receipt records. No browser storage is required. */
const PROTOTYPE_RECEIPTS = [
    {
        id: 'savemore1',
        store: 'Savemore',
        logoFile: 'images/savemore.png',
        receiptNumber: '01-00009997',
        date: '2026-07-23',
        member: 'Elena',

        /*
            Cool blue-gray tones reference the uploaded Savemore
            receipt image and its dark printed logo.
        */
        panelColor: '#FFF5D8',
        paperColor: '#FFF5D8',
        accentColor: '#B48A28',
        imageBaseName: 'savemore1',

        adjustments: [
            {
                label: 'SC/PWD Discount',
                amount: -3.66
            }
        ],

        items: [
            {
                id: 'savemore-whole-wheat',
                title: 'Whole Wheat Bread 600g',
                category: 'Food',
                quantity: 1,
                amount: 82,
                countedAmount: 78.34
            }
        ]
    },
    {
        id: '7111',
        store: '7-Eleven',
        logoFile: 'images/711.png',
        receiptNumber: '100057512',
        date: '2026-07-21',
        member: 'Marco',

        /*
            Warm paper tones reference the uploaded 7-Eleven
            receipt while the accent follows its brand identity.
        */
        panelColor: '#FFF1E8',
        paperColor: '#FFF1E8',
        accentColor: '#E98B5F',
        imageBaseName: '7111',
        adjustments: [],

        items: [
            {
                id: '711-coke-zero',
                title: 'Coca-Cola No Sugar 250mL',
                category: 'Food',
                quantity: 1,
                amount: 28,
                countedAmount: 28
            }
        ]
    },
    {
        id: 'mercury1',
        store: 'Mercury Drug',
        logoFile: 'images/mercury.png',
        receiptNumber: '00304',
        date: '2026-07-20',
        member: 'Elena',

        /*
            Soft cool gray-blue tones reference the uploaded
            Mercury receipt and its pharmacy presentation.
        */
        panelColor: '#FFE8EE',
        paperColor: '#FFE8EE',
        accentColor: '#C85F72',
        imageBaseName: 'mercury1',
        adjustments: [],

        items: [
            {
                id: 'mercury-lexapro',
                title: 'Lexapro FCT 10mg',
                category: 'Health',
                quantity: 30,
                amount: 3855,
                countedAmount: 3855
            }
        ]
    },
    {
        id: 'alphamart1',
        store: 'Alphamart',
        logoFile: 'images/alphamart.png',
        receiptNumber: 'AM-071926-032',
        date: '2026-07-19',
        member: 'Ana',
        panelColor: '#FFE6E6',
        paperColor: '#FFE6E6',
        accentColor: '#D66B6B',
        imageBaseName: 'alphamart1',
        adjustments: [],

        items: [
            {
                id: 'alphamart-eggs',
                title: 'Eggs 12pcs',
                category: 'Food',
                quantity: 1,
                amount: 110,
                countedAmount: 110
            },
            {
                id: 'alphamart-soap',
                title: 'Laundry Soap',
                category: 'Other',
                quantity: 1,
                amount: 78,
                countedAmount: 78
            },
            {
                id: 'alphamart-bread',
                title: 'Loaf Bread',
                category: 'Food',
                quantity: 1,
                amount: 55,
                countedAmount: 55
            }
        ]
    },
    {
        id: 'puregold1',
        store: 'Puregold',
        logoFile: 'images/puregold.png',
        receiptNumber: 'PG-071826-105',
        date: '2026-07-18',
        member: 'Elena',
        panelColor: '#EEF6F0',
        paperColor: '#EEF6F0',
        accentColor: '#6C9278',
        imageBaseName: 'puregold1',
        adjustments: [],

        items: [
            {
                id: 'puregold-chicken',
                title: 'Whole Chicken',
                category: 'Food',
                quantity: 1,
                amount: 220,
                countedAmount: 220
            },
            {
                id: 'puregold-oil',
                title: 'Cooking Oil 1L',
                category: 'Food',
                quantity: 1,
                amount: 150,
                countedAmount: 150
            },
            {
                id: 'puregold-notebook',
                title: 'Notebook',
                category: 'Education',
                quantity: 1,
                amount: 60,
                countedAmount: 60
            }
        ]
    }
];
function getPrototypeReceiptSubtotal(receipt) {
    return (receipt?.items || []).reduce((sum,item)=>sum+Number(item.amount||0),0);
}
function getPrototypeReceiptTotal(receipt) {
    const subtotal =
        getPrototypeReceiptSubtotal(
            receipt
        );

    const adjustmentTotal =
        (
            Array.isArray(
                receipt?.adjustments
            )
                ? receipt.adjustments
                : []
        )
            .reduce(
                (sum, adjustment) =>
                    sum +
                    Number(
                        adjustment.amount ||
                        0
                    ),
                0
            );

    return Math.max(
        Number(
            (
                subtotal +
                adjustmentTotal
            ).toFixed(2)
        ),
        0
    );
}

function getLighterReceiptColor(
    hexColor,
    strength = 0.22
) {
    const normalized =
        String(
            hexColor ||
            ''
        )
            .replace(
                '#',
                ''
            )
            .trim();

    if (
        !/^[0-9a-f]{6}$/i.test(
            normalized
        )
    ) {
        return hexColor;
    }

    const amount =
        Math.min(
            Math.max(
                Number(
                    strength
                ) ||
                0,
                0
            ),
            1
        );

    const channels = [
        parseInt(
            normalized.slice(
                0,
                2
            ),
            16
        ),
        parseInt(
            normalized.slice(
                2,
                4
            ),
            16
        ),
        parseInt(
            normalized.slice(
                4,
                6
            ),
            16
        )
    ];

    return (
        '#' +
        channels
            .map(channel => {
                return Math.round(
                    channel +
                    (
                        255 -
                        channel
                    ) *
                    amount
                )
                    .toString(16)
                    .padStart(
                        2,
                        '0'
                    );
            })
            .join('')
    );
}

function findPrototypeReceipt(receiptId) {
    return PROTOTYPE_RECEIPTS.find(receipt=>String(receipt.id)===String(receiptId||'')) || null;
}


const MONTH_OPTIONS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const APP_START_DATE_KEY = 'kabalikat_app_start_date';

const PERIOD_CHOICES = {};

const HOUSEHOLD_MEMBERS = {
    Elena: { role: 'Head', initials: 'ED', soft: '#F0E0F2', accent: '#B164AE' },
    Ana: { role: 'Member', initials: 'AD', soft: '#FAF0C6', accent: '#AA8024' },
    Marco: { role: 'Member', initials: 'MD', soft: '#E0EEF4', accent: '#50849F' },
    'Lolo Ben': { role: 'Member', initials: 'LB', soft: '#CFE3D4', accent: '#476A54' }
};

const SEASONAL_PLANS = [
    {
        id: 'nutrition-month',
        name: 'Nutrition Month',
        icon: 'bi-egg-fried',
        months: [7],
        range: 'July 1 – July 31, 2026',
        budget: 2200,
        spent: 980,
        accent: '#B96FB4',
        soft: '#F0E0F2',
        categories: [
            { name: 'Food', amount: 620, color: '#C9A1C8' },
            { name: 'Health', amount: 210, color: '#CBE1D2' },
            { name: 'Other', amount: 150, color: '#EBA88E' }
        ],
        expenses: [
            { category: 'Food', title: 'Healthy lunch ingredients', amount: 420, member: 'Elena', date: '2026-07-18', icon: 'bi-basket' },
            { category: 'Health', title: 'Vitamin snacks', amount: 210, member: 'Marco', date: '2026-07-16', icon: 'bi-heart-pulse' }
        ]
    },
    {
        id: 'school-opening',
        name: 'School Opening',
        icon: 'bi-backpack2',
        months: [7],
        range: 'July 1 – July 31, 2026',
        budget: 3000,
        spent: 1450,
        accent: '#5A8DA8',
        soft: '#E0EEF4',
        categories: [
            { name: 'Education', amount: 900, color: '#F3BF74' },
            { name: 'Transportation', amount: 300, color: '#AFCBDD' },
            { name: 'Other', amount: 250, color: '#EBA88E' }
        ],
        expenses: [
            { category: 'Education', title: 'Notebooks and school supplies', amount: 850, member: 'Ana', date: '2026-07-15', icon: 'bi-book' },
            { category: 'Transportation', title: 'School fare reload', amount: 300, member: 'Ana', date: '2026-07-14', icon: 'bi-bus-front' }
        ]
    },
    {
        id: 'town-fiesta',
        name: 'Town Fiesta',
        icon: 'bi-stars',
        months: [7],
        range: 'July 20 – July 28, 2026',
        budget: 2500,
        spent: 1120,
        accent: '#E98B5F',
        soft: '#FBE5D8',
        categories: [
            { name: 'Food', amount: 620, color: '#C9A1C8' },
            { name: 'Other', amount: 500, color: '#EBA88E' }
        ],
        expenses: [
            { category: 'Food', title: 'Fiesta ingredients', amount: 620, member: 'Elena', date: '2026-07-21', icon: 'bi-basket' },
            { category: 'Other', title: 'Fiesta decor', amount: 500, member: 'Ana', date: '2026-07-21', icon: 'bi-stars' }
        ]
    },
    {
        id: 'barangay-outreach',
        name: 'Barangay Outreach',
        icon: 'bi-people',
        months: [7],
        range: 'July 8 – July 30, 2026',
        budget: 1800,
        spent: 640,
        accent: '#8FAE9A',
        soft: '#E5F1E8',
        categories: [
            { name: 'Food', amount: 300, color: '#C9A1C8' },
            { name: 'Transportation', amount: 140, color: '#AFCBDD' },
            { name: 'Other', amount: 200, color: '#EBA88E' }
        ],
        expenses: [
            { category: 'Food', title: 'Snacks for volunteers', amount: 300, member: 'Elena', date: '2026-07-22', icon: 'bi-basket' },
            { category: 'Other', title: 'Printing materials', amount: 200, member: 'Ana', date: '2026-07-22', icon: 'bi-printer' }
        ]
    },
    {
        id: 'christmas',
        name: 'Christmas',
        icon: 'bi-tree',
        months: [12],
        range: 'Dec 1 – Dec 25, 2026',
        budget: 10000,
        spent: 4500,
        accent: '#B96FB4',
        soft: '#F0E0F2',
        categories: [
            { name: 'Food', amount: 1500, color: '#C9A1C8' }
        ],
        expenses: []
    }
];



const state = {
    budget: 25000,
    periodMode: 'month',
    periods: { month: 'July 2026' },
    pendingYear: '2026',
    pendingMonth: 'July',
    selectedAllExpenseCategory: 'All',
    selectedBreakdownCategory: 'All',
    selectedAddCategory: 'Food',
    showAllMembers: false,
    selectedSeasonalPlanId: 'nutrition-month',
    expenses: [
        { id: 1, category: 'Rent', title: 'Monthly house rent', amount: 1200, member: 'Elena', date: '2026-07-01' },
        { id: 2, category: 'Utilities', title: 'Electric bill', amount: 980, member: 'Elena', date: '2026-07-12' },
        { id: 3, category: 'Food', title: 'Healthy lunch ingredients', amount: 420, member: 'Elena', date: '2026-07-18', seasonalPlanId: 'nutrition-month' },
        { id: 4, category: 'Food', title: 'Fiesta ingredients', amount: 620, member: 'Elena', date: '2026-07-21', seasonalPlanId: 'town-fiesta' },
        { id: 5, category: 'Education', title: 'Notebooks and school supplies', amount: 850, member: 'Ana', date: '2026-07-15', seasonalPlanId: 'school-opening' },
        { id: 6, category: 'Transportation', title: 'School fare reload', amount: 300, member: 'Ana', date: '2026-07-14' },
        { id: 7, category: 'Debt', title: 'Coop loan payment', amount: 450, member: 'Elena', date: '2026-07-10' },
        { id: 8, category: 'Health', title: 'Vitamin snacks', amount: 210, member: 'Marco', date: '2026-07-16', seasonalPlanId: 'nutrition-month' },
        { id: 9, category: 'Other', title: 'Printing materials', amount: 200, member: 'Ana', date: '2026-07-22', seasonalPlanId: 'barangay-outreach' },
        { id: 10, category: 'Transportation', title: 'Barangay outreach commute', amount: 120, member: 'Marco', date: '2026-07-22' },
        { id: 11, category: 'Other', title: 'Household supplies', amount: 500, member: 'Lolo Ben', date: '2026-07-09' }
    ]
};

let currentCategoryDetail = 'Food';
let activePrototypeReceiptId = '';

document.addEventListener('DOMContentLoaded', () => {
    initializeExpensesPage();
});

async function initializeExpensesPage() {
    await loadScannedExpensesIntoState();
    document.getElementById('newExpenseDate').value = new Date().toISOString().slice(0, 10);
    bindEvents();
    renderAll();
    handleExpensesDeepLink();
}



async function loadScannedExpensesIntoState() {
    const existingIds = new Set(state.expenses.map(expense => String(expense.id)));
    const prototypeExpenses = [];

    PROTOTYPE_RECEIPTS.forEach(receipt => {
        receipt.items.forEach(item => {
            const itemId = `prototype:${receipt.id}:${item.id}`;
            if (existingIds.has(itemId)) return;
            existingIds.add(itemId);
            prototypeExpenses.push({
                id: itemId,
                category: normalizeScannedExpenseCategory(item.category),
                title: item.title,
                amount: Number(item.countedAmount ?? item.amount ?? 0),
                quantity: Number(item.quantity || 1),
                member: receipt.member,
                date: receipt.date,
                seasonalPlanId: '',
                source: 'Prototype Receipt',
                receiptId: receipt.id,
                receiptStore: receipt.store,
                receiptNumber: receipt.receiptNumber
            });
        });
    });

    if (prototypeExpenses.length) {
        state.expenses = [...prototypeExpenses, ...state.expenses];
    }
}

function openScannedReceiptDatabaseForExpenses() {
    return new Promise(
        (resolve, reject) => {
            const request =
                indexedDB.open(
                    "kabalikat_scanned_expenses_db",
                    1
                );

            request.onupgradeneeded =
                event => {
                    const database =
                        event.target.result;

                    if (
                        !database
                            .objectStoreNames
                            .contains(
                                "receipts"
                            )
                    ) {
                        database
                            .createObjectStore(
                                "receipts",
                                {
                                    keyPath: "id"
                                }
                            );
                    }
                };

            request.onsuccess =
                event => {
                    resolve(
                        event.target.result
                    );
                };

            request.onerror = () => {
                reject(
                    request.error ||
                    new Error(
                        "Receipt storage is unavailable."
                    )
                );
            };
        }
    );
}

async function getSavedScannedReceiptRecords() {
    const database =
        await openScannedReceiptDatabaseForExpenses();

    return new Promise(
        (resolve, reject) => {
            const transaction =
                database.transaction(
                    "receipts",
                    "readonly"
                );

            const request =
                transaction
                    .objectStore(
                        "receipts"
                    )
                    .getAll();

            request.onsuccess = () => {
                const records =
                    Array.isArray(
                        request.result
                    )
                        ? request.result
                        : [];

                resolve(
                    records.sort(
                        (first, second) =>
                            new Date(
                                second.createdAt ||
                                0
                            ) -
                            new Date(
                                first.createdAt ||
                                0
                            )
                    )
                );
            };

            request.onerror = () => {
                reject(
                    request.error ||
                    new Error(
                        "Saved receipts could not be read."
                    )
                );
            };

            transaction.oncomplete = () => {
                database.close();
            };
        }
    );
}

function getScannedReceiptMetadataFallback() {
    try {
        const stored =
            JSON.parse(
                localStorage.getItem(
                    "kabalikat_scanned_expense_metadata"
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

function normalizeScannedExpenseCategory(category) {
    const value =
        String(category || "")
            .trim()
            .toLowerCase();

    const categoryMap = {
        food: "Food",
        grocery: "Food",
        groceries: "Food",
        utilities: "Utilities",
        utility: "Utilities",
        transportation: "Transportation",
        transport: "Transportation",
        medicine: "Health",
        medical: "Health",
        health: "Health",
        school: "Education",
        education: "Education",
        rent: "Rent",
        housing: "Rent",
        debt: "Debt",
        "debt / utang": "Debt",
        loan: "Debt",
        emergency: "Other",
        shopping: "Other",
        other: "Other",
        others: "Other"
    };

    return (
        categoryMap[value] ||
        "Other"
    );
}

function normalizeImportedExpenseDate(value) {
    const text =
        String(value || "")
            .trim();

    if (
        /^\d{4}-\d{2}-\d{2}$/.test(
            text
        )
    ) {
        return text;
    }

    const parsed =
        new Date(text);

    if (
        !Number.isNaN(
            parsed.getTime()
        )
    ) {
        return (
            `${parsed.getFullYear()}-` +
            `${String(
                parsed.getMonth() + 1
            ).padStart(2, "0")}-` +
            `${String(
                parsed.getDate()
            ).padStart(2, "0")}`
        );
    }

    return new Date()
        .toISOString()
        .slice(0, 10);
}

function handleExpensesDeepLink() {
    const params = new URLSearchParams(window.location.search);
    const requestedView = String(params.get('view') || '').toLowerCase();
    const requestedReceiptId = String(params.get('receiptId') || '');
    const requestedSection = params.get('section') || window.location.hash.replace(/^#/, '');

    window.requestAnimationFrame(() => {
        if (requestedView === 'add-expense') {
            openPanel('addExpensePanel');
            return;
        }
        if (requestedView === 'receipt-details') {
            renderPrototypeReceiptDetails(findPrototypeReceipt(requestedReceiptId) || PROTOTYPE_RECEIPTS[0]);
            return;
        }
        if (requestedView === 'category-breakdown') {
            openPanel('categoryBreakdownPanel');
            return;
        }
        if (!requestedSection) return;
        const target = document.getElementById(requestedSection);
        const scrollArea = document.querySelector('.expenses-scroll-area');
        if (!target || !scrollArea) return;
        scrollArea.scrollTo({top:Math.max(target.offsetTop-18,0),behavior:'auto'});
    });
}

function bindEvents() {
    document.getElementById('periodPicker').addEventListener('click', openPeriodSheet);
    document.getElementById('allExpensesOpenPeriod').addEventListener('click', openPeriodSheet);
    document.getElementById('categoryPanelOpenPeriod').addEventListener('click', openPeriodSheet);
    document.getElementById('categoryDetailsOpenPeriod').addEventListener('click', openPeriodSheet);

    document.getElementById('openCategoryBreakdown').addEventListener('click', () => openPanel('categoryBreakdownPanel'));
    const allExpenseTrigger = document.getElementById('viewAllExpenses');
    if (allExpenseTrigger) allExpenseTrigger.addEventListener('click', () => openPanel('allExpensesPanel'));
    document.getElementById('openAddExpense').addEventListener('click', () => openPanel('addExpensePanel'));
    document.getElementById('openSeasonalPanel').addEventListener('click', () => {
        renderSeasonalPanel();
        openPanel('seasonalSpendingPanel');
    });
    document.getElementById('addCustomSeasonalPlan').addEventListener('click', createCustomSeasonalPlan);
    document.getElementById('memberDetailsCalendar').addEventListener('click', openPeriodSheet);

    document.getElementById('expenseSearch').addEventListener('input', renderAllExpensesPanel);

    document.getElementById('navHome').addEventListener('click', () => {
        window.location.href = 'home.html';
    });
    document.getElementById('navScan').addEventListener('click', () => {
        window.location.href = 'scanner.html';
    });

    const savingsButton = document.getElementById('navSavings');
    if (savingsButton) {
        savingsButton.addEventListener('click', () => {
            const target = document.getElementById('budget-overview');
            const scrollArea = document.querySelector('.expenses-scroll-area');

            if (target && scrollArea) {
                scrollArea.scrollTo({
                    top: Math.max(target.offsetTop - 18, 0),
                    behavior: 'smooth'
                });
            }
        });
    }

    document.querySelectorAll('[data-close-panel]').forEach(button => {
        button.addEventListener('click', () => {
            const panel = button.closest('.full-panel');
            if (panel) panel.hidden = true;
        });
    });

    document.querySelectorAll('[data-close-sheet]').forEach(button => {
        button.addEventListener('click', closeSheets);
    });

    document.getElementById('sheetBackdrop').addEventListener('click', closeSheets);
    document.getElementById('applyPeriod').addEventListener('click', applyPendingPeriod);

    document.getElementById('addExpenseForm').addEventListener('submit', saveExpense);
    document.getElementById('saveExpenseTop').addEventListener('click', () => {
        document.getElementById('addExpenseForm').requestSubmit();
    });

    document.getElementById("navBills")?.addEventListener("click", () => {
        window.location.href = "bills.html";
    });

    /*
        A receipt detail uses the existing Category Details panel.
        Its back button must return to the Receipts view instead
        of closing directly to the Expenses home screen.
    */
    document.addEventListener(
        'click',
        handlePrototypeReceiptBack,
        true
    );

    document.addEventListener("click", handleReceiptPreviewClick);

    document
        .getElementById("closeExpenseReceiptModal")
        ?.addEventListener(
            "click",
            closeExpenseReceiptModal
        );

    document
        .getElementById("expenseReceiptBackdrop")
        ?.addEventListener(
            "click",
            closeExpenseReceiptModal
        );
}

function renderAll() {
    renderPeriodHeader();
    renderPiggyBank();
    renderSeasonalOverview();
    renderHomeCategoryBreakdown();
    renderHouseholdSpending();
    renderAllExpensesPanel();
    renderAddExpenseCategories();
    renderSeasonalPlanOptions();
    renderBreakdownPanel();
    renderCategoryDetails(currentCategoryDetail);
}

function renderPeriodHeader() {
    const currentPeriod = getSelectedPeriodLabel();
    setText('periodPickerText', currentPeriod);
    setText('categoryPanelPeriodLabel', currentPeriod);
}


function renderPiggyBank() {
    const totalSpent = getTotalSpent();
    const remaining = Math.max(state.budget - totalSpent, 0);
    const spentRatio = state.budget > 0 ? Math.min(totalSpent / state.budget, 1) : 0;
    const spentPercent = Math.round(spentRatio * 100);

    setText('totalSpent', peso(totalSpent));
    setText('budgetAmount', peso(state.budget));
    setText('remainingMoneyInfo', peso(remaining));
    const curve = document.getElementById('budgetCurveLabel');
    if (curve) curve.textContent = `Overall Spent: ${spentPercent}%`;

    const gauge = document.getElementById('budgetGaugeProgress');
    if (gauge) {
        gauge.style.strokeDasharray = `${spentPercent} 100`;
    }
}


function renderHomeCategoryBreakdown() {
    const totals =
        getCategoryTotals();

    const receiptBundles =
        getVisibleReceiptBundles();

    const container =
        document.getElementById(
            'categoryLegend'
        );

    const categoryEntries = [
        ...Object.entries(
            EXPENSE_CATEGORIES
        ),
        [
            RECEIPTS_CATEGORY_NAME,
            RECEIPTS_CATEGORY_META
        ]
    ];

    container.innerHTML =
        categoryEntries
            .map(
                ([categoryName, meta]) => {
                    const isReceipts =
                        categoryName ===
                        RECEIPTS_CATEGORY_NAME;

                    const secondaryText =
                        isReceipts
                            ? `${receiptBundles.length} ${
                                receiptBundles.length === 1
                                    ? 'receipt'
                                    : 'receipts'
                            }`
                            : peso(
                                totals[
                                    categoryName
                                ] ||
                                0
                            );

                    return `
                        <button
                            class="category-grid-item ${
                                isReceipts
                                    ? 'receipts-category-item'
                                    : ''
                            }"
                            type="button"
                            data-category-row="${escapeHtml(
                                categoryName
                            )}"
                            style="
                                --category-soft:${escapeHtml(
                                    meta.soft
                                )};
                                --category-accent:${escapeHtml(
                                    meta.color
                                )}
                            ">
                            <span class="category-grid-icon">
                                <i class="bi ${escapeHtml(
                                    meta.icon
                                )}"></i>
                            </span>

                            <span class="category-grid-copy">
                                <strong>
                                    ${escapeHtml(
                                        categoryName
                                    )}
                                </strong>

                                <small>
                                    ${escapeHtml(
                                        secondaryText
                                    )}
                                </small>
                            </span>
                        </button>
                    `;
                }
            )
            .join('');

    container
        .querySelectorAll(
            '[data-category-row]'
        )
        .forEach(button => {
            button.addEventListener(
                'click',
                () => {
                    openCategoryDetails(
                        button.dataset
                            .categoryRow
                    );
                }
            );
        });
}

function renderHouseholdSpending() {
    const container = document.getElementById('householdSpendingList');
    const totalSpent = getTotalSpent();

    const memberTotals = Object.keys(HOUSEHOLD_MEMBERS).map(name => {
        const memberExpenses = getVisibleExpenses().filter(expense => expense.member === name);
        const amount = memberExpenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
        const categoryTotals = Object.keys(EXPENSE_CATEGORIES).map(category => ({
            category,
            amount: memberExpenses.filter(expense => expense.category === category).reduce((sum, expense) => sum + Number(expense.amount || 0), 0)
        })).sort((first, second) => second.amount - first.amount);

        return {
            name,
            ...HOUSEHOLD_MEMBERS[name],
            amount,
            expenses: memberExpenses,
            categoryTotals,
            topCategory: categoryTotals[0] && categoryTotals[0].amount > 0 ? categoryTotals[0].category : 'No spending',
            share: totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0
        };
    }).sort((first, second) => second.amount - first.amount);

    const visibleMembers = memberTotals;

    container.innerHTML = visibleMembers.map(member => `
        <button class="household-spending-card" type="button" data-member-name="${escapeHtml(member.name)}" style="--member-soft:${escapeHtml(member.soft)}; --member-accent:${escapeHtml(member.accent)}">
            <div class="household-member-avatar">${escapeHtml(member.initials)}</div>
            <div class="household-member-info">
                <h3>${escapeHtml(member.name)}</h3>
                <p>${escapeHtml(member.role)}</p>
            </div>
            <div class="household-member-value">
                <strong>${peso(member.amount)}</strong>
                <span>${member.share}%</span>
            </div>
        </button>
    `).join('');

    container.querySelectorAll('[data-member-name]').forEach(button => {
        button.addEventListener('click', () => {
            const member = memberTotals.find(item => item.name === button.dataset.memberName);
            if (member) openMemberDetails(member);
        });
    });
}

function openMemberDetails(member) {
    const totalTransactions = member.expenses.length;
    const average = totalTransactions > 0 ? Math.round(member.amount / totalTransactions) : 0;
    const topCategory = member.categoryTotals[0] || { category: 'No spending', amount: 0 };
    const availableCategories = [...new Set(
        member.expenses
            .map(expense => expense.category)
            .filter(category => EXPENSE_CATEGORIES[category])
    )];

    let angle = 0;
    const gradientParts = member.categoryTotals.filter(item => item.amount > 0).map(item => {
        const meta = EXPENSE_CATEGORIES[item.category];
        const nextAngle = angle + (member.amount > 0 ? item.amount / member.amount * 360 : 0);
        const part = `${meta.color} ${angle.toFixed(2)}deg ${nextAngle.toFixed(2)}deg`;
        angle = nextAngle;
        return part;
    });

    const categoryRows = member.categoryTotals.filter(item => item.amount > 0).map(item => {
        const meta = EXPENSE_CATEGORIES[item.category];
        const pct = member.amount > 0 ? Math.round(item.amount / member.amount * 100) : 0;
        return `
            <div class="member-category-row">
                <span class="member-category-name"><i style="background:${meta.color}"></i>${escapeHtml(item.category)}</span>
                <strong>${peso(item.amount)}</strong>
                <small>${pct}%</small>
            </div>
        `;
    }).join('');

    document.getElementById('memberDetailsContent').innerHTML = `
        <section class="member-detail-hero" style="--member-soft:${escapeHtml(member.soft)}; --member-accent:${escapeHtml(member.accent)}">
            <div class="member-detail-avatar">${escapeHtml(member.initials)}</div>
            <div><h3>${escapeHtml(member.name)}</h3><p>${escapeHtml(member.role)}</p></div>
            <strong>${peso(member.amount)}</strong>
            <span>${member.share}% of household spending</span>
        </section>

        <div class="member-stat-grid">
            <article><span>Transactions</span><strong>${totalTransactions}</strong><small>${getSelectedPeriodLabel()}</small></article>
            <article><span>Top Category</span><strong>${escapeHtml(topCategory.category)}</strong><small>${peso(topCategory.amount)}</small></article>
            <article><span>Average Spend</span><strong>${peso(average)}</strong><small>per transaction</small></article>
        </div>

        <div class="panel-subheading">
            <h3>Spending by Category</h3>
            <span>${peso(member.amount)} total</span>
        </div>

        <section class="member-category-card">
            <div class="member-category-donut" style="background:${gradientParts.length ? `conic-gradient(${gradientParts.join(',')})` : '#F4EFEC'}">
                <div><strong>${peso(member.amount)}</strong><span>Total</span></div>
            </div>
            <div class="member-category-list">${categoryRows || '<p class="empty-state">No category spending yet.</p>'}</div>
        </section>

        <div class="panel-subheading member-recent-heading">
            <h3>Recent Transactions</h3>
            <span id="memberTransactionCount">${totalTransactions} total</span>
        </div>

        <div id="memberTransactionFilters" class="member-transaction-filters" aria-label="Filter member transactions">
            <button class="active" type="button" data-member-category-filter="All">All</button>
            ${availableCategories.map(category => {
                const meta = EXPENSE_CATEGORIES[category];
                return `
                    <button
                        type="button"
                        data-member-category-filter="${escapeHtml(category)}"
                        style="--filter-soft:${escapeHtml(meta.soft)}; --filter-accent:${escapeHtml(meta.color)}">
                        ${escapeHtml(category)}
                    </button>
                `;
            }).join('')}
        </div>

        <div id="memberTransactionHistory" class="dated-history-list member-history-list"></div>
    `;

    const filterContainer = document.getElementById('memberTransactionFilters');
    const historyContainer = document.getElementById('memberTransactionHistory');
    const countLabel = document.getElementById('memberTransactionCount');

    const renderMemberTransactionHistory = (selectedCategory = 'All') => {
        const filteredExpenses = member.expenses
            .filter(expense => selectedCategory === 'All' || expense.category === selectedCategory)
            .sort((first, second) => new Date(second.date) - new Date(first.date));

        if (historyContainer) {
            historyContainer.innerHTML = filteredExpenses.length
                ? renderGroupedTransactionHistory(filteredExpenses.slice(0, 5))
                : '<p class="empty-state">No transactions in this category yet.</p>';
        }

        if (countLabel) {
            countLabel.textContent = selectedCategory === 'All'
                ? `${totalTransactions} total`
                : `${filteredExpenses.length} ${filteredExpenses.length === 1 ? 'transaction' : 'transactions'}`;
        }

        filterContainer?.querySelectorAll('[data-member-category-filter]').forEach(button => {
            button.classList.toggle(
                'active',
                button.dataset.memberCategoryFilter === selectedCategory
            );
        });
    };

    filterContainer?.querySelectorAll('[data-member-category-filter]').forEach(button => {
        button.addEventListener('click', () => {
            renderMemberTransactionHistory(button.dataset.memberCategoryFilter || 'All');
        });
    });

    renderMemberTransactionHistory('All');
    openPanel('memberDetailsPanel');
}

function renderAllExpensesPanel() {
    const categoryChips = ['All', ...Object.keys(EXPENSE_CATEGORIES)];
    const chipContainer = document.getElementById('allExpenseCategories');

    chipContainer.innerHTML = categoryChips.map(category => `
        <button class="${state.selectedAllExpenseCategory === category ? 'active' : ''}" type="button" data-all-category="${escapeHtml(category)}">${escapeHtml(shortLabel(category))}</button>
    `).join('');

    chipContainer.querySelectorAll('[data-all-category]').forEach(button => {
        button.addEventListener('click', () => {
            state.selectedAllExpenseCategory = button.dataset.allCategory;
            renderAllExpensesPanel();
        });
    });

    const query = (document.getElementById('expenseSearch').value || '').trim().toLowerCase();
    const filtered = getVisibleExpenses().filter(expense => {
        const matchesCategory = state.selectedAllExpenseCategory === 'All' || expense.category === state.selectedAllExpenseCategory;
        const haystack = `${expense.category} ${expense.title} ${expense.member}`.toLowerCase();
        return matchesCategory && haystack.includes(query);
    }).sort((a, b) => new Date(b.date) - new Date(a.date));

    document.getElementById('allExpensesList').innerHTML = filtered.length
        ? filtered.map(transactionCard).join('')
        : `<p class="empty-state">No matching expenses yet.</p>`;
}

function renderBreakdownPanel() {
    const totalSpent =
        getTotalSpent();

    setText(
        'categoryPanelTotal',
        peso(totalSpent)
    );

    const chipContainer =
        document.getElementById(
            'breakdownFilterChips'
        );

    const chips = [
        'All',
        ...Object.keys(
            EXPENSE_CATEGORIES
        ),
        RECEIPTS_CATEGORY_NAME
    ];

    chipContainer.innerHTML =
        chips.map(category => `
            <button
                class="${
                    state
                        .selectedBreakdownCategory ===
                    category
                        ? 'active'
                        : ''
                }"
                type="button"
                data-breakdown-category="${escapeHtml(
                    category
                )}">
                ${escapeHtml(
                    shortLabel(category)
                )}
            </button>
        `).join('');

    chipContainer
        .querySelectorAll(
            '[data-breakdown-category]'
        )
        .forEach(button => {
            button.addEventListener(
                'click',
                () => {
                    const category =
                        button.dataset
                            .breakdownCategory;

                    if (
                        category ===
                        RECEIPTS_CATEGORY_NAME
                    ) {
                        openCategoryDetails(
                            RECEIPTS_CATEGORY_NAME
                        );

                        return;
                    }

                    state
                        .selectedBreakdownCategory =
                        category;

                    renderBreakdownPanel();
                }
            );
        });

    const historyContainer =
        document.getElementById(
            'categoryListCards'
        );

    if (
        state.selectedBreakdownCategory ===
        RECEIPTS_CATEGORY_NAME
    ) {
        const receiptBundles =
            getVisibleReceiptBundles();

        historyContainer.className =
            'receipt-bundle-list';

        historyContainer.innerHTML =
            receiptBundles.length
                ? receiptBundles
                    .map(
                        receiptBundleCard
                    )
                    .join('')
                : `
                    <p class="empty-state">
                        No scanned receipts for this month.
                    </p>
                `;

        setText(
            'categoryHistoryFilterLabel',
            receiptBundles.length === 1
                ? '1 saved receipt'
                : `${receiptBundles.length} saved receipts`
        );

        return;
    }

    const filteredExpenses =
        getVisibleExpenses()
            .filter(expense => {
                return (
                    state
                        .selectedBreakdownCategory ===
                        'All' ||
                    expense.category ===
                        state
                            .selectedBreakdownCategory
                );
            })
            .sort(
                (first, second) =>
                    new Date(
                        second.date
                    ) -
                    new Date(
                        first.date
                    )
            );

    historyContainer.className =
        'dated-history-list category-history-list';

    historyContainer.innerHTML =
        renderGroupedTransactionHistory(
            filteredExpenses
        );

    setText(
        'categoryHistoryFilterLabel',
        state.selectedBreakdownCategory ===
            'All'
            ? 'All categories'
            : state
                .selectedBreakdownCategory
    );
}

function renderDonutAndLegend({ donutId, legendId, filteredCategory, centerLabelType, onRowClick }) {
    const donut = document.getElementById(donutId);
    const legend = document.getElementById(legendId);
    const totals = getCategoryTotals();
    const totalSpent = getTotalSpent();

    const categoriesToDraw = filteredCategory === 'All'
        ? Object.keys(EXPENSE_CATEGORIES)
        : [filteredCategory];

    let angle = 0;
    const parts = [];

    categoriesToDraw.forEach(categoryName => {
        const value = totals[categoryName] || 0;
        const share = totalSpent > 0 ? value / totalSpent : 0;
        const nextAngle = angle + (share * 360);
        parts.push(`${EXPENSE_CATEGORIES[categoryName].color} ${angle.toFixed(2)}deg ${nextAngle.toFixed(2)}deg`);
        angle = nextAngle;
    });

    donut.style.background = parts.length && totalSpent > 0
        ? `conic-gradient(${parts.join(', ')})`
        : '#F4EFEC';

    const centerLabel = donut.querySelector('span');
    if (centerLabelType === 'count') {
        centerLabel.innerHTML = `<b>${categoriesToDraw.length}</b><small>${categoriesToDraw.length === 1 ? 'Category' : 'Categories'}</small>`;
    } else if (centerLabelType === 'tap') {
        centerLabel.innerHTML = `<i class="bi bi-hand-index-thumb"></i><small>Tap a category</small>`;
    }

    legend.innerHTML = categoriesToDraw.map(categoryName => {
        const value = totals[categoryName] || 0;
        const percent = totalSpent > 0 ? Math.round((value / totalSpent) * 100) : 0;
        const meta = EXPENSE_CATEGORIES[categoryName];
        return `
            <button class="legend-row" type="button" data-category-row="${escapeHtml(categoryName)}" style="--legend-soft:${escapeHtml(meta.soft)}">
                <span class="legend-dot" style="background:${escapeHtml(meta.color)}"></span>
                <span class="legend-main">
                    <strong>${escapeHtml(categoryName)}</strong>
                    <small>${peso(value)}</small>
                </span>
                <span class="legend-percent">${percent}%</span>
            </button>
        `;
    }).join('');

    legend.querySelectorAll('[data-category-row]').forEach(button => {
        button.addEventListener('click', () => onRowClick(button.dataset.categoryRow));
    });
}

function openCategoryDetails(categoryName) {
    currentCategoryDetail = categoryName;
    renderCategoryDetails(categoryName);
    openPanel('categoryDetailsPanel');
}

function renderCategoryDetails(categoryName) {
    if (
        categoryName ===
        RECEIPTS_CATEGORY_NAME
    ) {
        renderReceiptCategoryDetails();
        return;
    }

    renderRegularCategoryDetails(
        categoryName
    );
}

function renderRegularCategoryDetails(categoryName) {
    const meta = EXPENSE_CATEGORIES[categoryName];
    const categoryExpenses = getVisibleExpenses()
        .filter(expense => expense.category === categoryName)
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    const amount = categoryExpenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
    const totalSpent = getTotalSpent();
    const percent = totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0;
    const previousAmount = Math.max(Math.round(amount * 0.87), 0);
    const change = amount - previousAmount;
    const changePercent = previousAmount > 0 ? Math.round((Math.abs(change) / previousAmount) * 100) : 0;

    setText('categoryDetailsTitle', `${categoryName} Details`);

    document.getElementById('categoryDetailsContent').innerHTML = `
        <section class="category-summary" style="--category-soft:${escapeHtml(meta.soft)}; --category-accent:${escapeHtml(meta.color)}">
            <div class="category-summary-top">
                <div class="category-summary-icon"><i class="bi ${escapeHtml(meta.icon)}"></i></div>
                <div>
                    <h3>${escapeHtml(categoryName)}</h3>
                    <p>${escapeHtml(getSelectedPeriodLabel())}</p>
                </div>
            </div>

            <strong>${peso(amount)}</strong>
            <p>${percent}% of total spending</p>

            <div class="comparison-grid">
                <div>
                    <span>Previous period</span>
                    <strong>${peso(previousAmount)}</strong>
                </div>
                <div>
                    <span>Transactions</span>
                    <strong>${categoryExpenses.length}</strong>
                </div>
            </div>
        </section>

        <div class="category-expenses-title">
            <h3>Recent ${escapeHtml(categoryName)} Transactions</h3>
        </div>

        <div class="dated-history-list category-detail-history-list">
            ${categoryExpenses.length
                ? renderGroupedTransactionHistory(
                    [...categoryExpenses].sort((first, second) => new Date(second.date) - new Date(first.date))
                )
                : '<p class="empty-state">No transactions in this category yet.</p>'}
        </div>

        <div class="insight-card">
            <i class="bi bi-lightbulb"></i>
            <span>${change > 0 ? `${categoryName} spending increased compared with the previous period.` : `You spent less on ${categoryName} compared with the previous period.`}</span>
        </div>
    `;
}


function renderReceiptCategoryDetails() {
    const receiptBundles =
        getVisibleReceiptBundles();

    setText(
        'categoryDetailsTitle',
        'Receipts'
    );

    document
        .getElementById(
            'categoryDetailsContent'
        )
        .innerHTML = `
            <section
                class="category-summary receipts-category-summary"
                style="
                    --category-soft:${escapeHtml(
                        RECEIPTS_CATEGORY_META.soft
                    )};
                    --category-accent:${escapeHtml(
                        RECEIPTS_CATEGORY_META.color
                    )}
                ">
                <div class="category-summary-top">
                    <div class="category-summary-icon">
                        <i class="bi ${escapeHtml(
                            RECEIPTS_CATEGORY_META.icon
                        )}"></i>
                    </div>

                    <div>
                        <h3>Saved Receipts</h3>
                        <p>
                            ${escapeHtml(
                                getSelectedPeriodLabel()
                            )}
                        </p>
                    </div>
                </div>

                <strong>
                    ${receiptBundles.length}
                </strong>

                <p>
                    ${
                        receiptBundles.length === 1
                            ? 'receipt saved'
                            : 'receipts saved'
                    }
                </p>

                <div class="receipt-reference-note">
                    <i class="bi bi-info-circle"></i>

                    <span>
                        Receipts are grouped here. Items remain
                        counted in their own categories.
                    </span>
                </div>
            </section>

            <div class="category-expenses-title">
                <h3>Scanned Receipts</h3>
            </div>

            <div class="receipt-bundle-list">
                ${
                    receiptBundles.length
                        ? receiptBundles
                            .map(
                                receiptBundleCard
                            )
                            .join('')
                        : `
                            <p class="empty-state">
                                No scanned receipts for this month.
                            </p>
                        `
                }
            </div>
        `;
}

function getSelectedMonthNumber() {
    const monthName = getSelectedPeriodLabel().split(' ')[0];
    return MONTH_OPTIONS.findIndex(item => item === monthName) + 1;
}

function getSeasonalPlanSpent(plan) {
    const tracked = state.expenses
        .filter(expense => expense.seasonalPlanId === plan.id)
        .reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
    return tracked || Number(plan.spent || 0);
}


function getSeasonalDisplayPalette(planId) {
    const paletteCycle = ['Food', 'Transportation', 'Debt', 'Utilities', 'Health', 'Rent'];
    const relevantPlans = getRelevantSeasonalPlans();
    const index = relevantPlans.findIndex(plan => String(plan.id) === String(planId));
    const paletteKey = paletteCycle[(index >= 0 ? index : 0) % paletteCycle.length];
    return EXPENSE_CATEGORIES[paletteKey] || EXPENSE_CATEGORIES.Other;
}

function getRelevantSeasonalPlans() {
    const monthNumber = getSelectedMonthNumber();
    return SEASONAL_PLANS.filter(plan => (plan.months || []).includes(monthNumber));
}

function renderSeasonalOverview() {
    const allPlans = getRelevantSeasonalPlans();
    const visiblePlans = allPlans.slice(0, 3);
    const totalSpent = allPlans.reduce((sum, plan) => sum + getSeasonalPlanSpent(plan), 0);
    const totalBudget = allPlans.reduce((sum, plan) => sum + Number(plan.budget || 0), 0);
    const ratio = totalBudget > 0 ? totalSpent / totalBudget : 0;

    setText(
        'seasonalSummaryText',
        allPlans.length
            ? `${peso(totalSpent)} spent out of ${peso(totalBudget)}`
            : 'No seasonal spending recorded'
    );
    setText('seasonalActiveLabel', 'Active this month');

    const progress = document.getElementById('seasonalProgressFill');
    if (progress) {
        progress.style.width = `${Math.min(ratio * 100, 100)}%`;
    }

    const miniContainer = document.getElementById('seasonalMiniPlans');
    miniContainer.className = `seasonal-mini-plans count-${visiblePlans.length}`;

    if (!visiblePlans.length) {
        miniContainer.innerHTML = `
            <div class="seasonal-empty-state">
                <span class="seasonal-empty-icon"><i class="bi bi-calendar2-heart"></i></span>
                <div>
                    <strong>No seasonal plans this month</strong>
                    <small>Create a custom plan for celebrations, school events, or family occasions.</small>
                </div>
                <button type="button" data-open-empty-seasonal>View seasonal plans</button>
            </div>
        `;

        const emptyAction = miniContainer.querySelector('[data-open-empty-seasonal]');
        if (emptyAction) {
            emptyAction.addEventListener('click', () => {
                renderSeasonalPanel();
                openPanel('seasonalSpendingPanel');
            });
        }

        renderSeasonalPanel();
        return;
    }

    miniContainer.innerHTML = visiblePlans.map(plan => {
        const spent = getSeasonalPlanSpent(plan);

        return `
            <button class="seasonal-mini-plan" type="button" data-seasonal-plan="${escapeHtml(plan.id)}">
                <strong>${escapeHtml(plan.name)}</strong>
                <small>${peso(spent)} spent</small>
            </button>
        `;
    }).join('');

    miniContainer.querySelectorAll('[data-seasonal-plan]').forEach(button => {
        button.addEventListener('click', () => {
            state.selectedSeasonalPlanId = button.dataset.seasonalPlan;
            renderSeasonalPlanDetails();
            openPanel('seasonalPlanDetailsPanel');
        });
    });

    state.selectedSeasonalPlanId = allPlans[0].id;
    renderSeasonalPanel();
}


function renderSeasonalPanel() {
    const plans = getRelevantSeasonalPlans();
    const totalBudget = plans.reduce((sum, plan) => sum + Number(plan.budget || 0), 0);
    const totalSpent = plans.reduce((sum, plan) => sum + getSeasonalPlanSpent(plan), 0);
    const ratio = totalBudget > 0 ? totalSpent / totalBudget : 0;

    setText('seasonalPanelPeriod', getSelectedPeriodLabel());
    setText('seasonalPanelTotalSpent', peso(totalSpent));
    setText('seasonalPanelTotalBudget', peso(totalBudget));

    const summaryProgress = document.getElementById('seasonalPanelProgressFill');
    if (summaryProgress) {
        summaryProgress.style.width = `${Math.min(ratio * 100, 100)}%`;
    }

    const list = document.getElementById('seasonalPlanList');
    list.innerHTML = plans.map((plan) => {
        const planSpent = getSeasonalPlanSpent(plan);
        const percent = plan.budget > 0 ? Math.round((planSpent / plan.budget) * 100) : 0;
        const displayPalette = getSeasonalDisplayPalette(plan.id);

        return `
            <button
                class="seasonal-plan-card"
                type="button"
                data-seasonal-plan="${escapeHtml(plan.id)}"
                style="--plan-soft:${escapeHtml(displayPalette.soft)}; --plan-accent:${escapeHtml(displayPalette.color)}; --plan-percent:${percent};">
                <div class="seasonal-plan-main">
                    <div class="seasonal-plan-icon"><i class="bi ${escapeHtml(plan.icon)}"></i></div>
                    <div>
                        <h4>${escapeHtml(plan.name)}</h4>
                        <p>${escapeHtml(plan.range)}</p>
                    </div>
                </div>

                <div class="seasonal-plan-ring"><span>${percent}%</span></div>

                <div class="seasonal-plan-values">
                    <strong>${peso(planSpent)} <small>spent</small></strong>
                    <span>of ${peso(plan.budget)}</span>
                </div>
            </button>
        `;
    }).join('') || '<p class="empty-state">No seasonal plans set for this month.</p>';

    list.querySelectorAll('[data-seasonal-plan]').forEach(button => {
        button.addEventListener('click', () => {
            state.selectedSeasonalPlanId = button.dataset.seasonalPlan;
            renderSeasonalPlanDetails();
            openPanel('seasonalPlanDetailsPanel');
        });
    });

    const recent = document.getElementById('seasonalRecentExpenses');
    const recentExpenses = plans
        .flatMap(plan => plan.expenses)
        .sort((first, second) => new Date(second.date) - new Date(first.date))
        .slice(0, 5);

    recent.innerHTML = recentExpenses.length
        ? renderGroupedTransactionHistory(recentExpenses)
        : '<p class="empty-state">No seasonal expenses yet.</p>';

    if (plans.length) {
        renderSeasonalPlanDetails();
    } else {
        setText('seasonalPlanTitle', 'Seasonal Plan');
        const details = document.getElementById('seasonalPlanDetailsContent');

        if (details) {
            details.innerHTML = `
                <div class="seasonal-empty-state panel-empty">
                    <span class="seasonal-empty-icon"><i class="bi bi-calendar2-heart"></i></span>
                    <div>
                        <strong>No seasonal plan selected</strong>
                        <small>Create a custom seasonal plan from the Seasonal Spending page.</small>
                    </div>
                </div>
            `;
        }
    }
}


function renderSeasonalPlanDetails() {
    const plan = SEASONAL_PLANS.find(item => item.id === state.selectedSeasonalPlanId);

    if (!plan) {
        return;
    }

    const planSpent = getSeasonalPlanSpent(plan);
    const percent = plan.budget > 0 ? Math.round((planSpent / plan.budget) * 100) : 0;
    const remaining = Math.max(plan.budget - planSpent, 0);
    const displayPalette = getSeasonalDisplayPalette(plan.id);

    setText('seasonalPlanTitle', `${plan.name} Details`);

    const container = document.getElementById('seasonalPlanDetailsContent');
    container.innerHTML = `
        <section class="seasonal-detail-hero" style="--plan-soft:${escapeHtml(displayPalette.soft)}; --plan-accent:${escapeHtml(displayPalette.color)}; --plan-ring:${escapeHtml(displayPalette.color)}; background:${escapeHtml(displayPalette.soft)};">
            <div class="seasonal-detail-head">
                <div class="seasonal-plan-icon large"><i class="bi ${escapeHtml(plan.icon)}"></i></div>

                <div class="seasonal-detail-copy">
                    <h3>${escapeHtml(plan.name)}</h3>
                    <p>${escapeHtml(plan.range)}</p>
                </div>

                <button
                    class="seasonal-add-inline"
                    type="button"
                    data-add-seasonal-expense
                    aria-label="Add Seasonal Expense">
                    <i class="bi bi-plus-lg"></i>
                    <span>Add</span>
                </button>
            </div>

            <div class="seasonal-progress-inline">
                <div class="seasonal-progress-bar">
                    <span style="width:${Math.min(percent, 100)}%"></span>
                </div>
                <strong>${percent}%</strong>
            </div>

            <div class="seasonal-detail-stats">
                <div class="seasonal-stat-budget" style="background:#FFFFFF;">
                    <span>Budget</span>
                    <strong>${peso(plan.budget)}</strong>
                </div>
                <div class="seasonal-stat-spent" style="background:#FFFFFF;">
                    <span>Spent</span>
                    <strong>${peso(planSpent)}</strong>
                </div>
                <div class="seasonal-stat-remaining" style="background:#FFFFFF;">
                    <span>Remaining</span>
                    <strong>${peso(remaining)}</strong>
                </div>
            </div>
        </section>

        <div class="panel-subheading seasonal-category-heading">
            <h3>Category Breakdown</h3>
        </div>

        <div class="seasonal-category-list">
            ${plan.categories.map(item => `
                <div class="seasonal-category-row">
                    <span class="seasonal-category-name">
                        <i style="background:${escapeHtml(item.color)}"></i>
                        ${escapeHtml(item.name)}
                    </span>
                    <strong>${peso(item.amount)}</strong>
                </div>
            `).join('') || '<p class="empty-state">No category spending recorded yet.</p>'}
        </div>

        <div class="panel-subheading seasonal-detail-recent-heading">
            <h3>Recent Transactions</h3>
        </div>

        <div class="seasonal-detail-transactions dated-history-list">
            ${plan.expenses.length
                ? renderGroupedTransactionHistory(
                    [...plan.expenses]
                        .sort((first, second) => new Date(second.date) - new Date(first.date))
                        .slice(0, 5)
                )
                : '<p class="empty-state">No seasonal transactions yet.</p>'}
        </div>
    `;

    const addButton = container.querySelector('[data-add-seasonal-expense]');
    if (addButton) {
        addButton.addEventListener('click', () => {
            renderSeasonalPlanOptions();
            openPanel('addExpensePanel');

            const seasonalSelect = document.getElementById('newExpenseSeasonalPlan');
            if (seasonalSelect) {
                seasonalSelect.value = plan.id;
            }

            const itemInput = document.getElementById('newExpenseItemName');
            if (itemInput) {
                window.setTimeout(() => itemInput.focus(), 50);
            }
        });
    }
}


function createCustomSeasonalPlan() {
    const name = String(prompt('Enter custom seasonal plan name:') || '').trim();
    if (!name) return;

    const budget = Number(prompt('Enter allocated budget for this plan:', '1000'));
    if (!(budget > 0)) return;

    const monthNumber = getSelectedMonthNumber();
    const selectedDate = getSelectedMonthDate();
    const id = `custom-${Date.now()}`;

    const colorCycle = ['Food', 'Transportation', 'Debt', 'Utilities', 'Health', 'Rent'];
    const existingCustomCount = SEASONAL_PLANS.filter(plan => String(plan.id).startsWith('custom-')).length;
    const cycleCategory = colorCycle[existingCustomCount % colorCycle.length];
    const palette = EXPENSE_CATEGORIES[cycleCategory] || EXPENSE_CATEGORIES.Other;

    SEASONAL_PLANS.push({
        id,
        name,
        icon: 'bi-calendar-event',
        months: [monthNumber],
        range: selectedDate.toLocaleDateString('en-PH', { month: 'long', year: 'numeric' }),
        budget,
        spent: 0,
        accent: palette.color,
        soft: palette.soft,
        categories: [],
        expenses: []
    });

    state.selectedSeasonalPlanId = id;
    renderSeasonalOverview();
    renderSeasonalPanel();
    showToast('Custom seasonal plan added.');
}



function renderGroupedTransactionHistory(expenses) {
    const sortedExpenses = [...expenses]
        .sort((first, second) => new Date(second.date) - new Date(first.date));

    if (!sortedExpenses.length) {
        return '<p class="empty-state">No transactions yet.</p>';
    }

    const grouped = new Map();

    sortedExpenses.forEach(expense => {
        const groupKey = expense.date || 'unknown-date';

        if (!grouped.has(groupKey)) {
            grouped.set(groupKey, []);
        }

        grouped.get(groupKey).push(expense);
    });

    return [...grouped.entries()].map(([date, entries]) => `
        <section class="dated-history-group">
            <div class="dated-history-date">${escapeHtml(formatSeasonalTransactionDate(date))}</div>
            <div class="dated-history-rows">
                ${entries.map(datedTransactionRow).join('')}
            </div>
        </section>
    `).join('');
}

function datedTransactionRow(expense) {
    const meta = EXPENSE_CATEGORIES[expense.category] || EXPENSE_CATEGORIES.Other;

    return `
        <article class="dated-history-row">
            <span class="dated-history-icon" style="background:${escapeHtml(meta.soft)}">
                <i class="bi ${escapeHtml(meta.icon || expense.icon || 'bi-stars')}"></i>
            </span>

            <div class="dated-history-copy">
                <h4>${escapeHtml(expense.title)}</h4>
                <p>${escapeHtml(expense.category)} <b>|</b> ${escapeHtml(expense.member || 'Member')}</p>
            </div>

            <strong class="dated-history-amount">-${peso(expense.amount)}</strong>
        </article>
    `;
}


function seasonalDetailExpenseCard(expense) {
    const meta = EXPENSE_CATEGORIES[expense.category] || EXPENSE_CATEGORIES.Other;

    return `
        <div class="seasonal-ledger-entry">
            <div class="seasonal-ledger-date">${escapeHtml(formatSeasonalTransactionDate(expense.date))}</div>

            <article class="seasonal-ledger-row">
                <span class="seasonal-ledger-icon" style="background:${escapeHtml(meta.soft)}">
                    <i class="bi ${escapeHtml(meta.icon || expense.icon || 'bi-stars')}"></i>
                </span>

                <div class="seasonal-ledger-copy">
                    <h4>${escapeHtml(expense.title)}</h4>
                    <p>${escapeHtml(expense.category)} <b>|</b> ${escapeHtml(expense.member || 'Member')}</p>
                </div>

                <strong class="seasonal-ledger-amount">-${peso(expense.amount)}</strong>
            </article>
        </div>
    `;
}

function formatHistoryDate(value) {
    return formatSeasonalTransactionDate(value);
}

function formatReceiptDate(value) {
    const receiptDate =
        value
            ? new Date(
                `${value}T00:00:00`
            )
            : null;

    if (
        !receiptDate ||
        Number.isNaN(
            receiptDate.getTime()
        )
    ) {
        return 'Date unavailable';
    }

    return receiptDate.toLocaleDateString(
        'en-PH',
        {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        }
    );
}

function formatSeasonalTransactionDate(value) {
    const transactionDate = value ? new Date(`${value}T00:00:00`) : null;

    if (!transactionDate || Number.isNaN(transactionDate.getTime())) {
        return 'Date unavailable';
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (transactionDate.getTime() === today.getTime()) {
        return 'Today';
    }

    if (transactionDate.getTime() === yesterday.getTime()) {
        return 'Yesterday';
    }

    return transactionDate.toLocaleDateString('en-PH', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });
}


function seasonalExpenseCard(expense) {
    const meta = EXPENSE_CATEGORIES[expense.category] || EXPENSE_CATEGORIES.Other;

    return `
        <article class="transaction-card seasonal-expense-card">
            <span class="scan-corner top-left"></span>
            <span class="scan-corner top-right"></span>
            <span class="scan-corner bottom-left"></span>
            <span class="scan-corner bottom-right"></span>

            <div class="transaction-icon seasonal-only-icon" style="--category-soft:${escapeHtml(meta.soft)}">
                <i class="bi ${escapeHtml(meta.icon || expense.icon || 'bi-stars')}"></i>
            </div>

            <div class="transaction-info">
                <h3>${escapeHtml(expense.title)}</h3>
                <p>${escapeHtml(expense.category)} <b>|</b> ${escapeHtml(expense.member || 'Member')}</p>
            </div>

            <div class="transaction-amount">${Number(expense.amount || 0) < 0 ? '+' : '-'}${peso(Math.abs(Number(expense.amount || 0)))}</div>
        </article>
    `;
}


function openPeriodSheet() {
    const [currentMonth, currentYear] = getSelectedPeriodLabel().split(' ');
    state.pendingMonth = currentMonth;
    state.pendingYear = currentYear;
    renderPeriodSheet();
    openSheet('periodSheet');
}

function getAppStartDate() {
    const saved = localStorage.getItem(APP_START_DATE_KEY);
    if (saved && !Number.isNaN(new Date(saved).getTime())) return new Date(saved);

    const earliest = [...state.expenses]
        .map(expense => new Date(`${expense.date}T00:00:00`))
        .filter(date => !Number.isNaN(date.getTime()))
        .sort((a, b) => a - b)[0] || new Date();

    localStorage.setItem(APP_START_DATE_KEY, earliest.toISOString().slice(0, 10));
    return earliest;
}

function getAllowedYears() {
    const start = getAppStartDate().getFullYear();
    const current = new Date().getFullYear();
    return Array.from({ length: current - start + 1 }, (_, index) => String(start + index));
}

function getAllowedMonths(yearText) {
    const year = Number(yearText);
    const start = getAppStartDate();
    const current = new Date();
    const firstMonth = year === start.getFullYear() ? start.getMonth() : 0;
    const lastMonth = year === current.getFullYear() ? current.getMonth() : 11;
    return MONTH_OPTIONS.filter((_, index) => index >= firstMonth && index <= lastMonth);
}

function renderPeriodSheet() {
    const years = getAllowedYears();
    if (!years.includes(state.pendingYear)) state.pendingYear = years[years.length - 1];

    const yearContainer = document.getElementById('periodYearOptions');
    yearContainer.innerHTML = years.map(year => `
        <button class="option-button ${state.pendingYear === year ? 'active' : ''}" type="button" data-year-option="${escapeHtml(year)}">${escapeHtml(year)}</button>
    `).join('');
    yearContainer.querySelectorAll('[data-year-option]').forEach(button => {
        button.addEventListener('click', () => {
            state.pendingYear = button.dataset.yearOption;
            const allowedMonths = getAllowedMonths(state.pendingYear);
            if (!allowedMonths.includes(state.pendingMonth)) state.pendingMonth = allowedMonths[0];
            renderPeriodSheet();
        });
    });

    const allowedMonths = getAllowedMonths(state.pendingYear);
    if (!allowedMonths.includes(state.pendingMonth)) state.pendingMonth = allowedMonths[0];

    const optionsContainer = document.getElementById('periodOptions');
    optionsContainer.innerHTML = allowedMonths.map(month => `
        <button class="option-button ${state.pendingMonth === month ? 'active' : ''}" type="button" data-month-option="${escapeHtml(month)}">${escapeHtml(month)}</button>
    `).join('');
    optionsContainer.querySelectorAll('[data-month-option]').forEach(button => {
        button.addEventListener('click', () => {
            state.pendingMonth = button.dataset.monthOption;
            renderPeriodSheet();
        });
    });
}

function applyPendingPeriod() {
    state.periodMode = 'month';
    state.periods.month = `${state.pendingMonth} ${state.pendingYear}`;
    closeSheets();
    renderAll();
}


function renderAddExpenseCategories() {
    const container = document.getElementById('addCategoryPicker');
    container.innerHTML = Object.entries(EXPENSE_CATEGORIES).map(([categoryName, meta]) => `
        <button class="add-category-option ${state.selectedAddCategory === categoryName ? 'active' : ''}" type="button" data-add-category="${escapeHtml(categoryName)}" style="--category-soft:${escapeHtml(meta.soft)}; --category-accent:${escapeHtml(meta.color)}">
            <i class="bi ${escapeHtml(meta.icon)}"></i>
            <span>${escapeHtml(shortLabel(categoryName))}</span>
        </button>
    `).join('');

    container.querySelectorAll('[data-add-category]').forEach(button => {
        button.addEventListener('click', () => {
            state.selectedAddCategory = button.dataset.addCategory;
            renderAddExpenseCategories();
        });
    });
}

function renderSeasonalPlanOptions() {
    const select = document.getElementById('newExpenseSeasonalPlan');
    if (!select) return;
    const plans = getRelevantSeasonalPlans();
    select.innerHTML = `<option value="">Not seasonal</option>` + plans.map(plan =>
        `<option value="${escapeHtml(plan.id)}">${escapeHtml(plan.name)}</option>`
    ).join('');
}

function saveExpense(event) {
    event.preventDefault();

    const amount = Number(document.getElementById('newExpenseAmount').value);
    const title = document.getElementById('newExpenseItemName').value.trim();
    const date = document.getElementById('newExpenseDate').value;
    const member = document.getElementById('newExpensePayer').value;
    const seasonalPlanId = document.getElementById('newExpenseSeasonalPlan')?.value || '';

    if (!amount || !title || !date) {
        showToast('Complete the required fields.');
        return;
    }

    state.expenses.unshift({
        id: Date.now(),
        category: state.selectedAddCategory,
        title,
        amount,
        member,
        date,
        seasonalPlanId
    });

    event.target.reset();
    document.getElementById('newExpenseDate').value = new Date().toISOString().slice(0, 10);
    document.getElementById('addExpensePanel').hidden = true;
    renderAll();
    showSaveSuccess();
}

function getVisibleReceiptBundles() {
    const selectedMonth = getSelectedMonthDate();
    return PROTOTYPE_RECEIPTS
        .filter(receipt => {
            const date = new Date(`${receipt.date}T00:00:00`);
            return !Number.isNaN(date.getTime()) &&
                date.getFullYear() === selectedMonth.getFullYear() &&
                date.getMonth() === selectedMonth.getMonth();
        })
        .map(receipt => ({
            ...receipt,
            itemCount: receipt.items.length,
            totalAmount: getPrototypeReceiptTotal(receipt)
        }))
        .sort((a,b)=>new Date(`${b.date}T00:00:00`)-new Date(`${a.date}T00:00:00`));
}

function receiptBundleCard(receipt) {
    const referenceText =
        receipt.receiptNumber
            ? `Receipt #${receipt.receiptNumber}`
            : 'Prototype receipt';

    return `
        <button
            class="receipt-bundle-card"
            type="button"
            data-receipt-bundle-id="${escapeHtml(
                receipt.id
            )}"
            aria-label="Open ${escapeHtml(
                receipt.store
            )} receipt details"
            style="
                background:${escapeHtml(
                    receipt.panelColor
                )};
                border:
                    1px solid
                    ${escapeHtml(
                        receipt.accentColor
                    )}22;
                box-shadow:
                    0 12px 28px
                    ${escapeHtml(
                        receipt.accentColor
                    )}18;
            ">

            <span
                class="receipt-bundle-thumbnail"
                style="
                    background:
                        rgba(
                            255,
                            255,
                            255,
                            .72
                        );
                    color:${escapeHtml(
                        receipt.accentColor
                    )};
                    overflow:hidden;
                ">

                <img
                    src="${escapeHtml(
                        receipt.logoFile
                    )}"
                    alt="${escapeHtml(
                        receipt.store
                    )} logo"
                    style="
                        display:block;
                        width:82%;
                        height:82%;
                        object-fit:contain;
                    "
                    onerror="
                        this.style.display='none';
                        this.nextElementSibling.style.display='grid';
                    ">

                <i
                    class="bi bi-shop"
                    style="
                        display:none;
                        width:100%;
                        height:100%;
                        place-items:center;
                        color:${escapeHtml(
                            receipt.accentColor
                        )};
                        font-size:20px;
                    ">
                </i>
            </span>

            <span class="receipt-bundle-main">
                <strong>
                    ${escapeHtml(
                        receipt.store
                    )}
                </strong>

                <small>
                    ${escapeHtml(
                        referenceText
                    )}
                </small>

                <span>
                    <i class="bi bi-calendar3"></i>

                    ${escapeHtml(
                        formatReceiptDate(
                            receipt.date
                        )
                    )}

                    •
                    ${receipt.itemCount}
                    ${
                        receipt.itemCount === 1
                            ? 'item'
                            : 'items'
                    }
                </span>
            </span>

            <span class="receipt-bundle-value">
                <strong
                    style="
                        color:var(--neutral-dark);
                    ">
                    ${peso(
                        receipt.totalAmount
                    )}
                </strong>

                <small>
                    View details
                </small>
            </span>

            <i
                class="
                    bi
                    bi-chevron-right
                    receipt-bundle-chevron
                "
                style="
                    color:${escapeHtml(
                        receipt.accentColor
                    )};
                ">
            </i>
        </button>
    `;
}

function transactionCard(expense) {
    const meta =
        EXPENSE_CATEGORIES[
            expense.category
        ] ||
        EXPENSE_CATEGORIES.Other;

    const hasReceiptImage =
        Boolean(
            expense.receiptImage
        );

    const visual = hasReceiptImage
        ? `
            <button
                class="transaction-receipt-preview"
                type="button"
                data-receipt-preview-id="${escapeHtml(
                    String(expense.id)
                )}"
                aria-label="View attached receipt for ${escapeHtml(
                    expense.title
                )}">
                <img
                    src="${escapeHtml(
                        expense.receiptImage
                    )}"
                    alt="Receipt thumbnail">
                <span>
                    <i class="bi bi-receipt"></i>
                </span>
            </button>
        `
        : `
            <div
                class="transaction-icon"
                style="background:${escapeHtml(
                    meta.soft
                )}">
                <i class="bi ${escapeHtml(
                    meta.icon
                )}"></i>
            </div>
        `;

    const amount =
        Number(
            expense.amount ||
            0
        );

    return `
        <article class="transaction-card ${
            hasReceiptImage
                ? "has-receipt-image"
                : ""
        }">
            <span class="scan-corner top-left"></span>
            <span class="scan-corner top-right"></span>
            <span class="scan-corner bottom-left"></span>
            <span class="scan-corner bottom-right"></span>

            ${visual}

            <div class="transaction-info">
                <h3>${escapeHtml(expense.category)}</h3>
                <p>
                    ${escapeHtml(expense.title)}
                    •
                    ${escapeHtml(expense.member)}
                </p>
                ${
                    hasReceiptImage
                        ? `<small class="transaction-receipt-label"><i class="bi bi-image"></i> Receipt attached</small>`
                        : ""
                }
            </div>

            <div class="transaction-amount">
                ${amount < 0 ? "+" : "-"}${peso(
                    Math.abs(amount)
                )}
            </div>
        </article>
    `;
}

function getPrototypeReceiptImageCandidates(
    receipt
) {
    const baseName =
        String(
            receipt?.imageBaseName ||
            receipt?.id ||
            ''
        );

    if (!baseName) {
        return [];
    }

    return [
        `images/receipts/${baseName}.jpg`,
        `images/receipts/${baseName}.jpeg`,
        `images/receipts/${baseName}.png`,
        `images/receipts/${baseName}.webp`,
        `images/receipts/${baseName}`
    ];
}

function openPrototypeReceiptImage(receipt) {
    const candidates = getPrototypeReceiptImageCandidates(receipt);
    let index = 0;
    const tryNext = () => {
        if (index >= candidates.length) {
            showToast(`Add ${receipt.imageBaseName}.jpg to the images folder.`);
            return;
        }
        const source = candidates[index++];
        const tester = new Image();
        tester.onload = () => openReceiptImageModal(source, `${receipt.store} Receipt`, receipt.store);
        tester.onerror = tryNext;
        tester.src = source;
    };
    tryNext();
}

function renderPrototypeReceiptDetails(
    receipt
) {
    if (!receipt) {
        showToast(
            'Receipt details are unavailable.'
        );

        return;
    }

    activePrototypeReceiptId =
        receipt.id;

    const subtotal =
        getPrototypeReceiptSubtotal(
            receipt
        );

    const total =
        getPrototypeReceiptTotal(
            receipt
        );

    const adjustments =
        Array.isArray(
            receipt.adjustments
        )
            ? receipt.adjustments
            : [];

    setText(
        'categoryDetailsTitle',
        `${receipt.store} Receipt`
    );

    const itemsMarkup =
        receipt.items
            .map(
                (
                    item,
                    itemIndex,
                    allItems
                ) => {
                    const category =
                        normalizeScannedExpenseCategory(
                            item.category
                        );

                    const meta =
                        EXPENSE_CATEGORIES[
                            category
                        ] ||
                        EXPENSE_CATEGORIES.Other;

                    return `
                        <div
                            style="
                                padding:14px 0;
                                border-bottom:
                                    ${
                                        itemIndex <
                                        allItems.length - 1
                                            ? '1px dashed rgba(92,83,78,.20)'
                                            : '0'
                                    };
                            ">
                            <div
                                style="
                                    display:grid;
                                    grid-template-columns:
                                        38px minmax(0,1fr) auto;
                                    align-items:start;
                                    gap:10px;
                                ">
                                <strong
                                    style="
                                        color:var(--neutral);
                                        font-size:12px;
                                        font-weight:800;
                                    ">
                                    ${Number(
                                        item.quantity ||
                                        1
                                    )}x
                                </strong>

                                <div
                                    style="
                                        min-width:0;
                                    ">
                                    <strong
                                        style="
                                            display:block;
                                            color:var(--neutral-dark);
                                            font-size:13px;
                                            line-height:1.35;
                                            font-weight:800;
                                        ">
                                        ${escapeHtml(
                                            item.title
                                        )}
                                    </strong>

                                    <span
                                        style="
                                            display:inline-flex;
                                            align-items:center;
                                            gap:6px;
                                            margin-top:7px;
                                            padding:5px 9px;
                                            border-radius:999px;
                                            background:${escapeHtml(
                                                meta.soft
                                            )};
                                            color:#251F1D;
                                            font-size:9px;
                                            line-height:1;
                                            font-weight:800;
                                        ">
                                        <i class="bi ${escapeHtml(
                                            meta.icon
                                        )}"></i>

                                        ${escapeHtml(
                                            category
                                        )}
                                    </span>
                                </div>

                                <strong
                                    style="
                                        color:var(--neutral-dark);
                                        font-size:13px;
                                        font-weight:800;
                                        white-space:nowrap;
                                    ">
                                    ${peso(
                                        item.amount
                                    )}
                                </strong>
                            </div>
                        </div>
                    `;
                }
            )
            .join('');

    const adjustmentsMarkup =
        adjustments
            .map(
                adjustment => {
                    const amount =
                        Number(
                            adjustment.amount ||
                            0
                        );

                    const displayAmount =
                        amount < 0
                            ? `-${peso(
                                Math.abs(
                                    amount
                                )
                            )}`
                            : peso(
                                amount
                            );

                    return `
                        <div
                            style="
                                display:flex;
                                justify-content:space-between;
                                align-items:center;
                                gap:16px;
                                padding:7px 0;
                                color:${
                                    amount < 0
                                        ? '#C96C4B'
                                        : 'var(--neutral)'
                                };
                                font-size:12px;
                                font-weight:800;
                            ">
                            <span>
                                ${escapeHtml(
                                    adjustment.label
                                )}
                            </span>

                            <strong>
                                ${displayAmount}
                            </strong>
                        </div>
                    `;
                }
            )
            .join('');

    const content =
        document.getElementById(
            'categoryDetailsContent'
        );

    if (!content) {
        return;
    }

    content.innerHTML = `
        <section
            style="
                padding:18px;
                border-radius:28px;
                background:${escapeHtml(
                    receipt.panelColor
                )};
                box-shadow:
                    0 14px 34px
                    ${escapeHtml(
                        receipt.accentColor
                    )}1F;
            ">
            <article
                style="
                    position:relative;
                    overflow:hidden;
                    padding:26px 20px 24px;
                    border-radius:22px;
                    background:
                        linear-gradient(
                            rgba(
                                255,
                                255,
                                255,
                                .30
                            ),
                            rgba(
                                255,
                                255,
                                255,
                                .30
                            )
                        ),
                        ${escapeHtml(
                            receipt.paperColor
                        )};
                    border:
                        1px solid
                        rgba(
                            255,
                            255,
                            255,
                            .74
                        );
                    box-shadow:
                        0 12px 28px
                        ${escapeHtml(
                            receipt.accentColor
                        )}18;
                ">
                <header
                    style="
                        text-align:center;
                    ">
                    <div
                        style="
                            min-height:64px;
                            display:grid;
                            place-items:center;
                        ">
                        <img
                            src="${escapeHtml(
                                receipt.logoFile
                            )}"
                            alt="${escapeHtml(
                                receipt.store
                            )} logo"
                            style="
                                display:block;
                                max-width:150px;
                                max-height:64px;
                                width:auto;
                                height:auto;
                                object-fit:contain;
                            "
                            onerror="
                                this.style.display='none';
                                this.nextElementSibling.style.display='grid';
                            ">

                        <span
                            style="
                                display:none;
                                width:58px;
                                height:58px;
                                margin:0 auto;
                                place-items:center;
                                border-radius:18px;
                                background:rgba(255,255,255,.78);
                                color:${escapeHtml(
                                    receipt.accentColor
                                )};
                                font-size:24px;
                            ">
                            <i class="bi bi-shop"></i>
                        </span>
                    </div>

                    <h3
                        style="
                            margin:12px 0 0;
                            color:var(--neutral-dark);
                            font-size:18px;
                            font-weight:800;
                        ">
                        ${escapeHtml(
                            receipt.store
                        )}
                    </h3>

                    <p
                        style="
                            margin:6px 0 0;
                            color:var(--muted);
                            font-size:10px;
                            font-weight:700;
                        ">
                        RECEIPT DETAILS
                    </p>
                </header>

                <div
                    style="
                        margin-top:18px;
                        padding:13px 0;
                        border-top:
                            1px dashed
                            rgba(92,83,78,.22);
                        border-bottom:
                            1px dashed
                            rgba(92,83,78,.22);
                        display:grid;
                        gap:8px;
                    ">
                    <div
                        style="
                            display:flex;
                            justify-content:space-between;
                            gap:14px;
                            color:var(--neutral);
                            font-size:11px;
                            font-weight:700;
                        ">
                        <span>Receipt No.</span>
                        <strong
                            style="
                                color:var(--neutral-dark);
                            ">
                            ${escapeHtml(
                                receipt.receiptNumber
                            )}
                        </strong>
                    </div>

                    <div
                        style="
                            display:flex;
                            justify-content:space-between;
                            gap:14px;
                            color:var(--neutral);
                            font-size:11px;
                            font-weight:700;
                        ">
                        <span>Date</span>
                        <strong
                            style="
                                color:var(--neutral-dark);
                            ">
                            ${escapeHtml(
                                formatReceiptDate(
                                    receipt.date
                                )
                            )}
                        </strong>
                    </div>

                    <div
                        style="
                            display:flex;
                            justify-content:space-between;
                            gap:14px;
                            color:var(--neutral);
                            font-size:11px;
                            font-weight:700;
                        ">
                        <span>Paid by</span>
                        <strong
                            style="
                                color:var(--neutral-dark);
                            ">
                            ${escapeHtml(
                                receipt.member
                            )}
                        </strong>
                    </div>
                </div>

                <div
                    style="
                        margin-top:18px;
                        display:grid;
                        grid-template-columns:
                            38px minmax(0,1fr) auto;
                        gap:10px;
                        color:var(--muted);
                        font-size:9px;
                        font-weight:800;
                        letter-spacing:.5px;
                    ">
                    <span>QTY</span>
                    <span>ITEM / CATEGORY</span>
                    <span>PRICE</span>
                </div>

                <div>
                    ${itemsMarkup}
                </div>

                <div
                    style="
                        margin-top:15px;
                        padding-top:14px;
                        border-top:
                            1px dashed
                            rgba(92,83,78,.22);
                    ">
                    <div
                        style="
                            display:flex;
                            justify-content:space-between;
                            align-items:center;
                            gap:16px;
                            padding:7px 0;
                            color:var(--neutral);
                            font-size:12px;
                            font-weight:800;
                        ">
                        <span>SUBTOTAL</span>
                        <strong>
                            ${peso(
                                subtotal
                            )}
                        </strong>
                    </div>

                    ${adjustmentsMarkup}

                    <div
                        style="
                            display:flex;
                            justify-content:space-between;
                            align-items:center;
                            gap:16px;
                            margin-top:8px;
                            padding-top:14px;
                            border-top:
                                1px dashed
                                rgba(92,83,78,.22);
                            color:var(--neutral-dark);
                            font-size:17px;
                            font-weight:900;
                        ">
                        <span>TOTAL</span>

                        <strong
                            style="
                                color:var(--neutral-dark);
                                font-size:22px;
                            ">
                            ${peso(
                                total
                            )}
                        </strong>
                    </div>
                </div>
            </article>
        </section>

        <button
            id="openPrototypeReceiptImage"
            type="button"
            style="
                width:100%;
                min-height:54px;
                margin-top:16px;
                border:0;
                border-radius:999px;
                background:${escapeHtml(
                    getLighterReceiptColor(
                        receipt.accentColor,
                        0.20
                    )
                )};
                color:#FFFFFF;
                font-family:inherit;
                font-size:13px;
                font-weight:800;
                display:flex;
                align-items:center;
                justify-content:center;
                gap:9px;
            ">
            <i class="bi bi-image"></i>
            View Receipt Image
        </button>

        <div
            class="receipt-reference-note"
            style="
                margin-top:14px;
            ">
            <i class="bi bi-info-circle"></i>

            <span>
                This receipt is shown as one grouped record.
                Its products are counted individually under
                their official expense categories.
            </span>
        </div>
    `;

    document
        .getElementById(
            'openPrototypeReceiptImage'
        )
        ?.addEventListener(
            'click',
            () => {
                openPrototypeReceiptImage(
                    receipt
                );
            }
        );

    openPanel(
        'categoryDetailsPanel'
    );
}

function openPrototypeReceiptDetails(receiptId) {
    renderPrototypeReceiptDetails(findPrototypeReceipt(receiptId));
}

function handlePrototypeReceiptBack(
    event
) {
    if (!activePrototypeReceiptId) {
        return;
    }

    const backButton =
        event.target.closest(
            '#categoryDetailsPanel [data-close-panel]'
        );

    if (!backButton) {
        return;
    }

    event.preventDefault();
    event.stopPropagation();

    activePrototypeReceiptId =
        '';

    /*
        Reuse the same panel and return directly to the
        Saved Receipts view.
    */
    renderReceiptCategoryDetails();

    const panel =
        document.getElementById(
            'categoryDetailsPanel'
        );

    if (panel) {
        panel.hidden =
            false;

        panel.scrollTop =
            0;
    }
}

function handleReceiptPreviewClick(event) {
    const bundleButton = event.target.closest('[data-receipt-bundle-id]');
    if (bundleButton) {
        event.preventDefault();
        event.stopPropagation();
        openPrototypeReceiptDetails(bundleButton.dataset.receiptBundleId);
        return;
    }

    const button = event.target.closest('[data-receipt-preview-id]');
    if (!button) return;
    event.preventDefault();
    event.stopPropagation();

    const expense = state.expenses.find(item => String(item.id) === String(button.dataset.receiptPreviewId));
    if (expense?.receiptId) {
        openPrototypeReceiptDetails(expense.receiptId);
        return;
    }
    openReceiptImageModal(expense?.receiptImage, expense?.receiptStore || 'Receipt Image', expense?.title || 'Receipt');
}

const receiptImageZoomState = {
    scale: 1,
    translateX: 0,
    translateY: 0,
    pointers: new Map(),
    startDistance: 0,
    startScale: 1,
    dragStartX: 0,
    dragStartY: 0,
    startTranslateX: 0,
    startTranslateY: 0
};

function applyReceiptImageZoom(
    image
) {
    if (!image) {
        return;
    }

    image.style.transform =
        `translate(` +
        `${receiptImageZoomState.translateX}px, ` +
        `${receiptImageZoomState.translateY}px` +
        `) scale(${receiptImageZoomState.scale})`;

    image.style.cursor =
        receiptImageZoomState.scale > 1
            ? 'grab'
            : 'zoom-in';
}

function resetReceiptImageZoom() {
    receiptImageZoomState.scale =
        1;

    receiptImageZoomState.translateX =
        0;

    receiptImageZoomState.translateY =
        0;

    receiptImageZoomState.pointers
        .clear();

    const image =
        document.getElementById(
            'expenseReceiptModalImage'
        );

    applyReceiptImageZoom(
        image
    );
}

function bindReceiptImageZoom() {
    const image =
        document.getElementById(
            'expenseReceiptModalImage'
        );

    const wrap =
        image?.closest(
            '.expense-receipt-image-wrap'
        );

    if (
        !image ||
        !wrap
    ) {
        return;
    }

    wrap.style.overflow =
        'hidden';

    wrap.style.touchAction =
        'none';

    image.style.transformOrigin =
        'center center';

    image.style.transition =
        'transform 0.16s ease';

    image.style.userSelect =
        'none';

    image.style.webkitUserDrag =
        'none';

    if (
        wrap.dataset
            .receiptZoomBound ===
        'true'
    ) {
        resetReceiptImageZoom();

        return;
    }

    wrap.dataset
        .receiptZoomBound =
        'true';

    const distanceBetweenPointers =
        () => {
            const points = [
                ...receiptImageZoomState
                    .pointers
                    .values()
            ];

            if (
                points.length < 2
            ) {
                return 0;
            }

            return Math.hypot(
                points[1].x -
                    points[0].x,
                points[1].y -
                    points[0].y
            );
        };

    wrap.addEventListener(
        'dblclick',
        event => {
            event.preventDefault();

            if (
                receiptImageZoomState.scale >
                1
            ) {
                resetReceiptImageZoom();
            } else {
                receiptImageZoomState.scale =
                    2.4;

                applyReceiptImageZoom(
                    image
                );
            }
        }
    );

    wrap.addEventListener(
        'wheel',
        event => {
            event.preventDefault();

            const nextScale =
                receiptImageZoomState.scale +
                (
                    event.deltaY < 0
                        ? 0.20
                        : -0.20
                );

            receiptImageZoomState.scale =
                Math.min(
                    Math.max(
                        nextScale,
                        1
                    ),
                    4
                );

            if (
                receiptImageZoomState.scale ===
                1
            ) {
                receiptImageZoomState.translateX =
                    0;

                receiptImageZoomState.translateY =
                    0;
            }

            applyReceiptImageZoom(
                image
            );
        },
        {
            passive: false
        }
    );

    wrap.addEventListener(
        'pointerdown',
        event => {
            wrap.setPointerCapture?.(
                event.pointerId
            );

            receiptImageZoomState
                .pointers
                .set(
                    event.pointerId,
                    {
                        x: event.clientX,
                        y: event.clientY
                    }
                );

            image.style.transition =
                'none';

            if (
                receiptImageZoomState
                    .pointers
                    .size ===
                2
            ) {
                receiptImageZoomState
                    .startDistance =
                    distanceBetweenPointers();

                receiptImageZoomState
                    .startScale =
                    receiptImageZoomState
                        .scale;
            } else {
                receiptImageZoomState
                    .dragStartX =
                    event.clientX;

                receiptImageZoomState
                    .dragStartY =
                    event.clientY;

                receiptImageZoomState
                    .startTranslateX =
                    receiptImageZoomState
                        .translateX;

                receiptImageZoomState
                    .startTranslateY =
                    receiptImageZoomState
                        .translateY;
            }
        }
    );

    wrap.addEventListener(
        'pointermove',
        event => {
            if (
                !receiptImageZoomState
                    .pointers
                    .has(
                        event.pointerId
                    )
            ) {
                return;
            }

            receiptImageZoomState
                .pointers
                .set(
                    event.pointerId,
                    {
                        x: event.clientX,
                        y: event.clientY
                    }
                );

            if (
                receiptImageZoomState
                    .pointers
                    .size >=
                2
            ) {
                const currentDistance =
                    distanceBetweenPointers();

                if (
                    receiptImageZoomState
                        .startDistance >
                    0
                ) {
                    receiptImageZoomState
                        .scale =
                        Math.min(
                            Math.max(
                                receiptImageZoomState
                                    .startScale *
                                (
                                    currentDistance /
                                    receiptImageZoomState
                                        .startDistance
                                ),
                                1
                            ),
                            4
                        );
                }
            } else if (
                receiptImageZoomState.scale >
                1
            ) {
                receiptImageZoomState
                    .translateX =
                    receiptImageZoomState
                        .startTranslateX +
                    (
                        event.clientX -
                        receiptImageZoomState
                            .dragStartX
                    );

                receiptImageZoomState
                    .translateY =
                    receiptImageZoomState
                        .startTranslateY +
                    (
                        event.clientY -
                        receiptImageZoomState
                            .dragStartY
                    );
            }

            applyReceiptImageZoom(
                image
            );
        }
    );

    const releasePointer =
        event => {
            receiptImageZoomState
                .pointers
                .delete(
                    event.pointerId
                );

            image.style.transition =
                'transform 0.16s ease';

            if (
                receiptImageZoomState.scale <=
                1
            ) {
                resetReceiptImageZoom();
            }
        };

    wrap.addEventListener(
        'pointerup',
        releasePointer
    );

    wrap.addEventListener(
        'pointercancel',
        releasePointer
    );

    wrap.addEventListener(
        'pointerleave',
        event => {
            if (
                event.pointerType ===
                'mouse'
            ) {
                releasePointer(
                    event
                );
            }
        }
    );
}

function openReceiptImageModal(
    imageSource,
    titleText,
    altText
) {
    if (!imageSource) {
        showToast(
            'Receipt image is unavailable.'
        );

        return;
    }

    const modal =
        document.getElementById(
            'expenseReceiptModal'
        );

    const image =
        document.getElementById(
            'expenseReceiptModalImage'
        );

    const title =
        document.getElementById(
            'expenseReceiptModalTitle'
        );

    if (image) {
        image.src =
            imageSource;

        image.alt =
            `Receipt for ${altText}`;
    }

    if (title) {
        title.textContent =
            titleText;
    }

    if (modal) {
        modal.hidden =
            false;
    }

    resetReceiptImageZoom();
    bindReceiptImageZoom();
}

function closeExpenseReceiptModal() {
    const modal =
        document.getElementById(
            "expenseReceiptModal"
        );

    const image =
        document.getElementById(
            "expenseReceiptModalImage"
        );

    if (modal) {
        modal.hidden = true;
    }

    if (image) {
        image.removeAttribute("src");
    }

    resetReceiptImageZoom();
}

function openPanel(id) {
    document.getElementById(id).hidden = false;
}

function openSheet(id) {
    document.getElementById('sheetBackdrop').hidden = false;
    document.getElementById(id).hidden = false;
}

function closeSheets() {
    document.getElementById('sheetBackdrop').hidden = true;
    document.querySelectorAll('.bottom-sheet').forEach(sheet => {
        sheet.hidden = true;
    });
}

function showToast(message) {
    const toast = document.getElementById('expenseToast');
    toast.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 2400);
}

function showSaveSuccess() {
    const overlay = document.getElementById('expenseSuccessOverlay');
    if (!overlay) {
        showToast('Expense saved.');
        return;
    }

    overlay.hidden = false;
    overlay.classList.remove('show');
    void overlay.offsetWidth;
    overlay.classList.add('show');

    setTimeout(() => {
        overlay.classList.remove('show');
        setTimeout(() => {
            overlay.hidden = true;
        }, 260);
    }, 1700);
}

function getSelectedPeriodLabel() {
    return state.periods[state.periodMode];
}

function periodModeLabel() {
    return capitalize(state.periodMode);
}

function getSelectedMonthDate() {
    const [monthName, yearText] = getSelectedPeriodLabel().split(' ');
    return new Date(Number(yearText), MONTH_OPTIONS.indexOf(monthName), 1);
}

function getVisibleExpenses() {
    const selected = getSelectedMonthDate();
    return state.expenses.filter(expense => {
        const date = new Date(`${expense.date}T00:00:00`);
        return date.getFullYear() === selected.getFullYear() && date.getMonth() === selected.getMonth();
    });
}

function getTotalSpent() {
    return getVisibleExpenses().reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
}

function getCategoryTotals() {
    const totals = {};
    Object.keys(EXPENSE_CATEGORIES).forEach(name => {
        totals[name] = 0;
    });

    getVisibleExpenses().forEach(expense => {
        const category = EXPENSE_CATEGORIES[expense.category] ? expense.category : 'Other';
        totals[category] = (totals[category] || 0) + Number(expense.amount || 0);
    });

    return totals;
}

function expenseCountText(categoryName) {
    const count = getVisibleExpenses().filter(expense => expense.category === categoryName).length;
    return `${count} ${count === 1 ? 'transaction' : 'transactions'}`;
}

function shortLabel(label) {
    return label === 'Transportation' ? 'Transport' : label;
}

function peso(value) {
    return `₱${Number(value || 0).toLocaleString('en-PH', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    })}`;
}

function capitalize(value) {
    return String(value || '').charAt(0).toUpperCase() + String(value || '').slice(1);
}

function setText(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}

function escapeHtml(value) {
    return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}
