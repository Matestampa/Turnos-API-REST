//Devuelve Date en formato string sin la parte del tiempo
function quit_time(date){
    return `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`
}

//Genera el dia de la fecha en formato "quit_time" y tambien el dia pasado ciertos dias
//tambien en el mismo formato
function gen_limitDays(limit){
    let today=new Date()
    
    let from_day=quit_time(today);
    
    let until_day=new Date(today.setDate(today.getDate()+limit));
    until_day=quit_time(until_day);

    return [from_day,until_day];
}

//Calcula diferencia de dias entre 2 fechas con decimales incluidos
function day_diference(date1,date2){
    let ms_diff=date1.getTime()-date2.getTime();
    return ms_diff / (1000*60*60*24);
}


module.exports={gen_limitDays,quit_time,day_diference};