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






const app=express();

//------------ Activacion de scheduled tasks ------------------------
/*for (let task of scheduledTasks_data){
    cron.schedule(task.interval,task.callback);
}*/

//----------- Config general Express --------------------------
app.listen(3000,()=>console.log("on"));
app.use(express.json());
app.use(cookieparser());

app.use(sessions({
    secret:"putoelquelee",
    saveUninitialized:true,
    resave:false,
    cookie:{max_age:1000*60*60*24},

}));

//---------------- ENDPOINTS ---------------------------------------------

app.use("/user",logSession_Routes);

/*------- Middleware superior/general que aplica autenticacion a todas las requests -----
/Influye en todas, menos en las del login de arriba que son distintas.*/
app.use(check_authentication);

//------------------ RESTO DE ENDPOINTS -------------------------
app.use("/turnos",turnos_Routes);