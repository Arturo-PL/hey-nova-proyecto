const mongoose = require('mongoose');

const mensajeSchema = mongoose.Schema(
    {
        remitente: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Usuario', // Referencia al modelo de Usuario
            required: true,
        },
        contenido: {
            type: String,
            trim: true,
            required: true,
        },
        leidoPor: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Usuario'
        }],
        fechaEnvio: {
            type: Date,
            default: Date.now,
        },
    },
    { _id: true } // Asegura que cada mensaje subdocumento tenga su propio _id
);

// No exportamos como Modelo, ya que se usará como subdocumento.
module.exports = mensajeSchema;