//------------------- INICIACION DE CLASES PARA INTERACTUAR CON POSTGRES ------------------------------------
//-------------------------------  Y COSAS RELACIONADAS    -----------------------------

const {Pool}=require("pg");
const {POSTGRES_CONN_VARS,POSTGRES_POOL_VARS}=require("../../config/postgres_config.js");

//Connection pool para hacer queries a la db
const pool=new Pool({
    ...POSTGRES_CONN_VARS,
    ...POSTGRES_POOL_VARS
});


//Clase para implementar tranasactions.
class Transaction{
    constructor(connection){
       this.conn=connection;
    }
    async get_conn(pool){
       return await pool.connect();
    }

    async start(){
        await this.conn.query("BEGIN");
    }

    async rollback(){
        await this.conn.query("ROLLBACK");
        this.conn.release();
    }

    async commit(){
        await this.conn.query("COMMIT");
        this.conn.release();
    }
}

module.exports={pool,Transaction};