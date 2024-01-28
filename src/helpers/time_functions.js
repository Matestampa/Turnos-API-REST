//--------------------  FUNCIONES PARA EL MANEJO DE FECHAS ----------------------------------------


//Devuelve Date en formato string sin la parte del tiempo
function remove_time(date){
    return `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`
}

//Genera el dia actual en formato "remove_time" y tambien el dia en el futuro pasados
//ciertos dias (limit) 
function gen_limitDays(limit){
    let today=new Date()
    
    let from_day=remove_time(today);
    
    let until_day=new Date(today.setDate(today.getDate()+limit));
    until_day=remove_time(until_day);

    return [from_day,until_day];
}

//Calcula diferencia de dias entre 2 fechas, con decimales incluidos
function day_diference(date1,date2){
    let ms_diff=date1.getTime()-date2.getTime();
    return ms_diff / (1000*60*60*24);
}


module.exports={gen_limitDays,remove_time,day_diference};