const express = require('express');
const router = express.Router();

const { 
    crearPublicacion, 
    obtenerPublicaciones, 
    manejarReaccion, 
    agregarComentario,
    eliminarPublicacion, 
    editarPublicacion,
    obtenerPublicacionPorId 
} = require('../controllers/postController');
const { proteger } = require('../middleware/authentication');

router.route('/')
    .get(proteger, obtenerPublicaciones) 
    .post(proteger, crearPublicacion);   
    


router.route('/:id')
    .get(proteger, obtenerPublicacionPorId)
    .put(proteger, editarPublicacion)
    .delete(proteger, eliminarPublicacion);

router.put('/reaccion/:id', proteger, manejarReaccion); 

router.post('/comentario/:id', proteger, agregarComentario); 

module.exports = router;