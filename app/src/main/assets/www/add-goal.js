let selectedType = "";





function selectType(button,type){


selectedType = type;



document
.querySelectorAll(
".goal-grid button"
)
.forEach(btn=>{


btn.classList.remove(
"selected"
);


});



button.classList.add(
"selected"
);




let custom =

document.getElementById(
"customType"
);



if(type==="Custom"){


custom.classList.remove(
"hidden"
);


}

else{


custom.classList.add(
"hidden"
);


}



}







function createGoal(){



let name =

document
.getElementById(
"goalName"
)
.value;





let target =

Number(

document
.getElementById(
"targetAmount"
)
.value

);






let initial =

Number(

document
.getElementById(
"initialSavings"
)
.value

)
||0;







if(!selectedType){


alert(
"Please select a goal type."
);


return;


}






if(selectedType==="Custom"){


selectedType =

document
.getElementById(
"customType"
)
.value;



if(!selectedType){


alert(
"Enter custom goal type."
);


return;


}


}






if(!name || target<=0){


alert(
"Complete goal details."
);


return;


}







let goals =

JSON.parse(

localStorage.getItem(
"kabalikatGoals"
)

)
||
[];








let newGoal = {


id:
Date.now(),


name:name,


category:selectedType,


target:target,


saved:initial,


icon:getIcon(selectedType)


};







goals.push(
newGoal
);







localStorage.setItem(

"kabalikatGoals",

JSON.stringify(goals)

);







alert(
"Goal created successfully!"
);





window.location.href =
"savings.html";



}







function getIcon(type){


switch(type){


case "Holiday":
return "bi-gift";


case "Education":
return "bi-book";


case "Home":
return "bi-house";


case "Vacation":
return "bi-airplane";


default:
return "bi-bullseye";


}


}