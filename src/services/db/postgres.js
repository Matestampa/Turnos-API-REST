const {Pool}=require("pg");
const POSTGRES_CONFIG=require("../../config/postgres_config.js");

//Conection pool to make queries
const pool=new Pool(POSTGRES_CONFIG);

//Class to implement transactions
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