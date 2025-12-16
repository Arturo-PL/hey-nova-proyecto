import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import foroService from '../services/foroServiceT';

const DetalleHilo = () => {
    const { idHilo } = useParams();
    const [hilo, setHilo] = useState(null);
    const [nuevoComentario, setNuevoComentario] = useState('');
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        cargarHilo();
    }, [idHilo]);

    const cargarHilo = async () => {
        try {
            const data = await foroService.obtenerHilo(idHilo);
            setHilo(data);
            setCargando(false);
        } catch (error) {
            console.error("Error cargando hilo", error);
            setCargando(false);
        }
    };

    const handleComentar = async (e) => {
        e.preventDefault();
        if (!nuevoComentario.trim()) return;

        try {
            const hiloActualizado = await foroService.crearComentario(idHilo, nuevoComentario);
            setHilo(hiloActualizado); 
            setNuevoComentario('');
        } catch (error) {
            alert('Error al enviar comentario');
        }
    };

    if (cargando) return <div style={{padding: '40px', textAlign: 'center'}}>Cargando conversación...</div>;
    if (!hilo) return <div style={{padding: '40px', textAlign: 'center'}}>No se encontró la discusión.</div>;

    return (
        <div style={styles.container}>
            {/* LINK DE RETORNO */}
            <Link to={`/foros/${hilo.foro}`} style={styles.backLink}>
                ← Volver al Foro
            </Link>

            {/* TARJETA PRINCIPAL (PREGUNTA) */}
            <div style={styles.mainCard}>
                <div style={styles.cardHeader}>
                    <h1 style={styles.title}>{hilo.titulo}</h1>
                    <span style={styles.dateBadge}>
                        {new Date(hilo.createdAt).toLocaleDateString()}
                    </span>
                </div>
                
                <div style={styles.authorInfo}>
                    <span style={styles.avatarPlaceholder}>👤</span>
                    <span>Publicado por <strong>{hilo.autor?.firstName || 'Usuario'}</strong></span>
                </div>

                <hr style={styles.divider}/>
                
                <p style={styles.content}>{hilo.contenido}</p>
            </div>

            {/* SECCIÓN DE RESPUESTAS */}
            <h3 style={styles.sectionTitle}>
                Respuestas <span style={styles.countBadge}>{hilo.comentarios.length}</span>
            </h3>
            
            <div style={styles.commentsList}>
                {hilo.comentarios.length === 0 && (
                    <p style={{color: 'var(--nova-text-muted)', fontStyle: 'italic'}}>
                        Aún no hay respuestas. ¡Ayuda a tu compañero!
                    </p>
                )}

                {hilo.comentarios.map((comentario, index) => (
                    <div key={index} style={styles.commentCard}>
                        <div style={styles.commentHeader}>
                            <strong style={{color: 'var(--nova-primary)'}}>
                                {comentario.usuario?.firstName || 'Usuario'}
                            </strong>
                            <span style={{fontSize: '0.8rem', color: 'var(--nova-text-muted)'}}>
                                {new Date(comentario.fecha).toLocaleDateString()}
                            </span>
                        </div>
                        <p style={{margin: '8px 0', color: 'var(--nova-text)', lineHeight: '1.4'}}>
                            {comentario.texto}
                        </p>
                    </div>
                ))}
            </div>

            {/* INPUT FLOTANTE PARA RESPONDER */}
            <div style={styles.inputArea}>
                <form onSubmit={handleComentar} style={{display: 'flex', gap: '15px'}}>
                    <input 
                        type="text" 
                        value={nuevoComentario}
                        onChange={(e) => setNuevoComentario(e.target.value)}
                        placeholder="Escribe una respuesta constructiva..."
                        style={styles.input}
                        required
                    />
                    <button type="submit" style={styles.btnSend}>Enviar Respuesta</button>
                </form>
            </div>
        </div>
    );
};

// === ESTILOS NOVATHEME ===
const styles = {
    container: { 
        padding: '2rem', 
        maxWidth: '800px', 
        margin: '0 auto',
        paddingBottom: '100px' // Espacio extra para que el input flotante no tape lo último
    },
    backLink: { 
        textDecoration: 'none', 
        color: 'var(--nova-text-muted)', 
        marginBottom: '1.5rem', 
        display: 'inline-block',
        fontWeight: '500',
        transition: 'color 0.2s'
    },
    mainCard: { 
        backgroundColor: 'var(--nova-white)', 
        padding: '30px', 
        borderRadius: '12px', 
        boxShadow: '0 4px 15px rgba(0,0,0,0.05)', 
        marginBottom: '40px',
        borderTop: '5px solid var(--nova-primary)' // Detalle verde institucional arriba
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'start',
        marginBottom: '15px'
    },
    title: { 
        marginTop: 0, 
        color: 'var(--nova-primary)',
        fontSize: '1.8rem',
        marginBottom: '0'
    },
    dateBadge: {
        backgroundColor: '#f0f2f5',
        padding: '4px 10px',
        borderRadius: '10px',
        fontSize: '0.8rem',
        color: 'var(--nova-text-muted)'
    },
    authorInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        color: 'var(--nova-text)',
        fontSize: '0.95rem'
    },
    avatarPlaceholder: {
        fontSize: '1.2rem'
    },
    divider: {
        margin: '20px 0', 
        border: '0', 
        borderTop: '1px solid #eee'
    },
    content: { 
        fontSize: '1.1rem', 
        lineHeight: '1.7', 
        color: 'var(--nova-text)' 
    },
    sectionTitle: {
        color: 'var(--nova-text)',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
    },
    countBadge: {
        backgroundColor: 'var(--nova-gold)',
        color: 'white',
        padding: '2px 8px',
        borderRadius: '12px',
        fontSize: '0.8rem'
    },
    commentsList: { 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '15px'
    },
    commentCard: { 
        backgroundColor: 'var(--nova-white)', // Burbuja blanca
        padding: '20px', 
        borderRadius: '12px', 
        borderLeft: '4px solid var(--nova-secondary)', // Borde lateral verde suave
        boxShadow: '0 2px 5px rgba(0,0,0,0.03)'
    },
    commentHeader: { 
        display: 'flex', 
        justifyContent: 'space-between', 
        marginBottom: '8px',
        borderBottom: '1px solid #f0f0f0',
        paddingBottom: '8px'
    },
    inputArea: { 
        position: 'fixed', 
        bottom: '20px', 
        left: '50%',
        transform: 'translateX(-50%)',
        width: '90%',
        maxWidth: '800px',
        backgroundColor: 'var(--nova-white)', 
        padding: '15px', 
        borderRadius: '12px', 
        boxShadow: '0 5px 20px rgba(0,0,0,0.15)',
        border: '1px solid #eee',
        zIndex: 100
    },
    input: { 
        flex: 1, 
        padding: '12px 15px', 
        borderRadius: '25px', 
        border: '1px solid #ccc', 
        fontSize: '1rem',
        outline: 'none',
        backgroundColor: '#f8f9fa'
    },
    btnSend: { 
        backgroundColor: 'var(--nova-primary)', 
        color: 'white', 
        border: 'none', 
        padding: '0 25px', 
        borderRadius: '25px', 
        cursor: 'pointer', 
        fontWeight: 'bold',
        transition: 'transform 0.1s'
    }
};

export default DetalleHilo;

