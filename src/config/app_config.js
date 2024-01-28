//------------------- ARCHIVO DE ENTRADA Y DISTRIBUCION DE VARIABLES DE ENTORNO ------------

const dotenv=require("dotenv");
const {join}=require("path")

let env_absPath=join(__dirname,"../../.env")
dotenv.config({path:env_absPath});



//Variables generales de la app
const APP_GEN_VARS={
    dev_mode:process.env.ENV=="dev" ? true : false,
    session_secret:process.env.SESSION_SECRET,
}

//Variables de conexion de la app
const APP_CONN_VARS={
    host:process.env.HOST,
    port:process.env.PORT,
}

//Variables de conexion de postgres
const POSTGRES_CONN_VARS={
    user:process.env.PG_USER,
    password:process.env.PG_PASSWORD,
    host:process.env.PG_HOST,
    port:process.env.PG_PORT,
}


module.exports={APP_GEN_VARS,
               APP_CONN_VARS,
               POSTGRES_CONN_VARS
}