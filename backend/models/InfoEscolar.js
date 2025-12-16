const mongoose = require('mongoose');

const infoEscolarSchema = mongoose.Schema({
    // La "clave" que usaremos para buscar (ej: 'examen', 'horario', 'becas')
    categoria: {
        type: String,
        required: true,
        unique: true, 
        lowercase: true,
        trim: true
    },
    // El mensaje que responderá el bot
    mensaje: {
        type: String,
        required: true
    },
    // Por si quieres desactivar una respuesta temporalmente sin borrarla
    activa: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('InfoEscolar', infoEscolarSchema);