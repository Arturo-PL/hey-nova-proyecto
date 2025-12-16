const mongoose = require('mongoose');

const hiloSchema = new mongoose.Schema({
    titulo: {
        type: String,
        required: [true, 'El título de la discusión es obligatorio.'],
        trim: true
    },
    contenido: {
        type: String,
        required: [true, 'El contenido de la discusión es obligatorio.']
    },
    // RELACIÓN: A qué foro pertenece este hilo
    foro: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Foro',
        required: true
    },
    // Quién escribió el hilo (Estudiante o Docente)
    autor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    // Array de comentarios embebidos (Simple y efectivo para empezar)
    comentarios: [{
        usuario: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Usuario' 
        },
        texto: { 
            type: String, 
            required: true 
        },
        fecha: { 
            type: Date, 
            default: Date.now 
        }
    }]
}, {
    timestamps: true // Crea automáticamente createdAt y updatedAt
});

module.exports = mongoose.model('Hilo', hiloSchema);