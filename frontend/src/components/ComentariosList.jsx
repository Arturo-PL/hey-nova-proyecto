import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import CrearComentario from './CrearComentario'; 

const API_BASE_URL = 'https://heyynova-api.onrender.com/api/publicaciones/'; 

/**
 * @param {string} postId - El ID de la publicación.
 */
const ComentariosList = ({ postId }) => {
    const { usuario } = useAuth();
    const [comentarios, setComentarios] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    // ----------------------------------------------------
    // Obtener Comentarios
    // ----------------------------------------------------
    const obtenerComentarios = async () => {
        if (!usuario || !usuario.token) return;

        setCargando(true);
        setError(null);
        
        try {
            const config = {
                headers: { Authorization: `Bearer ${usuario.token}` },
            };
            
            // Obtenemos la publicación completa para sacar sus comentarios
            const url = `${API_BASE_URL}${postId}`;
            const { data } = await axios.get(url, config);
            
            setComentarios(data.comentarios || []); 

        } catch (err) {
            console.error('Error al cargar comentarios:', err);
            setError('No se pudieron cargar los comentarios.');
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        obtenerComentarios();
    }, [postId, usuario.token]);

    const formatFecha = (fecha) => {
        return new Date(fecha).toLocaleString('es-MX', { 
            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
        });
    };

    // ----------------------------------------------------
    // Renderizado NovaTheme
    // ----------------------------------------------------
    return (
        <div style={styles.container}>
            {/* Formulario arriba (Estilo Twitter/Facebook) */}
            <CrearComentario postId={postId} onComentarioCreado={obtenerComentarios} />

            <div style={styles.headerTitle}>
                Comentarios <span style={styles.badge}>{comentarios.length}</span>
            </div>

            {cargando && <p style={styles.loading}>Cargando conversación...</p>}
            {error && <p style={styles.error}>{error}</p>}

            <div style={styles.list}>
                {comentarios.length > 0 ? (
                    comentarios.map((comentario) => (
                        <div key={comentario._id} style={styles.commentItem}>
                            <div style={styles.commentHeader}>
                                <strong style={styles.commentAuthor}>
                                    {comentario.usuario?.firstName} {comentario.usuario?.lastName}
                                </strong>
                                <span style={styles.commentDate}>
                                    {formatFecha(comentario.createdAt || comentario.fecha)}
                                </span>
                            </div>
                            <p style={styles.commentContent}>{comentario.texto}</p>
                        </div>
                    ))
                ) : (
                    !cargando && (
                        <div style={styles.emptyState}>
                            Sé el primero en opinar.
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

// ==========================================
// ESTILOS NOVATHEME
// ==========================================
const styles = {
    container: {
        marginTop: '10px',
        paddingTop: '10px',
        borderTop: '1px solid rgba(0,0,0,0.05)', // Separador muy sutil
    },
    headerTitle: {
        fontSize: '0.9rem',
        color: 'var(--nova-text-muted)',
        fontWeight: '600',
        marginBottom: '15px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    },
    badge: {
        backgroundColor: 'var(--nova-secondary)', // Verde suave
        color: 'white',
        padding: '2px 8px',
        borderRadius: '10px',
        fontSize: '0.75rem'
    },
    list: {
        marginTop: '10px',
        maxHeight: '400px', // Altura máxima con scroll si son muchos
        overflowY: 'auto',
        paddingRight: '5px' // Espacio para el scroll
    },
    commentItem: {
        padding: '12px 15px',
        borderLeft: '4px solid var(--nova-secondary)', // Borde lateral verde suave
        background: '#fbfbfb', // Fondo casi blanco para diferenciar del post
        borderRadius: '0 8px 8px 0', // Bordes redondeados solo a la derecha
        marginBottom: '12px',
        transition: 'background-color 0.2s'
    },
    commentHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: '6px',
    },
    commentAuthor: {
        fontSize: '0.95rem',
        color: 'var(--nova-primary)', // Nombre en Verde Institucional
        fontWeight: '700'
    },
    commentDate: {
        fontSize: '0.75rem',
        color: 'var(--nova-text-muted)',
    },
    commentContent: {
        margin: 0,
        fontSize: '0.95rem',
        lineHeight: '1.5',
        color: 'var(--nova-text)',
        whiteSpace: 'pre-line'
    },
    loading: {
        color: 'var(--nova-text-muted)',
        textAlign: 'center',
        fontStyle: 'italic',
        fontSize: '0.9rem'
    },
    error: {
        color: 'var(--nova-accent)',
        textAlign: 'center',
        fontSize: '0.9rem'
    },
    emptyState: {
        color: 'var(--nova-text-muted)',
        textAlign: 'center',
        fontStyle: 'italic',
        marginTop: '20px',
        fontSize: '0.9rem'
    }
};

export default ComentariosList;