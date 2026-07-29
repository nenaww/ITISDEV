const reportsData = {
"2026-07": {
label: "July 2026",
monthly: {
budget: 25000,
spent: 5750,
savings: 2300,
savingsGoal: 5000,
billsPaid: 1420,
debtBalance: 3250,
debtPaid: 1000,
owedToYou: 1600,
highestExpense: {
name: "Electric bill",
amount: 1420
},
categories: [
{
name: "Food",
amount: 3200,
color: "#C9A1C8"
},
{
name: "Utilities",
amount: 1420,
color: "#F3D86B"
},
{
name: "Transportation",
amount: 720,
color: "#AFCBDD"
},
{
name: "Health",
amount: 410,
color: "#CBE1D2"
}
],
memberExpenses: [
{
name: "Household Head",
shortName: "HH",
amount: 3200
},
{
name: "Ana",
shortName: "AN",
amount: 1300
},
{
name: "Carlo",
shortName: "CA",
amount: 750
},
{
name: "Mia",
shortName: "MI",
amount: 500
}
]
},
weekly: {
budget: 6250,
spent: 1850,
savings: 500,
savingsGoal: 1250,
billsPaid: 520,
debtBalance: 3250,
debtPaid: 250,
owedToYou: 1600,
highestExpense: {
name: "Weekly groceries",
amount: 850
},
categories: [
{
name: "Food",
amount: 980,
color: "#C9A1C8"
},
{
name: "Utilities",
amount: 520,
color: "#F3D86B"
},
{
name: "Transportation",
amount: 230,
color: "#AFCBDD"
},
{
name: "Health",
amount: 120,
color: "#CBE1D2"
}
],
memberExpenses: [
{
name: "Household Head",
shortName: "HH",
amount: 900
},
{
name: "Ana",
shortName: "AN",
amount: 450
},
{
name: "Carlo",
shortName: "CA",
amount: 300
},
{
name: "Mia",
shortName: "MI",
amount: 200
}
]
}
},
"2026-06": {
label: "June 2026",
monthly: {
budget: 25000,
spent: 6400,
savings: 2000,
savingsGoal: 5000,
billsPaid: 1699,
debtBalance: 3850,
debtPaid: 750,
owedToYou: 1400,
highestExpense: {
name: "Internet bill",
amount: 1699
},
categories: [
{
name: "Food",
amount: 3450,
color: "#C9A1C8"
},
{
name: "Utilities",
amount: 1699,
color: "#F3D86B"
},
{
name: "Transportation",
amount: 840,
color: "#AFCBDD"
},
{
name: "Health",
amount: 411,
color: "#CBE1D2"
}
],
memberExpenses: [
{
name: "Household Head",
shortName: "HH",
amount: 3500
},
{
name: "Ana",
shortName: "AN",
amount: 1400
},
{
name: "Carlo",
shortName: "CA",
amount: 900
},
{
name: "Mia",
shortName: "MI",
amount: 600
}
]
},
weekly: {
budget: 6250,
spent: 6850,
savings: 150,
savingsGoal: 1250,
billsPaid: 1450,
debtBalance: 3850,
debtPaid: 350,
owedToYou: 1400,
highestExpense: {
name: "Weekly groceries",
amount: 2800
},
categories: [
{
name: "Food",
amount: 3200,
color: "#C9A1C8"
},
{
name: "Utilities",
amount: 1450,
color: "#F3D86B"
},
{
name: "Transportation",
amount: 1300,
color: "#AFCBDD"
},
{
name: "Health",
amount: 900,
color: "#CBE1D2"
}
],
memberExpenses: [
{
name: "Household Head",
shortName: "HH",
amount: 3100
},
{
name: "Ana",
shortName: "AN",
amount: 1600
},
{
name: "Carlo",
shortName: "CA",
amount: 1250
},
{
name: "Mia",
shortName: "MI",
amount: 900
}
]
}
}
};

const reportsMonthNames = [
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

const reportsFocusOptions = {
budget: {
label: "Budget Performance",
icon: "bi-clipboard-data",
className: "reports-focus-icon-budget"
},
expense: {
label: "Expense Breakdown",
icon: "bi-pie-chart",
className: "reports-focus-icon-expense"
},
family: {
label: "Family Progress",
icon: "bi-people",
className: "reports-focus-icon-family"
},
goals: {
label: "Goals and Obligations",
icon: "bi-bullseye",
className: "reports-focus-icon-goals"
}
};

const reportsChartColors = {
orange: "#E98B5F",
peach: "#F5C2A8",
green: "#7EAA8C",
yellow: "#E4C35C",
blue: "#8BB8D2",
lavender: "#B79DCC",
pink: "#D99DBF",
mutedBar: "#D8D1CD",
text: "#5C534E",
muted: "#938982",
grid: "rgba(92, 83, 78, 0.10)"
};

const reportsCharts = {
budget: null,
expense: null,
family: null,
goals: null
};

let reportsSelectedMonth = "2026-07";
let reportsSelectedWeek = "2026-W31";
let reportsSelectedPeriod = "monthly";
let reportsSelectedFocus = "budget";

let reportsPickerDraftMonth = 7;
let reportsPickerDraftYear = 2026;
let reportsPickerDraftWeek = "2026-W31";

let reportsDateModalLastFocus = null;
let reportsCurrentView = null;

const reportsValueLabelPlugin = {
id: "reportsValueLabels",

afterDatasetsDraw(chart, args, pluginOptions) {
const formatter =
pluginOptions?.formatter;

if (typeof formatter !== "function") {
return;
}

const {
ctx,
chartArea
} = chart;

ctx.save();

ctx.font =
'700 10px "Plus Jakarta Sans", sans-serif';

ctx.textBaseline = "middle";

chart.data.datasets.forEach(
(dataset, datasetIndex) => {
const meta =
chart.getDatasetMeta(
datasetIndex
);

if (meta.hidden) {
return;
}

meta.data.forEach(
(element, index) => {
const value =
Number(
dataset.data[index] || 0
);

const label =
formatter(
value,
index,
datasetIndex,
chart
);

if (!label) {
return;
}

const position =
element.tooltipPosition();

const textWidth =
ctx.measureText(
label
).width;

const preferredX =
position.x + 8;

const willOverflow =
preferredX +
textWidth >
chartArea.right - 2;

ctx.fillStyle =
reportsChartColors.text;

ctx.textAlign =
willOverflow
? "right"
: "left";

const drawX =
willOverflow
? position.x - 8
: preferredX;

ctx.fillText(
label,
drawX,
position.y
);
}
);
}
);

ctx.restore();
}
};

document.addEventListener("DOMContentLoaded", () => {
if (typeof Chart !== "undefined") {
Chart.register(
reportsValueLabelPlugin
);
}

initializeReportsDateFilter();
bindReportsActions();
updateReportsFocusDropdown();
renderReportsPage();
});

function bindReportsActions() {
const backButton =
document.getElementById(
"reportsBackButton"
);

const dateButton =
document.getElementById(
"reportsDateButton"
);

const weeklyButton =
document.getElementById(
"reportsWeeklyButton"
);

const monthlyButton =
document.getElementById(
"reportsMonthlyButton"
);

const focusButton =
document.getElementById(
"reportsFocusButton"
);

const focusDropdown =
document.getElementById(
"reportsFocusDropdown"
);

const focusMenu =
document.getElementById(
"reportsFocusMenu"
);

const focusOptions =
document.querySelectorAll(
".reports-focus-option"
);

const dateBackdrop =
document.getElementById(
"reportsDateBackdrop"
);

const dateCloseButton =
document.getElementById(
"reportsDateCloseButton"
);

const dateCancelButton =
document.getElementById(
"reportsDateCancelButton"
);

const dateApplyButton =
document.getElementById(
"reportsDateApplyButton"
);

const pickerMonthSelect =
document.getElementById(
"reportsPickerMonthSelect"
);

const pickerYearSelect =
document.getElementById(
"reportsPickerYearSelect"
);

const weekCalendarGrid =
document.getElementById(
"reportsWeekCalendarGrid"
);

if (backButton) {
backButton.addEventListener(
"click",
() => {
if (
window.history.length >
1
) {
window.history.back();
}
}
);
}

if (dateButton) {
dateButton.addEventListener(
"click",
() => {
closeReportsFocusMenu();
openReportsDateModal();
}
);
}

if (weeklyButton) {
weeklyButton.addEventListener(
"click",
() => {
if (
reportsSelectedPeriod ===
"weekly"
) {
return;
}

reportsSelectedPeriod =
"weekly";

if (
getReportMonthKeyForWeek(
reportsSelectedWeek
) !==
reportsSelectedMonth
) {
reportsSelectedWeek =
getWeekForMonth(
reportsSelectedMonth
);
}

renderReportsPage();
}
);
}

if (monthlyButton) {
monthlyButton.addEventListener(
"click",
() => {
if (
reportsSelectedPeriod ===
"monthly"
) {
return;
}

reportsSelectedPeriod =
"monthly";

reportsSelectedMonth =
getReportMonthKeyForWeek(
reportsSelectedWeek
);

renderReportsPage();
}
);
}

if (focusButton) {
focusButton.addEventListener(
"click",
event => {
event.stopPropagation();

const isOpen =
focusDropdown
?.classList
.contains(
"is-open"
);

if (isOpen) {
closeReportsFocusMenu();
} else {
openReportsFocusMenu();
}
}
);
}

focusOptions.forEach(option => {
option.addEventListener(
"click",
event => {
event.stopPropagation();

const selectedFocus =
option.dataset.focus;

if (
!reportsFocusOptions[
selectedFocus
]
) {
return;
}

reportsSelectedFocus =
selectedFocus;

closeReportsFocusMenu();
renderReportsPage();
}
);
});

document.addEventListener(
"click",
event => {
if (
focusDropdown &&
!focusDropdown.contains(
event.target
)
) {
closeReportsFocusMenu();
}
}
);

[
dateBackdrop,
dateCloseButton,
dateCancelButton
].forEach(element => {
if (element) {
element.addEventListener(
"click",
closeReportsDateModal
);
}
});

if (dateApplyButton) {
dateApplyButton.addEventListener(
"click",
applyReportsDateSelection
);
}

if (pickerMonthSelect) {
pickerMonthSelect.addEventListener(
"change",
event => {
reportsPickerDraftMonth =
Number(
event.target.value
);

ensureValidDraftWeek();
renderReportsWeekCalendar();
}
);
}

if (pickerYearSelect) {
pickerYearSelect.addEventListener(
"change",
event => {
reportsPickerDraftYear =
Number(
event.target.value
);

populateReportsMonthOptions();
ensureValidDraftWeek();
renderReportsWeekCalendar();
}
);
}

if (weekCalendarGrid) {
weekCalendarGrid.addEventListener(
"click",
event => {
const dayButton =
event.target.closest(
".reports-calendar-day"
);

if (
!dayButton ||
dayButton.disabled
) {
return;
}

const selectedDate =
parseIsoDate(
dayButton.dataset.date
);

if (!selectedDate) {
return;
}

reportsPickerDraftWeek =
getIsoWeekValue(
selectedDate
);

renderReportsWeekCalendar();
}
);
}

document.addEventListener(
"keydown",
event => {
if (
event.key ===
"Escape" &&
isReportsDateModalOpen()
) {
closeReportsDateModal();
return;
}

if (
event.key ===
"Escape" &&
focusMenu &&
!focusMenu.hidden
) {
closeReportsFocusMenu();
focusButton?.focus();
}
}
);
}

function openReportsFocusMenu() {
const dropdown =
document.getElementById(
"reportsFocusDropdown"
);

const button =
document.getElementById(
"reportsFocusButton"
);

const menu =
document.getElementById(
"reportsFocusMenu"
);

if (!dropdown || !button || !menu) {
return;
}

dropdown.classList.add(
"is-open"
);

menu.hidden = false;

button.setAttribute(
"aria-expanded",
"true"
);
}

function closeReportsFocusMenu() {
const dropdown =
document.getElementById(
"reportsFocusDropdown"
);

const button =
document.getElementById(
"reportsFocusButton"
);

const menu =
document.getElementById(
"reportsFocusMenu"
);

if (!dropdown || !button || !menu) {
return;
}

dropdown.classList.remove(
"is-open"
);

menu.hidden = true;

button.setAttribute(
"aria-expanded",
"false"
);
}

function updateReportsFocusDropdown() {
const focus =
reportsFocusOptions[
reportsSelectedFocus
] ||
reportsFocusOptions.budget;

const label =
document.getElementById(
"reportsFocusLabel"
);

const iconContainer =
document.getElementById(
"reportsFocusButtonIcon"
);

const focusOptions =
document.querySelectorAll(
".reports-focus-option"
);

if (label) {
label.textContent =
focus.label;
}

if (iconContainer) {
iconContainer.className =
`reports-focus-icon ${focus.className}`;

iconContainer.innerHTML =
`<i class="bi ${focus.icon}"></i>`;
}

focusOptions.forEach(option => {
const isSelected =
option.dataset.focus ===
reportsSelectedFocus;

option.classList.toggle(
"selected",
isSelected
);

option.setAttribute(
"aria-checked",
String(isSelected)
);
});
}

function renderReportsPage() {
const requestedMonth =
reportsSelectedPeriod ===
"weekly"
? getReportMonthKeyForWeek(
reportsSelectedWeek
)
: reportsSelectedMonth;

const availableMonths =
Object
.keys(reportsData)
.sort();

const fallbackMonth =
availableMonths[
availableMonths.length - 1
];

const monthData =
reportsData[requestedMonth] ||
reportsData[fallbackMonth];

if (!monthData) {
return;
}

const report =
monthData[
reportsSelectedPeriod
] ||
monthData.monthly;

if (!report) {
return;
}

const budgetBalance =
Number(
report.budget || 0
) -
Number(
report.spent || 0
);

const remaining =
Math.max(
budgetBalance,
0
);

const overBudgetAmount =
Math.max(
-budgetBalance,
0
);

const percentageUsed =
Number(
report.budget || 0
) > 0
? Math.round(
(
Number(
report.spent || 0
) /
Number(
report.budget || 0
)
) * 100
)
: 0;

const selectedDateLabel =
reportsSelectedPeriod ===
"weekly"
? formatWeekRange(
reportsSelectedWeek
)
: formatMonthValue(
reportsSelectedMonth
);

const topCategory =
getTopCategory(
report.categories
);

const topCategoryShare =
topCategory &&
Number(
report.spent || 0
) > 0
? Math.round(
(
Number(
topCategory.amount || 0
) /
Number(
report.spent || 0
)
) * 100
)
: 0;

const savingsProgress =
Number(
report.savingsGoal || 0
) > 0
? Math.round(
(
Number(
report.savings || 0
) /
Number(
report.savingsGoal || 0
)
) * 100
)
: 0;

const memberTotal =
getMemberExpenseTotal(
report.memberExpenses
);

reportsCurrentView = {
report,
budgetBalance,
remaining,
overBudgetAmount,
percentageUsed,
topCategory,
topCategoryShare,
savingsProgress,
memberTotal
};

setText(
"reportsPeriodLabel",
`${selectedDateLabel} ${
reportsSelectedPeriod ===
"weekly"
? "Weekly"
: "Monthly"
} Report`
);

setText(
"reportsBudgetAmount",
peso(report.budget)
);

setText(
"reportsSpentAmount",
peso(report.spent)
);

setText(
"reportsRemainingAmount",
overBudgetAmount > 0
? `${peso(overBudgetAmount)} over`
: peso(remaining)
);

setText(
"reportsRemainingSummaryLabel",
overBudgetAmount > 0
? "Over Budget"
: "Remaining"
);

setText(
"reportsRemainingSummaryNote",
overBudgetAmount > 0
? "Amount above the limit"
: "Available budget"
);

setText(
"reportsSavingsAmount",
peso(report.savings)
);

setText(
"reportsBudgetPercent",
`${percentageUsed}% used`
);

setText(
"reportsRemainingText",
overBudgetAmount > 0
? `${peso(overBudgetAmount)} over budget`
: `${peso(remaining)} remaining`
);

setText(
"reportsBudgetChartAllocated",
peso(report.budget)
);

setText(
"reportsBudgetChartSpent",
peso(report.spent)
);

setText(
"reportsBudgetChartBalanceLabel",
overBudgetAmount > 0
? "Over budget"
: "Remaining"
);

setText(
"reportsBudgetChartRemaining",
overBudgetAmount > 0
? peso(overBudgetAmount)
: peso(remaining)
);

setText(
"reportsBudgetChartPercentage",
`${percentageUsed}%`
);

setText(
"reportsExpenseChartTotal",
peso(report.spent)
);

setText(
"reportsExpenseChartTopCategory",
topCategory
? topCategory.name
: "None"
);

setText(
"reportsExpenseChartTopShare",
`${topCategoryShare}%`
);

setText(
"reportsFactSpent",
peso(report.spent)
);

setText(
"reportsFactCategory",
topCategory
? `${topCategory.name} · ${peso(
topCategory.amount
)}`
: "No expenses"
);

setText(
"reportsFactCategoryShare",
`${topCategoryShare}% of total spending`
);

setText(
"reportsFactBudgetDifference",
overBudgetAmount > 0
? `${peso(overBudgetAmount)} over budget`
: `${peso(remaining)} below budget`
);

const highestExpense =
report.highestExpense || {
name: "No expense",
amount: 0
};

setText(
"reportsFactHighest",
`${highestExpense.name} · ${peso(
highestExpense.amount
)}`
);

setText(
"reportsFamilyBudgetAmount",
peso(report.budget)
);

setText(
"reportsFamilyTotalSpent",
peso(memberTotal)
);

const familyBudgetBalance =
Number(
report.budget || 0
) -
memberTotal;

setText(
"reportsFamilyBalanceLabel",
familyBudgetBalance < 0
? "Over budget"
: "Budget remaining"
);

setText(
"reportsFamilyBudgetRemaining",
familyBudgetBalance < 0
? peso(
Math.abs(
familyBudgetBalance
)
)
: peso(
familyBudgetBalance
)
);

setText(
"reportsFamilySavingsAmount",
peso(report.savings)
);

setText(
"reportsFamilyBillsAmount",
peso(report.billsPaid)
);

setText(
"reportsFamilyDebtPaidAmount",
peso(report.debtPaid)
);

setText(
"reportsSavingsGoalAmount",
peso(report.savingsGoal)
);

setText(
"reportsSavingsProgressAmount",
peso(report.savings)
);

setText(
"reportsSavingsProgressPercent",
`${savingsProgress}%`
);

setText(
"reportsGoalsDebtBalance",
peso(report.debtBalance)
);

setText(
"reportsObligationBills",
peso(report.billsPaid)
);

setText(
"reportsDebtPaidAmount",
peso(report.debtPaid)
);

setText(
"reportsOwedAmount",
peso(report.owedToYou)
);

const progress =
document.getElementById(
"reportsBudgetFill"
);

if (progress) {
progress.style.width =
`${Math.min(
percentageUsed,
100
)}%`;
}

renderBudgetStatus(
report,
percentageUsed,
remaining,
overBudgetAmount
);

renderCategories(
report.categories,
report.spent
);

renderMemberExpenses(
report.memberExpenses,
report.budget
);

renderExpenseInterpretation(
report,
remaining,
overBudgetAmount,
topCategory,
topCategoryShare
);

renderReportInterpretation(
report,
remaining,
overBudgetAmount,
memberTotal,
savingsProgress
);

updatePeriodButtons();
updateReportsDateControl();
updateReportsFocusDropdown();
updateVisibleReportSections();

requestAnimationFrame(
renderSelectedFocusChart
);
}

/* =========================================================
Charts
========================================================= */

function renderSelectedFocusChart() {
if (
typeof Chart === "undefined" ||
!reportsCurrentView
) {
return;
}

const {
report,
remaining,
overBudgetAmount
} = reportsCurrentView;

if (
reportsSelectedFocus ===
"budget"
) {
renderBudgetChart(
report,
remaining,
overBudgetAmount
);

return;
}

if (
reportsSelectedFocus ===
"expense"
) {
renderExpenseChart(report);
return;
}

if (
reportsSelectedFocus ===
"family"
) {
renderFamilyChart(report);
return;
}

if (
reportsSelectedFocus ===
"goals"
) {
renderGoalsChart(report);
}
}

function renderBudgetChart(
report,
remaining,
overBudgetAmount
) {
destroyReportChart(
"budget"
);

const canvas =
document.getElementById(
"reportsBudgetChart"
);

if (!canvas) {
return;
}

const budget =
Number(
report.budget || 0
);

const spent =
Number(
report.spent || 0
);

const balanceValue =
overBudgetAmount > 0
? overBudgetAmount
: remaining;

const balanceLabel =
overBudgetAmount > 0
? "Amount over budget"
: "Budget remaining";

const values = [
budget,
spent,
balanceValue
];

reportsCharts.budget =
new Chart(canvas, {
type: "bar",

data: {
labels: [
"Budget allocated",
"Amount spent",
balanceLabel
],

datasets: [
{
label: "Amount",
data: values,

backgroundColor: [
reportsChartColors.blue,
reportsChartColors.orange,
overBudgetAmount > 0
? reportsChartColors.peach
: reportsChartColors.green
],

borderRadius: 10,
borderSkipped: false,
barThickness: 24
}
]
},

options:
createHorizontalBarOptions({
maxValue:
Math.max(
budget,
spent,
remaining
) * 1.18,

formatter(value) {
const percentage =
budget > 0
? Math.round(
(
value /
budget
) * 100
)
: 0;

return (
`${peso(value)} · ` +
`${percentage}%`
);
},

tooltipLabel(context) {
const percentage =
budget > 0
? Math.round(
(
Number(
context.raw || 0
) /
budget
) * 100
)
: 0;

return (
`${peso(
context.raw
)} (${percentage}%)`
);
}
})
});
}

function renderExpenseChart(report) {
destroyReportChart(
"expense"
);

const canvas =
document.getElementById(
"reportsExpenseChart"
);

if (!canvas) {
return;
}

const categories =
Array.isArray(
report.categories
)
? [...report.categories]
.sort(
(first, second) =>
Number(
second.amount || 0
) -
Number(
first.amount || 0
)
)
: [];

const totalSpent =
Number(
report.spent || 0
);

const maximum =
Math.max(
...categories.map(
category =>
Number(
category.amount || 0
)
),
1
);

reportsCharts.expense =
new Chart(canvas, {
type: "bar",

data: {
labels:
categories.map(
category =>
category.name
),

datasets: [
{
label: "Expense",

data:
categories.map(
category =>
Number(
category.amount || 0
)
),

backgroundColor:
categories.map(
category =>
category.color
),

borderRadius: 10,
borderSkipped: false,
barThickness: 23
}
]
},

options:
createHorizontalBarOptions({
maxValue:
maximum * 1.25,

formatter(value) {
const share =
totalSpent > 0
? Math.round(
(
value /
totalSpent
) * 100
)
: 0;

return (
`${peso(value)} · ` +
`${share}%`
);
},

tooltipLabel(context) {
const value =
Number(
context.raw || 0
);

const share =
totalSpent > 0
? Math.round(
(
value /
totalSpent
) * 100
)
: 0;

return (
`${peso(value)} ` +
`(${share}% of total)`
);
}
})
});
}

function renderFamilyChart(report) {
destroyReportChart(
"family"
);

const canvas =
document.getElementById(
"reportsFamilyChart"
);

if (!canvas) {
return;
}

const members =
Array.isArray(
report.memberExpenses
)
? report.memberExpenses
: [];

const budget =
Number(
report.budget || 0
);

const totalFamilySpending =
getMemberExpenseTotal(
members
);

const labels = [
"Total family budget",
"Total family spending",
...members.map(
member =>
member.name
)
];

const values = [
budget,
totalFamilySpending,
...members.map(
member =>
Number(
member.amount || 0
)
)
];

const colors = [
reportsChartColors.mutedBar,
totalFamilySpending > budget
? reportsChartColors.peach
: reportsChartColors.orange,
reportsChartColors.orange,
reportsChartColors.green,
reportsChartColors.blue,
reportsChartColors.lavender
];

reportsCharts.family =
new Chart(canvas, {
type: "bar",

data: {
labels,

datasets: [
{
label: "Amount",
data: values,

backgroundColor:
colors.slice(
0,
values.length
),

borderRadius: 10,
borderSkipped: false,
barThickness: 23
}
]
},

options:
createHorizontalBarOptions({
maxValue:
budget * 1.18,

formatter(
value,
index
) {
if (index === 0) {
return (
`${peso(value)} · ` +
"100%"
);
}

const share =
budget > 0
? Math.round(
(
value /
budget
) * 100
)
: 0;

return (
`${peso(value)} · ` +
`${share}%`
);
},

tooltipLabel(context) {
const value =
Number(
context.raw || 0
);

const share =
budget > 0
? Math.round(
(
value /
budget
) * 100
)
: 0;

return (
`${peso(value)} ` +
`(${share}% of family budget)`
);
}
})
});
}

function renderGoalsChart(report) {
destroyReportChart(
"goals"
);

const canvas =
document.getElementById(
"reportsGoalsChart"
);

if (!canvas) {
return;
}

const labels = [
"Savings goal",
"Savings added",
"Bills paid",
"Debt paid",
"Debt balance",
"Owed to you"
];

const values = [
Number(
report.savingsGoal || 0
),
Number(
report.savings || 0
),
Number(
report.billsPaid || 0
),
Number(
report.debtPaid || 0
),
Number(
report.debtBalance || 0
),
Number(
report.owedToYou || 0
)
];

const maximum =
Math.max(
...values,
1
);

reportsCharts.goals =
new Chart(canvas, {
type: "bar",

data: {
labels,

datasets: [
{
label: "Amount",
data: values,

backgroundColor: [
reportsChartColors.lavender,
reportsChartColors.green,
reportsChartColors.yellow,
reportsChartColors.blue,
reportsChartColors.pink,
reportsChartColors.peach
],

borderRadius: 10,
borderSkipped: false,
barThickness: 22
}
]
},

options:
createHorizontalBarOptions({
maxValue:
maximum * 1.25,

formatter(value) {
return peso(value);
},

tooltipLabel(context) {
return peso(
context.raw
);
}
})
});
}

function createHorizontalBarOptions({
maxValue,
formatter,
tooltipLabel
}) {
return {
responsive: true,
maintainAspectRatio: false,
indexAxis: "y",

animation: {
duration: 420
},

layout: {
padding: {
right: 14
}
},

scales: {
x: {
beginAtZero: true,

suggestedMax:
Number(
maxValue || 0
),

border: {
display: false
},

grid: {
color:
reportsChartColors.grid
},

ticks: {
color:
reportsChartColors.muted,

font: {
family:
"Plus Jakarta Sans",
size: 9,
weight: "700"
},

callback(value) {
return compactPeso(
value
);
}
}
},

y: {
border: {
display: false
},

grid: {
display: false
},

ticks: {
color:
reportsChartColors.text,

font: {
family:
"Plus Jakarta Sans",
size: 10,
weight: "700"
}
}
}
},

plugins: {
legend: {
display: false
},

reportsValueLabels: {
formatter
},

tooltip: {
backgroundColor:
reportsChartColors.text,

displayColors: false,

titleFont: {
family:
"Plus Jakarta Sans",
size: 11,
weight: "800"
},

bodyFont: {
family:
"Plus Jakarta Sans",
size: 11,
weight: "700"
},

padding: 11,

callbacks: {
label:
tooltipLabel
}
}
}
};
}

function destroyReportChart(
chartName
) {
const chart =
reportsCharts[
chartName
];

if (
chart &&
typeof chart.destroy ===
"function"
) {
chart.destroy();
}

reportsCharts[
chartName
] = null;
}

/* =========================================================
Date filter
========================================================= */

function initializeReportsDateFilter() {
populateReportsYearOptions();
populateReportsMonthOptions();
updateReportsDateControl();
}

function updateReportsDateControl() {
const dateFieldLabel =
document.getElementById(
"reportsDateFieldLabel"
);

const dateDisplay =
document.getElementById(
"reportsDateDisplay"
);

const dateButton =
document.getElementById(
"reportsDateButton"
);

const isWeekly =
reportsSelectedPeriod ===
"weekly";

if (dateFieldLabel) {
dateFieldLabel.textContent =
isWeekly
? "Report week"
: "Report month";
}

if (dateDisplay) {
dateDisplay.textContent =
isWeekly
? formatWeekRange(
reportsSelectedWeek
)
: formatMonthValue(
reportsSelectedMonth
);
}

if (dateButton) {
dateButton.setAttribute(
"aria-label",
isWeekly
? `Select report week. Current selection: ${formatWeekRange(
reportsSelectedWeek
)}`
: `Select report month. Current selection: ${formatMonthValue(
reportsSelectedMonth
)}`
);
}
}

function openReportsDateModal() {
const modal =
document.getElementById(
"reportsDateModal"
);

if (!modal) {
return;
}

reportsDateModalLastFocus =
document.activeElement;

if (
reportsSelectedPeriod ===
"monthly"
) {
const [
year,
month
] =
reportsSelectedMonth
.split("-")
.map(Number);

reportsPickerDraftYear =
year;

reportsPickerDraftMonth =
month;
} else {
const selectedReportMonth =
getReportMonthKeyForWeek(
reportsSelectedWeek
);

const [
year,
month
] =
selectedReportMonth
.split("-")
.map(Number);

reportsPickerDraftYear =
year;

reportsPickerDraftMonth =
month;

reportsPickerDraftWeek =
reportsSelectedWeek;
}

populateReportsYearOptions();
populateReportsMonthOptions();
updateReportsDateModalContent();

modal.classList.add(
"is-open"
);

modal.setAttribute(
"aria-hidden",
"false"
);

requestAnimationFrame(
() => {
document
.getElementById(
"reportsDateCloseButton"
)
?.focus();
}
);
}

function closeReportsDateModal() {
const modal =
document.getElementById(
"reportsDateModal"
);

if (!modal) {
return;
}

modal.classList.remove(
"is-open"
);

modal.setAttribute(
"aria-hidden",
"true"
);

if (
reportsDateModalLastFocus &&
typeof
reportsDateModalLastFocus
.focus ===
"function"
) {
reportsDateModalLastFocus
.focus();
}
}

function isReportsDateModalOpen() {
return document
.getElementById(
"reportsDateModal"
)
?.classList
.contains(
"is-open"
);
}

function updateReportsDateModalContent() {
const modalTitle =
document.getElementById(
"reportsDateModalTitle"
);

const weekCalendarSection =
document.getElementById(
"reportsWeekCalendarSection"
);

const applyButton =
document.getElementById(
"reportsDateApplyButton"
);

const isWeekly =
reportsSelectedPeriod ===
"weekly";

if (modalTitle) {
modalTitle.textContent =
isWeekly
? "Select a specific week"
: "Select month and year";
}

if (weekCalendarSection) {
weekCalendarSection.hidden =
!isWeekly;
}

if (applyButton) {
applyButton.textContent =
isWeekly
? "View Week"
: "View Month";
}

if (isWeekly) {
ensureValidDraftWeek();
renderReportsWeekCalendar();
} else if (applyButton) {
applyButton.disabled =
false;
}
}

function applyReportsDateSelection() {
const monthKey =
`${
reportsPickerDraftYear
}-${String(
reportsPickerDraftMonth
).padStart(
2,
"0"
)}`;

if (
reportsSelectedPeriod ===
"monthly"
) {
reportsSelectedMonth =
monthKey;
} else {
if (
!reportsPickerDraftWeek
) {
return;
}

reportsSelectedWeek =
reportsPickerDraftWeek;

reportsSelectedMonth =
getReportMonthKeyForWeek(
reportsSelectedWeek
);
}

closeReportsDateModal();
renderReportsPage();
}

function populateReportsYearOptions() {
const yearSelect =
document.getElementById(
"reportsPickerYearSelect"
);

if (!yearSelect) {
return;
}

const years =
[
...new Set(
Object
.keys(reportsData)
.map(
key =>
Number(
key.slice(
0,
4
)
)
)
)
].sort(
(
first,
second
) =>
first -
second
);

if (
!years.includes(
reportsPickerDraftYear
)
) {
reportsPickerDraftYear =
years[
years.length - 1
];
}

yearSelect.innerHTML =
years
.map(
year => `
<option
value="${year}"
${
year ===
reportsPickerDraftYear
? "selected"
: ""
}
>
${year}
</option>
`
)
.join("");
}

function populateReportsMonthOptions() {
const monthSelect =
document.getElementById(
"reportsPickerMonthSelect"
);

const yearSelect =
document.getElementById(
"reportsPickerYearSelect"
);

if (!monthSelect) {
return;
}

if (yearSelect) {
yearSelect.value =
String(
reportsPickerDraftYear
);
}

const availableMonths =
Object
.keys(reportsData)
.filter(
key =>
Number(
key.slice(
0,
4
)
) ===
reportsPickerDraftYear
)
.map(
key =>
Number(
key.slice(
5,
7
)
)
)
.sort(
(
first,
second
) =>
first -
second
);

if (
!availableMonths.includes(
reportsPickerDraftMonth
)
) {
reportsPickerDraftMonth =
availableMonths[
availableMonths.length -
1
];
}

monthSelect.innerHTML =
availableMonths
.map(
month => `
<option
value="${month}"
${
month ===
reportsPickerDraftMonth
? "selected"
: ""
}
>
${
reportsMonthNames[
month -
1
]
}
</option>
`
)
.join("");
}

function ensureValidDraftWeek() {
if (
reportsSelectedPeriod !==
"weekly"
) {
return;
}

const draftMonthKey =
`${
reportsPickerDraftYear
}-${String(
reportsPickerDraftMonth
).padStart(
2,
"0"
)}`;

if (
getReportMonthKeyForWeek(
reportsPickerDraftWeek
) !==
draftMonthKey
) {
reportsPickerDraftWeek =
getWeekForMonth(
draftMonthKey
);
}
}

function renderReportsWeekCalendar() {
const grid =
document.getElementById(
"reportsWeekCalendarGrid"
);

const preview =
document.getElementById(
"reportsSelectedWeekPreview"
);

const applyButton =
document.getElementById(
"reportsDateApplyButton"
);

if (!grid) {
return;
}

const year =
reportsPickerDraftYear;

const monthIndex =
reportsPickerDraftMonth -
1;

const firstOfMonth =
new Date(
Date.UTC(
year,
monthIndex,
1
)
);

const lastOfMonth =
new Date(
Date.UTC(
year,
monthIndex + 1,
0
)
);

const firstDayNumber =
firstOfMonth.getUTCDay() ||
7;

const gridStart =
new Date(
firstOfMonth
);

gridStart.setUTCDate(
firstOfMonth.getUTCDate() -
firstDayNumber +
1
);

const lastDayNumber =
lastOfMonth.getUTCDay() ||
7;

const gridEnd =
new Date(
lastOfMonth
);

gridEnd.setUTCDate(
lastOfMonth.getUTCDate() +
(
7 -
lastDayNumber
)
);

const selectedRange =
getIsoWeekRange(
reportsPickerDraftWeek
);

const buttons = [];

const cursor =
new Date(
gridStart
);

while (
cursor <= gridEnd
) {
const currentDate =
new Date(
cursor
);

const isoDate =
currentDate
.toISOString()
.slice(
0,
10
);

const weekValue =
getIsoWeekValue(
currentDate
);

const weekMonthKey =
getReportMonthKeyForWeek(
weekValue
);

const isAvailable =
Boolean(
reportsData[
weekMonthKey
]
);

const isOutsideMonth =
currentDate
.getUTCMonth() !==
monthIndex;

const isSelected =
selectedRange &&
currentDate >=
selectedRange.start &&
currentDate <=
selectedRange.end;

const dayOfWeek =
currentDate
.getUTCDay() ||
7;

const classes = [
"reports-calendar-day"
];

if (
isOutsideMonth
) {
classes.push(
"outside-month"
);
}

if (isSelected) {
classes.push(
"selected-week"
);
}

if (
dayOfWeek === 1
) {
classes.push(
"week-start"
);
}

if (
dayOfWeek === 7
) {
classes.push(
"week-end"
);
}

buttons.push(`
<button
class="${classes.join(" ")}"
type="button"
role="gridcell"
data-date="${isoDate}"
aria-label="Select week containing ${currentDate.toLocaleDateString(
"en-US",
{
month: "long",
day: "numeric",
year: "numeric",
timeZone: "UTC"
}
)}"
${
isAvailable
? ""
: "disabled"
}
>
${
currentDate
.getUTCDate()
}
</button>
`);

cursor.setUTCDate(
cursor.getUTCDate() +
1
);
}

grid.innerHTML =
buttons.join("");

const draftWeekAvailable =
Boolean(
reportsData[
getReportMonthKeyForWeek(
reportsPickerDraftWeek
)
]
);

if (preview) {
preview.textContent =
draftWeekAvailable
? `Selected: ${formatWeekRange(
reportsPickerDraftWeek
)}`
: "This week has no report data.";
}

if (applyButton) {
applyButton.disabled =
!draftWeekAvailable;
}
}

function parseIsoDate(value) {
const match =
/^(\d{4})-(\d{2})-(\d{2})$/
.exec(
String(value)
);

if (!match) {
return null;
}

return new Date(
Date.UTC(
Number(match[1]),
Number(match[2]) - 1,
Number(match[3])
)
);
}

function getWeekForMonth(
monthValue
) {
const [
year,
month
] =
String(
monthValue
)
.split("-")
.map(Number);

if (!year || !month) {
return reportsSelectedWeek;
}

const targetDate =
new Date(
Date.UTC(
year,
month,
0
)
);

const targetWeek =
getIsoWeekValue(
targetDate
);

const targetWeekRange =
getIsoWeekRange(
targetWeek
);

if (!targetWeekRange) {
return reportsSelectedWeek;
}

const targetThursday =
new Date(
targetWeekRange.start
);

targetThursday.setUTCDate(
targetWeekRange
.start
.getUTCDate() +
3
);

if (
targetThursday
.getUTCMonth() +
1 !==
month
) {
targetDate.setUTCDate(
targetDate.getUTCDate() -
7
);
}

return getIsoWeekValue(
targetDate
);
}

function getIsoWeekValue(date) {
const target =
new Date(
Date.UTC(
date.getUTCFullYear(),
date.getUTCMonth(),
date.getUTCDate()
)
);

const dayNumber =
target.getUTCDay() ||
7;

target.setUTCDate(
target.getUTCDate() +
4 -
dayNumber
);

const yearStart =
new Date(
Date.UTC(
target.getUTCFullYear(),
0,
1
)
);

const weekNumber =
Math.ceil(
(
(
target -
yearStart
) /
86400000 +
1
) /
7
);

return `${
target.getUTCFullYear()
}-W${String(
weekNumber
).padStart(
2,
"0"
)}`;
}

function getIsoWeekRange(
weekValue
) {
const match =
/^(\d{4})-W(\d{2})$/
.exec(
String(
weekValue
)
);

if (!match) {
return null;
}

const isoYear =
Number(match[1]);

const isoWeek =
Number(match[2]);

const januaryFourth =
new Date(
Date.UTC(
isoYear,
0,
4
)
);

const januaryFourthDay =
januaryFourth
.getUTCDay() ||
7;

const weekOneMonday =
new Date(
januaryFourth
);

weekOneMonday.setUTCDate(
januaryFourth
.getUTCDate() -
januaryFourthDay +
1
);

const start =
new Date(
weekOneMonday
);

start.setUTCDate(
weekOneMonday
.getUTCDate() +
(
(
isoWeek -
1
) *
7
)
);

const end =
new Date(
start
);

end.setUTCDate(
start.getUTCDate() +
6
);

return {
start,
end
};
}

function getReportMonthKeyForWeek(
weekValue
) {
const range =
getIsoWeekRange(
weekValue
);

if (!range) {
return reportsSelectedMonth;
}

const middleOfWeek =
new Date(
range.start
);

middleOfWeek.setUTCDate(
range.start
.getUTCDate() +
3
);

return `${
middleOfWeek
.getUTCFullYear()
}-${String(
middleOfWeek
.getUTCMonth() +
1
).padStart(
2,
"0"
)}`;
}

function formatMonthValue(
monthValue
) {
const [
year,
month
] =
String(
monthValue
)
.split("-")
.map(Number);

if (!year || !month) {
return "Select month";
}

return new Date(
Date.UTC(
year,
month - 1,
1
)
).toLocaleDateString(
"en-US",
{
month: "long",
year: "numeric",
timeZone: "UTC"
}
);
}

function formatWeekRange(
weekValue
) {
const range =
getIsoWeekRange(
weekValue
);

if (!range) {
return "Select week";
}

const start =
range.start;

const end =
range.end;

const startMonth =
start.toLocaleDateString(
"en-US",
{
month: "long",
timeZone: "UTC"
}
);

const endMonth =
end.toLocaleDateString(
"en-US",
{
month: "long",
timeZone: "UTC"
}
);

const startDay =
start.getUTCDate();

const endDay =
end.getUTCDate();

const startYear =
start.getUTCFullYear();

const endYear =
end.getUTCFullYear();

if (
startMonth ===
endMonth &&
startYear ===
endYear
) {
return (
`${startMonth} ` +
`${startDay}–${endDay}, ` +
`${endYear}`
);
}

if (
startYear ===
endYear
) {
return (
`${startMonth} ${startDay}–` +
`${endMonth} ${endDay}, ` +
`${endYear}`
);
}

return (
`${startMonth} ${startDay}, ` +
`${startYear}–` +
`${endMonth} ${endDay}, ` +
`${endYear}`
);
}

/* =========================================================
Report content
========================================================= */

function renderBudgetStatus(
report,
percentageUsed,
remaining,
overBudgetAmount
) {
const statusCard =
document.querySelector(
".reports-status-card"
);

const statusIcon =
document.getElementById(
"reportsStatusIcon"
);

if (!statusCard) {
return;
}

statusCard.classList.remove(
"status-warning",
"status-danger"
);

const budget =
Number(
report.budget || 0
);

const spent =
Number(
report.spent || 0
);

if (percentageUsed <= 70) {
setText(
"reportsStatusTitle",
"On Track"
);

setText(
"reportsStatusDescription",
`${peso(spent)} of ${peso(budget)} was used, leaving ${peso(remaining)} or ${Math.max(
100 - percentageUsed,
0
)}% of the budget available.`
);

if (statusIcon) {
statusIcon.innerHTML =
'<i class="bi bi-shield-check"></i>';
}

return;
}

if (percentageUsed <= 90) {
statusCard.classList.add(
"status-warning"
);

setText(
"reportsStatusTitle",
"Near the Limit"
);

setText(
"reportsStatusDescription",
`${peso(spent)} of ${peso(budget)} was used. ${peso(remaining)} or ${Math.max(
100 - percentageUsed,
0
)}% remains.`
);

if (statusIcon) {
statusIcon.innerHTML =
'<i class="bi bi-exclamation-circle"></i>';
}

return;
}

statusCard.classList.add(
"status-danger"
);

setText(
"reportsStatusTitle",
overBudgetAmount > 0
? "Over Budget"
: "Budget Almost Used"
);

setText(
"reportsStatusDescription",
overBudgetAmount > 0
? `${peso(spent)} was spent against a ${peso(budget)} budget. This is ${peso(overBudgetAmount)} over the limit, with ${percentageUsed}% used.`
: `${peso(spent)} of ${peso(budget)} was used. Only ${peso(remaining)} or ${Math.max(
100 - percentageUsed,
0
)}% remains.`
);

if (statusIcon) {
statusIcon.innerHTML =
'<i class="bi bi-exclamation-triangle"></i>';
}
}

function renderCategories(
categories,
totalSpent
) {
const container =
document.getElementById(
"reportsCategoryList"
);

if (!container) {
return;
}

if (
!Array.isArray(
categories
) ||
categories.length === 0
) {
container.innerHTML = `
<p class="reports-empty-state">
No spending information available.
</p>
`;

return;
}

const sortedCategories =
[...categories].sort(
(
first,
second
) =>
Number(
second.amount || 0
) -
Number(
first.amount || 0
)
);

container.innerHTML =
sortedCategories
.map(
category => {
const amount =
Number(
category.amount ||
0
);

const percentage =
Number(
totalSpent || 0
) > 0
? Math.round(
(
amount /
Number(
totalSpent
)
) *
100
)
: 0;

return `
<div class="reports-category-item">

<div class="reports-category-main">

<div class="reports-category-name-row">

<span class="reports-category-name">

<span
class="reports-category-dot"
style="
background:
${escapeHtml(
category.color
)};
"
></span>

${escapeHtml(
category.name
)}

</span>

<span class="reports-category-percent">
${percentage}%
</span>

</div>

<div class="reports-category-track">

<div
class="reports-category-fill"
style="
width:
${Math.min(
percentage,
100
)}%;

background:
${escapeHtml(
category.color
)};
"
></div>

</div>

</div>

<strong class="reports-category-amount">
${peso(amount)}
</strong>

</div>
`;
}
)
.join("");
}

function renderMemberExpenses(
members,
familyBudget
) {
const container =
document.getElementById(
"reportsMemberExpenseList"
);

if (!container) {
return;
}

if (
!Array.isArray(
members
) ||
members.length === 0
) {
container.innerHTML = `
<p class="reports-empty-state">
No member expense information available.
</p>
`;

return;
}

container.innerHTML =
members
.map(
member => {
const amount =
Number(
member.amount ||
0
);

const budgetShare =
Number(
familyBudget || 0
) > 0
? Math.round(
(
amount /
Number(
familyBudget
)
) *
100
)
: 0;

return `
<div class="reports-member-expense-item">

<span class="reports-member-avatar">
${escapeHtml(
member.shortName ||
member.name
.slice(
0,
2
)
.toUpperCase()
)}
</span>

<div class="reports-member-expense-copy">

<strong>
${escapeHtml(
member.name
)}
</strong>

<span>
Share of the total family budget
</span>

</div>

<div class="reports-member-expense-value">

<strong>
${peso(amount)}
</strong>

<span>
${budgetShare}%
</span>

</div>

</div>
`;
}
)
.join("");
}

function renderExpenseInterpretation(
report,
remaining,
overBudgetAmount,
topCategory,
topCategoryShare
) {
const container =
document.getElementById(
"reportsExpenseInterpretationList"
);

if (!container) {
return;
}

const highestExpense =
report.highestExpense || {
name: "No recorded expense",
amount: 0
};

const items = [
{
icon: "bi-pie-chart",

title: topCategory
? `${topCategory.name} had the largest share`
: "No category data available",

description: topCategory
? `${peso(topCategory.amount)} of the ${peso(report.spent)} total came from this category.`
: "There are no recorded category expenses for this period.",

value: topCategory
? `${topCategoryShare}%`
: "0%"
},

{
icon: "bi-receipt",
title: "Largest recorded expense",
description: `${highestExpense.name} was the highest single expense entered for this report.`,

value: peso(
highestExpense.amount
)
},

{
icon: overBudgetAmount > 0
? "bi-exclamation-triangle"
: "bi-wallet2",

title: overBudgetAmount > 0
? "Spending exceeded the budget"
: "Spending stayed below the budget",

description: overBudgetAmount > 0
? `${peso(report.spent)} was spent against the ${peso(report.budget)} limit.`
: `${peso(report.spent)} was spent from the ${peso(report.budget)} budget.`,

value: overBudgetAmount > 0
? `${peso(overBudgetAmount)} over`
: `${peso(remaining)} left`
}
];

container.innerHTML =
createInterpretationMarkup(
items
);
}

function renderReportInterpretation(
report,
remaining,
overBudgetAmount,
memberTotal,
savingsProgress
) {
const container =
document.getElementById(
"reportsInterpretationList"
);

const heading =
document.getElementById(
"reportsInterpretationHeading"
);

const eyebrow =
document.getElementById(
"reportsInterpretationEyebrow"
);

if (!container) {
return;
}

let items = [];

if (reportsSelectedFocus === "family") {
const members =
Array.isArray(
report.memberExpenses
)
? report.memberExpenses
: [];

const highestMember =
[...members].sort(
(first, second) =>
Number(
second.amount || 0
) -
Number(
first.amount || 0
)
)[0] || null;

const familyShare =
Number(
report.budget || 0
) > 0
? Math.round(
(
memberTotal /
Number(
report.budget
)
) * 100
)
: 0;

const highestMemberShare =
highestMember &&
memberTotal > 0
? Math.round(
(
Number(
highestMember.amount || 0
) /
memberTotal
) * 100
)
: 0;

if (eyebrow) {
eyebrow.textContent =
"Based on the family chart";
}

if (heading) {
heading.textContent =
"Family Spending Interpretation";
}

items = [
{
icon: "bi-people",
title: "Combined family spending",
description: `${peso(memberTotal)} was recorded across all household members.`,
value: `${familyShare}% of budget`
},

{
icon: "bi-person-bar-chart",

title: highestMember
? `${highestMember.name} recorded the highest spending`
: "No member spending recorded",

description: highestMember
? `${peso(highestMember.amount)} represented ${highestMemberShare}% of all member expenses.`
: "There are no member expenses for this period.",

value: highestMember
? `${highestMemberShare}% share`
: "0%"
},

{
icon: overBudgetAmount > 0
? "bi-exclamation-triangle"
: "bi-wallet2",

title: overBudgetAmount > 0
? "Family spending is over budget"
: "Family spending is within budget",

description: overBudgetAmount > 0
? `${peso(memberTotal)} exceeded the ${peso(report.budget)} family budget.`
: `${peso(memberTotal)} was used from the ${peso(report.budget)} family budget.`,

value: overBudgetAmount > 0
? `${peso(overBudgetAmount)} over`
: `${peso(remaining)} left`
}
];
} else {
const savingsGap =
Math.max(
Number(
report.savingsGoal || 0
) -
Number(
report.savings || 0
),
0
);

const obligationsPaid =
Number(
report.billsPaid || 0
) +
Number(
report.debtPaid || 0
);

const collectibleCoverage =
Number(
report.debtBalance || 0
) > 0
? Math.round(
(
Number(
report.owedToYou || 0
) /
Number(
report.debtBalance || 0
)
) * 100
)
: 0;

if (eyebrow) {
eyebrow.textContent =
"Based on the goals chart";
}

if (heading) {
heading.textContent =
"Goals and Obligations Interpretation";
}

items = [
{
icon: "bi-piggy-bank",
title: "Savings goal progress",
description: `${peso(report.savings)} of the ${peso(report.savingsGoal)} target has been saved.`,
value: `${savingsProgress}% complete`
},

{
icon: "bi-bullseye",
title: "Amount still needed for the goal",

description: savingsGap > 0
? `${peso(savingsGap)} remains before the savings target is reached.`
: "The savings target has been reached for this period.",

value: savingsGap > 0
? peso(savingsGap)
: "Goal reached"
},

{
icon: "bi-check2-circle",
title: "Bills and debt payments recorded",
description: `${peso(report.billsPaid)} in bills and ${peso(report.debtPaid)} in debt payments were completed.`,

value: peso(
obligationsPaid
)
},

{
icon: "bi-arrow-down-left-circle",
title: "Collectible amount compared with debt",
description: `${peso(report.owedToYou)} owed to the household equals ${collectibleCoverage}% of the current ${peso(report.debtBalance)} debt balance.`,
value: `${collectibleCoverage}% coverage`
}
];
}

container.innerHTML =
createInterpretationMarkup(
items
);
}

function createInterpretationMarkup(
items
) {
return items
.map(
item => `
<div class="reports-interpretation-item">

<span class="reports-interpretation-icon">
<i class="bi ${escapeHtml(
item.icon
)}"></i>
</span>

<div class="reports-interpretation-copy">

<strong>
${escapeHtml(
item.title
)}
</strong>

<span>
${escapeHtml(
item.description
)}
</span>

</div>

<b class="reports-interpretation-value">
${escapeHtml(
item.value
)}
</b>

</div>
`
)
.join("");
}

function updatePeriodButtons() {
const weeklyButton =
document.getElementById(
"reportsWeeklyButton"
);

const monthlyButton =
document.getElementById(
"reportsMonthlyButton"
);

const weeklyActive =
reportsSelectedPeriod ===
"weekly";

const monthlyActive =
reportsSelectedPeriod ===
"monthly";

if (weeklyButton) {
weeklyButton.classList.toggle(
"active",
weeklyActive
);

weeklyButton.setAttribute(
"aria-pressed",
String(
weeklyActive
)
);
}

if (monthlyButton) {
monthlyButton.classList.toggle(
"active",
monthlyActive
);

monthlyButton.setAttribute(
"aria-pressed",
String(
monthlyActive
)
);
}
}

function updateVisibleReportSections() {
document
.querySelectorAll(
".reports-filter-section"
)
.forEach(
section => {
const supportedTypes =
String(
section
.dataset
.sectionTypes ||
""
)
.split(/\s+/)
.filter(Boolean);

const shouldShow =
supportedTypes.includes(
reportsSelectedFocus
);

section.classList.toggle(
"is-hidden",
!shouldShow
);
}
);
}

/* =========================================================
Helpers
========================================================= */

function getTopCategory(
categories
) {
if (
!Array.isArray(
categories
) ||
categories.length === 0
) {
return null;
}

return [...categories].sort(
(
first,
second
) =>
Number(
second.amount || 0
) -
Number(
first.amount || 0
)
)[0];
}

function getMemberExpenseTotal(
members
) {
if (
!Array.isArray(
members
)
) {
return 0;
}

return members.reduce(
(
total,
member
) =>
total +
Number(
member.amount || 0
),
0
);
}

function peso(value) {
return `₱${Number(
value || 0
).toLocaleString(
"en-PH",
{
minimumFractionDigits: 0,
maximumFractionDigits: 0
}
)}`;
}

function compactPeso(value) {
const number =
Number(
value || 0
);

if (
number >=
1000000
) {
return `₱${(
number /
1000000
).toFixed(1)}M`;
}

if (
number >=
1000
) {
return `₱${(
number /
1000
).toFixed(
number %
1000 ===
0
? 0
: 1
)}K`;
}

return `₱${number}`;
}

function setText(
id,
value
) {
const element =
document.getElementById(
id
);

if (element) {
element.textContent =
value;
}
}

function escapeHtml(value) {
return String(
value ??
""
)
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