const { error_handler } = require("../middlewares/error_handler.js");
const Service=require("../services/logSession_Service.js");

//get "/login"
async function getLogin(req,res){
      if (req.session.user_id){
        res.status(200).json({status:200, message:"", data:{logged:true}});
      }
      else{
        res.status(401).json({status:200, message:"", data:{logged:false}});
      }
}

//put "login"
async function postLogin(req,res){
     let {username,password}=req.body;

     let {error,user_id}=await Service.postLogin(username,password);

     if (!error){
        req.session.user_id=user_id
        res.cookie("user_id",user_id);
        res.status(200).json({status:200,message:"logged"});
     }
     else{
      error_handler(res,error);
     }

}
 
//get "/logout"
async function logout(req,res){
    req.session.destroy();
    res.status(200).send("Logged out");
}

module.exports={
    getLogin,postLogin,logout
}