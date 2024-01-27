//---------- SCHEDULED TASKS PARA HACER TAREAS Q SE REPITEN CADA CIERTO TIEMPO ---------------
//              (YA SEA CAMBIAR VARIABLES, O BORRAR/AGREGAR DATA A LA DB)


const {pool}=require("../services/db/postgres.js");
const const_vars=require("../services/const_vars/turnos_constVars.js");
const {gen_limitDays, remove_time}=require("../helpers/time_functions.js");


//Renueva el rango de dias en el que se pueda sacar turno
//Repite al inicio de cada dia
function set_limitDays(){
    let results=gen_limitDays(const_vars.LIMIT_DAYS);
    
    const_vars.from_day=results[0];
    const_vars.until_day=results[1];
};


//Inserta los day_times rows de cada dia, en la tabla "day_time".
async function insert_dayTimes_rows(){
    //Traemos el "until_day"(osea el day de "day_time" q hay que meter)
    let last_day=gen_limitDays(const_vars.LIMIT_DAYS)[1];

    let day_week_num=new Date(last_day).getDay();
    
    //Si es sabado o domingo no metemos nada
    if (day_week_num==6 || day_week_num==6){return}
    
    //Traemos los ids de las hours
    let hours_ids=(await pool.query(`SELECT id FROM hours`)).rows;
    
    //Traemos ultimo id para saber cual meter
    let curr_id=(await pool.query(`SELECT max(id) FROM day_time`))
     
     //por cada hour,Metemos un day_time
     let dayTime_row=[];
     
     let avail_spaces=const_vars.MAX_SPACES;

     for (let hr_id of hours_ids){
        curr_id++

        dayTime_row=[curr_id,last_day,hr_id,avail_spaces];

        await pool.query("INSERT INTO day_time(day,hr,avail) VALUES($1,$2,$3)",)
     }
}

//Para c/u se exporta el intervalo de tiempo y el callback que debe llamarse.
const scheduledTasks_data=[
    {"interval":"* 0 0 * * *",
     "callback":set_limitDays},
    
    {"interval":"* 0 0 * * *",
     "callback":insert_dayTimes_rows}
];

module.exports={scheduledTasks_data};