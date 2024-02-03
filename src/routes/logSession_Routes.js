const express=require("express");
const router=express.Router();

const Controler=require("../controllers/logSession_Controler.js");

//Informar si esta logeado o no
router.get("/login",Controler.get_login);

//Hacer login
router.post("/login",Controler.post_login);

//Cerrar session
router.get("/logout",Controler.logout);


module.exports=router;