let plans = [


{

id:1,

name:"Christmas Fund",

category:"Holiday",

target:10000,

saved:3200,

monthly:1500,

icon:"bi-gift"

},



{

id:2,

name:"School Opening",

category:"Education",

target:5000,

saved:1850,

monthly:800,

icon:"bi-book"

}



];








function renderPlans(){


const container =

document.getElementById(
"plans-container"
);



container.innerHTML="";



let total=0;



plans.forEach(plan=>{


total += plan.saved;



let progress = Math.round(

(plan.saved / plan.target)
*100

);



if(progress>100)
progress=100;




container.innerHTML += `


<div class="plan-card">


<div class="plan-header">


<div class="plan-icon"
style="
background:#efeafe;
color:#8c68d9;
">

<i class="bi ${plan.icon}"></i>

</div>




<div class="plan-info">


<strong>
${plan.name}
</strong>


<span>
${plan.category}
</span>


</div>


<strong>
${progress}%
</strong>



</div>





<div class="progress">

<span style="
width:${progress}%
">

</span>

</div>





<div class="plan-details">

<span>
Saved
</span>


<strong>
₱${plan.saved.toLocaleString()}
</strong>


</div>





<div class="plan-details">

<span>
Monthly Contribution
</span>


<strong>
₱${plan.monthly.toLocaleString()}
</strong>


</div>




<button class="view-btn"
onclick="addSavings(${plan.id})">

+ Add Savings

</button>



</div>



`;



});





document.getElementById(
"totalSaved"
).innerText =

"₱"+total.toLocaleString();



}









function addSavings(id){


let amount = Number(

prompt(
"Add amount:"
)

);



if(!amount)
return;



let plan =

plans.find(
item=>item.id===id
);



plan.saved += amount;



renderPlans();



}









function openAddModal(){


document
.getElementById(
"modal"
)
.classList
.remove(
"hidden"
);


}






function closeModal(){


document
.getElementById(
"modal"
)
.classList
.add(
"hidden"
);


}








function createPlan(){


let name =

document.getElementById(
"planName"
).value;



let category =

document.getElementById(
"category"
).value;



let target =

Number(
document.getElementById(
"target"
).value
);



let saved =

Number(
document.getElementById(
"saved"
).value
)
||0;



let monthly =

Number(
document.getElementById(
"monthly"
).value
)
||0;





if(!name || !target){

alert(
"Complete the required fields."
);

return;

}





plans.push({

id:
Date.now(),

name:name,

category:category,

target:target,

saved:saved,

monthly:monthly,

icon:"bi-calendar"

});





renderPlans();

closeModal();



}






document.addEventListener(
"DOMContentLoaded",
()=>{


renderPlans();


});