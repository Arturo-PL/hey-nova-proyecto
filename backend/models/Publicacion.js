
const mongoose = require('mongoose');

// Define la estructura de cada Comentario
const comentarioSchema = mongoose.Schema({
    usuario: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true, 
        ref: 'Usuario' // Referencia al modelo de Usuario
    },
    texto: { 
        type: String, 
        required: true 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

// Define la estructura de cada Reacción (Like, Love, etc.)
const reaccionSchema = mongoose.Schema({
    usuario: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true, 
        ref: 'Usuario' // Referencia al modelo de Usuario
    },
    tipo: {
        type: String,
        required: true,
        enum: ['like', 'love', 'funny', 'sad', 'angry'] // Tipos de reacción permitidos
    }
});

const publicacionSchema = mongoose.Schema({
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Usuario' // La publicación está ligada a un usuario (el autor)
    },
    rolAutor: {
        type: String,
        required: true,
        enum: ['estudiante', 'docente', 'admin'] // Copia el rol del autor al momento de publicar
    },
    
    // Contenido
    contenido: {
        type: String,
        trim: true,
        default: null // Puede no tener texto si es solo imagen/enlace
    },
    imagenURL: {
        type: String,
        default: null // URL de la imagen/video
    },
    enlaceExterno: {
        type: String,
        default: null // URL de un enlace compartido
    },
    tipoPublicacion: {
        type: String,
        enum: ['texto', 'imagen', 'enlace', 'multimedia'],
        default: 'texto'
    },
    
    // Interacciones (Usando los sub-documentos definidos arriba)
    reacciones: [reaccionSchema],
    comentarios: [comentarioSchema],
    
    // Contador para un acceso rápido sin necesidad de calcular el array
    numComentarios: {
        type: Number,
        default: 0
    },
    numReacciones: {
        type: Number,
        default: 0
    }
}, {
    // Habilita createdAt y updatedAt
    timestamps: true 
});

const Publicacion = mongoose.model('Publicacion', publicacionSchema);

module.exports = Publicacion;