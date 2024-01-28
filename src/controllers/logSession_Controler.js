const { apiError_handler, DFLT_API_ERRORS } = require("../error_handling");
const Service=require("../services/logSession_Service.js");

//GET "/login"
async function getLogin(req,res){
      if (req.session.user_id){
        res.status(200).json({status:200, message:"", data:{logged:true}});
      }
      
      else{
        apiError_handler(DFLT_API_ERRORS.NOT_AUTH("",{data:{logged:false}}) , res)
        return;
      }
}

//PUT "login"
async function postLogin(req,res){
     let {username,password}=req.body;

     let {error,user_id}=await Service.postLogin(username,password);

     if (error){ apiError_handler(error, res); return}
     
    
     req.session.user_id=user_id
     res.cookie("user_id",user_id);
     res.status(200).json({status:200,message:"Logged in"});

}
 
//GET "/logout"
async function logout(req,res){
    req.session.destroy();
    res.status(200).json({status:200,message:"Logged out"});
}

module.exports={
    getLogin,postLogin,logout
}