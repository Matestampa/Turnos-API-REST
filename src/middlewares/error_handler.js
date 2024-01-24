const ERRORS=Object.freeze({
    BAD_REQ: (descr)=>{return {type:"bad_request", status_code:400, descr:descr}},
    NOT_AUTH:(descr)=>{return {type:"not_authenticated", status_code:401, descr:descr}},
    NOT_FOUND:(descr)=>{return {type:"not found", status_code:404, descr:descr}},
    SERVER:(descr)=>{return {type:"server", status_code:500, descr:descr}},
    DB:(descr)=>{return {type:"db", tatus_code:500, descr:descr}},
});

function error_handler(res,error){
    let status_code=error.status_code;
    
    if (status_code==500){
        console.log(err_descr);
        res.status(status_code).json({status:status_code,
                              error:{type:"server",descr:"server fault"}});
        return;
    }
    
    res.status(status_code).json({status:error.status_code,
                                  error:{type:error.type,descr:error.descr}});

}



module.exports={error_handler,ERRORS};