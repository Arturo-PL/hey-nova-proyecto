const mongoose = require('mongoose');
const mensajeSchema = require('./Mensaje.js'); 

const conversacionSchema = new mongoose.Schema(
    {
        nombreChat: {
            type: String,
            trim: true,
            default: 'Chat Privado', 
        },
        esChatGrupal: {
            type: Boolean,
            default: false,
        },
        participantes: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Usuario',
        }],
        ultimoMensaje: {
            type: mongoose.Schema.Types.ObjectId, 
        },
        mensajes: [mensajeSchema], 
    },
    {
        timestamps: true,
        toJSON: { virtuals: true }, // Permite que los virtuales se incluyan al serializar
        toObject: { virtuals: true }
    }
);

conversacionSchema.virtual('lastMessage').get(function() {
    // Busca en el array 'mensajes' el subdocumento cuyo _id coincide con ultimoMensaje
    return this.mensajes.find(msg => msg._id.equals(this.ultimoMensaje));
});


const Conversacion = mongoose.model('Conversacion', conversacionSchema);

module.exports = Conversacion;