const express = require('express');
const router = express.Router();

const { obtenerPerfil, actualizarPerfil } = require('../controllers/profileController'); 

const { proteger } = require('../middleware/authentication'); 

router.route('/yo')
    .get(proteger, obtenerPerfil)      
    .put(proteger, actualizarPerfil);  

module.exports = router;