const express = require('express');
const router = express.Router();
const { proteger } = require('../middleware/authentication'); 
const { buscarUsuarios } = require('../controllers/userController'); 

router.route('/').get(proteger, buscarUsuarios);

module.exports = router;