const {pool,Transaction}=require("./db/postgres.js");

const {day_diference}=require("../helpers/time_functions.js");
const const_vars=require("./const_vars/turnos_constVars.js");

const {DFLT_API_ERRORS,INTERNAL_ERRORS}=require("../error_handling");


//GET "turnos/avail_days"
async function get_availDays(){
    let response;
    try{
        response=await pool.query(`SELECT days.day,days.avail FROM days WHERE day >=$1 AND day <=$2
                       AND avail>0`,[const_vars.from_day,const_vars.until_day]);
    } 
    catch(e){
        return {error:INTERNAL_ERRORS.DB(e.message), days:null};
    }
    
    return {error:null, days:response.rows};
}

//GET "turnos/avail_hours/:day_id"
async function get_availHours(day){
    let response;
    try{
        response=await pool.query(`SELECT hours.hour,day_time.id,day_time.avail FROM day_time INNER JOIN hours ON
        day_time.hr=hours.id WHERE day_time.day=$1 AND day_time.avail>0`,[day]);
    }
    catch(e){
        return {error:INTERNAL_ERRORS.DB(e.message), hours:null};
    }

    return {error:null, hours:response.rows}; 
}

//POST "turnos/save"
async function save_turno(day_timeId,user_id){
    
    //Traer day del day_time
    let response=await pool.query("SELECT day FROM day_time WHERE id=$1",[day_timeId]);

    //Chequear que el dia exista y este dentro del limite
    if (response.rows.length==0){return {error:DFLT_API_ERRORS.BAD_REQ(), turno_id:null}}
    
    let day=response.rows[0].day;
    if (new Date(day)>new Date(const_vars.until_day)){
        
        return {error:DFLT_API_ERRORS.BAD_REQ(), turno_id:null}
    }

    //Comenzar transacction:
    let conn=await pool.connect();
    let transaction=new Transaction(conn);
    transaction.start();
    
    //Fijarse si hay espacios disponibles para ese day_time
    let avail_spaces=(await conn.query(`SELECT avail FROM day_time WHERE id=$1 FOR UPDATE`,[day_timeId])).rows[0].avail;
    
    //Si no hay mas, rollback
    if (avail_spaces==0){
        transaction.rollback();
        return {error:DFLT_API_ERRORS.BAD_REQ("Turno already booked"), turno_id:null};
    }
    
    //Si no ,agregamos un nuevo turno y disminuimos la cant de espacios para ese day_time
    else{
       
       let newTurno_id=(await conn.query(`INSERT INTO turnos(user_id,day_time_id) 
                                        VALUES($1,$2) RETURNING id`,[user_id,day_timeId])).rows[0].id;
       
       //disminuimos espacios
       await conn.query(`UPDATE day_time SET avail=avail-1 WHERE id=$1`,[day_timeId])
       
       //Chequeamos si hay que disminuir los available de days tmb
       if (avail_spaces-1==0){//osea si con el update anterior se perdio al completo ese day_time
         await conn.query(`UPDATE days SET avail=avail-1 WHERE day=$1`,[day]);
       }
       
       //Hacemos "commit" de la transaction
       try {
        transaction.commit();
       }
       
       catch(e){
        transaction.rollback();
        return {error:INTERNAL_ERRORS.DB(e.message), turno_id:null}
       }
       
       return {error:null, turno_id:newTurno_id};
    }
}

//PUT "turnos/cancel"
async function cancel_turno(turno_id,user_id){
    //Traer dia y dayTime_id de la db usando tmb el user id, para ver q sea de el user q lo pide
    let response=await pool.query(`SELECT day_time.id,day_time.day FROM turnos INNER JOIN day_time 
                                 ON turnos.day_time_id=day_time.id WHERE turnos.id=$1 
                                 AND turnos.user_id=$2`,[turno_id,user_id]);
    
    //Si no Trae nada, bad request
    console.log(response.rows);
    if (response.rows[0]==undefined){return { error:DFLT_API_ERRORS.BAD_REQ("Private turno") }}
    
    //Si es coorecto tomamos la data
    let turno_day=response.rows[0].day;
    let dayTime_id=response.rows[0].id;

    
    //Chequear que el dia este al tiempo correcto para cancelar.
    if (day_diference(new Date(turno_day),new Date()) < const_vars.MINIMUM_DAYS_2CANCEL){
        return {error:DFLT_API_ERRORS.BAD_REQ("Days limit to cancel reached") };
    }
    
    //Si esta bien, procedemos a cancelarlo.
    else{
        
        //Comenzamos transaction
        let conn=await pool.connect();
        let transacction=new Transaction(conn);
        
        transacction.start();
        
        //Borramos el turno
        await conn.query("DELETE FROM turnos WHERE id=$1",[turno_id]);
        
        //Aumentamos los espacios disponibles para el day_time
        let avail=(await conn.query(`UPDATE day_time SET avail=avail+1 WHERE id=$1 returning avail`,[dayTime_id])).rows[0].avail;
        
        //Chequeamos si hay que aumentar el available de day tambien
        if (avail==1){ //osea si antes del update el avail de day_time estaba en 0
            await conn.query("UPDATE days SET avail=avail+1 WHERE day=$1",[turno_day]);
        }
        
        //Hacemos "commit" de la transaction
        try{
          transacction.commit();
          return {};
        }
        catch(e){
            transacction.rollback();
            return {error:INTERNAL_ERRORS.DB(e.message)};
        }

    }
}



module.exports={get_availDays,get_availHours,save_turno,cancel_turno};

