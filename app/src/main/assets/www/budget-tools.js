// ===========================
// BUDGET PLANNER
// ===========================


const plannerInputs = document.querySelectorAll(
".planner-card input, .card input"
);



function peso(value){

    return "₱" +
    Math.round(value)
    .toLocaleString("en-PH");

}




function calculatePlanner(){


    const income =

    Number(document.getElementById("income").value || 0);



    const otherIncome =

    Number(document.getElementById("otherIncome").value || 0);



    const available =

    income + otherIncome;



    const expenses = [

        "food",
        "bills",
        "transport",
        "rent",
        "family",
        "school",
        "allowance",
        "savings",
        "emergency"

    ];



    let total = 0;



    expenses.forEach(id=>{

        total += Number(
            document.getElementById(id).value || 0
        );

    });




    const remaining =

    available - total;




    document.getElementById(
        "availableMoney"
    ).textContent =
    peso(available);



    document.getElementById(
        "summaryAvailable"
    ).textContent =
    peso(available);



    document.getElementById(
        "planned"
    ).textContent =
    peso(total);



    document.getElementById(
        "remaining"
    ).textContent =
    peso(remaining);




    const message =
    document.getElementById(
        "plannerMessage"
    );



    if(remaining < 0){

        message.textContent =
        "⚠ Your planned budget exceeds your income.";

    }

    else if(remaining === 0){

        message.textContent =
        "✅ Your budget is fully planned.";

    }

    else {

        message.textContent =
        "You still have money available.";

    }


}





plannerInputs.forEach(input=>{

    input.addEventListener(
        "input",
        calculatePlanner
    );

});



calculatePlanner();









// ===========================
// CALCULATOR
// ===========================


const buttons =
document.querySelectorAll(
".buttons button"
);


const expression =
document.getElementById(
"expression"
);


const result =
document.getElementById(
"result"
);



let current = "";




buttons.forEach(button=>{


button.addEventListener(
"click",
()=>{


const value =
button.textContent;



if(value === "C"){

    current="";

    expression.textContent="";

    result.textContent="0";

}



else if(value === "⌫"){

    current =
    current.slice(0,-1);

    expression.textContent =
    current;

}



else if(value === "="){


    try{


        let answer =
        eval(current);



        result.textContent =
        answer;



    }

    catch{

        result.textContent =
        "Error";

    }



}



else{


    current += value;

    expression.textContent =
    current;


}



}

);


});