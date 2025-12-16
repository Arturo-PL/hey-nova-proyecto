const mongoose = require('mongoose');

const foroSchema = new mongoose.Schema({
    titulo: {
        type: String,
        required: [true, 'El título del foro es obligatorio.'],
        trim: true
    },
    descripcion: {
        type: String,
        required: [true, 'La descripción del foro es obligatoria.']
    },
    // Referencia al docente que creó el foro
    creador: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario', // Debe coincidir exactamente con el nombre en mongoose.model('Usuario')
        required: true
    },
    categoria: {
        type: String,
        default: 'General'
    },
    activo: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true // Crea automáticamente createdAt y updatedAt
});

module.exports = mongoose.model('Foro', foroSchema);