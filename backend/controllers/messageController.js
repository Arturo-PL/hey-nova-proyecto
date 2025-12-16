const Conversacion = require('../models/Conversacion');
const Usuario = require('../models/Usuario');
const asyncHandler = require('express-async-handler');

// Función de utilidad para poblar participantes y los mensajes
const poblarChat = (query) => {
    return query
        // Poblar participantes, excluyendo la contraseña
        .populate("participantes", "-password")
        .populate({
            path: "mensajes",
            populate: {
                path: "remitente",
                // CORRECCIÓN: Usamos firstName, lastName y foto
                select: "firstName lastName email foto", 
            },
        })
        .sort({ updatedAt: -1 }); // El chat más reciente primero
};

/**
 * @desc Busca o crea un chat privado.
 * @route POST /api/chat
 * @access Protegida
 */
const accessChat = asyncHandler(async (req, res) => {
    const { userId } = req.body;

    const usuarioId = req.usuario?._id || req.usuario;

    if (!userId || !usuarioId) {
        // Mejorado para incluir la falta de autenticación
        return res.status(400).json({ message: "El ID del usuario y la autenticación son requeridos." });
    }

    // 1. Buscar si ya existe una conversación privada entre los dos usuarios
    let isChat = await Conversacion.findOne({
        esChatGrupal: false,
        participantes: { $all: [usuarioId, userId], $size: 2 }, // Cambiado a usuarioId
    });
    
    // Si existe, poblar y retornar
    if (isChat) {
        isChat = await poblarChat(Conversacion.findById(isChat._id));
        
        // Establecer el nombre del chat usando firstName/lastName
        const otroParticipante = isChat.participantes.find(p => p._id.toString() !== usuarioId.toString()); // Cambiado a usuarioId
        if (otroParticipante) {
            isChat.nombreChat = `${otroParticipante.firstName} ${otroParticipante.lastName}`;
        }
        
        res.send(isChat);
    } else {
        // 2. Si no existe, crear la nueva conversación
        const chatData = {
            nombreChat: "Chat Privado",
            esChatGrupal: false,
            participantes: [usuarioId, userId], // Cambiado a usuarioId
        };

        const createdChat = await Conversacion.create(chatData);

        let FullChat = await poblarChat(Conversacion.findById(createdChat._id));
        
        // Establecer el nombre del chat de la conversación recién creada
        const otroParticipante = FullChat.participantes.find(p => p._id.toString() !== usuarioId.toString()); // Cambiado a usuarioId
        if (otroParticipante) {
            FullChat.nombreChat = `${otroParticipante.firstName} ${otroParticipante.lastName}`;
        }
        
        res.status(200).json(FullChat);
    }
});

//---------------------------------------------------------------------

/**
 * @desc Obtiene todas las conversaciones del usuario logueado.
 * @route GET /api/chat
 * @access Protegida
 */
const obtenerChatsUsuario = asyncHandler(async (req, res) => {
    try {
        const usuarioId = req.usuario?._id || req.usuario;

        if (!usuarioId) {
            // El middleware debería atrapar esto, pero es una buena defensa
            throw new Error('Usuario no autenticado para obtener chats.');
        }

        // Se usa usuarioId
        const chats = await Conversacion.find({
            participantes: { $elemMatch: { $eq: usuarioId } }
        });
        
        let resultados = await poblarChat(Conversacion.find({ _id: { $in: chats.map(c => c._id) } }));

        // Establecer el nombre del chat para la vista de lista de chats
        resultados.forEach(chat => {
            if (!chat.esChatGrupal) {
                 const otroParticipante = chat.participantes.find(p => p._id.toString() !== usuarioId.toString()); // Cambiado a usuarioId
                 
                 // CORRECCIÓN: Usamos firstName y lastName
                 if (otroParticipante) {
                     chat.nombreChat = `${otroParticipante.firstName} ${otroParticipante.lastName}`;
                 } else {
                     chat.nombreChat = 'Chat Desconocido'; // Fallback
                 }
            }
        });
        
        res.status(200).send(resultados);

    } catch (error) {
        console.error("Error en obtenerChatsUsuario:", error.message);
        // Devolvemos 401 si es un error de autenticación
        res.status(error.message.includes('autenticado') ? 401 : 400).json({ message: "Error al obtener la lista de chats", error: error.message });
    }
});

//---------------------------------------------------------------------

/**
 * @desc Envía un mensaje y lo guarda en la base de datos.
 * @route POST /api/chat/messages
 * @access Protegida
 */
const sendMessage = asyncHandler(async (req, res) => {
    const { chatId, content } = req.body;

    const usuarioId = req.usuario?._id || req.usuario;

    if (!content || !chatId || !usuarioId) {
        return res.status(400).json({ message: "Datos inválidos: chatId, content, o autenticación no encontrados" });
    }

    // 1. Crear el objeto del nuevo mensaje
    const nuevoMensaje = {
        remitente: usuarioId, // Cambiado a usuarioId
        contenido: content,
        leidoPor: [usuarioId], // Cambiado a usuarioId
    };

    // 2. Encontrar la conversación y agregar el mensaje
    let conversacionActualizada = await Conversacion.findByIdAndUpdate(
        chatId,
        {
            $push: { mensajes: nuevoMensaje },
        },
        { new: true } // Devuelve el documento actualizado
    );
    
    // 3. Obtener el ID del subdocumento y actualizar ultimoMensaje
    const mensajeAgregado = conversacionActualizada.mensajes[conversacionActualizada.mensajes.length - 1];
    
    // Actualizar el campo ultimoMensaje en la conversación
    await Conversacion.updateOne({ _id: chatId }, {
        ultimoMensaje: mensajeAgregado._id,
    });

    // 4. Poblar el remitente del mensaje
    await Usuario.populate(mensajeAgregado, {
        path: 'remitente',
        // CORRECCIÓN: Usamos firstName, lastName y foto
        select: 'firstName lastName email foto',
    });

    res.json(mensajeAgregado);
});

//---------------------------------------------------------------------

/**
 * @desc Obtiene el historial de mensajes de un chat específico.
 * @route GET /api/chat/messages/:chatId
 * @access Protegida
 */
const allMessages = asyncHandler(async (req, res) => {
    try {
        const usuarioId = req.usuario?._id || req.usuario; 

        if (!usuarioId) {
            return res.status(401).json({ message: "Usuario no autenticado." });
        }

        const conversacion = await Conversacion.findById(req.params.chatId)
            .select('mensajes') 
            // CORRECCIÓN: Usamos firstName, lastName y foto
            .populate('mensajes.remitente', 'firstName lastName email foto'); 

        if (!conversacion) {
            return res.status(404).json({ message: "Conversación no encontrada" });
        }

        res.json(conversacion.mensajes);

    } catch (error) {
        console.error("Error en allMessages:", error.message);
        res.status(400).json({ message: "Error al obtener los mensajes", error: error.message });
    }
});


module.exports = { accessChat, allMessages, sendMessage, obtenerChatsUsuario };