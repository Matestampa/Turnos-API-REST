const {pool}=require("./db/postgres.js");

const {DFLT_API_ERRORS}=require("../error_handling");


//POST "login"
async function postLogin(username,password){
   let response=await pool.query(`SELECT users.id,user_access.password FROM users INNER JOIN 
                      user_access ON users.id=user_access.user_id WHERE users.username=$1`,[username]);
   
   //Chequear que exista el usuario.
   if (response.rows.length==0){ return DFLT_API_ERRORS.BAD_REQ("Invalid username or password") }
   
   //Aca deberiamos deshashear la contraseña antes(en caso que este hasheada)
   //Chequear que la contraseña sea correcta
   else if (response.rows[0].password==password){
      let user_id=response.rows[0].id;
      
      return {error:null,"user_id":user_id};
   }
   
   //Si no
   else{
      return {error:DFLT_API_ERRORS.NOT_AUTH("Invalid username or password"), user_id:null};
   }
}

module.exports={
  postLogin
}