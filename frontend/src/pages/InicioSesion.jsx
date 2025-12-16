import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const InicioSesion = () => {
    // 1. Estados Locales
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [cargando, setCargando] = useState(false);

    // 2. Hooks
    const { usuario, iniciarSesion } = useAuth();
    const navigate = useNavigate();

    // 3. Redirección si ya está logueado
    useEffect(() => {
        if (usuario) {
            navigate('/feed'); 
        }
    }, [usuario, navigate]);

    // 4. Manejo del Submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        
        if (!email || !password) {
            setError('Por favor, ingresa tu correo y contraseña.');
            return;
        }

        setCargando(true);
        const resultado = await iniciarSesion(email, password);
        setCargando(false);

        if (!resultado.success) {
            setError(resultado.error);
        }
    };

    return (
        <div style={styles.pageContainer}>
            <div style={styles.card}>
                
                {/* Encabezado / Logo */}
                <div style={styles.header}>
                    <h1 style={styles.logo}>heyNova!</h1>
                    <h2 style={styles.subtitle}>Bienvenido de nuevo</h2>
                </div>
                
                {error && <div style={styles.errorAlert}>{error}</div>}
                
                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <label htmlFor="email" style={styles.label}>Correo Electrónico</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={styles.input}
                            placeholder="ejemplo@nova.edu.mx"
                        />
                    </div>
                    
                    <div style={styles.inputGroup}>
                        <label htmlFor="password" style={styles.label}>Contraseña</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={styles.input}
                            placeholder="••••••••"
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={cargando}
                        style={{
                            ...styles.button,
                            opacity: cargando ? 0.7 : 1,
                            cursor: cargando ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {cargando ? 'Iniciando...' : 'Iniciar Sesión'}
                    </button>
                </form>

                <div style={styles.footer}>
                    <p style={styles.footerText}>
                        ¿Aún no tienes cuenta? 
                        <Link to="/registro" style={styles.link}> Regístrate aquí</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

// ==========================================
// ESTILOS NOVATHEME
// ==========================================
const styles = {
    pageContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        // Fondo con un degradado sutil verde/gris
        background: 'linear-gradient(135deg, var(--nova-bg) 0%, #e8eceb 100%)', 
        padding: '20px'
    },
    card: {
        width: '100%',
        maxWidth: '420px',
        padding: '40px',
        backgroundColor: 'var(--nova-white)', // Tarjeta blanca
        borderRadius: '16px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.05)', // Sombra elegante
        border: '1px solid rgba(0,0,0,0.02)'
    },
    header: {
        textAlign: 'center',
        marginBottom: '30px'
    },
    logo: {
        color: 'var(--nova-primary)', // Verde Institucional
        fontSize: '2.5rem',
        fontWeight: '900',
        margin: '0 0 10px 0',
        letterSpacing: '-1px'
    },
    subtitle: {
        color: 'var(--nova-text-muted)',
        fontSize: '1.1rem',
        fontWeight: '500',
        margin: 0
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
    },
    label: {
        fontSize: '0.9rem',
        fontWeight: '600',
        color: 'var(--nova-text)',
        marginLeft: '5px'
    },
    input: {
        padding: '12px 15px',
        borderRadius: '8px',
        border: '1px solid #ddd',
        fontSize: '1rem',
        backgroundColor: '#f9f9f9',
        outline: 'none',
        transition: 'border-color 0.2s, box-shadow 0.2s'
    },
    button: {
        marginTop: '10px',
        padding: '14px',
        backgroundColor: 'var(--nova-primary)', // Botón Verde
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '1rem',
        fontWeight: 'bold',
        transition: 'background-color 0.2s',
        boxShadow: '0 4px 6px rgba(34, 123, 75, 0.2)' // Sombra verde sutil
    },
    errorAlert: {
        backgroundColor: '#fee2e2',
        color: '#dc2626',
        padding: '12px',
        borderRadius: '8px',
        marginBottom: '20px',
        fontSize: '0.9rem',
        textAlign: 'center',
        border: '1px solid #fecaca'
    },
    footer: {
        marginTop: '30px',
        textAlign: 'center',
        borderTop: '1px solid #f0f0f0',
        paddingTop: '20px'
    },
    footerText: {
        color: 'var(--nova-text-muted)',
        fontSize: '0.95rem'
    },
    link: {
        color: 'var(--nova-gold)', // Enlace Dorado para resaltar
        fontWeight: 'bold',
        textDecoration: 'none',
        marginLeft: '5px'
    }
};

export default InicioSesion;