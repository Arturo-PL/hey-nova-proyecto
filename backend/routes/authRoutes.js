
const express = require('express');
const router = express.Router(); 

const { registrarUsuario, iniciarSesion } = require('../controllers/authController');

// 1. Ruta para REGISTRAR un nuevo usuario (POST /api/auth/registro)
router.post('/registro', registrarUsuario); 
// 2. Ruta para INICIAR SESIÓN (POST /api/auth/login)
router.post('/login', iniciarSesion); 



module.exports = router;