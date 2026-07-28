const inputs = document.querySelectorAll("input");


const peso = (value)=>{

return "₱" + Math.round(value)
.toLocaleString("en-PH");

};



function calculate(){


let available =

Number(income.value || 0)

+

Number(otherIncome.value || 0);



let spending =

Number(food.value || 0)

+

Number(bills.value || 0)

+

Number(transport.value || 0)

+

Number(rent.value || 0)

+

Number(family.value || 0);



let savingsAmount =

Number(savings.value || 0);



let emergencyAmount =

Number(emergency.value || 0);



let totalUsed =

spending

+

savingsAmount

+

emergencyAmount;



let remainingMoney =

available - totalUsed;



available.textContent =
peso(available);



summaryAvailable.textContent =
peso(available);



planned.textContent =
peso(spending);



saved.textContent =
peso(
savingsAmount + emergencyAmount
);



remaining.textContent =
peso(remainingMoney);





if(remainingMoney < 0){


message.textContent =

"⚠ Your planned budget exceeds your available money.";


message.style.color="#d9822b";

}


else if(remainingMoney === 0){


message.textContent =

"✅ Your budget is fully planned!";


}


else{


message.textContent =

"Great! You still have money available for savings or other needs.";


}



}



inputs.forEach(input=>{

input.addEventListener(
"input",
calculate
);

});




reset.onclick = ()=>{


inputs.forEach(input=>{

input.value="";

});


calculate();


};



calculate();