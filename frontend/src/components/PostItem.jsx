import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ComentariosList from './ComentariosList'; 

const REACCION_API_URL = 'https://heyynova-api.onrender.com/api/publicaciones/reaccion/';
const POSTS_API_BASE_URL = 'https://heyynova-api.onrender.com/api/publicaciones/'; 

const PostItem = ({ post, refetchPosts }) => {
    const { usuario } = useAuth();
    
    // Verificación de propiedad
    const esMiPublicacion = usuario && post.usuario && usuario._id === post.usuario._id; 
    
    // Estados
    const [mostrarComentarios, setMostrarComentarios] = useState(false);
    const [reaccionesLocales, setReaccionesLocales] = useState(post.reacciones || []);
    const [numReacciones, setNumReacciones] = useState(post.numReacciones || 0);
    const [cargandoReaccion, setCargandoReaccion] = useState(false);
    const [eliminando, setEliminando] = useState(false);
    const [errorEliminar, setErrorEliminar] = useState(null);

    // Lógica de Reacción
    const miReaccion = reaccionesLocales.find(r => r.usuario === usuario._id);
    const tipoReaccionActual = miReaccion ? miReaccion.tipo : null;

    const handleCommentClick = () => setMostrarComentarios(prev => !prev);

    // Lógica de Eliminación
    const handleEliminar = async () => {
        if (!window.confirm('¿Seguro que quieres borrar esta publicación?')) return;

        setEliminando(true);
        try {
            const config = { headers: { Authorization: `Bearer ${usuario.token}` } };
            await axios.delete(`${POSTS_API_BASE_URL}${post._id}`, config);
            refetchPosts(); 
        } catch (err) {
            setErrorEliminar('No se pudo eliminar.');
        } finally {
            setEliminando(false);
        }
    };
    
    // Lógica de Like
    const manejarReaccion = async (tipoReaccion) => {
        if (!usuario || cargandoReaccion) return;
        setCargandoReaccion(true);
        try {
            const config = {
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${usuario.token}` 
                }
            };
            const { data } = await axios.put(
                `${REACCION_API_URL}${post._id}`,
                { tipoReaccion },
                config
            );
            setReaccionesLocales(data.reacciones);
            setNumReacciones(data.numReacciones);
        } catch (err) {
            console.error(err);
        } finally {
            setCargandoReaccion(false);
        }
    };

    const handleLikeClick = () => manejarReaccion('like'); 
    
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-MX', { 
            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div style={styles.card}>
            {/* ENCABEZADO */}
            <div style={styles.header}>
                <div style={styles.avatarPlaceholder}>
                    {post.usuario.firstName?.charAt(0) || 'U'}
                </div>
                <div style={styles.userInfo}>
                    <strong style={styles.userName}>
                        {post.usuario.firstName} {post.usuario.lastName}
                    </strong>
                    <div style={styles.metaData}>
                        <span style={styles.roleBadge}>{post.rolAutor || 'Estudiante'}</span>
                        <span style={styles.dot}>•</span>
                        <span>{formatDate(post.createdAt)}</span>
                    </div>
                </div>
                
                {/* Botón Eliminar (Solo dueño) */}
                {esMiPublicacion && (
                    <button 
                        onClick={handleEliminar} 
                        style={styles.deleteBtn}
                        disabled={eliminando}
                        title="Eliminar publicación"
                    >
                        {eliminando ? '...' : '🗑️'}
                    </button>
                )}
            </div>

            {/* CONTENIDO */}
            <div style={styles.content}>
                <p>{post.contenido}</p>
            </div>
            
            {errorEliminar && <p style={styles.errorMsg}>{errorEliminar}</p>}

            {/* BARRA DE ACCIONES */}
            <div style={styles.actionsBar}>
                <button 
                    onClick={handleLikeClick} 
                    style={{
                        ...styles.actionBtn,
                        ...(tipoReaccionActual === 'like' ? styles.activeLike : {})
                    }}
                    disabled={cargandoReaccion}
                >
                    {tipoReaccionActual === 'like' ? '❤️' : '🤍'} 
                    <span style={{marginLeft: '5px'}}>
                        {numReacciones > 0 ? numReacciones : 'Me gusta'}
                    </span>
                </button>

                <button 
                    onClick={handleCommentClick}
                    style={{
                        ...styles.actionBtn,
                        ...(mostrarComentarios ? styles.activeComment : {})
                    }}
                >
                    💬 <span style={{marginLeft: '5px'}}>Comentar</span>
                </button>
            </div>
            
            {/* SECCIÓN DE COMENTARIOS (Desplegable) */}
            {mostrarComentarios && (
                <div style={styles.commentsSection}>
                    <ComentariosList postId={post._id} />
                </div>
            )}
        </div>
    );
};

// === ESTILOS NOVATHEME ===
const styles = {
    card: {
        backgroundColor: 'var(--nova-white)',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)', // Sombra suave
        border: '1px solid rgba(0,0,0,0.05)',
        transition: 'transform 0.2s',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '15px'
    },
    avatarPlaceholder: {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        backgroundColor: 'var(--nova-secondary)', // Verde suave
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        marginRight: '12px',
        fontSize: '1.2rem'
    },
    userInfo: {
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1
    },
    userName: {
        color: 'var(--nova-text)',
        fontSize: '1rem'
    },
    metaData: {
        fontSize: '0.8rem',
        color: 'var(--nova-text-muted)',
        display: 'flex',
        alignItems: 'center',
        gap: '5px'
    },
    roleBadge: {
        backgroundColor: '#f0f2f5',
        padding: '2px 6px',
        borderRadius: '4px',
        fontSize: '0.75rem',
        fontWeight: '600',
        textTransform: 'uppercase',
        color: 'var(--nova-text)'
    },
    dot: { color: '#ccc' },
    deleteBtn: {
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        fontSize: '1.2rem',
        opacity: 0.6,
        transition: 'opacity 0.2s',
        padding: '5px'
    },
    content: {
        fontSize: '1rem',
        lineHeight: '1.5',
        color: 'var(--nova-text)',
        marginBottom: '15px',
        whiteSpace: 'pre-line' // Respeta los saltos de línea
    },
    errorMsg: {
        color: 'var(--nova-accent)',
        fontSize: '0.9rem',
        marginBottom: '10px'
    },
    actionsBar: {
        display: 'flex',
        borderTop: '1px solid #f0f2f5',
        paddingTop: '10px',
        gap: '10px'
    },
    actionBtn: {
        flex: 1, // Ocupan el mismo ancho
        background: 'transparent',
        border: 'none',
        padding: '8px',
        borderRadius: '6px',
        color: 'var(--nova-text-muted)',
        fontWeight: '600',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.95rem',
        transition: 'background-color 0.2s'
    },
    activeLike: {
        color: 'var(--nova-accent)', // Naranja/Rojo al dar like
        backgroundColor: '#fff5f5'
    },
    activeComment: {
        color: 'var(--nova-primary)',
        backgroundColor: '#f0fdf4'
    },
    commentsSection: {
        marginTop: '15px',
        borderTop: '1px solid #f0f2f5',
        paddingTop: '15px'
    }
};

export default PostItem;