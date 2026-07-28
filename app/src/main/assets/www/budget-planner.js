const inputs = document.querySelectorAll("input");


const peso = (amount)=>{

return "₱" +
Math.round(amount)
.toLocaleString("en-PH");

};




function calculate(){


let available =

Number(income.value || 0)

+

Number(otherIncome.value || 0);




let planned =

Number(food.value || 0)

+

Number(bills.value || 0)

+

Number(transport.value || 0)

+

Number(rent.value || 0)

+

Number(family.value || 0)

+

Number(school.value || 0)

+

Number(allowance.value || 0)

+

Number(savings.value || 0)

+

Number(emergency.value || 0);





let remaining =

available - planned;





document.getElementById("available")
.textContent =
peso(available);



document.getElementById("summaryAvailable")
.textContent =
peso(available);



document.getElementById("planned")
.textContent =
peso(planned);



document.getElementById("remaining")
.textContent =
peso(remaining);





if(remaining < 0){

message.textContent =
"⚠ Your planned budget exceeds your income.";

}


else if(remaining === 0){

message.textContent =
"✅ Your budget is fully planned.";

}


else{

message.textContent =
"You still have money available.";

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