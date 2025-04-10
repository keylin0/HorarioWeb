const express = require("express");
const router = express.Router(); //define un conjunto de rutas relacionadas con la autenticación.
const authController = require("../controllers/authController"); //se ejecutará cuando un usuario haga una solicitud a las rutas

router.get("/checkSession", authController.checkSession); //verifica si el usuario tiene una sesión activa
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.delete("/delete", authController.delete);

module.exports = router;