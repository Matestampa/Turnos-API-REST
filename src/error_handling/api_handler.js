const {internalError_handler,InternalError}=require("./internal_handler.js");

//---------------------- HANDLER CENTRAL DE ERRORS PARA EL USER -------------------------------

async function apiError_handler(error,response){
    
    //Revisamos si se trata de un error interno
    if (error instanceof InternalError){
        //Se lo pasamos al handler interno
        internalError_handler(error);
        
        //Transformamos el error en uno para el user.
        error=DFLT_API_ERRORS.SERVER();
    }
    
    //Ordena bien data de response
    let response_message=error.message? error.message: error.default_message;
    
    //se la manda al user
    response.status(error.status_code).json({
        status:error.status_code,
        error:{
            message:response_message,
            data:error.data 
        }
    });

}


//--------------------- CLASES DE ERRROS PARA EL USER ------------------------------

//########### Clase base #########################
class Error4User extends Error{
    constructor(message,data){
      super(message);
      this.message=message; 
      this.data=data;
      
      //Personalizables obligatorias de c/U
      this.default_message;
      this.status_code;
    }
}


//########### implementaciones ##################
class Api_NotAuth_Error extends Error4User{
    constructor(message,data){
        super(message,data);

        this.default_message="Unhautorized user"
        this.status_code=401;
    }
}

class Api_BadRequest_Error extends Error4User{
    constructor(message,data){
        super(message,data);

        this.default_message="Bad request"
        this.status_code=404;
    }
}


class Api_Server_Error extends Error4User{
    constructor(message,data){
        super(message,data);

        this.default_message="Server malfunc"
        this.status_code=500;
    }
}


//--------------------- OBJ CON TODOS LOS ERRORS -------------------------------------
//------------------ PARA QUE SEA MAS FACIL USARLOS E IMPORTARLOS --------------------

const DFLT_API_ERRORS=Object.freeze({
    NOT_AUTH:(message,data)=>new Api_NotAuth_Error(message,data),
    BAD_REQ:(message,data)=> new Api_BadRequest_Error(message,data),
    SERVER: (message,data)=> new Api_Server_Error(message,data),
})


module.exports={apiError_handler,Error4User,DFLT_API_ERRORS};