//require("dotenv").config();

//procces.env.variable

const POSTGRES_CONFIG={
    user:"postgres",
    password:"postgres",
    host:"localhost",
    port:5432,
    database:"turnos",
    idleTimeoutMillis:0
};

module.exports=POSTGRES_CONFIG;