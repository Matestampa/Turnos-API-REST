const Service=require("../services/turnos_Service.js")
const const_vars=require("../services/const_vars/turnos_constVars.js");
const {day_diference}=require("../helpers/time_functions.js");

const {apiError_handler,DFLT_API_ERRORS}=require("../error_handling");

//GET "turnos/avail_days"
async function get_availDays(req,res){
    let {error,days}=await Service.get_availDays()
    
    if (error){ apiError_handler(error,res) ;return}
    
    res.status(200).json({status:200,message:"",data:{days:days}});
}


//GET "turnos/avail_hours/:day_id"
async function get_availHours(req,res){
    let day=req.params.day_id;
    
    //chequear que el day sea menor que el until_day;
    if (new Date(day)> new Date(const_vars.until_day)){
        
        apiError_handler(DFLT_API_ERRORS.BAD_REQ(),res);
        return;
    }
    
    let {error,hours}=await Service.get_availHours(day);

    if (error){apiError_handler(error,res);return}

    res.status(200).json({status:200,message:"",data:{hours:hours}});
}

//POST "turnos/save"
async function save_turno(req,res){
    let {day_timeId}=req.body;
    
    /*---------------- VER SI ESTO SE HACE CON VALIDATOR ---------------
    //Traer day del day_time
    let day=(await pool.query("SELECT day from day_time WHERE id=$1",[day_timeId])).rows[0].day;

    //chequear que el dia exista y este dentro del limite
    if (day==undefined || new Date(day)>new Date(const_vars.until_day)){
        res.status(400).json({"error":"bad_data"});
        return
    }
    //-------------------------------------------------------------------*/
    let {error,turno_id}=await Service.save_turno(day_timeId);

    if (error){apiError_handler(error,res);return}

    res.status(200).json({status:200,message:"Succesfully booked",data:{turno_id:turno_id}});

}

//PUT "turnos/cancel"
async function cancel_turno(req,res){
    let {turno_id}=req.body;
    
    /*----------------------- VER SI ESTO ES CON VALIDATORS -----------------
    //Traer horario del turno de la db usando tmb el usr id, para ver q sea de el user q lo pide
    let response=await pool.query(`SELECT day_time.id,day_time.day FROM turnos INNER JOIN day_time 
                                 ON turnos.day_time_id=day_time.id WHERE turnos.id=$1`,[turno_id]);//(agregar user_id dsps)
    
    //SI NO Trae nada, bad request
    if (response.rows[0]==undefined){return {"error":"bad_data"}}
    
    let turno_day=response.rows[0].day;
    let day_timeId=response.rows[0].id;

    //-----------------------------------------------*/ 
 
    let {error}=await Service.cancel_turno(turno_id);

    if (error){apiError_handler(error,res);return}

    res.status(200).json({status:200,message:"Turno cancelled"})
}



module.exports={get_availDays,get_availHours,save_turno,cancel_turno};
