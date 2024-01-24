const express=require("express");
const router=express.Router();

const Controler=require("../controlers/logSession_Controler.js");

//Informa si esta logeado o no
router.get("/login",Controler.getLogin);

//Loggea si la data esta bien
router.post("/login",Controler.postLogin);

//Cierra la session
router.get("/logout",Controler.logout);


module.exports=router;