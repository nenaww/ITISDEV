const buttons =
document.querySelectorAll(".buttons button");


const expression =
document.getElementById("expression");


const result =
document.getElementById("result");



let current = "";





buttons.forEach(button=>{


button.addEventListener(
"click",
()=>{


let value =
button.textContent;



// CLEAR

if(value === "C"){

current = "";

expression.textContent="";

result.textContent="0";

return;

}





// DELETE

if(value === "⌫"){

current =
current.slice(0,-1);

expression.textContent =
current;

return;

}





// EQUAL

if(value === "="){


try{


let formatted =
current
.replaceAll("×","*")
.replaceAll("÷","/")
.replaceAll("−","-");



let answer =
eval(formatted);



result.textContent =
answer;



}


catch{


result.textContent =
"Error";

}



return;

}





// PERCENT

if(value === "%"){


current += "/100";

expression.textContent =
current;

return;

}





// NORMAL BUTTON

current += value;


expression.textContent =
current;



}


);


});