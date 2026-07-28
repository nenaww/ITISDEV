// ========================================
// KABALIKAT BUDGET CALCULATOR
// ========================================


// ==============================
// STATE
// ==============================


let currentInput = "";

let firstNumber = null;

let currentOperator = null;


let selectedFunction = "spend";

let selectedCategory = "Grocery";



// Future database values
// Replace with Supabase later

let householdBudget = {

    total: null,

    spent: null,

    remaining: null,

    daysLeft: null

};







// ==============================
// ELEMENTS
// ==============================


const amountValue =
document.getElementById(
"amountValue"
);


const amountLabel =
document.getElementById(
"amountLabel"
);



const categoryName =
document.getElementById(
"categoryName"
);








// ==============================
// KEYPAD
// ==============================


const keys =
document.querySelectorAll(
".keypad button"
);



keys.forEach(key => {


    key.addEventListener(
    "click",
    ()=>{


        const value =
        key.textContent;



        // CLEAR

        if(value === "C"){

            resetCalculator();

            return;

        }




        // DELETE

        if(value === "⌫"){

            currentInput =
            currentInput.slice(0,-1);


            updateAmount();


            return;

        }





        // EQUAL

        if(value === "="){

            calculate();


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

        if(value === "%"){


            currentInput =
            String(
                Number(currentInput || 0)
                /100
            );


            updateAmount();


            return;

        }






        // NUMBER INPUT

        currentInput += value;


        updateAmount();



    });


});








function updateAmount(){


    if(currentInput === ""){


        amountValue.textContent =
        "₱0";


        return;

    }



    amountValue.textContent =

    "₱" +

    Number(currentInput)
    .toLocaleString(
        "en-PH"
    );


}








// ==============================
// CALCULATOR MATH
// ==============================


function setOperator(operator){


    if(currentInput === "")
    return;



    firstNumber =
    Number(currentInput);



    currentOperator =
    operator;


    currentInput = "";



}






function calculate(){


    if(
    firstNumber === null ||
    currentOperator === null ||
    currentInput === ""
    ){

        updateBudgetImpact();

        return;

    }




    let secondNumber =
    Number(currentInput);



    let answer = 0;



    switch(currentOperator){


        case "+":

            answer =
            firstNumber + secondNumber;

        break;



        case "−":

            answer =
            firstNumber - secondNumber;

        break;



        case "×":

            answer =
            firstNumber * secondNumber;

        break;



        case "÷":

            answer =
            firstNumber / secondNumber;

        break;


    }




    currentInput =
    String(answer);



    firstNumber = null;

    currentOperator = null;



    updateAmount();


    updateBudgetImpact();


}









function resetCalculator(){


    currentInput="";

    firstNumber=null;

    currentOperator=null;


    amountValue.textContent =
    "₱0";


}










// ==============================
// FUNCTION MODES
// ==============================


const functionButtons =
document.querySelectorAll(
".function"
);



functionButtons.forEach(button=>{


    button.addEventListener(
    "click",
    ()=>{


        functionButtons.forEach(btn=>{

            btn.classList.remove(
            "active"
            );

        });



        button.classList.add(
        "active"
        );



        selectedFunction =
        button.dataset.function;



        updateFunctionLabel();



    });


});








function updateFunctionLabel(){


switch(selectedFunction){


    case "spend":

        amountLabel.textContent =
        "Amount to Spend";

    break;



    case "save":

        amountLabel.textContent =
        "Amount to Save";

    break;



    case "split":

        amountLabel.textContent =
        "Amount to Split";

    break;



    case "daily":

        amountLabel.textContent =
        "Daily Spending Limit";

    break;



    case "member":

        amountLabel.textContent =
        "Amount Per Member";

    break;



    case "percent":

        amountLabel.textContent =
        "Budget Percentage";

    break;



}


}










// ==============================
// MORE FUNCTIONS DROPDOWN
// ==============================


const moreButton =
document.querySelector(
".more-button"
);



const moreFunctions =
document.querySelector(
".more-functions"
);



moreButton.addEventListener(
"click",
()=>{


moreFunctions.classList.toggle(
"hidden"
);


});









// ==============================
// CATEGORY SELECTOR
// ==============================


const categoryButton =
document.querySelector(
".category-button"
);



const categoryMenu =
document.querySelector(
".category-menu"
);



categoryButton.addEventListener(
"click",
()=>{


categoryMenu.classList.toggle(
"hidden"
);


});







const categories =
document.querySelectorAll(
".category-menu button"
);



categories.forEach(category=>{


category.addEventListener(
"click",
()=>{


selectedCategory =
category.dataset.category;



categoryName.textContent =
selectedCategory;



categoryMenu.classList.add(
"hidden"
);



updateBudgetImpact();



});


});









// ==============================
// PLANNER EXPAND
// ==============================


const togglePlanner =
document.getElementById(
"togglePlanner"
);


const plannerMore =
document.querySelector(
".planner-more"
);



togglePlanner.addEventListener(
"click",
()=>{


plannerMore.classList.toggle(
"hidden"
);



});









// ==============================
// BUDGET IMPACT
// ==============================


function updateBudgetImpact(){



const amount =
Number(currentInput || 0);



const remaining =
document.getElementById(
"impactBudget"
);



const category =
document.getElementById(
"impactCategory"
);



const percent =
document.getElementById(
"impactPercent"
);



const status =
document.getElementById(
"impactStatus"
);






// No database yet

if(
householdBudget.remaining === null
){


remaining.textContent =
"--";


category.textContent =
selectedCategory;


percent.textContent =
"--";


status.textContent =
"Waiting";


return;

}





let newRemaining =

householdBudget.remaining;



if(selectedFunction === "spend"){

newRemaining -= amount;

}





let used =

(
amount /
householdBudget.total
)
*100;





remaining.textContent =

"₱" +

Math.max(
newRemaining,
0
)
.toLocaleString(
"en-PH"
);



percent.textContent =

used.toFixed(1)
+
"%";





if(newRemaining < 0){


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










// ==============================
// DATABASE CONNECTION READY
// ==============================


function loadHouseholdBudget(data){


householdBudget = data;


/*

Example:

loadHouseholdBudget({

total:25000,

spent:10484,

remaining:14516,

daysLeft:12

});


*/


updateBudgetImpact();


}