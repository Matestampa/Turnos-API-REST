const express=require("express");

//-------------- importacion para scheduled tasks --------------------
const cron=require("node-cron");
const {scheduledTasks_data}=require("./extra_services/scheduled_tasks.js");

//-------------- importacion de middlewares -----------------
const sessions=require("express-session");
const cookieparser=require("cookie-parser");
const {check_authentication}=require("./middlewares/authentication.js");

//--------------- importacion de rutas --------------------------
const logSession_Routes=require("./routes/logSession_Routes.js");
const turnos_Routes=require("./routes/turnos_Routes.js");

//--------------- importacion cosas generales --------------------
const {APP_GEN_VARS}=require("./config/app_config.js");



const App=express();

//------------ Activacion de scheduled tasks ------------------------
/*for (let task of scheduledTasks_data){
    cron.schedule(task.interval,task.callback);
}*/



//---------------- Config general Express -------------------------------
App.use(express.json());
App.use(cookieparser());

App.use(sessions({
    secret:APP_GEN_VARS.session_secret,
    saveUninitialized:true,
    resave:false,
    cookie:{max_age:1000*60*60*24},

}));


//---------------- ENDPOINTS ---------------------------------------------
App.use("/user",logSession_Routes);

/*------- Middleware superior/general que aplica autenticacion a todas las requests -----
(Influye en todas, menos en las del login de arriba que son distintas).*/
App.use(check_authentication);


//------------------ RESTO DE ENDPOINTS -------------------------
App.use("/turnos",turnos_Routes);


module.exports={App};