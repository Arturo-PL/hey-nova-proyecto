const express = require('express');
const router = express.Router();
const { proteger, esDocente } = require('../middleware/authentication');

const { 
    crearForo, 
    obtenerForos, 
    crearHilo, 
    obtenerHilosDeForo,
    agregarComentario,
    obtenerHilo
} = require('../controllers/foroController');

// 1. Obtener todos los foros (Cualquier usuario logueado)
router.get('/', proteger, obtenerForos);

// 2. Crear un nuevo foro (SOLO DOCENTES) -> Ojo al doble middleware
router.post('/', proteger, esDocente, crearForo);

// 3. Ver los hilos de un foro específico
router.get('/:idForo/hilos', proteger, obtenerHilosDeForo);

// 4. Crear un hilo en un foro (Estudiantes y Docentes)
router.post('/:idForo/hilos', proteger, crearHilo);

router.get('/hilo/:idHilo', proteger, obtenerHilo);

// 5. Comentar en un hilo existente
// Nota: Usamos '/hilo/...' para diferenciarlo de las rutas de arriba
router.post('/hilo/:idHilo/comentar', proteger, agregarComentario);

module.exports = router;