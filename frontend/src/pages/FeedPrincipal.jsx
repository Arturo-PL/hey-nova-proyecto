import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

import PostItem from '../components/PostItem'; 
import CrearPublicacion from '../components/CrearPublicacion'; 
const API_URL = 'https://heyynova-api.onrender.com/api/publicaciones/'; 

const FeedPrincipal = () => {
    const { usuario, cerrarSesion } = useAuth(); 
    const [publicaciones, setPublicaciones] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    const obtenerPublicaciones = async () => {
        if (!usuario || !usuario.token) {
            setCargando(false);
            return;
        }

        try {
            // No reseteamos 'cargando' a true aquí para evitar parpadeos al recargar
            setError(null);

            const config = {
                headers: { Authorization: `Bearer ${usuario.token}` },
            };

            const { data } = await axios.get(API_URL, config);
            setPublicaciones(data.reverse()); // Más recientes primero
            setCargando(false);

        } catch (err) {
            console.error('Error al cargar feed:', err);
            setError('No se pudieron cargar las novedades.');
            setCargando(false);
            if (err.response && err.response.status === 401) {
                cerrarSesion();
            }
        }
    };

    // Cargar al inicio
    useEffect(() => {
        obtenerPublicaciones();
    }, [usuario.token]);

    // ----------------------------------------------------
    // Renderizado (NovaTheme)
    // ----------------------------------------------------
    return (
        <div style={styles.container}>
            {/* Título de la Sección */}
            <div style={styles.pageHeader}>
                <h1 style={styles.title}>Inicio</h1>
                <p style={styles.subtitle}>¿Qué está pasando en NovaUniversitas?</p>
            </div>

            <div style={styles.feedColumn}>
                
                {/* 1. Componente Crear Publicación (Caja moderna) */}
                <div style={styles.createWrapper}>
                    <CrearPublicacion refetchPosts={obtenerPublicaciones} />
                </div>
                
                {/* 2. Lista de Publicaciones */}
                {cargando ? (
                    <p style={styles.loadingText}>Cargando novedades...</p>
                ) : error ? (
                    <div style={styles.errorBox}>{error}</div>
                ) : publicaciones.length === 0 ? (
                    <div style={styles.emptyState}>
                        <p>📭 Aún no hay publicaciones.</p>
                        <p>¡Sé el primero en compartir algo!</p>
                    </div>
                ) : (
                    <div style={styles.postsList}>
                        {publicaciones.map(post => (
                            <PostItem
                                key={post._id}
                                post={post}
                                refetchPosts={obtenerPublicaciones}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// === ESTILOS NOVATHEME ===
const styles = {
    container: {
        maxWidth: '700px', // Ancho estilo Facebook/Twitter
        margin: '0 auto',
        padding: '20px',
        paddingBottom: '80px'
    },
    pageHeader: {
        marginBottom: '20px',
        textAlign: 'center'
    },
    title: {
        color: 'var(--nova-primary)',
        fontSize: '2rem',
        margin: '0 0 5px 0'
    },
    subtitle: {
        color: 'var(--nova-text-muted)',
        margin: 0,
        fontSize: '1rem'
    },
    feedColumn: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
    },
    createWrapper: {
        marginBottom: '10px'
    },
    loadingText: {
        textAlign: 'center',
        color: 'var(--nova-text-muted)',
        marginTop: '20px'
    },
    errorBox: {
        backgroundColor: '#fee2e2',
        color: '#dc2626',
        padding: '15px',
        borderRadius: '8px',
        textAlign: 'center',
        border: '1px solid #fca5a5'
    },
    emptyState: {
        textAlign: 'center',
        padding: '40px',
        color: 'var(--nova-text-muted)',
        backgroundColor: 'rgba(255,255,255,0.5)',
        borderRadius: '12px',
        border: '2px dashed var(--nova-secondary)'
    },
    postsList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
    }
};

export default FeedPrincipal;