// Maneja rutas que no existen (responde con un error 404)
const notFound = (req, res, next) => {
    const error = new Error(`Ruta no encontrada - ${req.originalUrl}`);
    res.status(404);
    next(error); // Pasa el error al siguiente middleware (errorHandler)
};

// Maneja errores generales (errores de código, errores de Mongoose, etc.)
const errorHandler = (err, req, res, next) => {
    // Asegura que el status code sea 500 (Server Error) si no ha sido definido antes
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);

    res.json({
        mensaje: err.message,
        // En desarrollo, mostramos el stack trace para depuración.
        // En producción, no lo mostraríamos por seguridad.
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

module.exports = { notFound, errorHandler };