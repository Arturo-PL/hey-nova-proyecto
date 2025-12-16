import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = 'https://heyynova-api.onrender.com/api/publicaciones/';

/**
 * @param {string} postId - El ID de la publicación.
 * @param {function} onComentarioCreado - Función para recargar la lista de comentarios.
 */
const CrearComentario = ({ postId, onComentarioCreado }) => {
    const { usuario } = useAuth();
    const [contenido, setContenido] = useState('');
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!contenido.trim()) {
            setError('El comentario no puede estar vacío.');
            return;
        }

        if (!usuario || !usuario.token) {
            setError('Debes iniciar sesión para comentar.');
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

            // URL y Body intactos según tu lógica
            const url = `${API_BASE_URL}comentario/${postId}`;
            await axios.post(url, { texto: contenido }, config);

            setContenido('');
            onComentarioCreado();

        } catch (err) {
            console.error('Error al crear el comentario:', err);
            const mensaje = err.response?.data?.mensaje || 'Fallo al publicar el comentario.';
            setError(mensaje);
        } finally {
            setCargando(false);
        }
    };

    return (
        <div style={styles.container}>
            <form onSubmit={handleSubmit} style={styles.form}>
                <textarea
                    placeholder="Escribe una respuesta..."
                    value={contenido}
                    onChange={(e) => setContenido(e.target.value)}
                    rows="2"
                    style={styles.textarea}
                    disabled={cargando}
                />
                
                <div style={styles.footer}>
                    {error ? (
                        <p style={styles.error}>{error}</p>
                    ) : (
                        <span></span> // Espaciador
                    )}
                    
                    <button 
                        type="submit" 
                        disabled={cargando || !contenido.trim()}
                        style={{
                            ...styles.button,
                            opacity: (cargando || !contenido.trim()) ? 0.6 : 1,
                            cursor: (cargando || !contenido.trim()) ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {cargando ? 'Enviando...' : 'Comentar'}
                    </button>
                </div>
            </form>
        </div>
    );
};

// ==========================================
// ESTILOS NOVATHEME
// ==========================================
const styles = {
    container: {
        marginTop: '15px',
        padding: '15px',
        borderRadius: '12px',
        backgroundColor: '#f8f9fa', // Fondo muy suave para diferenciar el área de input
        border: '1px solid rgba(0,0,0,0.05)'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
    },
    textarea: {
        width: '100%',
        padding: '10px 12px',
        marginBottom: '10px',
        border: '1px solid #e1e1e1', // Borde sutil
        borderRadius: '8px',
        resize: 'none', // Evita romper el diseño
        boxSizing: 'border-box',
        fontFamily: 'inherit',
        fontSize: '0.95rem',
        backgroundColor: 'var(--nova-white)',
        outline: 'none'
    },
    footer: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    button: {
        padding: '6px 18px',
        background: 'var(--nova-primary)', // Verde Institucional
        color: 'white',
        border: 'none',
        borderRadius: '20px', // Botón redondeado moderno
        cursor: 'pointer',
        fontSize: '0.9rem',
        fontWeight: 'bold',
        transition: 'opacity 0.2s'
    },
    error: {
        color: 'var(--nova-accent)', // Naranja/Rojo de alerta
        fontSize: '0.85rem',
        margin: 0,
        fontWeight: '500'
    }
};

export default CrearComentario;