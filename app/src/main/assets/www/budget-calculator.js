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
// TEMP HOUSEHOLD DATA
// Replace with database later
// ===============================

let householdBudget = {

    total: 25000,
    spent: 8000,
    remaining: 17000,
    daysLeft: 15

};





// ===============================
// CALCULATOR STATE
// ===============================

let currentInput = "";

let firstValue = null;

let currentOperator = null;

let selectedMode = "spend";

let selectedCategory = "None";









// ===============================
// INITIAL LOAD
// ===============================

document.getElementById("totalBudget").textContent =
formatMoney(householdBudget.total);


document.getElementById("spentAmount").textContent =
formatMoney(householdBudget.spent);


document.getElementById("remainingAmount").textContent =
formatMoney(householdBudget.remaining);


document.getElementById("daysRemaining").textContent =
householdBudget.daysLeft;









function formatMoney(value){

    return "₱" +
    Number(value)
    .toLocaleString("en-PH");

}









// ===============================
// CALCULATOR DISPLAY
// ===============================


const amountDisplay =
document.getElementById("amountValue");



function updateDisplay(){

    if(currentInput === ""){

        amountDisplay.textContent =
        "₱0";

        return;

    }


    amountDisplay.textContent =
    formatMoney(currentInput);

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

    updateDisplay();

    return;

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


currentInput = "";



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


amountDisplay.textContent =
"₱0";


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



switch(selectedMode){


case "spend":

label.textContent =
"Amount to Spend";

extra.classList.add("hidden");

break;



case "save":

label.textContent =
"Amount to Save";

extra.classList.add("hidden");

break;



case "split":

label.textContent =
"Amount to Split";

extra.classList.remove("hidden");

break;



case "daily":

label.textContent =
"Amount Per Day";

extra.classList.remove("hidden");

break;



case "member":

label.textContent =
"Amount Per Member";

extra.classList.remove("hidden");

break;



case "percent":

label.textContent =
"Budget Percentage";

extra.classList.add("hidden");

break;


}


}









// ===============================
// MORE BUTTON
// ===============================


const moreButton =
document.getElementById("moreButton");

const moreFunctions =
document.getElementById("moreFunctions");

moreButton.addEventListener("click",()=>{
const willOpen =
moreFunctions.classList.contains("hidden");

moreFunctions.classList.toggle("hidden");
moreButton.classList.toggle("open",willOpen);
moreButton.setAttribute(
"aria-expanded",
String(willOpen)
);
});









// ===============================
// CATEGORY DROPDOWN
// ===============================


const categoryButton =
document.getElementById("categoryButton");

const categoryMenu =
document.getElementById("categoryMenu");

categoryButton.addEventListener("click",event=>{
event.stopPropagation();

const willOpen =
categoryMenu.classList.contains("hidden");

categoryMenu.classList.toggle("hidden");
categoryButton.classList.toggle("open",willOpen);
categoryButton.setAttribute(
"aria-expanded",
String(willOpen)
);
});






document
.querySelectorAll("#categoryMenu button")
.forEach(button=>{


button.addEventListener(
"click",
()=>{


selectedCategory =
button.dataset.category;



document
.getElementById("categoryName")
.textContent =
selectedCategory;



categoryMenu.classList.add("hidden");
categoryButton.classList.remove("open");
categoryButton.setAttribute(
"aria-expanded",
"false"
);

document
.querySelectorAll("#categoryMenu button")
.forEach(option=>{
option.classList.toggle(
"selected",
option === button
);
});

updateBudgetImpact();


});


});









document.addEventListener("click",event=>{
if(
!categoryButton.contains(event.target) &&
!categoryMenu.contains(event.target)
){
categoryMenu.classList.add("hidden");
categoryButton.classList.remove("open");
categoryButton.setAttribute("aria-expanded","false");
}
});

document.addEventListener("keydown",event=>{
if(event.key !== "Escape") return;

categoryMenu.classList.add("hidden");
categoryButton.classList.remove("open");
categoryButton.setAttribute("aria-expanded","false");

moreFunctions.classList.add("hidden");
moreButton.classList.remove("open");
moreButton.setAttribute("aria-expanded","false");
});


// ===============================
// BUDGET IMPACT
// ===============================


function updateBudgetImpact(){


let amount =
Number(currentInput || 0);



let result =
householdBudget.remaining;



switch(selectedMode){



case "spend":

result =
householdBudget.remaining - amount;

break;



case "save":

result =
householdBudget.remaining - amount;

break;



case "split":


let members =
Number(
document.getElementById("memberInput").value
|| 1
);


result =
amount / members;


break;




case "daily":


let days =
Number(
document.getElementById("daysInput").value
|| 1
);


result =
amount / days;


break;




case "member":


let people =
Number(
document.getElementById("memberInput").value
|| 1
);


result =
amount / people;


break;




case "percent":


result =
(amount / householdBudget.total) * 100;


break;


}






document
.getElementById("impactCategory")
.textContent =
selectedCategory;



document
.getElementById("impactBudget")
.textContent =
selectedMode === "percent"
?
result.toFixed(1)+"%"
:
formatMoney(Math.max(result,0));





let percent =
(amount / householdBudget.total) * 100;



document
.getElementById("impactPercent")
.textContent =
percent.toFixed(1)+"%";





let status =
document.getElementById("impactStatus");



if(result < 0){

status.textContent =
"Over Budget";

}

else if(percent > 70){

status.textContent =
"Be Careful";

}

else{

status.textContent =
"Safe";

}


}









// ===============================
// PLANNER
// ===============================


const plannerToggle =
document.getElementById("plannerToggle");

const advancedPlanner =
document.getElementById("advancedPlanner");

plannerToggle.addEventListener("click",()=>{
const willOpen =
advancedPlanner.classList.contains("hidden");

advancedPlanner.classList.toggle("hidden");
plannerToggle.classList.toggle("open",willOpen);
plannerToggle.setAttribute(
"aria-expanded",
String(willOpen)
);
});








document
.querySelectorAll(".planner-input input")
.forEach(input=>{


input.addEventListener(
"input",
calculatePlanner
);


});









function calculatePlanner(){


let income =
Number(
document.getElementById("incomeInput").value || 0
);



let bills =
Number(
document.getElementById("billsInput").value || 0
);



let savings =
Number(
document.getElementById("savingsInput").value || 0
);



let additional =
Number(
document.getElementById("additionalInput").value || 0
);



let debt =
Number(
document.getElementById("debtInput").value || 0
);



let seasonal =
Number(
document.getElementById("seasonalInput").value || 0
);





let available =
income + additional;



let afterBills =
available - bills - debt;



let afterSavings =
afterBills - savings;



let finalMoney =
afterSavings - seasonal;







document.getElementById("afterBills")
.textContent =
formatMoney(afterBills);



document.getElementById("afterSavings")
.textContent =
formatMoney(afterSavings);



document.getElementById("dailyLimit")
.textContent =
formatMoney(
finalMoney / householdBudget.daysLeft
)
+
"/day";



document.getElementById("perMember")
.textContent =
formatMoney(
finalMoney / 4
);






let status =
document.getElementById("planStatus");



if(finalMoney < 0){

status.textContent =
"Over Budget";

}

else if(finalMoney < 3000){

status.textContent =
"Tight";

}

else{

status.textContent =
"Balanced";

}






updateAllocation(
income,
savings,
seasonal
);



}









// ===============================
// ALLOCATION PREVIEW
// ===============================


function updateAllocation(
income,
savings,
seasonal
){



let food =
income * .30;



let transport =
income * .10;



let utilities =
income * .10;



let health =
income * .05;



let other =
income * .10;





document.getElementById("foodAllocation")
.textContent =
formatMoney(food);



document.getElementById("transportAllocation")
.textContent =
formatMoney(transport);



document.getElementById("utilitiesAllocation")
.textContent =
formatMoney(utilities);



document.getElementById("healthAllocation")
.textContent =
formatMoney(health);



document.getElementById("savingsAllocation")
.textContent =
formatMoney(savings);



document.getElementById("seasonalAllocation")
.textContent =
formatMoney(seasonal);



document.getElementById("otherAllocation")
.textContent =
formatMoney(other);





let total =

food +
transport +
utilities +
health +
savings +
seasonal +
other;



document.getElementById("totalAllocated")
.textContent =
formatMoney(total);



document.getElementById("unallocatedBalance")
.textContent =
formatMoney(
income-total
);



}









// ===============================
// RESET
// ===============================


document
.getElementById("resetButton")
.addEventListener(
"click",
()=>{


document
.querySelectorAll(
".planner-input input"
)
.forEach(input=>{

input.value="";

});



resetCalculator();


});

setBudgetToolView("calculator");
updateMode();
updateBudgetImpact();
calculatePlanner();

});