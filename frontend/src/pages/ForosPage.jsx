import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import foroService from '../services/foroServiceT'; 

const ForosPage = () => {
    const [foros, setForos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    
    // Estados para el formulario
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [nuevoForo, setNuevoForo] = useState({ 
        titulo: '', 
        descripcion: '', 
        categoria: 'General' 
    });

    // 2. VERIFICACIÓN DE ROL
    const usuarioAlmacenado = localStorage.getItem('usuarioInfo');
    const usuarioObj = usuarioAlmacenado ? JSON.parse(usuarioAlmacenado) : null;
    const esDocente = usuarioObj?.rol === 'docente' || usuarioObj?.rol === 'admin';

    // 3. CARGAR FOROS
    useEffect(() => {
        cargarForos();
    }, []);

    const cargarForos = async () => {
        try {
            const data = await foroService.obtenerForos();
            setForos(data);
            setCargando(false);
        } catch (err) {
            console.error(err);
            setError('Error al cargar los foros.');
            setCargando(false);
        }
    };

    // 4. CREAR FORO
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await foroService.crearForo(nuevoForo);
            alert('¡Foro creado exitosamente!');
            setMostrarFormulario(false);
            setNuevoForo({ titulo: '', descripcion: '', categoria: 'General' });
            cargarForos(); 
        } catch (err) {
            alert('Error al crear el foro.');
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>Foros de Clase</h1>
                    <p style={styles.subtitle}>Espacios de discusión y dudas académicas</p>
                </div>
                
                {esDocente && (
                    <button 
                        onClick={() => setMostrarFormulario(!mostrarFormulario)}
                        style={mostrarFormulario ? styles.btnCancel : styles.btnAdd}
                    >
                        {mostrarFormulario ? 'Cancelar' : '+ Crear Nuevo Foro'}
                    </button>
                )}
            </div>

            {/* FORMULARIO DE CREACIÓN */}
            {mostrarFormulario && (
                <div style={styles.formContainer}>
                    <h3 style={{marginBottom: '15px', color: 'var(--nova-primary)'}}>Crear Nueva Sala</h3>
                    <form onSubmit={handleSubmit}>
                        <div style={styles.inputGroup}>
                            <label style={{fontWeight: 'bold'}}>Título:</label>
                            <input 
                                type="text" 
                                style={styles.input}
                                value={nuevoForo.titulo}
                                onChange={(e) => setNuevoForo({...nuevoForo, titulo: e.target.value})}
                                required
                                placeholder="Ej: Matemáticas Discretas"
                            />
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={{fontWeight: 'bold'}}>Descripción:</label>
                            <textarea 
                                style={styles.textarea}
                                value={nuevoForo.descripcion}
                                onChange={(e) => setNuevoForo({...nuevoForo, descripcion: e.target.value})}
                                required
                                placeholder="¿De qué trata este foro?"
                            />
                        </div>
                        <button type="submit" style={styles.btnSave}>Guardar Foro</button>
                    </form>
                </div>
            )}

            {cargando && <p>Cargando espacios...</p>}
            {error && <p style={{color: 'var(--nova-accent)'}}>{error}</p>}

            {/* GRID DE TARJETAS */}
            <div style={styles.grid}>
                {!cargando && foros.length === 0 && <p>No hay foros creados aún.</p>}
                
                {foros.map((foro) => (
                    <div key={foro._id} style={styles.card}>
                        <div style={styles.cardHeader}>
                            <h2 style={styles.cardTitle}>{foro.titulo}</h2>
                            <span style={styles.badge}>{foro.categoria}</span>
                        </div>
                        <p style={styles.cardDesc}>{foro.descripcion}</p>
                        
                        <div style={styles.cardFooter}>
                            <small style={{color: 'var(--nova-text-muted)'}}>
                                Prof: {foro.creador?.firstName || 'Docente'}
                            </small>
                            <Link to={`/foros/${foro._id}`} style={styles.linkBtn}>
                                Entrar →
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// === ESTILOS NOVATHEME (Variables CSS) ===
const styles = {
    container: {
        padding: '2rem',
        maxWidth: '1200px',
        margin: '0 auto',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        borderBottom: '2px solid var(--nova-secondary)', // Línea suave color salvia
        paddingBottom: '1rem'
    },
    title: { 
        margin: 0, 
        color: 'var(--nova-primary)', // Verde Institucional
        fontSize: '2rem'
    },
    subtitle: { 
        margin: 0, 
        color: 'var(--nova-text-muted)' 
    },
    btnAdd: {
        backgroundColor: 'var(--nova-gold)', // Dorado para destacar la acción
        color: 'white',
        border: 'none',
        padding: '10px 25px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: 'bold',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    },
    btnCancel: {
        backgroundColor: 'transparent',
        color: 'var(--nova-accent)', // Naranja de alerta
        border: '2px solid var(--nova-accent)',
        padding: '8px 20px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: 'bold'
    },
    formContainer: {
        backgroundColor: 'var(--nova-white)', // Blanco puro
        padding: '25px',
        borderRadius: '12px',
        marginBottom: '2rem',
        boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
        borderLeft: '5px solid var(--nova-primary)' // Acento verde a la izquierda
    },
    inputGroup: { marginBottom: '15px' },
    input: {
        width: '100%',
        padding: '12px',
        borderRadius: '6px',
        border: '1px solid #ccc',
        marginTop: '5px',
        fontSize: '1rem',
        backgroundColor: '#f9f9f9'
    },
    textarea: {
        width: '100%',
        padding: '12px',
        borderRadius: '6px',
        border: '1px solid #ccc',
        marginTop: '5px',
        minHeight: '80px',
        fontSize: '1rem',
        fontFamily: 'inherit',
        backgroundColor: '#f9f9f9'
    },
    btnSave: {
        backgroundColor: 'var(--nova-primary)', // Verde para guardar
        color: 'white',
        border: 'none',
        padding: '12px 30px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: '1rem'
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '25px'
    },
    card: {
        backgroundColor: 'var(--nova-white)', // Tarjeta blanca sobre fondo gris
        borderRadius: '12px',
        padding: '25px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'transform 0.2s, box-shadow 0.2s',
        border: '1px solid rgba(0,0,0,0.05)'
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'start',
        marginBottom: '15px'
    },
    cardTitle: { 
        fontSize: '1.3rem', 
        margin: 0, 
        color: 'var(--nova-text)',
        fontWeight: 'bold'
    },
    badge: {
        backgroundColor: 'var(--nova-secondary)', // Verde suave para categoría
        color: 'white',
        fontSize: '0.75rem',
        padding: '4px 10px',
        borderRadius: '12px',
        fontWeight: 'bold',
        textTransform: 'uppercase'
    },
    cardDesc: { 
        color: 'var(--nova-text)', 
        fontSize: '0.95rem', 
        lineHeight: '1.5',
        marginBottom: '20px' 
    },
    cardFooter: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 'auto',
        borderTop: '1px solid #eee',
        paddingTop: '15px'
    },
    linkBtn: {
        textDecoration: 'none',
        color: 'var(--nova-primary)',
        fontWeight: 'bold',
        border: '2px solid var(--nova-primary)',
        padding: '5px 15px',
        borderRadius: '20px',
        transition: 'all 0.2s',
        fontSize: '0.9rem'
    }
};

export default ForosPage;