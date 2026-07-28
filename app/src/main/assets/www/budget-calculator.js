document.addEventListener("DOMContentLoaded", () => {


// ======================================
// TEMP HOUSEHOLD DATA
// Replace with Supabase later
// ======================================

let householdBudget = {

    total: 25000,

    spent: 8000,

    remaining: 17000,

    daysLeft: 15

};





// ======================================
// STATE
// ======================================

let currentInput = "";

let previousValue = null;

let operator = null;

let selectedMode = "spend";

let selectedCategory = "Grocery";







// ======================================
// ELEMENTS
// ======================================


const amountDisplay =
document.getElementById("amountValue");


const amountLabel =
document.getElementById("amountLabel");



const categoryName =
document.getElementById("categoryName");









// ======================================
// INITIAL BUDGET DISPLAY
// ======================================


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







// ======================================
// FORMAT MONEY
// ======================================


function formatMoney(value){

return "₱" +
Number(value)
.toLocaleString("en-PH");

}







// ======================================
// CALCULATOR KEYPAD
// ======================================


document
.querySelectorAll(".keypad button")
.forEach(button=>{


button.addEventListener(
"click",
()=>{


let value =
button.textContent.trim();





// CLEAR

if(value==="C"){

resetCalculator();

return;

}






// DELETE

if(value==="⌫"){

currentInput =
currentInput.slice(0,-1);

updateDisplay();

return;

}







// EQUAL

if(value==="="){

calculateExpression();

return;

}







// OPERATOR

if(
["+","−","×","÷"]
.includes(value)
){

setOperator(value);

return;

}







// PERCENT

if(value==="%"){

currentInput =
String(
Number(currentInput || 0)
/100
);


updateDisplay();

return;

}







// NUMBER

currentInput += value;


updateDisplay();


}

);


});










function updateDisplay(){


if(currentInput===""){

amountDisplay.textContent="₱0";

return;

}


amountDisplay.textContent =
formatMoney(currentInput);


}








function resetCalculator(){


currentInput="";

previousValue=null;

operator=null;


amountDisplay.textContent="₱0";


}








// ======================================
// MATH OPERATIONS
// ======================================


function setOperator(op){


if(currentInput==="")
return;



previousValue =
Number(currentInput);



operator = op;


currentInput="";



}




function calculateExpression(){


if(
previousValue===null ||
operator===null ||
currentInput===""
){

updateBudgetImpact();

return;

}



let second =
Number(currentInput);



let result;



switch(operator){


case "+":

result =
previousValue + second;

break;



case "−":

result =
previousValue - second;

break;



case "×":

result =
previousValue * second;

break;



case "÷":

result =
previousValue / second;

break;


}




currentInput =
String(result);



previousValue=null;

operator=null;



updateDisplay();


updateBudgetImpact();


}









// ======================================
// MODE BUTTONS
// ======================================


document
.querySelectorAll(".function[data-function]")
.forEach(button=>{


button.addEventListener(
"click",
()=>{


document
.querySelectorAll(
".function"
)
.forEach(btn=>
btn.classList.remove(
"active"
)
);



button.classList.add(
"active"
);



selectedMode =
button.dataset.function;



updateMode();



}

);


});









function updateMode(){


const extra =
document.getElementById(
"extraInputs"
);



switch(selectedMode){



case "spend":

amountLabel.textContent =
"Amount to Spend";

extra.classList.add(
"hidden"
);

break;




case "save":

amountLabel.textContent =
"Amount to Save";

extra.classList.add(
"hidden"
);

break;




case "split":

amountLabel.textContent =
"Amount to Split";

extra.classList.remove(
"hidden"
);

break;




case "daily":

amountLabel.textContent =
"Daily Spending";

extra.classList.remove(
"hidden"
);

break;




case "member":

amountLabel.textContent =
"Amount Per Member";

extra.classList.remove(
"hidden"
);

break;




case "percent":

amountLabel.textContent =
"Budget Percentage";

extra.classList.add(
"hidden"
);

break;


}



}









// ======================================
// MORE BUTTON
// ======================================


document
.getElementById(
"moreButton"
)
.addEventListener(
"click",
()=>{


document
.getElementById(
"moreFunctions"
)
.classList
.toggle(
"hidden"
);


});









// ======================================
// CATEGORY DROPDOWN
// ======================================


document
.getElementById(
"categoryButton"
)
.addEventListener(
"click",
()=>{


document
.getElementById(
"categoryMenu"
)
.classList
.toggle(
"hidden"
);


});






document
.querySelectorAll(
"#categoryMenu button"
)
.forEach(button=>{


button.addEventListener(
"click",
()=>{


selectedCategory =
button.dataset.category;



categoryName.textContent =
selectedCategory;



document
.getElementById(
"categoryMenu"
)
.classList
.add(
"hidden"
);



updateBudgetImpact();


});


});









// ======================================
// BUDGET IMPACT
// ======================================


function updateBudgetImpact(){


let amount =
Number(currentInput || 0);



let result =
householdBudget.remaining;



switch(selectedMode){



case "spend":

result =
householdBudget.remaining
-
amount;

break;



case "save":

result =
householdBudget.remaining
-
amount;

break;




case "split":


let members =
Number(
document.getElementById(
"memberInput"
).value
||1
);



result =
amount / members;


break;





case "daily":


let days =
Number(
document.getElementById(
"daysInput"
).value
||1
);


result =
amount / days;


break;





case "member":


let people =
Number(
document.getElementById(
"memberInput"
).value
||1
);


result =
amount / people;


break;




case "percent":


result =
(amount /
householdBudget.total)
*
100;


break;



}






document
.getElementById(
"impactBudget"
)
.textContent =
selectedMode==="percent"

?

result.toFixed(1)+"%"

:

formatMoney(
Math.max(result,0)
);





document
.getElementById(
"impactCategory"
)
.textContent =
selectedCategory;





let used =
(amount /
householdBudget.total)
*
100;




document
.getElementById(
"impactPercent"
)
.textContent =
used.toFixed(1)+"%";







let status =
document
.getElementById(
"impactStatus"
);



if(result < 0){

status.textContent =
"Over Budget";

}



else if(used > 70){

status.textContent =
"Be Careful";

}



else{

status.textContent =
"Safe";

}



}









// ======================================
// EXTRA INPUT LISTENERS
// ======================================


document
.querySelectorAll(
"#memberInput,#daysInput"
)
.forEach(input=>{


input.addEventListener(
"input",
updateBudgetImpact
);


});









// ======================================
// PLANNER
// ======================================


document
.getElementById(
"plannerToggle"
)
.addEventListener(
"click",
()=>{


document
.getElementById(
"advancedPlanner"
)
.classList
.toggle(
"hidden"
);


});







document
.querySelectorAll(
".planner-input input"
)
.forEach(input=>{


input.addEventListener(
"input",
calculatePlanner
);


});








function calculatePlanner(){


let income =
Number(
document.getElementById(
"incomeInput"
).value ||0
);



let bills =
Number(
document.getElementById(
"billsInput"
).value ||0
);



let savings =
Number(
document.getElementById(
"savingsInput"
).value ||0
);




let additional =
Number(
document.getElementById(
"additionalInput"
).value ||0
);



let debt =
Number(
document.getElementById(
"debtInput"
).value ||0
);



let seasonal =
Number(
document.getElementById(
"seasonalInput"
).value ||0
);





let available =
income
+
additional;



let afterBills =
available
-
bills
-
debt;



let afterSavings =
afterBills
-
savings;



let final =
afterSavings
-
seasonal;






document
.getElementById(
"afterBills"
)
.textContent =
formatMoney(
afterBills
);




document
.getElementById(
"afterSavings"
)
.textContent =
formatMoney(
afterSavings
);





document
.getElementById(
"dailyLimit"
)
.textContent =
formatMoney(
final /
householdBudget.daysLeft
);






let status =
document
.getElementById(
"planStatus"
);



if(final < 0){

status.textContent =
"Over Budget";

}

else if(final < 3000){

status.textContent =
"Tight";

}

else{

status.textContent =
"Balanced";

}



}





});