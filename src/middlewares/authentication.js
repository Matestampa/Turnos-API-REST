//------------------------ MIDDLEWARE PARA AUTENTICACION DE SESION DE USUARIO --------------- 

const {APP_GEN_VARS}=require("../config/app_config.js");
const {error_handler,ERRORS}=require("./error_handler.js");

function check_authentication(req,res,next){
    //Si no estamos en modo testing
    if (!APP_GEN_VARS.testing_mode){
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