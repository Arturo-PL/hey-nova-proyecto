const asyncHandler = require('express-async-handler');
const Usuario = require('../models/Usuario');

/**
 * @desc    Busca usuarios por nombre o email (excluyendo al usuario logueado)
 * @route   GET /api/user?search=keyword
 * @access  Protegida (Requiere autenticación)
 */
const buscarUsuarios = asyncHandler(async (req, res) => {
    // Protección de ID
    const usuarioId = req.usuario?._id || req.usuario; 

    if (!usuarioId) {
        res.status(401);
        throw new Error('Usuario no autenticado para realizar la búsqueda.');
    }

    // 1. Obtener el término de búsqueda (?search=juan)
    const keyword = req.query.search
        ? {
            $or: [
                { firstName: { $regex: req.query.search, $options: "i" } }, 
                { lastName: { $regex: req.query.search, $options: "i" } }, 
                { email: { $regex: req.query.search, $options: "i" } },
            ],
          }
        : {}; 

    // 2. Ejecutar la búsqueda
    // Buscamos coincidencias Y que NO sea el usuario actual ($ne = Not Equal)
    const usuarios = await Usuario.find(keyword)
        .find({ _id: { $ne: usuarioId } })
        .select('-password'); // Importante: nunca devolver contraseñas

    res.send(usuarios);
});

// Solo exportamos la búsqueda, porque el perfil ya está en profileController
module.exports = { 
    buscarUsuarios, 
};