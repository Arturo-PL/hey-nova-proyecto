const asyncHandler = require('express-async-handler');
const Publicacion = require('../models/Publicacion'); 
const Usuario = require('../models/Usuario');
const redisClient = require('../config/redis'); 
const Bitacora = require('../models/BitacoraSQL'); 

// CLAVE Y TIEMPO
const CACHE_KEY_FEED = 'heynova:feed:publicaciones'; 
const TTL_FEED = 3600; // 1 hora

// ----------------------------------------------------
// A. CREACIÓN Y VISUALIZACIÓN
// ----------------------------------------------------

/**
 * @desc    Crear una nueva publicación
 */
const crearPublicacion = asyncHandler(async (req, res) => {
    const { contenido, imagenURL, enlaceExterno, tipoPublicacion } = req.body;
    
    if (!contenido && !imagenURL && !enlaceExterno) {
        res.status(400);
        throw new Error('La publicación no puede estar vacía.');
    }

    const userId = req.usuario?._id || req.usuario; 

    if (!userId) {
        res.status(401);
        throw new Error('Usuario no autenticado.');
    }

    // 1. GUARDAR EN MONGODB (NoSQL)
    const nuevaPublicacion = await Publicacion.create({
        usuario: userId,
        rolAutor: req.usuario?.rol || 'Usuario', 
        contenido,
        imagenURL,
        enlaceExterno,
        tipoPublicacion: tipoPublicacion || 'texto',
    });

    // ==========================================================
    // 2. GUARDAR EN SQL (Requisito Examen: Auditoría)
    // ==========================================================
    try {
        await Bitacora.create({
            accion: 'CREAR_POST',
            usuario_nombre: req.usuario.username || 'Usuario',
            usuario_id: req.usuario._id.toString(),
            detalle: `Se creó el post ID: ${nuevaPublicacion._id} en MongoDB`
        });
        console.log('💾 Auditoría guardada en SQL (Tabla Bitacoras)');
    } catch (sqlError) {
        console.error('⚠️ Error guardando en SQL:', sqlError);
    }
    // ==========================================================

    // 3. REDIS: INVALIDACIÓN
    console.log('🗑️  INVALIDACIÓN: Nueva publicación creada, borrando caché del Feed.');
    await redisClient.del(CACHE_KEY_FEED);

    res.status(201).json(nuevaPublicacion);
});

/**
 * @desc    Obtener una única publicación por ID (Sin caché por ahora)
 */
const obtenerPublicacionPorId = asyncHandler(async (req, res) => {
    const publicacion = await Publicacion.findById(req.params.id)
        .populate('usuario', 'username firstName lastName rol')
        .populate('comentarios.usuario', 'username firstName lastName rol'); 

    if (publicacion) {
        res.json(publicacion);
    } else {
        res.status(404);
        throw new Error('Publicación no encontrada');
    }
});

/**
 * @desc    Obtener todas las publicaciones (El Feed) - CACHEADO
 */
const obtenerPublicaciones = asyncHandler(async (req, res) => {
    // 1. Intentar obtener de Redis
    try {
        const dataEnCache = await redisClient.get(CACHE_KEY_FEED);

        if (dataEnCache) {
            console.log('⚡ REDIS HIT: Sirviendo Feed principal desde caché');
            return res.status(200).json(JSON.parse(dataEnCache));
        }
    } catch (error) {
        console.error('Error de lectura en Redis:', error);
    }

    // 2. Si no hay caché, consultar Mongo
    console.log('🐢 MONGO QUERY: Feed no en caché, consultando BD...');

    const publicaciones = await Publicacion.find({})
        .sort({ createdAt: -1 }) 
        .populate('usuario', 'username firstName lastName rol');

    // 3. Guardar en Redis
    try {
        await redisClient.set(CACHE_KEY_FEED, JSON.stringify(publicaciones), {
            EX: TTL_FEED 
        });
    } catch (error) {
        console.error('Error escribiendo en Redis:', error);
    }

    res.status(200).json(publicaciones);
});


// ----------------------------------------------------
// B. INTERACCIONES (Reacciones y Comentarios)
// ----------------------------------------------------

const manejarReaccion = asyncHandler(async (req, res) => {
    const publicacion = await Publicacion.findById(req.params.id);
    const usuarioId = req.usuario?._id || req.usuario;
    const { tipoReaccion } = req.body; 
    
    if (!publicacion) { res.status(404); throw new Error('Publicación no encontrada.'); }
    if (!usuarioId) { res.status(401); throw new Error('Usuario no autenticado.'); }
    
    const reaccionExistente = publicacion.reacciones.find(
        r => r.usuario.toString() === usuarioId.toString()
    );

    if (reaccionExistente) {
        if (reaccionExistente.tipo === tipoReaccion) {
            publicacion.reacciones = publicacion.reacciones.filter(
                r => r.usuario.toString() !== usuarioId.toString()
            );
        } else {
            reaccionExistente.tipo = tipoReaccion;
        }
    } else {
        publicacion.reacciones.push({ usuario: usuarioId, tipo: tipoReaccion });
    }

    publicacion.numReacciones = publicacion.reacciones.length;
    await publicacion.save();

    // 🔥 REDIS: INVALIDACIÓN
    console.log('🗑️  INVALIDACIÓN: Reacción detectada, refrescando caché del Feed.');
    await redisClient.del(CACHE_KEY_FEED);

    res.json({ 
        mensaje: 'Reacción actualizada.', 
        reacciones: publicacion.reacciones,
        numReacciones: publicacion.numReacciones
    });
});


const agregarComentario = asyncHandler(async (req, res) => {
    const usuarioId = req.usuario?._id || req.usuario; 

    if (!usuarioId) { res.status(401); throw new Error('Usuario no autenticado.'); }

    const publicacion = await Publicacion.findById(req.params.id);
    const { texto } = req.body;

    if (!publicacion) { res.status(404); throw new Error('Publicación no encontrada.'); }
    if (!texto) { res.status(400); throw new Error('Comentario vacío.'); }

    const nuevoComentario = { usuario: usuarioId, texto: texto };

    publicacion.comentarios.push(nuevoComentario);
    publicacion.numComentarios = publicacion.comentarios.length;

    await publicacion.save();

    // REDIS: INVALIDACIÓN
    console.log('🗑️  INVALIDACIÓN: Nuevo comentario, refrescando caché del Feed.');
    await redisClient.del(CACHE_KEY_FEED);

    const comentarioGuardado = publicacion.comentarios[publicacion.comentarios.length - 1];
    const comentarioFinal = await Publicacion.populate(comentarioGuardado, {
        path: 'usuario',
        select: 'username firstName lastName rol'
    });

    res.status(201).json({
        mensaje: 'Comentario agregado.',
        comentario: comentarioFinal
    });
});

// ----------------------------------------------------
// C. EDICIÓN Y ELIMINACIÓN
// ----------------------------------------------------

const editarPublicacion = asyncHandler(async (req, res) => {
    const publicacion = await Publicacion.findById(req.params.id);
    const { contenido, imagenURL, enlaceExterno } = req.body;

    if (!publicacion) { res.status(404); throw new Error('Publicación no encontrada.'); }

    const userId = req.usuario?._id || req.usuario; 
    if (!userId) { res.status(401); throw new Error('Usuario no autenticado.'); }

    if (publicacion.usuario.toString() !== userId.toString()) { 
        res.status(401); throw new Error('No autorizado.');
    }

    publicacion.contenido = contenido !== undefined ? contenido : publicacion.contenido;
    publicacion.imagenURL = imagenURL !== undefined ? imagenURL : publicacion.imagenURL;
    publicacion.enlaceExterno = enlaceExterno !== undefined ? enlaceExterno : publicacion.enlaceExterno;

    const publicacionActualizada = await publicacion.save();

    // ==========================================================
    // SQL: REGISTRAR EDICIÓN
    // ==========================================================
    try {
        await Bitacora.create({
            accion: 'EDITAR_POST',
            usuario_nombre: req.usuario.username || 'Usuario',
            usuario_id: req.usuario._id.toString(),
            detalle: `Se editó el post ID: ${req.params.id}`
        });
    } catch (sqlError) { console.error(sqlError); }
    // ==========================================================

    // REDIS: INVALIDACIÓN
    console.log('🗑️  INVALIDACIÓN: Publicación editada, refrescando caché del Feed.');
    await redisClient.del(CACHE_KEY_FEED);

    res.status(200).json(publicacionActualizada);
});


const eliminarPublicacion = asyncHandler(async (req, res) => {
    const publicacion = await Publicacion.findById(req.params.id);

    if (!publicacion) { res.status(404); throw new Error('Publicación no encontrada.'); }

    const userId = req.usuario?._id || req.usuario; 
    if (!userId) { res.status(401); throw new Error('Usuario no autenticado.'); }

    if (publicacion.usuario.toString() !== userId.toString()) { 
        res.status(401); throw new Error('No autorizado.');
    }

    await Publicacion.deleteOne({ _id: req.params.id }); 

    // ==========================================================
    // SQL: REGISTRAR ELIMINACIÓN
    // ==========================================================
    try {
        await Bitacora.create({
            accion: 'ELIMINAR_POST',
            usuario_nombre: req.usuario.username || 'Usuario',
            usuario_id: req.usuario._id.toString(),
            detalle: `Se eliminó el post ID: ${req.params.id}`
        });
        console.log('💾 Baja lógica registrada en SQL');
    } catch (sqlError) { console.error(sqlError); }
    // ==========================================================

    // REDIS: INVALIDACIÓN
    console.log('🗑️  INVALIDACIÓN: Publicación eliminada, refrescando caché del Feed.');
    await redisClient.del(CACHE_KEY_FEED);

    res.json({ id: req.params.id, mensaje: 'Publicación eliminada correctamente.' });
});

module.exports = {
    crearPublicacion,
    obtenerPublicaciones,
    manejarReaccion,
    agregarComentario,
    editarPublicacion, 
    eliminarPublicacion,
    obtenerPublicacionPorId,
};