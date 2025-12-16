import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = 'https://heyynova-api.onrender.com/api/perfiles/yo'; 

const PerfilUsuario = () => {
    const { usuario, setUsuario } = useAuth(); 
    
    const [perfil, setPerfil] = useState(null);
    const [formData, setFormData] = useState({});
    const [cargando, setCargando] = useState(true);
    const [editando, setEditando] = useState(false);
    const [error, setError] = useState(null);
    const [mensajeExito, setMensajeExito] = useState(null);

    const obtenerPerfil = async () => {
        if (!usuario || !usuario.token) return;

        setCargando(true);
        setError(null);

        try {
            const config = {
                headers: { Authorization: `Bearer ${usuario.token}` },
            };

            const { data } = await axios.get(API_URL, config);
            
            setPerfil(data);
            setFormData({
                firstName: data.firstName || '',
                lastName: data.lastName || '',
                email: data.email || '',
                carrera: data.carrera || '',
                semestre: data.semestre || '',
                // bio: data.bio || '',  <-- ELIMINADO
            });
        } catch (err) {
            console.error('Error al cargar el perfil:', err);
            setError('No se pudo cargar la información del perfil.');
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        obtenerPerfil();
    }, [usuario]); 

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setMensajeExito(null);
        setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setCargando(true);
        setMensajeExito(null);
        setError(null);
        
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${usuario.token}`,
                },
            };

            const datosEditables = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                carrera: formData.carrera,
                semestre: formData.semestre,
                // bio: formData.bio, <-- ELIMINADO
            };

            const { data } = await axios.put(API_URL, datosEditables, config);
            
            setPerfil(data.perfil);
            
            const usuarioActualizado = {
                ...usuario,
                firstName: data.perfil.firstName,
                lastName: data.perfil.lastName,
                token: usuario.token 
            };

            setUsuario(usuarioActualizado); 
            localStorage.setItem('usuarioInfo', JSON.stringify(usuarioActualizado)); 

            setEditando(false);
            setMensajeExito('Perfil actualizado exitosamente.');

        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Fallo al guardar los cambios.');
        } finally {
            setCargando(false);
        }
    };
    
    if (cargando && !perfil) return <div style={styles.loading}>Cargando perfil...</div>;
    if (error && !perfil) return <div style={styles.errorContainer}>{error}</div>;
    if (!perfil) return <div style={styles.errorContainer}>Perfil no disponible.</div>;

    return (
        <div style={styles.container}>
             <div style={styles.card}>
                <div style={styles.header}>
                    <div style={styles.avatar}>
                        {perfil.firstName.charAt(0)}
                    </div>
                    <div>
                        <h1 style={styles.title}>{perfil.firstName} {perfil.lastName}</h1>
                        <span style={styles.roleBadge}>{perfil.rol}</span>
                    </div>
                </div>
                
                {mensajeExito && <div style={styles.successMsg}>{mensajeExito}</div>}

                <div style={styles.actions}>
                    <button 
                        onClick={() => {
                            setEditando(!editando);
                            setError(null);
                            setMensajeExito(null);
                            if (editando) obtenerPerfil(); 
                        }} 
                        style={editando ? styles.cancelBtn : styles.editBtn}
                    >
                        {editando ? 'Cancelar' : '✏️ Editar Perfil'}
                    </button>
                </div>

                {editando ? (
                    <form onSubmit={handleSubmit} style={styles.form}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Nombre</label>
                            <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required style={styles.input} />
                        </div>
                        
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Apellido</label>
                            <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required style={styles.input} />
                        </div>
                        
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Email</label>
                            <input type="email" name="email" value={formData.email} readOnly disabled style={{...styles.input, backgroundColor: '#f0f0f0', cursor: 'not-allowed'}} />
                        </div>

                        {/* SECCIÓN DE BIOGRAFÍA ELIMINADA AQUÍ */}
                        
                        {perfil.rol === 'estudiante' && (
                            <>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Carrera</label>
                                    <input type="text" name="carrera" value={formData.carrera} onChange={handleChange} style={styles.input} />
                                </div>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Semestre</label>
                                    <input type="number" name="semestre" value={formData.semestre} onChange={handleChange} style={styles.input} />
                                </div>
                            </>
                        )}
                        
                        {error && <p style={styles.errorText}>{error}</p>}
                        
                        <button type="submit" disabled={cargando} style={styles.saveBtn}>
                            {cargando ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </form>

                ) : (
                    <div style={styles.viewMode}>
                        <div style={styles.infoRow}>
                            <span style={styles.infoLabel}>Email</span>
                            <span style={styles.infoValue}>{perfil.email}</span>
                        </div>
                        <div style={styles.infoRow}>
                            <span style={styles.infoLabel}>Usuario</span>
                            <span style={styles.infoValue}>@{perfil.username}</span>
                        </div>
                        
                        {perfil.rol === 'estudiante' && (
                            <>
                                <div style={styles.infoRow}>
                                    <span style={styles.infoLabel}>Carrera</span>
                                    <span style={styles.infoValue}>{perfil.carrera || 'No especificada'}</span>
                                </div>
                                <div style={styles.infoRow}>
                                    <span style={styles.infoLabel}>Semestre</span>
                                    <span style={styles.infoValue}>{perfil.semestre || 'N/A'}</span>
                                </div>
                            </>
                        )}
                        
                        {/* SECCIÓN DE BIOGRAFÍA ELIMINADA AQUÍ TAMBIÉN */}
                    </div>
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
        display: 'flex', 
        justifyContent: 'center', 
        padding: '40px 20px', 
        minHeight: 'calc(100vh - 80px)' 
    },
    card: { 
        maxWidth: '600px', 
        width: '100%', 
        padding: '40px', 
        backgroundColor: 'var(--nova-white)', 
        borderRadius: '16px', 
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
        border: '1px solid rgba(0,0,0,0.02)'
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        marginBottom: '30px',
        paddingBottom: '20px',
        borderBottom: '1px solid #f0f0f0'
    },
    avatar: {
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        backgroundColor: 'var(--nova-primary)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '2.5rem',
        fontWeight: 'bold'
    },
    title: {
        margin: 0,
        color: 'var(--nova-text)',
        fontSize: '1.8rem'
    },
    roleBadge: {
        display: 'inline-block',
        backgroundColor: 'var(--nova-gold)',
        color: 'white',
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '0.8rem',
        marginTop: '5px',
        textTransform: 'uppercase',
        fontWeight: 'bold'
    },
    actions: {
        marginBottom: '20px',
        textAlign: 'right'
    },
    editBtn: { 
        padding: '10px 20px', 
        background: 'var(--nova-secondary)', 
        color: 'white', 
        border: 'none', 
        borderRadius: '8px', 
        cursor: 'pointer', 
        fontWeight: 'bold' 
    },
    cancelBtn: { 
        padding: '10px 20px', 
        background: 'transparent', 
        color: 'var(--nova-text-muted)', 
        border: '1px solid var(--nova-text-muted)', 
        borderRadius: '8px', 
        cursor: 'pointer', 
        fontWeight: 'bold' 
    },
    saveBtn: { 
        width: '100%',
        padding: '12px', 
        background: 'var(--nova-primary)', 
        color: 'white', 
        border: 'none', 
        borderRadius: '8px', 
        cursor: 'pointer', 
        marginTop: '20px', 
        fontWeight: 'bold',
        fontSize: '1rem'
    },
    form: { display: 'flex', flexDirection: 'column', gap: '15px' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '5px' },
    label: { fontWeight: '600', color: 'var(--nova-text)', fontSize: '0.9rem' },
    input: { padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' },
    
    viewMode: { padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '12px' },
    infoRow: { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' },
    infoLabel: { fontWeight: '600', color: 'var(--nova-text-muted)' },
    infoValue: { color: 'var(--nova-text)', fontWeight: '500' },
    
    successMsg: { color: '#155724', backgroundColor: '#d4edda', padding: '10px', borderRadius: '5px', marginBottom: '20px', textAlign: 'center' },
    errorText: { color: 'var(--nova-accent)', textAlign: 'center' },
    loading: { textAlign: 'center', padding: '50px', color: 'var(--nova-text-muted)' },
    errorContainer: { textAlign: 'center', padding: '50px', color: 'var(--nova-accent)' }
};

export default PerfilUsuario;