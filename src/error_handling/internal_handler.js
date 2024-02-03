
//------------------------------- HANDLER CENTRAL DE ERRORES INTERNOS -------------------------

async function internalError_handler(error){
    
    //Logear el error a donde sea
    console.log(`${error} DESDE EL INTERNAL HANDLER`);

    //Si es critico, tira abajo el server o las requests.
    if (error.critic){
      
    }
}


//------------------------------ CLASES DE ERRORS INTERNOS --------------------------------------

//########## Clase base ####################
class InternalError extends Error{
    constructor(message,attachedError){
      super(message);
      this.message=message; //str
      this.attachedError=attachedError; //Error
      this.critic; //bool
    }
}

//las implementaciones quedan a cargo de los servicios

class Db_Error extends InternalError{
  constructor(message,attachedError){
    super(message,attachedError);

    this.critic=false;
  }
}

const INTERNAL_ERRORS=Object.freeze({
  DB:(message,attachedError)=>new Db_Error(message,attachedError),
})

module.exports={internalError_handler,InternalError, INTERNAL_ERRORS};