const asyncHandler = require('express-async-handler');
const Usuario = require('../models/Usuario');
const redisClient = require('../config/redis'); 

// TIEMPO DE EXPIRACIÓN
const TTL_PROFILE = 86400; // 24 Horas (El perfil cambia poco)

/**
 * @desc    Obtener los datos del perfil del usuario logueado
 * @route   GET /api/perfiles/yo
 * @access  Privado
 */
const obtenerPerfil = asyncHandler(async (req, res) => {
    const usuarioId = req.usuario._id;
    // Estandarizamos la key:
    const cacheKey = `heynova:perfil:${usuarioId}`;

    // -----------------------------------------------------------
    // 1. INTENTO DE LECTURA EN REDIS
    // -----------------------------------------------------------
    try {
        const perfilEnCache = await redisClient.get(cacheKey);
        
        if (perfilEnCache) {
            console.log(`⚡ REDIS HIT: Perfil propio (${req.usuario.username}) servido desde caché`);
            return res.json(JSON.parse(perfilEnCache));
        }
    } catch (error) {
        console.error('Error Redis:', error);
    }

    // -----------------------------------------------------------
    // 2. SI FALLA REDIS, USAMOS DATOS DE MIDDLEWARE/MONGO
    // -----------------------------------------------------------
    console.log(`🐢 MONGO QUERY: Perfil no cacheado, procesando datos...`);

    const usuario = req.usuario;

    if (usuario) {
        const respuesta = {
            _id: usuario._id,
            username: usuario.username,
            email: usuario.email,
            firstName: usuario.firstName,
            lastName: usuario.lastName,
            rol: usuario.rol,
            carrera: usuario.carrera,
            semestre: usuario.semestre,
            universidad: usuario.universidad,
            campus: usuario.campus,
            promedio: usuario.promedio,
            profileComplete: usuario.profileComplete,
            createdAt: usuario.createdAt,
            imagen: usuario.imagen || null 
        };

        // 3. GUARDAR EN REDIS
        try {
            await redisClient.set(cacheKey, JSON.stringify(respuesta), { EX: TTL_PROFILE });
            // console.log('💾 Perfil guardado en Redis');
        } catch (error) {
            console.error('Error guardando en Redis:', error);
        }

        res.json(respuesta);
    } else {
        res.status(404);
        throw new Error('Usuario no encontrado.');
    }
});

/**
 * @desc    Actualizar los datos del perfil del usuario logueado
 * @route   PUT /api/perfiles/yo
 * @access  Privado
 */
const actualizarPerfil = asyncHandler(async (req, res) => {
    const usuarioId = req.usuario._id;
    const usuario = await Usuario.findById(usuarioId);

    if (usuario) {
        // Actualización de campos
        usuario.username = req.body.username || usuario.username;
        usuario.firstName = req.body.firstName || usuario.firstName;
        usuario.lastName = req.body.lastName || usuario.lastName;
        
        if (req.body.password) {
            usuario.password = req.body.password; 
        }

        usuario.carrera = req.body.carrera || usuario.carrera;
        usuario.semestre = req.body.semestre || usuario.semestre;
        usuario.universidad = req.body.universidad || usuario.universidad;
        usuario.campus = req.body.campus || usuario.campus;
        usuario.promedio = req.body.promedio || usuario.promedio;
        
        if (req.body.profileComplete !== undefined) {
            usuario.profileComplete = req.body.profileComplete;
        }

        const perfilActualizado = await usuario.save();

        // -----------------------------------------------------------
        // 🔥 REDIS: INVALIDACIÓN
        // -----------------------------------------------------------
        const cacheKey = `heynova:perfil:${usuarioId}`;
        console.log(`🗑️  INVALIDACIÓN: Perfil actualizado, borrando caché antigua.`);
        await redisClient.del(cacheKey);

        res.json({
            mensaje: 'Perfil actualizado exitosamente.',
            perfil: {
                _id: perfilActualizado._id,
                username: perfilActualizado.username,
                email: perfilActualizado.email,
                firstName: perfilActualizado.firstName,
                lastName: perfilActualizado.lastName,
                rol: perfilActualizado.rol,
                carrera: perfilActualizado.carrera,
                semestre: perfilActualizado.semestre,
                universidad: perfilActualizado.universidad,
                campus: perfilActualizado.campus,
                promedio: perfilActualizado.promedio,
                bio: perfilActualizado.bio, 
                imagen: perfilActualizado.imagen
            }
        });

    } else {
        res.status(404);
        throw new Error('Usuario no encontrado.');
    }
});

module.exports = {
    obtenerPerfil,
    actualizarPerfil,
};