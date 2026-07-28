const incomeInput = document.getElementById("income");
const extraInput = document.getElementById("extra");

const needsInput = document.getElementById("needs");
const savingsInput = document.getElementById("save");
const emergencyInput = document.getElementById("emergency");
const othersInput = document.getElementById("others");

const totalAvailable = document.getElementById("total");
const percentageTotal = document.getElementById("percent");

const needsAmount = document.getElementById("needsAmount");
const savingsAmount = document.getElementById("saveAmount");
const emergencyAmount = document.getElementById("emergencyAmount");
const othersAmount = document.getElementById("othersAmount");

const summaryBudget = document.getElementById("sumTotal");
const allocatedAmount = document.getElementById("allocated");
const remainingAmount = document.getElementById("remaining");

const warningMessage = document.getElementById("warning");

const balancedButton = document.getElementById("balanced");
const savingsButton = document.getElementById("focused");
const resetButton = document.getElementById("reset");


function formatMoney(amount) {
    return "₱" + Math.round(amount).toLocaleString("en-PH");
}



function calculateBudget() {

    // Calculate available money
    const totalBudget =
        Number(incomeInput.value || 0) +
        Number(extraInput.value || 0);



    // Display total available
    totalAvailable.textContent =
        formatMoney(totalBudget);



    summaryBudget.textContent =
        formatMoney(totalBudget);



    // Get percentages
    const needsPercent =
        Number(needsInput.value || 0);

    const savingsPercent =
        Number(savingsInput.value || 0);

    const emergencyPercent =
        Number(emergencyInput.value || 0);

    const othersPercent =
        Number(othersInput.value || 0);



    const totalPercentage =
        needsPercent +
        savingsPercent +
        emergencyPercent +
        othersPercent;



    percentageTotal.textContent =
        totalPercentage + "%";



    // Calculate category amounts
    const needsValue =
        totalBudget * (needsPercent / 100);

    const savingsValue =
        totalBudget * (savingsPercent / 100);

    const emergencyValue =
        totalBudget * (emergencyPercent / 100);

    const othersValue =
        totalBudget * (othersPercent / 100);



    needsAmount.textContent =
        formatMoney(needsValue);

    savingsAmount.textContent =
        formatMoney(savingsValue);

    emergencyAmount.textContent =
        formatMoney(emergencyValue);

    othersAmount.textContent =
        formatMoney(othersValue);



    const allocated =
        needsValue +
        savingsValue +
        emergencyValue +
        othersValue;



    allocatedAmount.textContent =
        formatMoney(allocated);



    remainingAmount.textContent =
        formatMoney(totalBudget - allocated);



    // Validation message

    if (totalPercentage > 100) {

        warningMessage.textContent =
            "⚠ Allocation exceeds 100%.";

    } 
    
    else if (totalPercentage < 100) {

        warningMessage.textContent =
            "You still have unallocated budget.";

    } 
    
    else {

        warningMessage.textContent =
            "";

    }

}



// Update whenever user types

[
    incomeInput,
    extraInput,
    needsInput,
    savingsInput,
    emergencyInput,
    othersInput

].forEach(input => {

    input.addEventListener(
        "input",
        calculateBudget
    );

});




// Balanced preset

balancedButton.addEventListener(
    "click",
    () => {

        needsInput.value = 60;
        savingsInput.value = 20;
        emergencyInput.value = 10;
        othersInput.value = 10;

        calculateBudget();

    }
);




// Savings focused preset

savingsButton.addEventListener(
    "click",
    () => {

        needsInput.value = 50;
        savingsInput.value = 30;
        emergencyInput.value = 15;
        othersInput.value = 5;

        calculateBudget();

    }
);




// Reset button

resetButton.addEventListener(
    "click",
    () => {

        incomeInput.value = "";
        extraInput.value = "";

        needsInput.value = 60;
        savingsInput.value = 20;
        emergencyInput.value = 10;
        othersInput.value = 10;


        calculateBudget();

    }
);



// Initial calculation

calculateBudget();