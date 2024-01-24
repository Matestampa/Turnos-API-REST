const {pool}=require("./db/postgres.js");

const {ERRORS}=require("../middlewares/error_handler.js");

//get "/login"
//LA HACEMOS TODA EN EL CONTROLLER YA QUE NO NECESITA NADA EXTRA
/*async function getLogin(req,res){
    if (req.session.user_id){
      res.status(200).json({"logged":true});
    }
    else{
      res.status(401).json({"logged":false});
    }
}*/

//post "login"
async function postLogin(username,password){
   let response=await pool.query(`SELECT users.id,user_access.password FROM users INNER JOIN 
                      user_access ON users.id=user_access.user_id WHERE users.username=$1`,[username]);
   
   if (response.rows.length==0){return {error:{type:"bad_request",descr:"Invalid username or password"}}}
   
   //Aca deberiamos deshashear la contra antes(en caso que este hasheada)
   else if (response.rows[0].password==password){
      let user_id=response.rows[0].id;
      
      return {error:null,"user_id":user_id};
   }
   else{
      return {error:ERRORS.NOT_AUTH("Invalid username or password"), user_id:null};
   }
}

//get "/logout"
//LA HACEMOS TODA EN EL CONTROLER YA QUE NO NECESITA NADA EXTRA
/*async function logout(req,res){
  req.session.destroy();
  res.status(200).send("Logged out");
}*/

module.exports={
  postLogin
}