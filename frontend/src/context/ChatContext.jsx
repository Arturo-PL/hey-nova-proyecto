import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext'; 

const API_BASE_URL = 'https://heyynova-api.onrender.com/api/chat'; 

const ChatContext = createContext();

export const useChat = () => {
    return useContext(ChatContext);
};

export const ChatProvider = ({ children }) => {
    const { usuario } = useAuth();
    const { socket } = useSocket(); 


    const [conversaciones, setConversaciones] = useState([]); 
    const [conversacionSeleccionada, setConversacionSeleccionada] = useState(null); 
    const [mensajes, setMensajes] = useState([]);
    
    const [cargandoChats, setCargandoChats] = useState(false);
    const [cargandoMensajes, setCargandoMensajes] = useState(false);



    const obtenerConversaciones = useCallback(async () => {
        if (!usuario || !usuario.token) return;

        setCargandoChats(true);

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${usuario.token}`,
                },
            };
            
            const { data } = await axios.get(API_BASE_URL, config); 

            setConversaciones(data);
            
        } catch (error) {
            console.error('Error al obtener la lista de conversaciones:', error);
            setConversaciones([]); // Aseguramos que sea un array vacío en caso de error
        } finally {
            setCargandoChats(false);
        }
    }, [usuario]);


    const accederConversacion = useCallback(async (userId) => {
        if (!usuario || !usuario.token) return;

        setCargandoChats(true);

        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${usuario.token}`,
                },
            };
            
            const { data } = await axios.post(API_BASE_URL, { userId }, config); 

            // Si la conversación ya existe, la ponemos al inicio de la lista y la seleccionamos
            setConversaciones(prevChats => {
                const filteredChats = prevChats.filter(c => c._id !== data._id);
                return [data, ...filteredChats];
            });

            setConversacionSeleccionada(data);
            
        } catch (error) {
            console.error('Error al acceder a la conversación:', error);
        } finally {
            setCargandoChats(false);
        }
    }, [usuario]);


    const obtenerMensajes = useCallback(async (chatId) => {
        if (!usuario || !usuario.token || !chatId) return;

        setCargandoMensajes(true);
        setMensajes([]); // Aseguramos que se vacíe al cambiar de chat

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${usuario.token}`,
                },
            };
            
            const { data } = await axios.get(`${API_BASE_URL}/messages/${chatId}`, config);

            setMensajes(data);

        } catch (error) {
            console.error('Error al obtener mensajes:', error);
        } finally {
            setCargandoMensajes(false);
        }
    }, [usuario]);

    useEffect(() => {
        if (usuario) {
            obtenerConversaciones();
        } else {
            setConversaciones([]);
            setConversacionSeleccionada(null);
        }
    }, [usuario, obtenerConversaciones]); // Agregamos obtenerConversaciones a las dependencias

    useEffect(() => {
        if (conversacionSeleccionada) {
            if (socket) {
                socket.emit('join_chat', conversacionSeleccionada._id);
            }
            obtenerMensajes(conversacionSeleccionada._id);
        } else {
            setMensajes([]);
        }
    }, [conversacionSeleccionada, socket, obtenerMensajes]); 
    
    useEffect(() => {
        if (socket) {
            
            socket.on('mensajeRecibido', (nuevoMensaje) => {
                
                console.groupCollapsed("DEBUG - MENSAJE SOCKET RECIBIDO");
                console.log("Mensaje Completo (Data del Backend):", nuevoMensaje);
                console.log("Chat ID del Mensaje (nuevoMensaje.chat):", nuevoMensaje.chat);
                console.log("Chat ACTIVO (conversacionSeleccionada?._id):", conversacionSeleccionada?._id);
                
                const esChatActivo = conversacionSeleccionada && (conversacionSeleccionada._id === nuevoMensaje.chat);
                
                if (esChatActivo) {
                    console.log("✅ Condición de CHAT ACTIVO CUMPLIDA. Agregando mensaje...");
                    setMensajes(prevMensajes => [...prevMensajes, nuevoMensaje]);
                } else {
                    console.log("❌ Mensaje recibido, pero el chat no está activo. No se agrega al feed.");
                }
                console.groupEnd();
                
                // Siempre actualizamos la lista de chats para que el chat se mueva al inicio
                obtenerConversaciones(); 
            });

            // Limpieza: importante remover el listener al desmontar o al cambiar las dependencias
            return () => {
                socket.off('mensajeRecibido');
            };
        }
    // 🔑 AÑADIMOS TODAS LAS DEPENDENCIAS NECESARIAS:
    }, [socket, conversacionSeleccionada, setMensajes, obtenerConversaciones]); 


    const value = {
        conversaciones,
        setConversaciones, 
        conversacionSeleccionada,
        setConversacionSeleccionada,
        mensajes,
        setMensajes, 
        accederConversacion, 
        obtenerConversaciones, 
        obtenerMensajes,
        cargandoChats,
        cargandoMensajes,
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};