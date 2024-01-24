const express=require("express");
const router=express.Router();

const Controler=require("../controlers/turnos_Controler.js");

//Traer dias disponibles
router.get("/avail_days",Controler.get_availDays);

//Traer Horarios disponibles para un dia
router.get("/avail_hours/:day_id",Controler.get_availHours);

//Adquirir un turno
router.post("/save",Controler.save_turno);

//Cancelar un turno
router.put("/cancel",Controler.cancel_turno);

module.exports=router;