//------------------------ MIDDLEWARE PARA AUTENTICACION DE SESION DE USUARIO --------------- 

const {APP_GEN_VARS}=require("../config/app_config.js");
const {apiError_handler,DFLT_API_ERRORS}=require("../error_handling");

function check_authentication(req,res,next){
    //Si no estamos en modo testing
    if (!APP_GEN_VARS.testing_mode){
        if (req.cookies.user_id==req.session.user_id){
            next();
        }
        else{
            apiError_handler(DFLT_API_ERRORS.NOT_AUTH(),res);
        }
    }
    else{
        next();
    }
}

module.exports={check_authentication};