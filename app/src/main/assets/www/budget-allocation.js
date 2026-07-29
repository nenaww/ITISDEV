let income = 25000;



let categories = [

{
name:"Food",
amount:6000
},

{
name:"Transportation",
amount:2000
}

];



let seasonal = [

{
name:"Christmas",
amount:1500
}

];



let bills = [

{
name:"Electricity",
amount:2500
}

];





function addItem(type){


let name = prompt(
"Enter name:"
);



if(!name)
return;



let item={

name:name,

amount:0

};



if(type==="category")

categories.push(item);


if(type==="seasonal")

seasonal.push(item);


if(type==="bill")

bills.push(item);



render();

calculate();


}






function render(){


renderList(
"categoryList",
categories,
"category"
);


renderList(
"seasonalList",
seasonal,
"seasonal"
);


renderList(
"billList",
bills,
"bill"
);



}








function renderList(
id,
array,
type
){


let container =
document.getElementById(id);


container.innerHTML="";



array.forEach((item,index)=>{


container.innerHTML += `


<div class="item">


<span>
${item.name}
</span>


<input
type="number"
value="${item.amount}"
oninput="
updateAmount('${type}',${index},this.value)
">


<button onclick="
removeItem('${type}',${index})
">

×


</button>


</div>


`;

});


}








function updateAmount(
type,
index,
value
){


let amount =
Number(value)||0;



if(type==="category")
categories[index].amount=amount;


if(type==="seasonal")
seasonal[index].amount=amount;


if(type==="bill")
bills[index].amount=amount;



calculate();

}







function removeItem(
type,
index
){


if(type==="category")
categories.splice(index,1);


if(type==="seasonal")
seasonal.splice(index,1);


if(type==="bill")
bills.splice(index,1);



render();

calculate();


}








function calculate(){


let categoryTotal =

categories.reduce(
(sum,item)=>sum+item.amount,
0
);



let seasonalTotal =

seasonal.reduce(
(sum,item)=>sum+item.amount,
0
);



let billTotal =

bills.reduce(
(sum,item)=>sum+item.amount,
0
);



let savings =

Number(
document.getElementById(
"savingsInput"
).value
)
||0;




let allocated =

categoryTotal
+
seasonalTotal
+
billTotal
+
savings;



let remaining =

income -
allocated;






document.getElementById(
"allocated"
).innerText =

"₱"+allocated.toLocaleString();





document.getElementById(
"remaining"
).innerText =

"₱"+remaining.toLocaleString();





document.getElementById(
"availableDisplay"
).innerText =

"₱"+remaining.toLocaleString();






let badge =
document.getElementById(
"statusBadge"
);





if(remaining > 0){

badge.innerText =
"Extra Funds Available";

}



else if(remaining===0){

badge.innerText =
"Balanced";

}



else if(Math.abs(remaining)<=2000){

badge.innerText =
"Needs Adjustment";

}



else{

badge.innerText =
"Overallocated";

}



}







function saveBudget(){


calculate();


alert(
"Budget plan saved!"
);


}







document.addEventListener(
"DOMContentLoaded",
()=>{


document.getElementById(
"incomeDisplay"
).innerText =
"₱"+income.toLocaleString();



render();

calculate();


});