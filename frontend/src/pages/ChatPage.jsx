import React from 'react';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import ChatList from '../components/Chat/ChatList'; 
import MessageWindow from '../components/Chat/MessageWindow';
import ChatWelcome from '../components/Chat/ChatWelcome';
import BuscarUsuario from '../components/Chat/BuscarUsuario'; 

const ChatPage = () => {
    // Obtenemos funciones y estados del contexto de autenticación y chat
    const { usuario, cerrarSesion } = useAuth(); 
    const { 
        conversacionSeleccionada, 
        // cargandoChats ya no es necesario aquí para el renderizado, ChatList lo maneja
    } = useChat();

    // ----------------------------------------------------
    // Lógica de Cierre de Sesión
    // ----------------------------------------------------
    const handleCerrarSesion = () => {
        if (window.confirm("¿Estás seguro de que quieres cerrar sesión?")) {
            cerrarSesion();
        }
    };


    return (
        <div style={styles.fullPageContainer}>
            <div style={styles.chatContainer}>
                
                {/* 1. Barra Lateral de Chats (ChatList) */}
                <div style={styles.chatListPanel}>
                    
                    {/* 👈 NUEVO: Componente para buscar e iniciar nuevos chats */}
                    <BuscarUsuario /> 
                    
                    <h3 style={styles.listTitle}>Chats Activos</h3>
                    {/* Renderiza ChatList para mostrar las conversaciones */}
                    <ChatList /> 
                </div>

                {/* 2. Ventana Principal de Mensajes */}
                <div style={styles.messageWindowPanel}>
                    {conversacionSeleccionada ? (
                        /* Si hay una conversación seleccionada, muestra la ventana de mensajes */
                        <MessageWindow /> 
                    ) : (
                        /* Si no hay, muestra el mensaje de bienvenida */
                        <ChatWelcome />
                    )}
                </div>

            </div>
        </div>
    );
};

// Estilos muy básicos
const styles = {
    fullPageContainer: { 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100vh', 
        backgroundColor: '#f5f7fa' 
    },
    header: { 
        padding: '10px 20px', 
        backgroundColor: '#4a00e0', 
        color: 'white', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
    },
    logoutButton: { 
        padding: '5px 10px', 
        background: '#8e24aa', 
        color: 'white', 
        border: 'none', 
        borderRadius: '5px', 
        cursor: 'pointer' 
    },
    chatContainer: { 
        display: 'flex', 
        flexGrow: 1 
    },
    chatListPanel: { 
        width: '300px', 
        borderRight: '1px solid #ddd', 
        padding: '15px', 
        backgroundColor: '#ffffff',
        overflowY: 'auto', // Permite el scroll en la barra lateral si hay muchos chats o búsquedas
    },
    messageWindowPanel: { 
        flexGrow: 1, 
        padding: '0px', 
        display: 'flex', 
        flexDirection: 'column' 
    },
    listTitle: { 
        borderBottom: '2px solid #4a00e0', 
        paddingBottom: '5px', 
        marginBottom: '15px' 
    },
};

export default ChatPage;