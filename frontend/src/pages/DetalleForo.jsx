import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import foroService from '../services/foroServiceT'; 

const DetalleForo = () => {
    const { idForo } = useParams();
    const [hilos, setHilos] = useState([]);
    const [cargando, setCargando] = useState(true);
    
    // Estado para el formulario
    const [mostrarForm, setMostrarForm] = useState(false);
    const [nuevoHilo, setNuevoHilo] = useState({ titulo: '', contenido: '' });

    useEffect(() => {
        cargarHilos();
    }, [idForo]);

    const cargarHilos = async () => {
        try {
            const data = await foroService.obtenerHilos(idForo);
            setHilos(data);
            setCargando(false);
        } catch (error) {
            console.error(error);
            setCargando(false);
        }
    };

    const handleCrearHilo = async (e) => {
        e.preventDefault();
        try {
            await foroService.crearHilo(idForo, nuevoHilo);
            setNuevoHilo({ titulo: '', contenido: '' });
            setMostrarForm(false);
            cargarHilos(); 
            alert('¡Discusión publicada!');
        } catch (error) {
            alert('Error al publicar la discusión');
        }
    };

    return (
        <div style={styles.container}>
            {/* BOTÓN VOLVER */}
            <Link to="/foros" style={styles.backLink}>← Volver a los Foros</Link>
            
            <div style={styles.header}>
                <h1 style={styles.title}>Discusiones del Curso</h1>
                <button 
                    onClick={() => setMostrarForm(!mostrarForm)}
                    style={mostrarForm ? styles.btnCancel : styles.btnAdd}
                >
                    {mostrarForm ? 'Cancelar' : '+ Nueva Discusión'}
                </button>
            </div>

            {/* FORMULARIO PARA CREAR HILO */}
            {mostrarForm && (
                <div style={styles.formCard}>
                    <h3 style={{marginBottom: '15px', color: 'var(--nova-primary)'}}>Publicar nueva duda o tema</h3>
                    <form onSubmit={handleCrearHilo}>
                        <input 
                            type="text" 
                            placeholder="Título (Ej: Duda sobre el examen)" 
                            value={nuevoHilo.titulo}
                            onChange={(e) => setNuevoHilo({...nuevoHilo, titulo: e.target.value})}
                            style={styles.input}
                            required
                        />
                        <textarea 
                            placeholder="Escribe aquí tu pregunta o comentario..." 
                            value={nuevoHilo.contenido}
                            onChange={(e) => setNuevoHilo({...nuevoHilo, contenido: e.target.value})}
                            style={styles.textarea}
                            required
                        />
                        <button type="submit" style={styles.btnSave}>Publicar</button>
                    </form>
                </div>
            )}

            {/* LISTA DE HILOS */}
            {cargando ? <p>Cargando discusiones...</p> : (
                <div style={styles.list}>
                    {hilos.length === 0 && (
                        <div style={styles.emptyState}>
                            <p>Nadie ha publicado nada aún en este foro.</p>
                            <p>¡Sé el primero en participar!</p>
                        </div>
                    )}
                    
                    {hilos.map(hilo => (
                        <div key={hilo._id} style={styles.hiloCard}>
                            <div style={{flex: 1}}>
                                <h3 style={styles.hiloTitle}>{hilo.titulo}</h3>
                                <p style={styles.hiloContent}>{hilo.contenido}</p>
                                <div style={styles.meta}>
                                    <span>Por: <strong>{hilo.autor?.firstName || 'Usuario'}</strong></span>
                                    <span> • {new Date(hilo.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                            
                            {/* Botón de Comentarios (Enlace) */}
                             <Link to={`/foros/hilo/${hilo._id}`} style={{textDecoration: 'none'}}>
                                <button style={styles.btnComment}>
                                    💬 {hilo.comentarios?.length || 0} Comentarios
                                </button>
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// === ESTILOS NOVATHEME ===
const styles = {
    container: { 
        padding: '2rem', 
        maxWidth: '1000px', 
        margin: '0 auto' 
    },
    backLink: { 
        textDecoration: 'none', 
        color: 'var(--nova-text-muted)', 
        marginBottom: '1rem', 
        display: 'inline-block',
        fontSize: '0.9rem',
        fontWeight: '500'
    },
    header: { 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px',
        borderBottom: '1px solid var(--nova-secondary)',
        paddingBottom: '15px'
    },
    title: {
        fontSize: '2rem',
        color: 'var(--nova-primary)',
        margin: 0
    },
    btnAdd: { 
        backgroundColor: 'var(--nova-gold)', // Dorado para acción principal
        color: 'white', 
        border: 'none', 
        padding: '10px 20px', 
        borderRadius: '8px', 
        cursor: 'pointer',
        fontWeight: 'bold',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
    },
    btnCancel: { 
        backgroundColor: 'transparent', 
        color: 'var(--nova-accent)', 
        border: '2px solid var(--nova-accent)', 
        padding: '8px 20px', 
        borderRadius: '8px', 
        cursor: 'pointer',
        fontWeight: 'bold'
    },
    formCard: { 
        backgroundColor: 'var(--nova-white)', 
        padding: '25px', 
        borderRadius: '12px', 
        marginBottom: '25px', 
        boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
        borderLeft: '5px solid var(--nova-gold)' // Detalle dorado para diferenciar
    },
    input: { 
        width: '100%', 
        padding: '12px', 
        marginBottom: '10px', 
        borderRadius: '6px', 
        border: '1px solid #ccc',
        backgroundColor: '#f9f9f9',
        fontSize: '1rem'
    },
    textarea: { 
        width: '100%', 
        padding: '12px', 
        minHeight: '100px', 
        marginBottom: '10px', 
        borderRadius: '6px', 
        border: '1px solid #ccc',
        backgroundColor: '#f9f9f9',
        fontSize: '1rem',
        fontFamily: 'inherit'
    },
    btnSave: { 
        backgroundColor: 'var(--nova-primary)', 
        color: 'white', 
        padding: '10px 25px', 
        border: 'none', 
        borderRadius: '6px', 
        cursor: 'pointer',
        fontWeight: 'bold'
    },
    list: { 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '20px' 
    },
    emptyState: {
        textAlign: 'center',
        padding: '40px',
        color: 'var(--nova-text-muted)',
        fontSize: '1.1rem'
    },
    hiloCard: { 
        backgroundColor: 'var(--nova-white)', // Tarjeta blanca
        padding: '25px', 
        borderRadius: '12px', 
        border: '1px solid rgba(0,0,0,0.05)', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        transition: 'transform 0.2s'
    },
    hiloTitle: { 
        margin: '0 0 8px 0', 
        color: 'var(--nova-text)',
        fontSize: '1.2rem'
    },
    hiloContent: { 
        margin: '0 0 12px 0', 
        color: '#555', 
        fontSize: '1rem',
        lineHeight: '1.5'
    },
    meta: { 
        fontSize: '0.85rem', 
        color: 'var(--nova-text-muted)' 
    },
    btnComment: { 
        background: 'var(--nova-bg)', // Fondo gris suave
        border: 'none', 
        padding: '8px 18px', 
        borderRadius: '20px', 
        cursor: 'pointer', 
        color: 'var(--nova-primary)',
        fontWeight: '600',
        fontSize: '0.9rem',
        transition: 'background-color 0.2s'
    }
};

export default DetalleForo;