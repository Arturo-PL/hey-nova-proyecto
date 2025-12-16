import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NavBar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { usuario, cerrarSesion } = useAuth();
    
    // Lista de enlaces de navegación
    const navLinks = [
        { path: '/feed', name: 'Inicio', icon: '🏠' },
        { path: '/foros', name: 'Foros', icon: '📚' },
        { path: '/chat', name: 'Chat', icon: '💬' },
        { path: '/perfil', name: 'Perfil', icon: '👤' },
    ];

    const handleCerrarSesion = () => {
        if (window.confirm("¿Seguro que quieres cerrar sesión?")) {
            cerrarSesion();
        }
    };

    if (!usuario) {
        return null;
    }

    return (
        <header style={styles.header}>
            <div style={styles.logo} onClick={() => navigate('/feed')}>
                heyNova!
            </div>
            
            <nav style={styles.nav}>
                {navLinks.map((link) => (
                    <button
                        key={link.path}
                        onClick={() => navigate(link.path)}
                        style={{
                            ...styles.navButton,
                            // Lógica para resaltar botón activo
                            ...(location.pathname.startsWith(link.path) ? styles.activeButton : {}) 
                        }}
                    >
                        {link.icon} {link.name}
                    </button>
                ))}
            </nav>

            <div style={styles.userContainer}>
                <span style={styles.userName}>{usuario.firstName}</span>
                <button onClick={handleCerrarSesion} style={styles.logoutButton}>
                    Salir
                </button>
            </div>
        </header>
    );
};

// ==========================================
// ESTILOS NUEVOS (NOVATHEME)
// ==========================================
const styles = {
    header: {
        backgroundColor: 'var(--nova-primary)', 
        color: 'var(--nova-white)',
        padding: '10px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        position: 'sticky',
        top: 0,
        zIndex: 1000
    },
    logo: {
        fontSize: '1.6em',
        fontWeight: '900',
        cursor: 'pointer',
        letterSpacing: '1px',
        color: 'var(--nova-white)'
    },
    nav: {
        display: 'flex',
        gap: '10px',
    },
    navButton: {
        backgroundColor: 'transparent', // 👈 IMPORTANTE: Forzamos transparencia
        color: 'rgba(255, 255, 255, 0.9)', 
        border: 'none',
        padding: '8px 16px',
        borderRadius: '20px', 
        cursor: 'pointer',
        fontSize: '1em',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontWeight: '500'
    },
    activeButton: {
        backgroundColor: 'var(--nova-gold)', // 👈 Dorado cuando está seleccionado
        color: 'var(--nova-white)',
        fontWeight: 'bold',
        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
        transform: 'scale(1.05)'
    },
    userContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
    },
    userName: {
        fontSize: '1em',
        fontWeight: '600',
        color: 'var(--nova-white)'
    },
    logoutButton: {
        padding: '6px 14px',
        backgroundColor: 'var(--nova-accent)', 
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: '0.9em'
    }
};

export default NavBar;