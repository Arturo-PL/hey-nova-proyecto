import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = 'https://heyynova-api.onrender.com/api/publicaciones/';

/**
 * @param {function} refetchPosts - Función pasada desde FeedPrincipal para recargar el feed.
 */
const CrearPublicacion = ({ refetchPosts }) => {
    const { usuario } = useAuth();
    const [contenido, setContenido] = useState('');
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!contenido.trim()) {
            setError('La publicación no puede estar vacía.');
            return;
        }

        if (!usuario || !usuario.token) {
            setError('Debes iniciar sesión para publicar.');
            return;
        }

        setCargando(true);
        
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${usuario.token}`, 
                },
            };

            // Estructura de datos a enviar: solo el contenido
            await axios.post(API_URL, { contenido }, config);

            // 1. Limpiar el formulario
            setContenido('');
            
            // 2. Notificar al componente padre (FeedPrincipal) para recargar la lista
            refetchPosts();

        } catch (err) {
            console.error('Error al crear la publicación:', err);
            const mensaje = err.response && err.response.data.mensaje 
                ? err.response.data.mensaje 
                : 'Fallo al publicar. Inténtalo de nuevo.';
            setError(mensaje);
        } finally {
            setCargando(false);
        }
    };

    return (
        <div style={styles.container}>
            <form onSubmit={handleSubmit}>
                <textarea
                    placeholder={`¿Qué hay de nuevo, ${usuario?.firstName}?`}
                    value={contenido}
                    onChange={(e) => setContenido(e.target.value)}
                    rows="3"
                    style={styles.textarea}
                    disabled={cargando}
                />
                
                <div style={styles.footer}>
                    {error && <p style={styles.error}>{error}</p>}
                    
                    {/* Elemento espaciador si no hay error para alinear el botón a la derecha */}
                    {!error && <span></span>}

                    <button 
                        type="submit" 
                        disabled={cargando || !contenido.trim()}
                        style={{
                            ...styles.button,
                            // Opacidad visual si está deshabilitado
                            opacity: (cargando || !contenido.trim()) ? 0.6 : 1,
                            cursor: (cargando || !contenido.trim()) ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {cargando ? 'Publicando...' : 'Publicar'}
                    </button>
                </div>
            </form>
        </div>
    );
};

// 2. Estilos NOVATHEME
const styles = {
    container: {
        background: 'var(--nova-white)',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)', // Sombra suave consistente con PostItem
        marginBottom: '20px',
        border: '1px solid rgba(0,0,0,0.05)'
    },
    textarea: {
        width: '100%',
        padding: '12px 15px',
        marginBottom: '15px',
        border: '1px solid #e1e1e1', // Borde gris muy suave
        borderRadius: '8px',
        resize: 'none', // Evita que rompan el diseño
        backgroundColor: '#f9f9f9', // Fondo gris claro para diferenciar del contenedor
        fontSize: '1rem',
        fontFamily: 'inherit',
        outline: 'none',
        boxSizing: 'border-box'
    },
    footer: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    button: {
        padding: '10px 25px',
        background: 'var(--nova-primary)', // Verde Institucional
        color: 'white',
        border: 'none',
        borderRadius: '20px', // Botón redondeado moderno
        fontSize: '0.95rem',
        fontWeight: 'bold',
        transition: 'opacity 0.2s',
        marginLeft: 'auto' // Asegura que se vaya a la derecha
    },
    error: {
        color: 'var(--nova-accent)', // Naranja/Rojo de alerta
        marginBottom: '0',
        fontSize: '0.9em',
        fontWeight: '500'
    }
};

export default CrearPublicacion;