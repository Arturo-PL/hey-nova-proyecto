const asyncHandler = require('express-async-handler');
const Usuario = require('../models/Usuario');
const generarToken = require('../utils/tokenGenerator');

/**
 * @desc    Registrar un nuevo usuario (Estudiante, Docente, o Admin)
 * @route   POST /api/auth/registro
 * @access  Público
 */
const registrarUsuario = asyncHandler(async (req, res) => {
    // 1. Desestructurar los datos del cuerpo de la solicitud
    const { username, email, password, firstName, lastName, rol, carrera } = req.body;

    // 2. Verificar si el usuario ya existe (por email o username)
    const usuarioExiste = await Usuario.findOne({ $or: [{ email }, { username }] });

    if (usuarioExiste) {
        res.status(400);
        throw new Error('El usuario o el correo electrónico ya está registrado.');
    }

    // 3. Crear el nuevo usuario
    const nuevoUsuario = await Usuario.create({
        username,
        email,
        password, // La contraseña se hashea automáticamente en el modelo 
        firstName,
        lastName,
        // Si el rol no se especifica, por defecto será estudiante
        rol: rol || 'estudiante', 
        carrera: rol === 'estudiante' ? carrera : undefined, // Solo se guarda carrera si es estudiante
    });

    if (nuevoUsuario) {
        // 4. Enviar respuesta exitosa con el token
        res.status(201).json({
            _id: nuevoUsuario._id,
            username: nuevoUsuario.username,
            email: nuevoUsuario.email,
            firstName: nuevoUsuario.firstName,
            rol: nuevoUsuario.rol,
            // Información académica 
            carrera: nuevoUsuario.carrera,
            token: generarToken(nuevoUsuario._id), // Genera el JWT
        });
    } else {
        res.status(400);
        throw new Error('Datos de usuario no válidos.');
    }
});

/**
 * @desc    Autenticar un usuario y obtener token (Login)
 * @route   POST /api/auth/login
 * @access  Público
 */
const iniciarSesion = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // 1. Buscar el usuario por email
    // Usamos .select('+password') para incluir la contraseña hasheada (que está oculta por 'select: false')
    const usuario = await Usuario.findOne({ email }).select('+password'); 

    // 2. Verificar usuario y contraseña
    if (usuario && (await usuario.matchPassword(password))) {
        // 3. Enviar respuesta exitosa
        res.json({
            _id: usuario._id,
            username: usuario.username,
            email: usuario.email,
            firstName: usuario.firstName,
            rol: usuario.rol,
            carrera: usuario.carrera,
            token: generarToken(usuario._id), // Genera el JWT
        });
    } else {
        res.status(401);
        throw new Error('Credenciales inválidas (Correo o Contraseña incorrectos).');
    }
});

module.exports = {
    registrarUsuario,
    iniciarSesion,
};