//------------------------------- APARTADO PARA LA FUNCIONALIDAD DE PAGOS -----------------------------
//-----------------------------  (TODAVIA NO IMPLEMENTADO)  -------------------------------

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
