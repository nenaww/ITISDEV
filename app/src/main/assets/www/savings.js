// =====================================
// KABALIKAT SAVINGS PROTOTYPE DATA
// =====================================


const savingsData = {


    totalSavings: 32560,


    emergencyFund: 12000,


    monthlyExcess: 2350,



    goals:[

        {
            id:1,

            name:"Christmas Fund",

            saved:3200,

            target:6000,

            icon:"bi-tree",

            style:"green"

        },


        {
            id:2,

            name:"School Opening",

            saved:1850,

            target:4000,

            icon:"bi-mortarboard",

            style:"purple"

        }


    ],




    activities:[


        {

            date:"JUL 20",

            title:"Monthly Excess Added",

            subtitle:"From Budget Allocation",

            amount:"+₱2,350",

            type:"income"

        },



        {

            date:"JUL 18",

            title:"13th Month Pay Added",

            subtitle:"Moved to Savings",

            amount:"+₱8,000",

            type:"income"

        },



        {

            date:"JUL 15",

            title:"Christmas Fund",

            subtitle:"Goal Allocation",

            amount:"-₱1,500",

            type:"expense"

        }



    ]



};






// =====================================
// NAVIGATION
// =====================================


function navigate(page){

    window.location.href = page;

}







// =====================================
// SAVINGS OVERVIEW
// =====================================


function renderOverview(){


    document.getElementById(
        "totalSavings"
    ).innerText =

    "₱" +
    savingsData.totalSavings.toLocaleString();



    document.getElementById(
        "emergencyFund"
    ).innerText =

    "₱" +
    savingsData.emergencyFund.toLocaleString();




    document.getElementById(
        "monthlyExcess"
    ).innerText =

    "+₱" +
    savingsData.monthlyExcess.toLocaleString()
    +
    " saved this month";




    document.getElementById(
        "goalCount"
    ).innerText =

    savingsData.goals.length +
    " Goals";


}








// =====================================
// ACTIVE GOALS
// =====================================


function renderGoals(){


    const container =

    document.getElementById(
        "goal-container"
    );



    container.innerHTML = "";




    savingsData.goals.forEach(goal=>{


        let progress = Math.round(

            (goal.saved /
            goal.target)
            *
            100

        );



        if(progress > 100){

            progress = 100;

        }





        container.innerHTML += `


        <div class="goal-card">


            <div class="goal-top">


                <div class="goal-icon ${goal.style}">


                    <i class="bi ${goal.icon}"></i>


                </div>




                <div class="goal-name">


                    <strong>
                    ${goal.name}
                    </strong>


                    <span>

                    ₱${goal.saved.toLocaleString()}
                    /
                    ₱${goal.target.toLocaleString()}

                    </span>


                </div>




                <strong>

                ${progress}%

                </strong>



            </div>





            <div class="progress">


                <span style="
                width:${progress}%
                "></span>


            </div>





            <button onclick="addMoney(${goal.id})">

                + Add Money

            </button>




        </div>


        `;



    });



}







// =====================================
// ADD MONEY TO GOAL
// =====================================


function addMoney(id){


    let amount = prompt(
        "Enter amount to add:"
    );



    amount = Number(amount);




    if(!amount || amount <= 0){

        return;

    }




    let goal =

    savingsData.goals.find(

        item => item.id === id

    );





    if(!goal){

        return;

    }




    goal.saved += amount;



    savingsData.totalSavings -= amount;





    savingsData.activities.unshift({


        date:"TODAY",


        title:
        "Added to " + goal.name,


        subtitle:
        "Goal contribution",


        amount:
        "-₱" + amount.toLocaleString(),


        type:"expense"


    });





    renderOverview();

    renderGoals();

    renderActivity();



}









// =====================================
// RECENT ACTIVITY
// =====================================


function renderActivity(){


    const container =

    document.getElementById(
        "activity-container"
    );



    container.innerHTML = "";





    savingsData.activities.forEach(item=>{


        container.innerHTML += `


        <div class="transaction">


            <div class="date">

                ${item.date}

            </div>




            <div class="transaction-info">


                <strong>

                ${item.title}

                </strong>


                <span>

                ${item.subtitle}

                </span>


            </div>




            <strong class="${item.type}">

                ${item.amount}

            </strong>



        </div>



        `;


    });



}









// =====================================
// INITIALIZE PAGE
// =====================================


document.addEventListener(

"DOMContentLoaded",

()=>{


    renderOverview();


    renderGoals();


    renderActivity();



}

);