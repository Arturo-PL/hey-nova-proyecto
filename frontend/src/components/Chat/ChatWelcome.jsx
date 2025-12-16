import React from 'react';
import { useAuth } from '../../context/AuthContext';

const ChatWelcome = () => {
    const { usuario } = useAuth();

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.icon}>👋</div>
                <h2 style={styles.title}>¡Hola, {usuario.firstName}!</h2>
                <p style={styles.instruction}>
                    Selecciona una conversación de tu lista de chats para comenzar a mensajear.
                </p>
                <p style={styles.tip}>
                    O utiliza la función de <span style={styles.highlight}>Buscar Usuario</span> para iniciar una nueva.
                </p>
            </div>
        </div>
    );
};

// ==========================================
// ESTILOS NOVATHEME
// ==========================================
const styles = {
    container: {
        flex: 1, // Ocupa todo el espacio disponible
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        padding: '20px',
        // Fondo transparente para dejar ver el patrón del ChatPage, o un color sólido suave
        backgroundColor: 'transparent', 
    },
    card: {
        textAlign: 'center',
        padding: '50px 40px',
        borderRadius: '24px', // Bordes muy redondeados modernos
        backgroundColor: 'var(--nova-white)', // Blanco puro
        boxShadow: '0 10px 40px rgba(0,0,0,0.06)', // Sombra elegante y difusa
        maxWidth: '450px',
        width: '100%',
        border: '1px solid rgba(0,0,0,0.03)'
    },
    icon: {
        fontSize: '4rem',
        marginBottom: '20px',
        display: 'block'
    },
    title: {
        color: 'var(--nova-primary)', // Verde Institucional
        marginBottom: '15px',
        fontSize: '2rem',
        marginTop: 0,
        fontWeight: '700'
    },
    instruction: {
        color: 'var(--nova-text)',
        fontSize: '1.1rem',
        lineHeight: '1.6',
        marginBottom: '10px'
    },
    tip: {
        color: 'var(--nova-text-muted)', // Gris verdoso suave
        marginTop: '25px',
        fontSize: '0.95rem',
    },
    highlight: {
        color: 'var(--nova-gold)', // Dorado para resaltar la acción clave
        fontWeight: 'bold'
    }
};

export default ChatWelcome;