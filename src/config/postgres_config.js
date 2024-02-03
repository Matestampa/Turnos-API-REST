const dotenv=require("dotenv");
const {join}=require("path")

let env_absPath=join(__dirname,"../../.env")
dotenv.config({path:env_absPath});

//Variables de conexion
const POSTGRES_CONN_VARS={
    user:process.env.PG_USER,
    password:process.env.PG_PASSWORD,
    host:process.env.PG_HOST,
    port:process.env.PG_PORT,
    database:process.env.DB_NAME,
};

//Ciertas variables del Pool
const POSTGRES_POOL_VARS={
    idleTimeoutMillis:process.env.PG_POOL_IDLETIMEOUTMS
}

module.exports={POSTGRES_CONN_VARS,POSTGRES_POOL_VARS};