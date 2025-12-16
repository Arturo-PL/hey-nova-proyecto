import React from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';

const ChatList = () => {
    const { 
        conversaciones, 
        conversacionSeleccionada, 
        setConversacionSeleccionada, 
        cargandoChats
    } = useChat();
    
    const { usuario } = useAuth();
    
    /**
     * @desc Determina el nombre del contacto en un chat 1:1.
     */
    const obtenerNombreContacto = (chat) => {
        if (chat.participantes && chat.participantes.length === 2) {
            const contacto = chat.participantes.find(p => p._id !== usuario._id);
            if (contacto) {
                return `${contacto.firstName} ${contacto.lastName}`;
            }
        }
        return chat.nombreChat || "Chat Grupal";
    };

    if (cargandoChats) {
        return <div style={styles.loading}>Cargando conversaciones...</div>;
    }

    if ((conversaciones || []).length === 0) {
        return (
            <div style={styles.noChats}>
                <div style={{fontSize: '2rem', marginBottom: '10px'}}>📭</div>
                No tienes conversaciones activas.
            </div>
        );
    }

    return (
        <div style={styles.listContainer}>
            {conversaciones.map((chat) => (
                <div
                    key={chat._id}
                    style={{
                        ...styles.chatItem,
                        // Aplicamos estilo de seleccionado (Verde claro)
                        ...(conversacionSeleccionada?._id === chat._id ? styles.selected : {})
                    }}
                    onClick={() => setConversacionSeleccionada(chat)}
                    // Efecto Hover simple con JS en línea
                    onMouseEnter={(e) => {
                        if (conversacionSeleccionada?._id !== chat._id) 
                            e.currentTarget.style.backgroundColor = '#f9f9f9';
                    }}
                    onMouseLeave={(e) => {
                        if (conversacionSeleccionada?._id !== chat._id) 
                            e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                >
                    {/* Agregamos visualmente el Avatar */}
                    <div style={styles.avatar}>
                        {obtenerNombreContacto(chat).charAt(0)}
                    </div>

                    <div style={styles.chatInfo}>
                        <div style={styles.chatTitle}>
                            {obtenerNombreContacto(chat)}
                        </div>
                        <div style={styles.lastMessage}>
                            (Haz click para ver los mensajes)
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

// ==========================================
// ESTILOS NOVATHEME
// ==========================================
const styles = {
    listContainer: {
        height: '100%',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column'
    },
    chatItem: {
        padding: '15px 20px',
        borderBottom: '1px solid #f0f0f0', // Línea sutil
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        backgroundColor: 'white',
        minHeight: '50px',
        display: 'flex',
        alignItems: 'center',
        gap: '15px' // Espacio entre avatar y texto
    },
    // Estilo nuevo para el círculo de iniciales
    avatar: {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        backgroundColor: 'var(--nova-secondary)', // Verde suave
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        fontSize: '1.1rem',
        flexShrink: 0
    },
    chatInfo: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        overflow: 'hidden'
    },
    chatTitle: {
        fontWeight: '600',
        color: 'var(--nova-text)', // Negro suave
        marginBottom: '2px',
        fontSize: '0.95rem'
    },
    lastMessage: {
        fontSize: '0.85em',
        color: 'var(--nova-text-muted)', // Gris verdoso
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
    },
    selected: {
        backgroundColor: '#f0fdf4', // Fondo verde muy claro
        borderLeft: '4px solid var(--nova-primary)', // Indicador verde a la izquierda
    },
    loading: {
        textAlign: 'center',
        padding: '40px',
        color: 'var(--nova-text-muted)',
        fontStyle: 'italic'
    },
    noChats: {
        textAlign: 'center',
        padding: '50px 20px',
        color: 'var(--nova-text-muted)',
        lineHeight: '1.6'
    }
};

export default ChatList;