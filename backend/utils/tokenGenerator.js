const jwt = require('jsonwebtoken');

// Función que acepta el ID de usuario y genera un token firmado
const generarToken = (id) => {
    return jwt.sign(
        { id }, 
        process.env.JWT_SECRET, // Clave secreta definida en el archivo .env
        { expiresIn: '30d' } // El token expira en 30 días
    );
};

module.exports = generarToken;