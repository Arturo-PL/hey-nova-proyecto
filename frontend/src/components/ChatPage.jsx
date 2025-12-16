import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext'; 
import { useChat } from '../context/ChatContext'; 
import { useSocket } from '../context/SocketContext'; 

// Componentes internos
import BuscarUsuario from '../components/Chat/BuscarUsuario';
import ChatList from '../components/Chat/ChatList';
import MessageWindow from '../components/Chat/MessageWindow';
import ChatWelcome from '../components/Chat/ChatWelcome';

const ChatPage = () => {
    const { usuario } = useAuth();
    const { socket } = useSocket();
    const { conversacionSeleccionada, obtenerConversaciones } = useChat();

    useEffect(() => {
        if (socket && usuario) {
            socket.emit("setup", usuario); 
            
            socket.on("connected", () => console.log("✅ Socket conectado."));
            
            socket.on("mensajeRecibido", () => {
                obtenerConversaciones(); 
            });

            return () => {
                socket.off("mensajeRecibido");
                socket.off("connected");
            };
        }
    }, [socket, usuario]);

    if (!usuario) {
        return <div style={styles.authRequired}>Inicia sesión para chatear.</div>;
    }

    return (
        <div style={styles.pageContainer}>
            <div style={styles.contentWrapper}>
                
                {/* === BARRA LATERAL (LISTA DE CHATS) === */}
                <div style={styles.sidebar}>
                    {/* Aquí irán los componentes con estilos NovaTheme después */}
                    <div style={styles.searchContainer}>
                        <BuscarUsuario />
                    </div>
                    
                    <div style={styles.chatListWrapper}>
                        <ChatList />
                    </div>
                </div>

                {/* === VENTANA PRINCIPAL (MENSAJES) === */}
                <div style={styles.mainContent}>
                    {conversacionSeleccionada ? (
                        <MessageWindow />
                    ) : (
                        <ChatWelcome />
                    )}
                </div>

            </div>
        </div>
    );
};

// ==========================================
// ESTILOS NOVATHEME (Layout Principal)
// ==========================================
const styles = {
    pageContainer: {
        display: 'flex',
        height: 'calc(100vh - 80px)', 
        width: '100%',
        maxWidth: '1400px', // Un poco más ancho para que el chat respire
        margin: '0 auto',
        padding: '20px',
        boxSizing: 'border-box'
    },
    contentWrapper: {
        display: 'flex',
        flexGrow: 1,
        borderRadius: '16px', // Bordes más redondeados
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)', // Sombra elegante
        backgroundColor: 'var(--nova-white)', // Fondo blanco puro
        overflow: 'hidden', // Para que lo de adentro no rompa los bordes redondeados
        border: '1px solid rgba(0,0,0,0.05)'
    },
    // --- LADO IZQUIERDO ---
    sidebar: {
        width: '380px', // Un poco más ancho para ver nombres largos
        borderRight: '1px solid rgba(0,0,0,0.08)', // Separador muy sutil
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#fdfdfd', // Un blanco apenas grisáceo para diferenciar zonas
    },
    searchContainer: {
        padding: '20px',
        borderBottom: '1px solid rgba(0,0,0,0.05)'
    },
    chatListWrapper: {
        flexGrow: 1,
        overflowY: 'auto',
        // Personalización del scrollbar para que sea verde/gris
        scrollbarWidth: 'thin',
        scrollbarColor: 'var(--nova-secondary) transparent'
    },
    // --- LADO DERECHO ---
    mainContent: {
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        // Fondo con un patrón sutil o color sólido para los mensajes
        backgroundColor: '#ffffff', 
        backgroundImage: 'radial-gradient(#227b4b 0.5px, transparent 0.5px)', // Puntitos verdes muy sutiles (opcional)
        backgroundSize: '20px 20px',
        backgroundBlendMode: 'soft-light',
        opacity: 0.99 // Truco para el blend mode
    },
    authRequired: {
        textAlign: 'center',
        padding: '50px',
        fontSize: '1.2em',
        color: 'var(--nova-accent)',
        fontWeight: 'bold'
    }
};

export default ChatPage;