target = Math.floor(Math.random() * 100);
tentatives = 10;
 for (i=0;i<tentatives;i++){
    reste = tentatives - i -1;
    enterNumber = parseInt(prompt("entrer un nombre entre 0 et 100"))
    if (enterNumber == target){
        console.log("felicitation , le nombre à deviner etait "+ target)
        break;
    }
    else if (enterNumber > target){
        console.log("le nombre est plus petit")
    }
    else if (enterNumber < target){
        console.log("le nombre est plus grand") 
    }
    console.log("in vous reste "+ reste + "  tentatives")
 }