const express=require("express");
const router=express.Router();

const Controler=require("../controllers/logSession_Controler.js");

//Informar si esta logeado o no
router.get("/login",Controler.getLogin);

//Hacer login
router.post("/login",Controler.postLogin);

//Cerrar session
router.get("/logout",Controler.logout);


module.exports=router;