// ======================================
// 13TH MONTH PAY LOGIC
// ======================================


let received = true;






// ======================================
// TOGGLE RECEIVED STATUS
// ======================================


function setReceived(status){


    received = status;



    const receivedBtn =
    document.getElementById(
        "receivedBtn"
    );



    const notReceivedBtn =
    document.getElementById(
        "notReceivedBtn"
    );



    const summary =
    document.getElementById(
        "summaryCard"
    );



    const notReceivedCard =
    document.getElementById(
        "notReceivedCard"
    );



    const allocation =
    document.getElementById(
        "allocationArea"
    );





    receivedBtn.classList.remove(
        "active"
    );


    notReceivedBtn.classList.remove(
        "active"
    );





    if(status){


        receivedBtn.classList.add(
            "active"
        );



        summary.classList.remove(
            "hidden"
        );



        allocation.classList.remove(
            "hidden"
        );



        notReceivedCard.classList.add(
            "hidden"
        );



    }



    else{


        notReceivedBtn.classList.add(
            "active"
        );



        summary.classList.add(
            "hidden"
        );



        allocation.classList.add(
            "hidden"
        );



        notReceivedCard.classList.remove(
            "hidden"
        );



    }



}









// ======================================
// CALCULATION
// ======================================


function calculate(){



    let amount =

    Number(
        document.getElementById(
            "amountInput"
        ).value
    )
    ||0;





    let savings =

    Number(
        document.getElementById(
            "savingInput"
        ).value
    )
    ||0;




    let goals =

    Number(
        document.getElementById(
            "goalInput"
        ).value
    )
    ||0;





    let expenses =

    Number(
        document.getElementById(
            "expenseInput"
        ).value
    )
    ||0;






    let allocated =

    savings +
    goals +
    expenses;





    let remaining =

    amount -
    allocated;






    document.getElementById(
        "displayAmount"
    )
    .innerText =

    "₱" +
    amount.toLocaleString();






    document.getElementById(
        "allocated"
    )
    .innerText =

    "₱" +
    allocated.toLocaleString();







    document.getElementById(
        "remaining"
    )
    .innerText =

    "₱" +
    remaining.toLocaleString();







    updateStatus(
        remaining
    );



}








// ======================================
// STATUS
// ======================================


function updateStatus(
remaining
){



    const badge =

    document.getElementById(
        "statusBadge"
    );





    if(remaining === 0){



        badge.innerText =
        "Balanced ✓";


        badge.style.color =
        "#6f9d79";



    }





    else if(remaining > 0){



        badge.innerText =
        "Extra Funds Available";



        badge.style.color =
        "#6aa5c8";



    }





    else if(
        Math.abs(remaining)
        <= 1000
    ){



        badge.innerText =
        "Needs Adjustment";



        badge.style.color =
        "#dc9660";



    }





    else{



        badge.innerText =
        "Overallocated";



        badge.style.color =
        "#dc8d8d";



    }



}








// ======================================
// REVIEW BUTTON
// ======================================


function confirmAllocation(){



    if(!received){


        alert(
        "Please mark your 13th month pay status first."
        );


        return;


    }





    let amount =

    Number(
        document.getElementById(
            "amountInput"
        ).value
    );



    if(!amount || amount<=0){


        alert(
        "Please enter received amount."
        );


        return;


    }





    let allocated =

    Number(
        document.getElementById(
            "savingInput"
        ).value
    )
    +
    Number(
        document.getElementById(
            "goalInput"
        ).value
    )
    +
    Number(
        document.getElementById(
            "expenseInput"
        ).value
    );






    if(allocated > amount){


        alert(
        "Your allocation exceeds your received amount."
        );


        return;


    }





    alert(

    `Allocation Review

Savings:
₱${Number(document.getElementById("savingInput").value).toLocaleString()}

Goals:
₱${Number(document.getElementById("goalInput").value).toLocaleString()}

Expenses:
₱${Number(document.getElementById("expenseInput").value).toLocaleString()}`

    );



}









// ======================================
// INITIAL LOAD
// ======================================


document.addEventListener(
"DOMContentLoaded",

()=>{


    setReceived(true);


    calculate();


}

);