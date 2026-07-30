document.addEventListener("DOMContentLoaded", () => {

const budgetCalculatorBackButton =
document.getElementById(
"budgetCalculatorBackButton"
);

if(budgetCalculatorBackButton){

budgetCalculatorBackButton
.addEventListener(
"click",
()=>{

const parameters =
new URLSearchParams(
window.location.search
);

const source =
parameters.get("from");

if(
source === "home" ||
window.history.length <= 1
){

window.location.href =
"home.html";

return;

}

window.history.back();

}
);

}


// ===============================
// BUDGET TOOL SWITCH
// ===============================

const budgetToolButtons =
document.querySelectorAll(
"[data-budget-view]"
);

const budgetToolPanels =
document.querySelectorAll(
"[data-budget-panel]"
);

budgetToolButtons.forEach(button=>{

button.addEventListener("click",()=>{
setBudgetToolView(
button.dataset.budgetView
);
});

});

function setBudgetToolView(view){

const selectedView =
view === "planner"
? "planner"
: "calculator";

budgetToolButtons.forEach(button=>{
const active =
button.dataset.budgetView === selectedView;

button.classList.toggle("active",active);
button.setAttribute(
"aria-selected",
String(active)
);
});

budgetToolPanels.forEach(panel=>{
const active =
panel.dataset.budgetPanel === selectedView;

panel.hidden = !active;
panel.classList.toggle("active",active);
});

window.scrollTo({top:0,behavior:"smooth"});
}


// ===============================
// LOCAL PROTOTYPE STORAGE
// ===============================

const CALCULATOR_BUDGET_STORAGE_KEY =
"kabalikat_budget_calculator_state_v1";

const CALCULATOR_ACTIONS_STORAGE_KEY =
"kabalikat_budget_calculator_actions_v1";

const CALCULATOR_PENDING_EXPENSES_KEY =
"kabalikat_pending_expenses_v1";

const SAVINGS_STORAGE_KEY =
"kabalikat_household_allocations_v1";

const CALCULATOR_PROFILE_KEY =
"kabalikat_profile_v1";

const SAVINGS_GOAL_STORAGE_KEYS = [
    "kabalikat_savings_goals_v1",
    "kabalikat_savings_goals",
    "kabalikat_savings_state_v1",
    "kabalikat_goals_v1",
    "savings_goals"
];

const DEFAULT_CALCULATOR_SAVINGS_GOALS = [
    "School Supplies",
    "New Refrigerator",
    "Family Vacation"
];

const BUDGET_PLANNER_STORAGE_KEY =
"kabalikat_budget_plans_v2";

const PLANNER_MEMBER_STORAGE_KEYS = [
    "kabalikat_household_members_v1",
    "kabalikat_family_members_v1",
    "kabalikat_members_v1"
];

const PLANNER_SEASONAL_STORAGE_KEYS = [
    "kabalikat_seasonal_plans_v1",
    "kabalikat_seasonal_plans",
    "seasonal_plans"
];

const DEFAULT_PLANNER_MEMBERS = [
    {
        id: "ana",
        name: "Ana Dela Cruz",
        initials: "AD"
    },
    {
        id: "marco",
        name: "Marco Dela Cruz",
        initials: "MD"
    },
    {
        id: "lolo-ben",
        name: "Lolo Ben",
        initials: "LB"
    }
];

const DEFAULT_HOUSEHOLD_BUDGET = {
    total: 25000,
    spent: 8000,
    remaining: 17000,
    daysLeft: 15,
    reservedSavings: 0
};


// ===============================
// TEMP HOUSEHOLD DATA
// Replace with database later
// ===============================

let householdBudget =
loadCalculatorBudgetState();





// ===============================
// CALCULATOR STATE
// ===============================

let currentInput = "";

let firstValue = null;

let currentOperator = null;

let lastCompletedExpression = "";

let selectedMode = "spend";

let selectedCategory = "None";

let selectedSeasonalPlan = null;

let lastExpenseCategory = "";
const CATEGORY_VISUALS = {
"":{icon:"bi-list-check",soft:"#F4EFEC",accent:"#5C534E"},Food:{icon:"bi-basket",soft:"#F0E0F2",accent:"#B164AE"},Grocery:{icon:"bi-cart3",soft:"#F0E0F2",accent:"#B164AE"},Utilities:{icon:"bi-lightning-charge",soft:"#FAF0C6",accent:"#AA8024"},Transportation:{icon:"bi-bus-front",soft:"#E0EEF4",accent:"#50849F"},Health:{icon:"bi-heart-pulse",soft:"#E5F1E8",accent:"#5C8F6C"},School:{icon:"bi-book",soft:"#FBE5D8",accent:"#C96E4B"},Rent:{icon:"bi-house-door",soft:"#F6E1EC",accent:"#B35A82"},Savings:{icon:"bi-piggy-bank",soft:"#E0F0EC",accent:"#4F8B78"},"Seasonal Plans":{icon:"bi-calendar-event",soft:"#FFF1E8",accent:"#C96E4B"},Debt:{icon:"bi-credit-card",soft:"#E0F0EC",accent:"#4F8B78"},Other:{icon:"bi-three-dots",soft:"#EBE6F5",accent:"#6E618E"}};
const CALCULATOR_SEASONAL_PLANS=[
{id:"nutrition-month",name:"Nutrition Month",icon:"bi-egg-fried",range:"July 1 – July 31, 2026",budget:2200,spent:980,soft:"#F0E0F2",accent:"#B164AE"},
{id:"school-opening",name:"School Opening",icon:"bi-backpack2",range:"July 1 – July 31, 2026",budget:3000,spent:1450,soft:"#E0EEF4",accent:"#50849F"},
{id:"town-fiesta",name:"Town Fiesta",icon:"bi-stars",range:"July 20 – July 28, 2026",budget:2500,spent:1120,soft:"#FBE5D8",accent:"#C96E4B"},
{id:"barangay-outreach",name:"Barangay Outreach",icon:"bi-people",range:"July 8 – July 30, 2026",budget:1800,spent:640,soft:"#E5F1E8",accent:"#5C8F6C"}
];









// ===============================
// STORAGE HELPERS
// ===============================

function readStoredJson(
key,
fallback
){

try{

const stored =
localStorage.getItem(
key
);

return stored
?
JSON.parse(stored)
:
fallback;

}
catch(error){

console.error(
`Unable to read ${key}:`,
error
);

return fallback;

}

}


function writeStoredJson(
key,
value
){

try{

localStorage.setItem(
key,
JSON.stringify(value)
);

return true;

}
catch(error){

console.error(
`Unable to save ${key}:`,
error
);

return false;

}

}


function loadCalculatorBudgetState(){

const stored =
readStoredJson(
CALCULATOR_BUDGET_STORAGE_KEY,
null
);

if(
!stored ||
typeof stored !==
"object"
){

return {
...DEFAULT_HOUSEHOLD_BUDGET
};

}

const total =
Math.max(
Number(
stored.total ??
DEFAULT_HOUSEHOLD_BUDGET.total
),
0
);

const spent =
Math.max(
Number(
stored.spent ??
DEFAULT_HOUSEHOLD_BUDGET.spent
),
0
);

const reservedSavings =
Math.max(
Number(
stored.reservedSavings ||
0
),
0
);

const remaining =
Number.isFinite(
Number(
stored.remaining
)
)
?
Number(
stored.remaining
)
:
total -
spent -
reservedSavings;

return {
total,
spent,
remaining,
reservedSavings,
daysLeft:
Math.max(
Number(
stored.daysLeft ||
DEFAULT_HOUSEHOLD_BUDGET.daysLeft
),
0
)
};

}


function persistCalculatorBudgetState(){

writeStoredJson(
CALCULATOR_BUDGET_STORAGE_KEY,
householdBudget
);

}


function createCalculatorRecordId(
prefix
){

if(
typeof crypto !==
"undefined" &&
typeof crypto.randomUUID ===
"function"
){

return `${prefix}-${crypto.randomUUID()}`;

}

return `${prefix}-${Date.now()}-${Math.random()
.toString(16)
.slice(2)}`;

}


function getCurrentMonthKey(){

const today =
new Date();

return `${today.getFullYear()}-${String(
today.getMonth() + 1
).padStart(2,"0")}`;

}


// ===============================
// CURRENT USER AND SAVINGS GOALS
// ===============================

function getCalculatorCurrentUser(){

const profile =
readStoredJson(
CALCULATOR_PROFILE_KEY,
{}
);

const name =
String(
profile?.name ||
profile?.fullName ||
profile?.displayName ||
"Elena Dela Cruz"
).trim();

return {
name:
name ||
"Elena Dela Cruz"
};

}


function collectGoalNamesFromValue(
value
){

const names = [];

const collect =
item=>{

if(!item){
return;
}

if(Array.isArray(item)){
item.forEach(collect);
return;
}

if(typeof item === "string"){

const value =
item.trim();

if(value){
names.push(value);
}

return;

}

if(typeof item !== "object"){
return;
}

const candidate =
item.goalName ||
item.name ||
item.title ||
item.label;

const looksLikeGoal =
"target" in item ||
"targetAmount" in item ||
"goalAmount" in item ||
"saved" in item ||
"savedAmount" in item ||
"currentAmount" in item ||
"progress" in item ||
String(item.type || "")
.toLowerCase()
.includes("goal");

if(
candidate &&
looksLikeGoal
){

names.push(
String(candidate).trim()
);

}

[
item.goals,
item.savingsGoals,
item.activeGoals,
item.items,
item.data
]
.forEach(collect);

};

collect(value);

return names;

}


function getSavedSavingsGoalNames(){

const keys =
new Set(
SAVINGS_GOAL_STORAGE_KEYS
);

for(
let index = 0;
index < localStorage.length;
index += 1
){

const key =
localStorage.key(index);

if(
key &&
/sav(ing|ings).*goal|goal.*sav(ing|ings)/i.test(key)
){
keys.add(key);
}

}

const names = [];

keys.forEach(key=>{

const stored =
readStoredJson(
key,
null
);

names.push(
...collectGoalNamesFromValue(
stored
)
);

});

return [
...new Set(
names
.map(name=>name.trim())
.filter(name=>
name &&
name.toLowerCase() !==
"general savings"
)
)
];

}


function populateSavingsDestinationOptions(){

const select =
document.getElementById(
"savingsDestinationSelect"
);

if(!select){
return;
}

const previousValue =
select.value ||
"General Savings";

const savedGoals =
getSavedSavingsGoalNames();

const goalOptions = [
...new Set([
...savedGoals,
...DEFAULT_CALCULATOR_SAVINGS_GOALS
])
]
.slice(0,3);

const options = [
"General Savings",
...goalOptions
];

select.innerHTML =
options
.map(option=>
`<option value="${escapeCalculatorHtml(option)}">${escapeCalculatorHtml(option)}</option>`
)
.join("");

select.value =
options.includes(previousValue)
?
previousValue
:
"General Savings";

}


function escapeCalculatorHtml(
value
){

return String(value ?? "")
.replaceAll("&","&amp;")
.replaceAll("<","&lt;")
.replaceAll(">","&gt;")
.replaceAll('"',"&quot;")
.replaceAll("'","&#039;");

}


function renderCurrentCalculatorUser(){

const element =
document.getElementById(
"decisionCurrentUser"
);

if(element){
element.textContent =
getCalculatorCurrentUser().name;
}

}


// ===============================
// INITIAL LOAD
// ===============================

function renderBudgetOverview(){

document.getElementById(
"totalBudget"
).textContent =
formatMoney(
householdBudget.total
);


document.getElementById(
"spentAmount"
).textContent =
formatMoney(
householdBudget.spent
);


document.getElementById(
"remainingAmount"
).textContent =
formatMoney(
householdBudget.remaining
);


document.getElementById(
"daysRemaining"
).textContent =
householdBudget.daysLeft;

}


renderBudgetOverview();









function formatMoney(value){

    const amount =
    Number(value || 0);

    const sign =
    amount < 0
    ?
    "-"
    :
    "";

    return sign +
    "₱" +
    Math.abs(amount)
    .toLocaleString(
    "en-PH",
    {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }
    );

}









// ===============================
// CALCULATOR DISPLAY
// ===============================

const amountDisplay =
document.getElementById(
"amountValue"
);

const calculationExpression =
document.getElementById(
"calculationExpression"
);


function formatCalculatorNumber(
value
){

const numeric =
Number(value);

if(!Number.isFinite(numeric)){
return String(value || 0);
}

return numeric.toLocaleString(
"en-PH",
{
maximumFractionDigits:2
}
);

}


function updateExpressionDisplay(){

if(!calculationExpression){
return;
}

if(
currentOperator !== null &&
firstValue !== null
){

const secondPart =
currentInput === ""
?
""
:
` ${currentInput}`;

calculationExpression.textContent =
`${formatCalculatorNumber(firstValue)} ${currentOperator}${secondPart}`;

return;

}

calculationExpression.textContent =
lastCompletedExpression ||
currentInput ||
"0";

}


function updateDisplay(){

if(currentInput === ""){

amountDisplay.textContent =
"₱0";

updateExpressionDisplay();
updateBudgetImpact();

return;

}

amountDisplay.textContent =
formatMoney(currentInput);

updateExpressionDisplay();
updateBudgetImpact();

}


// ===============================
// KEYPAD
// ===============================


document
.querySelectorAll(".keypad button")
.forEach(button=>{


button.addEventListener(
"click",
()=>{


let value =
button.dataset.key ||
button.textContent.trim();




if(value === "C"){

    resetCalculator();

    return;

}




if(value === "⌫"){

    currentInput =
    currentInput.slice(0,-1);

    updateDisplay();

    return;

}





if(value === "="){

    calculate();

    return;

}





if(
["+","−","×","÷"]
.includes(value)
){

    setOperator(value);

    return;

}




if(value === "%"){

    currentInput =
    String(
    Number(currentInput || 0) / 100
    );

    lastCompletedExpression =
    `${currentInput} %`;

    updateDisplay();

    return;

}





if(lastCompletedExpression){

currentInput = "";
lastCompletedExpression = "";

}

currentInput += value;

updateDisplay();



});


});









// ===============================
// OPERATIONS
// ===============================


function setOperator(operator){


if(currentInput === "")
return;


firstValue =
Number(currentInput);


currentOperator =
operator;

lastCompletedExpression =
"";

currentInput = "";

updateExpressionDisplay();



}







function calculate(){


if(
firstValue === null ||
currentOperator === null ||
currentInput === ""
){

updateBudgetImpact();

return;

}



let secondValue =
Number(currentInput);



let result;



switch(currentOperator){


case "+":

result =
firstValue + secondValue;

break;



case "−":

result =
firstValue - secondValue;

break;



case "×":

result =
firstValue * secondValue;

break;



case "÷":

result =
firstValue / secondValue;

break;


}




lastCompletedExpression =
`${formatCalculatorNumber(firstValue)} ${currentOperator} ${formatCalculatorNumber(secondValue)} = ${formatCalculatorNumber(result)}`;

currentInput =
String(result);


firstValue = null;

currentOperator = null;



updateDisplay();

updateBudgetImpact();


}








function resetCalculator(){

currentInput="";

firstValue=null;

currentOperator=null;

lastCompletedExpression =
"";

amountDisplay.textContent =
"₱0";

updateExpressionDisplay();

updateBudgetImpact();


}









// ===============================
// FUNCTION MODES
// ===============================


document
.querySelectorAll(".function[data-function]")
.forEach(button=>{


button.addEventListener(
"click",
()=>{


document
.querySelectorAll(".function")
.forEach(btn=>
btn.classList.remove("active")
);


button.classList.add("active");


selectedMode =
button.dataset.function;



updateMode();


});


});








function updateMode(){

const label =
document.getElementById(
"amountLabel"
);

const extra =
document.getElementById(
"extraInputs"
);

const memberField =
document.getElementById(
"memberInputField"
);

const daysField =
document.getElementById(
"daysInputField"
);

const applyCard =
document.getElementById(
"decisionApplyCard"
);

const nameField =
document.getElementById(
"decisionNameField"
);

const saveDestinationField =
document.getElementById(
"saveDestinationField"
);

const splitSummary =
document.getElementById(
"splitApplySummary"
);

const actionText =
document.getElementById(
"applyDecisionButtonText"
);

const applyTitle =
document.getElementById(
"decisionApplyTitle"
);


extra.classList.add(
"hidden"
);

memberField.classList.add(
"hidden"
);

daysField.classList.add(
"hidden"
);

nameField.hidden =
selectedMode ===
"save";

saveDestinationField.hidden =
selectedMode !==
"save";

splitSummary.hidden =
selectedMode !==
"split";

applyCard.classList.remove(
"mode-spend",
"mode-save",
"mode-split"
);

applyCard.classList.add(
`mode-${selectedMode}`
);


if(
selectedMode ===
"save"
){

if(
categorySelect.value &&
categorySelect.value !==
"Savings"
){

lastExpenseCategory =
categorySelect.value;

}

categorySelect.value =
"Savings";

categorySelect.disabled =
true;

selectedCategory =
"Savings";

selectedSeasonalPlan =
null;

label.textContent =
"Amount to Save";

actionText.textContent =
"Move to Savings";

applyTitle.textContent =
"Move to Savings";

populateSavingsDestinationOptions();

}
else{

categorySelect.disabled =
false;

if(
categorySelect.value ===
"Savings"
){

categorySelect.value =
lastExpenseCategory ||
"";

selectedCategory =
categorySelect.value ||
"None";

}

if(
selectedMode ===
"split"
){

label.textContent =
"Amount to Split";

extra.classList.remove(
"hidden"
);

memberField.classList.remove(
"hidden"
);

actionText.textContent =
"Apply Shared Expense";

applyTitle.textContent =
"Apply Shared Expense";

}
else{

label.textContent =
"Amount to Spend";

actionText.textContent =
"Apply Expense";

applyTitle.textContent =
"Apply Expense";

}

}

updateCategorySelectAppearance();
renderCalculatorSeasonalPlans();
updateBudgetImpact();

}


// ===============================
// PLANNING CATEGORY SELECT
// ===============================
const categorySelect=document.getElementById("categorySelect");
const categorySelectShell=document.getElementById("categorySelectShell");
const categorySelectIcon=document.getElementById("categorySelectIcon");
const categorySelectLabel=document.querySelector(".category-select-label");
const seasonalPlanPicker=document.getElementById("seasonalPlanPicker");
const seasonalPlanList=document.getElementById("seasonalPlanList");
categorySelect.addEventListener(
"change",
()=>{

selectedCategory =
categorySelect.value ||
"None";

selectedSeasonalPlan =
null;

if(
selectedMode !==
"save" &&
categorySelect.value
){

lastExpenseCategory =
categorySelect.value;

}

updateCategorySelectAppearance();

renderCalculatorSeasonalPlans();

updateBudgetImpact();

}
);
function updateCategorySelectAppearance(){const value=categorySelect.value||"";const visual=CATEGORY_VISUALS[value]||CATEGORY_VISUALS[""];categorySelectShell.style.setProperty("--selected-soft",visual.soft);categorySelectShell.style.setProperty("--selected-accent",visual.accent);categorySelectIcon.innerHTML=`<i class="bi ${visual.icon}"></i>`;categorySelectLabel.textContent=value||"What are you planning?";}
function renderCalculatorSeasonalPlans(){const isSeasonal=categorySelect.value==="Seasonal Plans";seasonalPlanPicker.hidden=!isSeasonal;if(!isSeasonal){seasonalPlanList.innerHTML="";return;}seasonalPlanList.innerHTML=CALCULATOR_SEASONAL_PLANS.map(plan=>{const remaining=Math.max(Number(plan.budget||0)-Number(plan.spent||0),0);return `<button type="button" class="calculator-seasonal-plan ${selectedSeasonalPlan?.id===plan.id?"selected":""}" data-calculator-seasonal-plan="${plan.id}" style="--plan-soft:${plan.soft};--plan-accent:${plan.accent};"><span class="calculator-seasonal-icon"><i class="bi ${plan.icon}"></i></span><span class="calculator-seasonal-copy"><strong>${plan.name}</strong><small>${plan.range}</small></span><span class="calculator-seasonal-values"><strong>${formatMoney(remaining)}</strong><small>remaining</small></span></button>`;}).join("");seasonalPlanList.querySelectorAll("[data-calculator-seasonal-plan]").forEach(button=>{button.addEventListener("click",()=>{selectedSeasonalPlan=CALCULATOR_SEASONAL_PLANS.find(plan=>plan.id===button.dataset.calculatorSeasonalPlan)||null;renderCalculatorSeasonalPlans();updateBudgetImpact();});});}
updateCategorySelectAppearance();renderCalculatorSeasonalPlans();

// ===============================
// BUDGET IMPACT
// ===============================

// ===============================


function updateBudgetImpact(){


const amount =
Math.max(
Number(currentInput || 0),
0
);

const availableBudget =
Math.max(
Number(
householdBudget.remaining || 0
),
0
);

/*
    The entered amount is always the full household amount
    being spent, saved, or allocated. Split, Per Day, and
    Per Member only change how that amount is distributed.
*/
const memberCount =
Math.max(
Number(
document.getElementById(
"memberInput"
).value || 0
),
0
);

const appliedAmount =
selectedMode === "split" &&
memberCount >= 2
?
amount / memberCount
:
amount;

const remainingAfterDecision =
availableBudget - appliedAmount;

const affectedPercent =
availableBudget > 0
?
(appliedAmount / availableBudget) * 100
:
amount > 0
?
100
:
0;

const dayCount =
Math.max(
Number(
document.getElementById(
"daysInput"
).value || 0
),
0
);

let planningFor =
selectedSeasonalPlan?.name ||
selectedCategory;


if(
selectedMode ===
"save"
){

planningFor =
document.getElementById(
"savingsDestinationSelect"
)?.value ||
"General Savings";

}


if(
selectedMode === "split" &&
memberCount > 0 &&
amount > 0
){

planningFor +=
` • ${formatMoney(
amount / memberCount
)} each`;

}


if(
selectedMode === "daily" &&
dayCount > 0 &&
amount > 0
){

planningFor +=
` • ${formatMoney(
amount / dayCount
)}/day`;

}


if(
selectedMode === "member" &&
memberCount > 0 &&
amount > 0
){

planningFor +=
` • ${formatMoney(
amount / memberCount
)}/member`;

}


document
.getElementById(
"impactCategory"
)
.textContent =
planningFor;


document
.getElementById(
"impactBudget"
)
.textContent =
formatMoney(
remainingAfterDecision
);


document
.getElementById(
"impactPercent"
)
.textContent =
`${affectedPercent.toFixed(1)}%`;


const status =
document.getElementById(
"impactStatus"
);

const budgetText =
document.getElementById(
"impactBudget"
);

status.classList.remove(
"safe",
"manageable",
"caution",
"danger"
);

budgetText.classList.remove(
"safe",
"manageable",
"caution",
"danger"
);


let statusText =
"Safe";

let statusClass =
"safe";


if(
remainingAfterDecision < 0 ||
affectedPercent > 100
){

statusText =
"Over Budget";

statusClass =
"danger";

}
else if(
affectedPercent > 75
){

statusText =
"Critical";

statusClass =
"danger";

}
else if(
affectedPercent > 50
){

statusText =
"Be Careful";

statusClass =
"caution";

}
else if(
affectedPercent > 25
){

statusText =
"Manageable";

statusClass =
"manageable";

}


status.textContent =
statusText;

status.classList.add(
statusClass
);

budgetText.classList.add(
statusClass
);


updateSplitSharePreview(
amount,
memberCount
);

updateDecisionActionAvailability();

}







document
.querySelectorAll(
[
"#memberInput",
"#daysInput",
"#decisionTitleInput",
"#savingsDestinationSelect"
].join(", ")
)
.forEach(input=>{

input.addEventListener(
input.tagName ===
"SELECT"
?
"change"
:
"input",
updateBudgetImpact
);

});







// ===============================
// APPLY CALCULATOR DECISION
// ===============================

const applyDecisionButton =
document.getElementById(
"applyDecisionButton"
);

const calculatorToast =
document.getElementById(
"calculatorToast"
);

let calculatorToastTimer =
null;


applyDecisionButton.addEventListener(
"click",
applyCurrentDecision
);


function getCurrentDecisionAmount(){

return Math.max(
Number(
currentInput ||
0
),
0
);

}


function getDecisionValidation(){

const amount =
getCurrentDecisionAmount();

const category =
categorySelect.value ||
"";

const title =
document.getElementById(
"decisionTitleInput"
).value.trim();

const memberCount =
Math.max(
Number(
document.getElementById(
"memberInput"
).value ||
0
),
0
);

if(
amount <= 0
){

return {
valid:false,
message:
"Enter an amount first."
};

}

const appliedAmount =
selectedMode ===
"split" &&
memberCount >= 2
?
amount /
memberCount
:
amount;

if(
appliedAmount >
Number(
householdBudget.remaining ||
0
)
){

return {
valid:false,
message:
selectedMode ===
"split"
?
"Your share is higher than the remaining budget."
:
"This amount is higher than the remaining budget."
};

}

if(
selectedMode !==
"save" &&
!category
){

return {
valid:false,
message:
"Choose what you are planning."
};

}

if(
category ===
"Seasonal Plans" &&
!selectedSeasonalPlan
){

return {
valid:false,
message:
"Choose a seasonal plan."
};

}

if(
selectedMode !==
"save" &&
!title
){

return {
valid:false,
message:
"Add an expense name."
};

}

if(
selectedMode ===
"split" &&
memberCount < 2
){

return {
valid:false,
message:
"Enter at least two members for a shared expense."
};

}

return {
valid:true,
message:
selectedMode ===
"save"
?
"Ready to move this amount to savings."
:
selectedMode ===
"split"
?
"Ready to record one shared expense."
:
"Ready to record this expense."
};

}


function updateDecisionActionAvailability(){

const validation =
getDecisionValidation();

applyDecisionButton.disabled =
!validation.valid;

const actionHint =
document.getElementById(
"decisionActionHint"
);

actionHint.textContent =
validation.message;

actionHint.classList.toggle(
"attention",
validation.message ===
"Add an expense name."
);

}


function updateSplitSharePreview(
amount,
memberCount
){

const splitAmount =
document.getElementById(
"splitShareAmount"
);

const splitText =
document.getElementById(
"splitShareText"
);

if(
selectedMode !==
"split"
){

return;

}

if(
amount > 0 &&
memberCount >= 2
){

splitAmount.textContent =
formatMoney(
amount /
memberCount
);

splitText.textContent =
`${formatMoney(amount)} total ÷ ${memberCount} members`;

return;

}

splitAmount.textContent =
"₱0";

splitText.textContent =
"Enter at least two members.";

}


function buildDecisionRecord(){

const enteredAmount =
getCurrentDecisionAmount();

const title =
document.getElementById(
"decisionTitleInput"
).value.trim();

const member =
getCalculatorCurrentUser().name;

const memberCount =
Math.max(
Number(
document.getElementById(
"memberInput"
).value ||
0
),
0
);

const sharePerMember =
selectedMode ===
"split" &&
memberCount >= 2
?
enteredAmount /
memberCount
:
enteredAmount;

const destination =
document.getElementById(
"savingsDestinationSelect"
).value;

const date =
new Date()
.toISOString()
.slice(0,10);

const baseRecord = {
id:
createCalculatorRecordId(
"calculator"
),
mode:selectedMode,
amount:
selectedMode ===
"split"
?
sharePerMember
:
enteredAmount,
date,
createdAt:
new Date()
.toISOString(),
source:
"budget-calculator"
};


if(
selectedMode ===
"save"
){

return {
...baseRecord,
category:
"Savings",
title:
destination,
member,
destination
};

}


return {
...baseRecord,
category:
categorySelect.value ||
"Other",
title,
member,
seasonalPlanId:
selectedSeasonalPlan?.id ||
"",
seasonalPlanName:
selectedSeasonalPlan?.name ||
"",
split:
selectedMode ===
"split"
?
{
memberCount,
totalAmount:
enteredAmount,
sharePerMember
}
:
null
};

}


function buildConfirmationMessage(
record
){

if(
record.mode ===
"save"
){

return `Move ${formatMoney(
record.amount
)} from the available budget to ${record.destination}?`;

}

if(
record.mode ===
"split"
){

return `Record ${formatMoney(
record.split.sharePerMember
)} as ${record.member}'s share of "${record.title}" (${formatMoney(
record.split.totalAmount
)} split among ${record.split.memberCount} members)?`;

}

return `Add "${record.title}" worth ${formatMoney(
record.amount
)} to household expenses?`;

}


function applyCurrentDecision(){

const validation =
getDecisionValidation();

if(
!validation.valid
){

showCalculatorToast(
validation.message
);

return;

}

const record =
buildDecisionRecord();

if(
!window.confirm(
buildConfirmationMessage(
record
)
)
){

return;

}


if(
record.mode ===
"save"
){

const savingsResult =
persistSavingsDecision(
record
);

if(
!savingsResult.ok
){

showCalculatorToast(
savingsResult.message
);

return;

}

householdBudget.reservedSavings =
Math.max(
Number(
householdBudget.reservedSavings ||
0
),
0
) +
record.amount;

}
else{

persistPendingExpense(
record
);

householdBudget.spent =
Math.max(
Number(
householdBudget.spent ||
0
),
0
) +
record.amount;

}


householdBudget.remaining =
Number(
householdBudget.remaining ||
0
) -
record.amount;

persistCalculatorAction(
record
);

persistCalculatorBudgetState();

renderBudgetOverview();

const successCopy =
getDecisionSuccessCopy(
record
);

showCalculatorSuccess(
successCopy.title,
successCopy.message,
resetAppliedDecision
);

}


function getDecisionSuccessCopy(
record
){

if(
record.mode ===
"save"
){

return {
title:
"Savings Updated",
message:
`${formatMoney(record.amount)} was added to ${record.destination}.`
};

}

if(
record.mode ===
"split"
){

return {
title:
"Shared Expense Recorded",
message:
`${formatMoney(record.amount)} was recorded as your share.`
};

}

return {
title:
"Expense Recorded",
message:
"Your expense has been saved successfully."
};

}


function showCalculatorSuccess(
title,
message,
onComplete
){

const overlay =
document.getElementById(
"calculatorSuccessOverlay"
);

const titleElement =
document.getElementById(
"calculatorSuccessTitle"
);

const messageElement =
document.getElementById(
"calculatorSuccessMessage"
);

if(!overlay){
showCalculatorToast(message);
onComplete?.();
return;
}

titleElement.textContent =
title;

messageElement.textContent =
message;

overlay.hidden =
false;

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
onComplete?.();
},
260
);

},
1500
);

}


function persistCalculatorAction(
record
){

const actions =
readStoredJson(
CALCULATOR_ACTIONS_STORAGE_KEY,
[]
);

const safeActions =
Array.isArray(
actions
)
?
actions
:
[];

safeActions.unshift(
record
);

writeStoredJson(
CALCULATOR_ACTIONS_STORAGE_KEY,
safeActions.slice(
0,
100
)
);

}


function persistPendingExpense(
record
){

const pending =
readStoredJson(
CALCULATOR_PENDING_EXPENSES_KEY,
[]
);

const safePending =
Array.isArray(
pending
)
?
pending
:
[];

safePending.unshift({
id:record.id,
category:record.category,
title:record.title,
amount:record.amount,
member:record.member,
date:record.date,
seasonalPlanId:
record.seasonalPlanId,
seasonalPlanName:
record.seasonalPlanName,
split:
record.split,
source:
record.source
});

writeStoredJson(
CALCULATOR_PENDING_EXPENSES_KEY,
safePending.slice(
0,
100
)
);

}


function persistSavingsDecision(
record
){

const monthKey =
getCurrentMonthKey();

const stored =
readStoredJson(
SAVINGS_STORAGE_KEY,
{
selectedMonth:
monthKey,
months:{}
}
);

const savingsState =
stored &&
typeof stored ===
"object"
?
stored
:
{
selectedMonth:
monthKey,
months:{}
};

if(
!savingsState.months ||
typeof savingsState.months !==
"object"
){

savingsState.months =
{};

}

if(
!savingsState.months[
monthKey
]
){

savingsState.months[
monthKey
] = {
budget:
householdBudget.total,
allocations:[]
};

}

const current =
savingsState.months[
monthKey
];

if(
!Array.isArray(
current.allocations
)
){

current.allocations =
[];

}

const currentBudget =
Math.max(
Number(
current.budget ||
householdBudget.total
),
0
);

const allocated =
current.allocations
.reduce(
(sum,item)=>
sum +
Math.max(
Number(
item.amount ||
0
),
0
),
0
);

const available =
Math.max(
currentBudget -
allocated,
0
);

if(
record.amount >
available
){

return {
ok:false,
message:
`Only ${formatMoney(
available
)} is available in the current household allocation.`
};

}

current.allocations.push({
id:
createCalculatorRecordId(
"savings"
),
member:
record.member,
purpose:
"Savings",
amount:
record.amount,
note:
record.destination
});

current.budget =
currentBudget;

savingsState.selectedMonth =
monthKey;

if(
!writeStoredJson(
SAVINGS_STORAGE_KEY,
savingsState
)
){

return {
ok:false,
message:
"Unable to save this allocation on the device."
};

}

return {
ok:true
};

}


function resetAppliedDecision(){

currentInput =
"";

firstValue =
null;

currentOperator =
null;

lastCompletedExpression =
"";

amountDisplay.textContent =
"₱0";

updateExpressionDisplay();

document.getElementById(
"decisionTitleInput"
).value =
"";

document.getElementById(
"memberInput"
).value =
"2";

syncSplitMemberStepper();

if(
selectedMode !==
"save"
){

categorySelect.value =
"";

selectedCategory =
"None";

selectedSeasonalPlan =
null;

}

updateCategorySelectAppearance();

renderCalculatorSeasonalPlans();

updateBudgetImpact();

}


function showCalculatorToast(
message
){

if(
!calculatorToast
){

return;

}

calculatorToast.textContent =
message;

calculatorToast.classList.add(
"show"
);

window.clearTimeout(
calculatorToastTimer
);

calculatorToastTimer =
window.setTimeout(
()=>{

calculatorToast.classList.remove(
"show"
);

},
2600
);

}


// ===============================
// SPLIT MEMBER STEPPER
// ===============================

const splitMemberInput =
document.getElementById(
"memberInput"
);

const decreaseMemberCountButton =
document.getElementById(
"decreaseMemberCount"
);

const increaseMemberCountButton =
document.getElementById(
"increaseMemberCount"
);

decreaseMemberCountButton
?.addEventListener(
"click",
()=>{

const minimum =
2;

const current =
Math.max(
Number(
splitMemberInput.value ||
minimum
),
minimum
);

splitMemberInput.value =
String(
Math.max(
current - 1,
minimum
)
);

syncSplitMemberStepper();

updateBudgetImpact();

}
);


increaseMemberCountButton
?.addEventListener(
"click",
()=>{

const current =
Math.max(
Number(
splitMemberInput.value ||
2
),
2
);

splitMemberInput.value =
String(
current + 1
);

syncSplitMemberStepper();

updateBudgetImpact();

}
);


function syncSplitMemberStepper(){

if(
!splitMemberInput
){

return;

}

const minimum =
2;

const current =
Math.max(
Number(
splitMemberInput.value ||
minimum
),
minimum
);

splitMemberInput.value =
String(current);

decreaseMemberCountButton.disabled =
current <= minimum;

increaseMemberCountButton.disabled =
false;

}


// ===============================
// BUDGET PLANNER
// ===============================

let plannerMembers =
[];

function escapePlannerHtml(
value
){

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


function getPlannerMembers(){

const currentUser =
getCalculatorCurrentUser();

const currentUserName =
String(
currentUser.name ||
""
)
.trim()
.toLowerCase();

for(
const key of
PLANNER_MEMBER_STORAGE_KEYS
){

const stored =
readStoredJson(
key,
null
);

const candidates =
Array.isArray(stored)
?
stored
:
Array.isArray(
stored?.members
)
?
stored.members
:
Array.isArray(
stored?.familyMembers
)
?
stored.familyMembers
:
[];

if(
!candidates.length
){

continue;

}

const members =
candidates
.map(
(member,index)=>{

const name =
String(
member?.name ||
member?.fullName ||
member?.displayName ||
""
)
.trim();

const role =
String(
member?.role ||
member?.memberRole ||
""
)
.toLowerCase();

return {
id:
String(
member?.id ||
member?.userId ||
member?.memberId ||
`member-${index + 1}`
),
name,
role,
initials:
String(
member?.initials ||
getPlannerInitials(name)
)
};

}
)
.filter(
member=>
member.name &&
member.name
.toLowerCase() !==
currentUserName &&
!member.role.includes(
"head"
)
);

if(
members.length
){

return members;

}

}

return DEFAULT_PLANNER_MEMBERS
.map(
member=>({
...member
})
);

}


function getPlannerInitials(
name
){

return String(
name ||
"Member"
)
.trim()
.split(/\s+/)
.slice(0,2)
.map(
part=>
part
.charAt(0)
.toUpperCase()
)
.join("") ||
"MB";

}


function renderPlannerMemberAllocations(
savedAllocations =
{}
){

const container =
document.getElementById(
"plannerMemberAllocationList"
);

if(
!container
){

return;

}

if(
!plannerMembers.length
){

container.innerHTML =
`
<div class="planner-member-empty">
<i class="bi bi-people"></i>
<strong>No household members found.</strong>
<span>Add members before distributing the remaining budget.</span>
</div>
`;

return;

}

const memberColors = [
{
soft:"#F1EDFF",
accent:"#6B5CA5"
},
{
soft:"#EAF3F8",
accent:"#4F7F99"
},
{
soft:"#EEF6F0",
accent:"#5C8F6C"
},
{
soft:"#FFF5D8",
accent:"#A77E20"
},
{
soft:"#FFF1E8",
accent:"#C96E4B"
}
];

container.innerHTML =
plannerMembers
.map(
(member,index)=>{

const color =
memberColors[
index %
memberColors.length
];

const savedAmount =
Math.max(
Number(
savedAllocations[
member.id
] ||
0
),
0
);

return `
<label
class="member-allocation-row"
style="
--member-soft:${color.soft};
--member-accent:${color.accent};
"
>
<span class="member-allocation-avatar">
${escapePlannerHtml(
member.initials ||
getPlannerInitials(
member.name
)
)}
</span>

<span class="member-allocation-copy">
<strong>
${escapePlannerHtml(
member.name
)}
</strong>

<small>
Allocates this amount personally
</small>
</span>

<div class="member-allocation-input">
<b>₱</b>

<input
type="number"
min="0"
step="100"
placeholder="0"
inputmode="decimal"
data-planner-member-id="${escapePlannerHtml(
member.id
)}"
value="${
savedAmount > 0
?
savedAmount
:
""
}"
>
</div>
</label>
`;

}
)
.join("");

container
.querySelectorAll(
"[data-planner-member-id]"
)
.forEach(
input=>{

input.addEventListener(
"input",
calculatePlanner
);

}
);

}


function readPlannerNumber(
id
){

return Math.max(
Number(
document.getElementById(
id
)?.value ||
0
),
0
);

}


function collectHeadCategoryAllocations(){

const allocations =
{};

document
.querySelectorAll(
"[data-planner-category]"
)
.forEach(
input=>{

allocations[
input.dataset
.plannerCategory
] =
Math.max(
Number(
input.value ||
0
),
0
);

}
);

return allocations;

}


function collectMemberAllocations(){

const allocations =
{};

document
.querySelectorAll(
"[data-planner-member-id]"
)
.forEach(
input=>{

allocations[
input.dataset
.plannerMemberId
] =
Math.max(
Number(
input.value ||
0
),
0
);

}
);

return allocations;

}


function sumPlannerValues(
object
){

return Object.values(
object ||
{}
)
.reduce(
(sum,value)=>
sum +
Math.max(
Number(
value ||
0
),
0
),
0
);

}


function getPlannerSnapshot(){

const monthlyBudget =
readPlannerNumber(
"incomeInput"
);

const additionalIncome =
readPlannerNumber(
"additionalInput"
);

const totalAvailable =
monthlyBudget +
additionalIncome;

const headCategories =
collectHeadCategoryAllocations();

const headAllocation =
sumPlannerValues(
headCategories
);

const availableForMembers =
totalAvailable -
headAllocation;

const memberAllocations =
collectMemberAllocations();

const memberAllocationTotal =
sumPlannerValues(
memberAllocations
);

const unassignedBalance =
availableForMembers -
memberAllocationTotal;

let status =
"Extra Funds Available";

let statusClass =
"extra-funds";


if(
totalAvailable <= 0
){

status =
"Add a Budget";

statusClass =
"needs-adjustment";

}
else if(
headAllocation >
totalAvailable ||
unassignedBalance < 0
){

status =
"Overallocated";

statusClass =
"overallocated";

}
else if(
Math.abs(
unassignedBalance
) <
0.01
){

status =
"Balanced";

statusClass =
"balanced";

}
return {
month:
getSelectedPlannerMonthKey(),
monthlyBudget,
additionalIncome,
totalAvailable,
headCategories,
headAllocation,
availableForMembers,
memberAllocations,
memberAllocationTotal,
unassignedBalance,
status,
statusClass
};

}


function setPlannerText(
id,
value
){

const element =
document.getElementById(id);

if(
element
){

element.textContent =
value;

}

}


function calculatePlanner(){

const snapshot =
getPlannerSnapshot();

setPlannerText(
"plannerTotalAvailable",
formatMoney(
snapshot.totalAvailable
)
);

setPlannerText(
"availableForMembersChip",
`${formatMoney(
snapshot.availableForMembers
)} available`
);

setPlannerText(
"plannerMemberTotal",
formatMoney(
snapshot.memberAllocationTotal
)
);

setPlannerText(
"plannerMemberUnassigned",
formatMoney(
snapshot.unassignedBalance
)
);

setPlannerText(
"plannerResultAvailable",
formatMoney(
snapshot.totalAvailable
)
);

setPlannerText(
"plannerResultHead",
formatMoney(
snapshot.headAllocation
)
);

setPlannerText(
"plannerResultMembers",
formatMoney(
snapshot.memberAllocationTotal
)
);

setPlannerText(
"plannerResultUnassigned",
formatMoney(
snapshot.unassignedBalance
)
);

setPlannerText(
"headAllocationTotal",
formatMoney(
snapshot.headAllocation
)
);

setPlannerText(
"remainingForMembers",
formatMoney(
snapshot.availableForMembers
)
);

const statusElement =
document.getElementById(
"planStatus"
);

statusElement.textContent =
snapshot.status;

statusElement.className =
snapshot.statusClass;


[
"plannerMemberUnassigned",
"plannerResultUnassigned",
"remainingForMembers",
"availableForMembersChip"
]
.forEach(
id=>{

const element =
document.getElementById(id);

element?.classList.toggle(
"negative",
snapshot.unassignedBalance < 0 ||
snapshot.availableForMembers < 0
);

}
);


const applyButton =
document.getElementById(
"applyPlanButton"
);

const applyPlanHint =
document.getElementById(
"applyPlanHint"
);

const isCurrentMonth =
snapshot.month ===
getCurrentPlannerMonthKey();

const hasValidPlan =
snapshot.totalAvailable > 0 &&
snapshot.headAllocation <=
snapshot.totalAvailable &&
snapshot.unassignedBalance >= 0;

applyButton.disabled =
!isCurrentMonth ||
!hasValidPlan;

applyButton.title =
isCurrentMonth
?
"Apply the current month's household plan."
:
"Apply Plan is available for the current month only.";

if(
applyPlanHint
){

applyPlanHint.textContent =
isCurrentMonth
?
"Complete the plan to apply it for the current month."
:
`Apply Plan is only available for ${
getPlannerMonthLabel(
getCurrentPlannerMonthKey()
)
}.`;

applyPlanHint.classList.toggle(
"current-month",
isCurrentMonth
);

}

return snapshot;

}


function bindPlannerInputs(){

document
.querySelectorAll(
[
"#incomeInput",
"#additionalInput",
"[data-planner-category]"
].join(",")
)
.forEach(
input=>{

input.addEventListener(
"input",
calculatePlanner
);

}
);

document
.getElementById(
"resetButton"
)
.addEventListener(
"click",
resetBudgetPlanner
);

document
.getElementById(
"saveDraftButton"
)
.addEventListener(
"click",
()=>{

saveBudgetPlanner(
"draft"
);

}
);

document
.getElementById(
"applyPlanButton"
)
.addEventListener(
"click",
()=>{

saveBudgetPlanner(
"applied"
);

}
);

}


function getSavedPlannerMonth(
monthKey =
getSelectedPlannerMonthKey()
){

const stored =
readStoredJson(
BUDGET_PLANNER_STORAGE_KEY,
{
months:{}
}
);

return stored?.months?.[
monthKey
] ||
null;

}


function populatePlannerFromSavedPlan(
plan
){

if(
!plan
){

return false;

}

document.getElementById(
"incomeInput"
).value =
plan.monthlyBudget >
0
?
String(
plan.monthlyBudget
)
:
"";

document.getElementById(
"additionalInput"
).value =
plan.additionalIncome >
0
?
String(
plan.additionalIncome
)
:
"";


document
.querySelectorAll(
"[data-planner-category]"
)
.forEach(
input=>{

const amount =
Math.max(
Number(
plan.headCategories?.[
input.dataset
.plannerCategory
] ||
0
),
0
);

input.value =
amount > 0
?
String(amount)
:
"";

}
);

renderPlannerMemberAllocations(
plan.memberAllocations ||
{}
);

return true;

}


async function loadAutomaticPlannerValues(){

const billDebtTotals =
await readCurrentPlannerBillDebtTotals();

const savings =
getPlannerSavingsAutomaticValue();

const seasonalPlans =
getPlannerSeasonalAutomaticValue();

return {
bills:
billDebtTotals.bills,
debt:
billDebtTotals.debt,
savings,
seasonalPlans
};

}


async function readCurrentPlannerBillDebtTotals(){

const empty =
{
bills:0,
debt:0
};

if(
typeof indexedDB ===
"undefined"
){

return empty;

}

try{

if(
typeof indexedDB.databases ===
"function"
){

const databases =
await indexedDB.databases();

if(
!databases.some(
database=>
database.name ===
"kabalikat_bills_db"
)
){

return empty;

}

}

const entries =
await new Promise(
(resolve,reject)=>{

const request =
indexedDB.open(
"kabalikat_bills_db"
);

request.onerror =
()=>
reject(
request.error
);

request.onsuccess =
()=>{

const database =
request.result;

if(
!database.objectStoreNames
.contains(
"entries"
)
){

database.close();

resolve([]);

return;

}

const transaction =
database.transaction(
"entries",
"readonly"
);

const getAllRequest =
transaction
.objectStore(
"entries"
)
.getAll();

getAllRequest.onsuccess =
()=>{

resolve(
getAllRequest.result ||
[]
);

database.close();

};

getAllRequest.onerror =
()=>{

reject(
getAllRequest.error
);

database.close();

};

};

}
);

const month =
getCurrentMonthKey();

return entries
.reduce(
(totals,entry)=>{

const date =
String(
entry?.dueDate ||
entry?.date ||
entry?.createdAt ||
""
);

if(
date &&
!date.startsWith(
month
)
){

return totals;

}

if(
entry?.paid ===
true
){

return totals;

}

const amount =
Math.max(
Number(
entry?.remainingBalance ??
entry?.balance ??
entry?.amount ??
0
),
0
);

if(
entry?.type ===
"bill"
){

totals.bills +=
amount;

}

if(
entry?.type ===
"debt"
){

totals.debt +=
amount;

}

return totals;

},
{
bills:0,
debt:0
}
);

}
catch(error){

console.warn(
"Unable to reflect Bills and Debt in the planner:",
error
);

return empty;

}

}


function getPlannerSavingsAutomaticValue(){

const stored =
readStoredJson(
SAVINGS_STORAGE_KEY,
null
);

const month =
stored?.months?.[
getCurrentMonthKey()
];

const allocations =
Array.isArray(
month?.allocations
)
?
month.allocations
:
[];

const total =
allocations
.filter(
item=>
String(
item?.purpose ||
""
)
.toLowerCase() ===
"savings"
)
.reduce(
(sum,item)=>
sum +
Math.max(
Number(
item?.amount ||
0
),
0
),
0
);

return total > 0
?
total
:
Math.max(
Number(
householdBudget
.reservedSavings ||
0
),
0
);

}


function getPlannerSeasonalAutomaticValue(){

for(
const key of
PLANNER_SEASONAL_STORAGE_KEYS
){

const stored =
readStoredJson(
key,
null
);

const plans =
Array.isArray(stored)
?
stored
:
Array.isArray(
stored?.plans
)
?
stored.plans
:
[];

if(
!plans.length
){

continue;

}

const total =
plans
.filter(
plan=>
plan?.active !==
false
)
.reduce(
(sum,plan)=>
sum +
Math.max(
Number(
plan?.allocation ??
plan?.budget ??
plan?.amount ??
0
),
0
),
0
);

if(
total > 0
){

return total;

}

}

return 0;

}


function populateAutomaticPlannerFields(){

const mapping =
{
billsInput:
plannerAutomaticValues
.bills,
debtInput:
plannerAutomaticValues
.debt,
seasonalInput:
plannerAutomaticValues
.seasonalPlans
};

Object.entries(
mapping
)
.forEach(
([id,value])=>{

const input =
document.getElementById(id);

if(
!input
){

return;

}

input.value =
value > 0
?
String(value)
:
"";

}
);

}


const PLANNER_MONTH_OPTIONS = [
{
value:"01",
label:"January"
},
{
value:"02",
label:"February"
},
{
value:"03",
label:"March"
},
{
value:"04",
label:"April"
},
{
value:"05",
label:"May"
},
{
value:"06",
label:"June"
},
{
value:"07",
label:"July"
},
{
value:"08",
label:"August"
},
{
value:"09",
label:"September"
},
{
value:"10",
label:"October"
},
{
value:"11",
label:"November"
},
{
value:"12",
label:"December"
}
];


function getCurrentPlannerDate(){

const today =
new Date();

return new Date(
today.getFullYear(),
today.getMonth(),
1
);

}


function getCurrentPlannerMonthKey(){

const currentDate =
getCurrentPlannerDate();

return `${currentDate.getFullYear()}-${String(
currentDate.getMonth() + 1
).padStart(
2,
"0"
)}`;

}


function getPlannerFutureYears(
count =
5
){

const firstSelectableDate =
getCurrentPlannerDate();

const firstYear =
firstSelectableDate.getFullYear();

return Array.from(
{
length:count
},
(_,index)=>
firstYear + index
);

}


function getSelectedPlannerMonthKey(){

const monthSelect =
document.getElementById(
"plannerMonthSelect"
);

const yearSelect =
document.getElementById(
"plannerYearSelect"
);

const firstSelectableDate =
getCurrentPlannerDate();

const fallbackYear =
String(
firstSelectableDate.getFullYear()
);

const fallbackMonth =
String(
firstSelectableDate.getMonth() + 1
)
.padStart(
2,
"0"
);

return `${
yearSelect?.value ||
fallbackYear
}-${
monthSelect?.value ||
fallbackMonth
}`;

}


function getPlannerMonthLabel(
monthKey =
getSelectedPlannerMonthKey()
){

const [
year,
month
] =
String(monthKey)
.split("-")
.map(Number);

const date =
new Date(
year,
Math.max(
month - 1,
0
),
1
);

return date.toLocaleDateString(
"en-PH",
{
month:"long",
year:"numeric"
}
);

}


function populatePlannerYearOptions(
preferredYear =
""
){

const yearSelect =
document.getElementById(
"plannerYearSelect"
);

if(
!yearSelect
){

return;

}

const years =
getPlannerFutureYears(5);

yearSelect.innerHTML =
years
.map(
year=>`
<option value="${year}">
${year}
</option>
`
)
.join("");

const normalizedPreferred =
Number(
preferredYear
);

yearSelect.value =
years.includes(
normalizedPreferred
)
?
String(
normalizedPreferred
)
:
String(
years[0]
);

}


function populatePlannerMonthOptions(
preferredMonth =
""
){

const monthSelect =
document.getElementById(
"plannerMonthSelect"
);

const yearSelect =
document.getElementById(
"plannerYearSelect"
);

if(
!monthSelect ||
!yearSelect
){

return;

}

const firstSelectableDate =
getCurrentPlannerDate();

const selectedYear =
Number(
yearSelect.value ||
firstSelectableDate.getFullYear()
);

const firstSelectableYear =
firstSelectableDate.getFullYear();

const firstSelectableMonth =
firstSelectableDate.getMonth() + 1;

const availableMonths =
PLANNER_MONTH_OPTIONS
.filter(
month=>{

if(
selectedYear >
firstSelectableYear
){

return true;

}

return Number(
month.value
) >=
firstSelectableMonth;

}
);

monthSelect.innerHTML =
availableMonths
.map(
month=>`
<option value="${month.value}">
${month.label}
</option>
`
)
.join("");

const normalizedPreferred =
String(
preferredMonth ||
""
)
.padStart(
2,
"0"
);

monthSelect.value =
availableMonths.some(
month=>
month.value ===
normalizedPreferred
)
?
normalizedPreferred
:
availableMonths[0].value;

}


function populatePlannerDateOptions(){

const stored =
readStoredJson(
BUDGET_PLANNER_STORAGE_KEY,
{
selectedMonth:""
}
);

const storedMonthKey =
String(
stored?.selectedMonth ||
""
);

const [
storedYear,
storedMonth
] =
storedMonthKey
.split("-");

populatePlannerYearOptions(
storedYear
);

populatePlannerMonthOptions(
storedMonth
);

}


function clearBudgetPlannerFields(){

document
.querySelectorAll(
[
"#incomeInput",
"#additionalInput",
"[data-planner-category]"
].join(",")
)
.forEach(
input=>{

input.value =
"";

}
);

renderPlannerMemberAllocations();

}


function loadSelectedPlannerMonth(){

const savedPlan =
getSavedPlannerMonth();

if(
savedPlan
){

populatePlannerFromSavedPlan(
savedPlan
);

}
else{

clearBudgetPlannerFields();

}

calculatePlanner();

}


function updatePlannerDateTrigger(){

setPlannerText(
"plannerMonthDisplay",
getPlannerMonthLabel()
);

}


function setPlannerDateDropdownOpen(
isOpen
){

const trigger =
document.getElementById(
"plannerDateTrigger"
);

const panel =
document.getElementById(
"plannerDateDropdown"
);

if(
!trigger ||
!panel
){

return;

}

panel.hidden =
!isOpen;

trigger.setAttribute(
"aria-expanded",
String(
isOpen
)
);

trigger.classList.toggle(
"open",
isOpen
);

}


function togglePlannerDateDropdown(){

const trigger =
document.getElementById(
"plannerDateTrigger"
);

if(
!trigger
){

return;

}

setPlannerDateDropdownOpen(
trigger.getAttribute(
"aria-expanded"
) !==
"true"
);

}


function handlePlannerMonthChange(){

updatePlannerDateTrigger();

loadSelectedPlannerMonth();

setPlannerDateDropdownOpen(
false
);

}


function handlePlannerYearChange(){

populatePlannerMonthOptions();

updatePlannerDateTrigger();

loadSelectedPlannerMonth();

}


function initializeBudgetPlanner(){

plannerMembers =
getPlannerMembers();

populatePlannerDateOptions();

updatePlannerDateTrigger();

loadSelectedPlannerMonth();

bindPlannerInputs();

const trigger =
document.getElementById(
"plannerDateTrigger"
);

const dropdown =
document.getElementById(
"plannerDateDropdown"
);

const monthSelect =
document.getElementById(
"plannerMonthSelect"
);

const yearSelect =
document.getElementById(
"plannerYearSelect"
);

trigger
?.addEventListener(
"click",
event=>{

event.stopPropagation();

togglePlannerDateDropdown();

}
);

dropdown
?.addEventListener(
"click",
event=>{

event.stopPropagation();

}
);

monthSelect
?.addEventListener(
"change",
handlePlannerMonthChange
);

yearSelect
?.addEventListener(
"change",
handlePlannerYearChange
);

document.addEventListener(
"click",
()=>{

setPlannerDateDropdownOpen(
false
);

}
);

document.addEventListener(
"keydown",
event=>{

if(
event.key ===
"Escape"
){

setPlannerDateDropdownOpen(
false
);

}

}
);

syncSplitMemberStepper();

}


function saveBudgetPlanner(
mode
){

const snapshot =
calculatePlanner();

if(
mode ===
"applied" &&
snapshot.month !==
getCurrentPlannerMonthKey()
){

showCalculatorToast(
`Apply Plan is only available for ${
getPlannerMonthLabel(
getCurrentPlannerMonthKey()
)
}.`
);

return;

}

if(
snapshot.totalAvailable <= 0
){

showCalculatorToast(
"Enter the household budget first."
);

return;

}

if(
snapshot.headAllocation >
snapshot.totalAvailable ||
snapshot.unassignedBalance < 0
){

showCalculatorToast(
"Adjust the plan before saving because it is overallocated."
);

return;

}

const currentUser =
getCalculatorCurrentUser();

const actionLabel =
mode ===
"applied"
?
"Apply"
:
"Save";

if(
mode ===
"applied" &&
!window.confirm(
`${actionLabel} the ${getPlannerMonthLabel()} household plan?`
)
){

return;

}

const stored =
readStoredJson(
BUDGET_PLANNER_STORAGE_KEY,
{
selectedMonth:
snapshot.month,
months:{}
}
);

if(
!stored.months ||
typeof stored.months !==
"object"
){

stored.months =
{};

}

stored.selectedMonth =
snapshot.month;

stored.months[
snapshot.month
] = {
...snapshot,
state:
mode,
createdBy:
currentUser.name,
updatedAt:
new Date()
.toISOString()
};

if(
!writeStoredJson(
BUDGET_PLANNER_STORAGE_KEY,
stored
)
){

showCalculatorToast(
"Unable to save the household plan on this device."
);

return;

}

if(
mode ===
"applied"
){

showCalculatorSuccess(
"Plan Applied",
"The Head allocation and member budgets are ready.",
()=>{}
);

}
else{

showCalculatorToast(
"Household plan saved as a draft."
);

}

}


function resetBudgetPlanner(){

clearBudgetPlannerFields();

calculatePlanner();

}


setBudgetToolView("calculator");
populateSavingsDestinationOptions();
renderCurrentCalculatorUser();
updateExpressionDisplay();
updateMode();
updateBudgetImpact();
initializeBudgetPlanner();

});