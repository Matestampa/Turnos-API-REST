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
async function save_turno(day_timeId){
    
    //Traer day del day_time
    let response=await pool.query("SELECT day FROM day_time WHERE id=$1",[day_timeId]);

    //chequear que el dia exista y este dentro del limite
    if (response.rows.length==0){return {error:DFLT_API_ERRORS.NOT_FOUND(), turno_id:null}}
    
    let day=response.rows[0].day;
    if (new Date(day)>new Date(const_vars.until_day)){
        
        return {error:DFLT_API_ERRORS.BAD_REQ(), turno_id:null}
    }

    //Hacer transacction:
    let conn=await pool.connect();
    let transaction=new Transaction(conn);
    transaction.start();
    
    //Fijarse si existe algo en turnos con el day y el hour_id
    let avail_spaces=(await conn.query(`SELECT avail FROM day_time WHERE id=$1 FOR UPDATE`,[day_timeId])).rows[0].avail;
    
    //Si no hay mas, rollback
    if (avail_spaces==0){
        transaction.rollback();
        return {error:DFLT_API_ERRORS.BAD_REQ("Turno already booked"), turno_id:null};
    }
    
    //si no ,seteamos un nuevo turno y aumentamos la cant de turnos del dia
    else{
       //chequeamos al insertar q no hayan mandado dias o horas q no existen
       let newTurno_id;
       
       //aumentamos la cant de turnos del dia
       await conn.query(`UPDATE day_time SET avail=avail-1 WHERE id=$1`,[day_timeId])
       
       //chequeamos si hay que updatear los available da days tmb
       if (avail_spaces-1==0){//osea si con el update anterior se perdio este time/hour
         await conn.query(`UPDATE days SET avail=avail-1 WHERE day=$1`,[day]);
       }
       
       try {
        transaction.commit();
       }
       catch(e){
        conn.release();
        return {error:INTERNAL_ERRORS.DB(e.message), turno_id:null}
       }
       
       return {error:null, turno_id:newTurno_id};
    }
}

//PUT "turnos/cancel"
async function cancel_turno(turno_id){
    //Traer horario del turno de la db usando tmb el usr id, para ver q sea de el user q lo pide
    let response=await pool.query(`SELECT day_time.id,day_time.day FROM turnos INNER JOIN day_time 
                                 ON turnos.day_time_id=day_time.id WHERE turnos.id=$1`,[turno_id]);//(agregar user_id dsps)
    
    //SI NO Trae nada, bad request
    if (response.rows[0]==undefined){return { error:DFLT_API_ERRORS.BAD_REQ() }}
    
    let turno_day=response.rows[0].day;
    let day_timeId=response.rows[0].id;

    
    //Si nos da menor al limit para cancelar, bad req
    if (day_diference(new Date(turno_day),new Date()) < const_vars.MINIMUM_DAYS_2CANCEL){
        
        return {error:DFLT_API_ERRORS.BAD_REQ("Days limit to cancel reached") };
    }
    //Si no ,cancelamos el turno
    else{
        let conn=await pool.connect();
        let transacction=new Transaction(conn);
        
        transacction.start();

        await conn.query("DELETE FROM turnos WHERE id=$1",[turno_id]);
        
        let avail=(await conn.query(`UPDATE day_time SET avail=avail+1 WHERE id=$1 returning avail`,[day_timeId])).rows[0].avail;
        
        //Chequeamos si hay que volver a habilitar el day tmb
        if (avail==1){ //osea si antes del update estaba en 0
            await conn.query("UPDATE days SET avail=avail+1 WHERE day=$1",[turno_day]);
        }
        
        try{
          transacction.commit();
          return;
        }
        catch(e){
            conn.release();
            return {error:INTERNAL_ERRORS.DB(e.message)};
        }

    }
}

//Esta es una function, que no deberia ser endpoint directamente
//Si no que debe haber un endpoint, que reciba el pago con el "toConfirm_id"
//y luego llama a esta funcion.
//Pero este lo hacemos asi porque es solo test
async function confirm_pay(req,res){
    let {pay_id}=req.body;
    
    //Chequear que se pague antes de tiempo (aunque en el front no deje, no hay q dejar q se haga por api)
    let response=(await pool.query(`SELECT to_confirm.day_time_id,to_confirm.taken_at,day_time.day,day_time.hr FROM to_confirm 
                  INNER JOIN day_time on to_confirm.day_time_id=day_time.id WHERE to_confirm.id=$1`
                  ,[pay_id])).rows[0];
    
    //Si da undefinded es xq se mando cualquiera, o el schedule lo borro antes
    //Y si los minutos dan mayores, es que se quiso confirmar pasado el tiempo
    if (response==undefined || day_diference(new Date(),response["taken_at"])>10){
        res.status(400).json({"error":"expired time"})
        //deberiamos devolver el dinero
        return;
    }
    //Si no, se procede a confirmar el turno

    let dayTime_id=response.dayTime_id
    let day=response.day;
    let hr=response.hr;

    //Borrar lo de reserved, o setear el expire=0
     await pool.query(`DELETE FROM reserved WHERE id=$1`,[pay_id]);
    
     //Insertar en turno
     await pool.query("INSERT INTO turnos(day_time_id) VALUES ($1)",[dayTime_id]);
    
    //Y hacer demas cosas, mandar mail, guradar otra data etc.
}

//schedule task cada x minutos que revisa si los turnos a confirmar pago ya expiraron
//y de ser asi los vuelve para atras
async function check_toConfirm(){
    //el extract epoch nos da la diferencia en segundos
    let expired=await pool.query("SELECT id from to_confirm WHERE EXTRACT(EPOCH (taken_at - now()))>cant_seconds");
    
    let conn=pool.connect();

    for (let row of expired){
        let transacction=new Transaction(conn);
        transacction.start();

        //aumentar day_time
        //si es necesario ymb day
        //borrar la row
        transacction.commit();
    }
}

module.exports={get_availDays,get_availHours,save_turno,cancel_turno};

