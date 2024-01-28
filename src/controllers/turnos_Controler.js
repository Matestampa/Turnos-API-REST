const Service=require("../services/turnos_Service.js")
const const_vars=require("../services/const_vars/turnos_constVars.js");
const {day_diference}=require("../helpers/time_functions.js");

const {apiError_handler,DFLT_API_ERRORS}=require("../error_handling");


//GET "turnos/avail_days"
async function get_availDays(req,res){
    let {error,days}=await Service.get_availDays()
    
    if (error){ apiError_handler(error,res) ;return}
    
    res.status(200).json({status:200,message:"", data:{days:days}});
}


//GET "turnos/avail_hours/:day_id"
async function get_availHours(req,res){
    let day=req.params.day_id;
    
    //chequear que el "day" sea menor que el "until_day";
    if (new Date(day)> new Date(const_vars.until_day)){
        
        apiError_handler(DFLT_API_ERRORS.BAD_REQ(),res);
        return;
    }
    
    let {error,hours}=await Service.get_availHours(day);

    if (error){apiError_handler(error,res); return}

    res.status(200).json({status:200,message:"",data:{hours:hours}});
}

//POST "turnos/save"
async function save_turno(req,res){
    let {day_timeId}=req.body;
    
    let {error,turno_id}=await Service.save_turno(day_timeId);

    if (error){apiError_handler(error,res);return}

    res.status(200).json({status:200,message:"Succesfully booked",data:{turno_id:turno_id}});

}

//PUT "turnos/cancel"
async function cancel_turno(req,res){
    let {turno_id}=req.body;
    
    let {error}=await Service.cancel_turno(turno_id,req.session.user_id);

    if (error){apiError_handler(error,res);return}

    res.status(200).json({status:200,message:"Turno cancelled"})
}



module.exports={get_availDays,get_availHours,save_turno,cancel_turno};
