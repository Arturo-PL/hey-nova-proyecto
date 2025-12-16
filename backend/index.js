// 1. IMPORTACIÓN DE MÓDULOS Y CORE
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http'); 
const { Server } = require('socket.io'); 

// Importar utilidades y Middlewares
const conectarDB = require('./config/baseDeDatos');
const { conectarSQL } = require('./config/sqlDb');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
require('./config/redis');

// IMPORTAR CONTROLADOR DEL CHATBOT
const { procesarPregunta } = require('./controllers/chatbotController'); 

// 🔑 IMPORTAR RUTAS REST (Módulos)
const authRoutes = require('./routes/authRoutes'); 
const profileRoutes = require('./routes/profileRoutes'); 
const postRoutes = require('./routes/postRoutes'); 
const chatRoutes = require('./routes/chatRoutes');
const userRoutes = require('./routes/userRoutes');
const foroRoutes = require('./routes/ForoRoutes');


// 2. CONFIGURACIÓN INICIAL
dotenv.config();
conectarDB();
conectarSQL();
const app = express();

const PORT = process.env.PORT || 5000;


// 3. MIDDLEWARES PRINCIPALES (Express)
app.use(express.json()); 
app.use(cors({
    origin: '*', // Permite que Vercel, Localhost y cualquier PC se conecte
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true // Opcional, pero ayuda si manejas cookies/sesiones
}));


// 4. DEFINICIÓN DE RUTAS (Endpoints REST)

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('API de heyNova funcionando correctamente. ¡Bienvenido!');
});

// Rutas de Módulos REST 
app.use('/api/auth', authRoutes);       
app.use('/api/perfiles', profileRoutes); 
app.use('/api/publicaciones', postRoutes); 
app.use('/api/chat', chatRoutes); 
app.use('/api/user', userRoutes);
app.use('/api/foros', foroRoutes);


// 5. MANEJO DE ERRORES (Debe ir después de todas las rutas)
app.use(notFound);
app.use(errorHandler);


// 6. CONFIGURACIÓN DEL SERVIDOR HTTP Y SOCKET.IO
const servidorHttp = http.createServer(app); 

const io = new Server(servidorHttp, {
    pingTimeout: 60000, 
    cors: {
        // origin: 'http://localhost:5173', cambie estooooo <-----------------------------------------------------------------------
        origin: '*', 
        credentials: true,
    },
});


// 7. LÓGICA DE SOCKET.IO (Manejo de eventos de chat en tiempo real)
io.on('connection', (socket) => {
    console.log('🔗 Usuario conectado a Socket.IO');

    // ==========================================================
    // A. CONFIGURACIÓN INICIAL (Unirse a Sala Personal)
    // ==========================================================
    socket.on('setup', (userData) => {
        if (userData && userData._id) {
            socket.join(userData._id); // Sala personal para enviar notificaciones directas
            console.log(`Usuario con ID ${userData._id} conectado a su sala personal.`);
            socket.emit('connected');
        }
    });

    // ==========================================================
    // B. UNIRSE A UNA CONVERSACIÓN ESPECÍFICA
    // ==========================================================
    socket.on('join_chat', (chatId) => {
        socket.join(chatId); // Sala para enviar/recibir mensajes del chat actual
        console.log(`Socket se unió a la sala de chat: ${chatId}`);
    });

    // ==========================================================
    // C. RECEPCIÓN Y RE-EMISIÓN DEL MENSAJE
    // ==========================================================
    socket.on('enviarMensaje', (mensajeGuardado) => { 
        
        // 🔑 LÓGICA DE EXTRACCIÓN ROBUSTA
        let chatId = mensajeGuardado.chatId || mensajeGuardado.chat; 

        // Si es un objeto populado, extraer el _id:
        if (chatId && typeof chatId === 'object' && chatId._id) {
            chatId = chatId._id;
        }

        // Convertir a string para asegurar la comparación y el uso en socket.join:
        if (chatId) {
            chatId = chatId.toString();
        }

        if (!chatId) {
            return console.error("Error: ID de chat no encontrado para re-transmisión. Objeto recibido:", mensajeGuardado); 
        }
        
        // 🚨 DEBUG: Confirma que la extracción fue exitosa
        console.log(`✅ ID de Chat encontrado: ${chatId}. Re-transmitiendo...`); 
        
        // Emite a todos en la sala del chat EXCEPTO al remitente actual
        socket.to(chatId).emit('mensajeRecibido', mensajeGuardado); 
    });

    // ==========================================================
    // D. CHATBOT NOVABOT (BOTÓN FLOTANTE) 🤖
    // ==========================================================
    socket.on('pregunta-bot', async (preguntaUsuario) => {
        console.log(`🤖 Bot solicitado: ${preguntaUsuario}`);

        // 1. El controlador decide si busca en Redis o Mongo
        const respuestaTexto = await procesarPregunta(preguntaUsuario);

        // 2. Respondemos SOLO a este usuario (socket.emit)
        socket.emit('respuesta-bot', {
            texto: respuestaTexto,
            fecha: new Date()
        });
    });
    
    // ==========================================================
    
    socket.on('disconnect', () => {
        console.log('❌ Usuario desconectado de Socket.IO');
    });
});


// 8. INICIO DEL SERVIDOR (Escuchando en el servidor HTTP, no en la app Express)
servidorHttp.listen(PORT, () => {
    console.log(`🚀 Servidor Express y Socket.IO corriendo en el puerto ${PORT}`);
    console.log(`Accede a la API en: http://localhost:${PORT}`);
});