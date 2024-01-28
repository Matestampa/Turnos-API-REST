/*----------- Variables (no constantes tecnicamente) pero que no se modifican      ---------
//----------- especificamente por los endpoints del user. Sino que se pueden llegar ---------
//----------- a modificar cada tanto por el admin, o por alguna scheduled task.     ----------
*/


const {gen_limitDays}=require("../../helpers/time_functions.js");

const {APP_GEN_VARS}=require("../../config/app_config.js");


let LIMIT_DAYS=5; //limite de dias a futuro para reservar turno
let MINIMUM_DAYS_2CANCEL=1; //minimo de dias anteriores al turno para cancelarlo

//En deploy hacemos esto con un scheduler 1 vez por dia, pero mientras estemos en modo
//dev, lo seguimos haciendo aca.(ya q el server lo prendemos y apagamos td el rato)
let from_day,until_day;

if (APP_GEN_VARS.dev_mode){
    [from_day,until_day]=gen_limitDays(LIMIT_DAYS);
}

//Maximos espacios disponibles en un horario de un cierto dia.
let MAX_SPACES=2;

module.exports={LIMIT_DAYS,
                MINIMUM_DAYS_2CANCEL,
                from_day, until_day,
                MAX_SPACES};