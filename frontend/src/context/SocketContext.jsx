import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext'; 

const SOCKET_SERVER_URL = 'https://heyynova-api.onrender.com';

const SocketContext = createContext();

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const { usuario } = useAuth();
    
    const [socket, setSocket] = useState(null);
    const [estaConectado, setEstaConectado] = useState(false);

    useEffect(() => {
        // Solo intentamos conectar si el usuario está autenticado
        if (usuario && usuario.token) {
            

            const newSocket = io(SOCKET_SERVER_URL, {
                auth: {
                    token: usuario.token,
                },
                transports: ['websocket'], 
            });


            newSocket.on('connect', () => {
                console.log('🔗 Socket.IO conectado con éxito.');
                setEstaConectado(true);
                
                if (usuario) {
                    newSocket.emit('setup', usuario); 
                }
            });

            newSocket.on('disconnect', () => {
                console.log('❌ Socket.IO desconectado.');
                setEstaConectado(false);
            });
            
            newSocket.on('connect_error', (error) => {
                console.error('⚠️ Error de conexión de Socket.IO:', error.message);
            });
            
            // Evento opcional para confirmar la creación de la sala en el backend
            newSocket.on('connected', () => {
                console.log('✅ Usuario unido a sala personal en el servidor.');
            });

            setSocket(newSocket);

            return () => {
                // Remover todos los listeners antes de desconectar
                newSocket.off('connect');
                newSocket.off('disconnect');
                newSocket.off('connect_error');
                newSocket.off('connected');
                
                newSocket.disconnect();
                setSocket(null);
            };

        } else if (!usuario && socket) {
            // Si el usuario cierra sesión y la conexión existe, la cerramos
            socket.disconnect();
            setSocket(null);
        }
    }, [usuario]); // Depende de 'usuario'

    // 5. Valor a Proveer
    const value = {
        socket,
        estaConectado,
        userId: usuario ? usuario._id : null,
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};