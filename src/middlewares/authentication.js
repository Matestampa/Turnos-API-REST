const APP_CONFIG=require("../config/app_config.js");
const {error_handler,ERRORS}=require("./error_handler.js");

function check_authentication(req,res,next){
    //Si no estamos en modo testing
    if (!APP_CONFIG.testing_mode){
        if (req.cookies.user_id==req.session.user_id){
            next();
        }
        else{
            error_handler(res,ERRORS.NOT_AUTH());
        }
    }
    else{
        next();
    }
}

module.exports={check_authentication};