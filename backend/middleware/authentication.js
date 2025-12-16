const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const Usuario = require('../models/Usuario');

/**
 * @desc    Middleware de protección para rutas privadas
 * @name    proteger
 * @access  Privado
 */
const proteger = asyncHandler(async (req, res, next) => {
    let token;

    // 1. Verificar si existe el token en los encabezados (formato: "Bearer <token>")
    if (
        req.headers.authorization && 
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Obtener el token (quitar "Bearer ")
            token = req.headers.authorization.split(' ')[1];

            // 2. Verificar el token (decodificarlo)
            const decodificado = jwt.verify(token, process.env.JWT_SECRET);

            // 3. Obtener el usuario del token y adjuntarlo al objeto 'req'
            // ✅ CORRECCIÓN CLAVE: Usamos req.usuario consistentemente
            req.usuario = await Usuario.findById(decodificado.id).select('-password');

            // 4. Verificar si el usuario fue encontrado (por si fue eliminado de la BD)
            if (!req.usuario) { // <--- ¡Cambiado de req.user!
                res.status(401);
                throw new Error('Usuario no encontrado o no existe.');
            }

            // 5. Continuar al siguiente middleware o controlador
            next();

        } catch (error) {
            console.error(error);
            // Si la verificación falla (token expirado o incorrecto)
            res.status(401); 
            throw new Error('No autorizado, token fallido o expirado.');
        }
    }

    // Si no se encuentra el token en el encabezado
    if (!token) {
        res.status(401);
        throw new Error('No autorizado, no se encontró el token.');
    }
});

const esDocente = (req, res, next) => {
    // 1. Verificamos si 'proteger' ya cargó el usuario en req.usuario
    // 2. Verificamos si el rol es 'docente' (o 'admin' para que tengas superpoderes)
    if (req.usuario && (req.usuario.rol === 'docente' || req.usuario.rol === 'admin')) {
        next(); // ¡Adelante!
    } else {
        res.status(403); // 403 Forbidden (Entiendes la petición, pero no tienes permiso)
        throw new Error('Acceso denegado. Se requieren permisos de Docente.');
    }
};

module.exports = { proteger, esDocente };