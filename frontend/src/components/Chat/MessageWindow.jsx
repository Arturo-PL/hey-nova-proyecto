import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

const API_SEND_MESSAGE_URL = 'https://heyynova-api.onrender.com/api/chat/messages'; 

const MessageWindow = () => {
    const { usuario } = useAuth();
    const { socket } = useSocket();
    
    const { 
        conversacionSeleccionada, 
        mensajes, 
        setMensajes, 
        cargandoMensajes,
        obtenerConversaciones 
    } = useChat();

    const [contenido, setContenido] = useState('');
    const [cargandoEnvio, setCargandoEnvio] = useState(false);
    const messagesEndRef = useRef(null);

    const enviarMensaje = async (e) => {
        e.preventDefault();
        
        if (!contenido.trim() || !conversacionSeleccionada) return;

        setCargandoEnvio(true);

        const mensajeAEnviar = {
            chatId: conversacionSeleccionada._id,
            content: contenido.trim(),
        };

        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${usuario.token}`,
                },
            };
            
            const { data: nuevoMensajeGuardado } = await axios.post(
                API_SEND_MESSAGE_URL,
                mensajeAEnviar,
                config
            );
            
            nuevoMensajeGuardado.chat = conversacionSeleccionada._id;
            
            setMensajes(prevMensajes => [...prevMensajes, nuevoMensajeGuardado]);

            if (socket) {
                socket.emit('enviarMensaje', nuevoMensajeGuardado); 
            }
            
            obtenerConversaciones();
            setContenido('');

        } catch (error) {
            console.error('Error al enviar el mensaje:', error);
            alert('Fallo al enviar el mensaje.');
        } finally {
            setCargandoEnvio(false);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [mensajes]); 

    if (!conversacionSeleccionada) return null; 

    const contacto = conversacionSeleccionada.participantes.find(p => p._id !== usuario._id);
    const nombreContacto = contacto ? `${contacto.firstName} ${contacto.lastName}` : conversacionSeleccionada.nombreChat || "Chat Grupal";
    
    return (
        <div style={styles.windowContainer}>
            {/* Encabezado del chat */}
            <div style={styles.header}>
                <div style={styles.avatar}>
                    {nombreContacto.charAt(0)}
                </div>
                <div style={styles.contactInfo}>
                    <strong style={styles.contactName}>{nombreContacto}</strong>
                </div>
            </div>

            {/* Área de visualización de mensajes */}
            <div style={styles.messageArea}>
                {cargandoMensajes ? (
                    <div style={styles.loading}>Cargando mensajes...</div>
                ) : (
                    mensajes.map((mensaje) => {
                        const esMio = mensaje.remitente._id === usuario._id;
                        return (
                            <div 
                                key={mensaje._id} 
                                style={{ ...styles.messageBubbleContainer, justifyContent: esMio ? 'flex-end' : 'flex-start' }}
                            >
                                <div style={{ ...styles.messageBubble, ...(esMio ? styles.myBubble : styles.otherBubble) }}>
                                    {!esMio && <small style={styles.senderName}>{mensaje.remitente.firstName}</small>}
                                    <p style={styles.messageContent}>{mensaje.contenido}</p>
                                    <small style={{...styles.messageTime, color: esMio ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.5)'}}>
                                        {(() => {
                                            const fecha = new Date(mensaje.fechaEnvio || mensaje.createdAt);
                                            if (isNaN(fecha.getTime())) return "";
                                            return fecha.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
                                        })()}
                                    </small>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Formulario de envío */}
            <form onSubmit={enviarMensaje} style={styles.inputForm}>
                <input
                    type="text"
                    placeholder="Escribe un mensaje..."
                    value={contenido}
                    onChange={(e) => setContenido(e.target.value)}
                    style={styles.inputField}
                    disabled={cargandoEnvio}
                />
                <button type="submit" disabled={cargandoEnvio || !contenido.trim()} style={styles.sendButton}>
                    {cargandoEnvio ? '...' : '➤'}
                </button>
            </form>
        </div>
    );
};

// ==========================================
// ESTILOS NOVATHEME (CORREGIDOS)
// ==========================================
const styles = {
    windowContainer: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        // ✅ CORRECCIÓN: Fondo sólido para evitar transparencias raras o grisaceas
        backgroundColor: '#f5f7f6', 
    },
    header: {
        padding: '15px 20px',
        borderBottom: '1px solid rgba(0,0,0,0.05)',
        backgroundColor: 'var(--nova-white)', // Blanco puro
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        zIndex: 10,
        boxShadow: '0 2px 5px rgba(0,0,0,0.02)'
    },
    avatar: {
        width: '38px',
        height: '38px',
        borderRadius: '50%',
        backgroundColor: 'var(--nova-secondary)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold'
    },
    contactInfo: {
        display: 'flex',
        flexDirection: 'column'
    },
    contactName: {
        fontSize: '1rem',
        color: 'var(--nova-text)'
    },
    messageArea: {
        flexGrow: 1,
        padding: '20px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
    },
    messageBubbleContainer: {
        display: 'flex',
        marginBottom: '5px',
    },
    messageBubble: {
        maxWidth: '70%',
        padding: '10px 16px',
        borderRadius: '18px',
        position: 'relative',
        wordWrap: 'break-word',
        boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
        fontSize: '0.95rem',
        lineHeight: '1.4'
    },
    myBubble: {
        backgroundColor: 'var(--nova-primary)', // Verde
        color: 'white',
        borderBottomRightRadius: '4px', 
    },
    otherBubble: {
        backgroundColor: 'white', // Blanco
        color: 'var(--nova-text)',
        borderBottomLeftRadius: '4px',
        border: '1px solid rgba(0,0,0,0.05)'
    },
    senderName: {
        display: 'block',
        fontSize: '0.75em',
        fontWeight: 'bold',
        marginBottom: '2px',
        color: 'var(--nova-gold)'
    },
    messageContent: {
        margin: 0,
    },
    messageTime: {
        display: 'block',
        fontSize: '0.7em',
        textAlign: 'right',
        marginTop: '4px',
    },
    inputForm: {
        display: 'flex',
        padding: '15px 20px',
        borderTop: '1px solid rgba(0,0,0,0.05)',
        backgroundColor: 'var(--nova-white)',
        gap: '10px'
    },
    inputField: {
        flexGrow: 1,
        padding: '12px 18px',
        borderRadius: '25px',
        border: '1px solid #ddd',
        backgroundColor: '#f9f9f9',
        outline: 'none',
        fontSize: '0.95rem'
    },
    sendButton: {
        padding: '0',
        width: '45px',
        height: '45px',
        backgroundColor: 'var(--nova-primary)', 
        color: 'white',
        border: 'none',
        borderRadius: '50%',
        cursor: 'pointer',
        fontSize: '1.2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'transform 0.1s',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
    },
    loading: {
        textAlign: 'center',
        padding: '20px',
        color: 'var(--nova-text-muted)',
    }
};

export default MessageWindow;