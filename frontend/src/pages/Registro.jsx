import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Registro = () => {
    // 1. Estados Locales
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        rol: 'estudiante', 
        carrera: '',
        semestre: '',
    });

    const [error, setError] = useState(null);
    const [cargando, setCargando] = useState(false);

    // 2. Hooks
    const { usuario, registrarUsuario } = useAuth();
    const navigate = useNavigate();

    // 3. Redirección si ya está logueado
    useEffect(() => {
        if (usuario) {
            navigate('/feed'); 
        }
    }, [usuario, navigate]);

    // 4. Manejo de Cambios
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setError(null);
    };

    // 5. Manejo del Submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        
        if (formData.rol === 'estudiante' && !formData.carrera) {
            setError('La carrera es obligatoria para estudiantes.');
            return;
        }

        setCargando(true);

        const datosAEnviar = { ...formData };
        if (datosAEnviar.rol !== 'estudiante') {
            delete datosAEnviar.carrera;
            delete datosAEnviar.semestre;
        }
        
        const resultado = await registrarUsuario(datosAEnviar);
        setCargando(false);

        if (!resultado.success) {
            setError(resultado.error);
        }
    };

    return (
        <div style={styles.pageContainer}>
            <div style={styles.card}>
                <div style={styles.header}>
                    <h1 style={styles.logo}>heyNova!</h1>
                    <h2 style={styles.subtitle}>Crea tu cuenta universitaria</h2>
                </div>
                
                {error && <div style={styles.errorAlert}>{error}</div>}
                
                <form onSubmit={handleSubmit} style={styles.form}>
                    
                    {/* Fila de Nombre y Apellido */}
                    <div style={styles.row}>
                        <div style={styles.inputGroup}>
                            <label htmlFor="firstName" style={styles.label}>Nombre</label>
                            <input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required style={styles.input} />
                        </div>
                        <div style={styles.inputGroup}>
                            <label htmlFor="lastName" style={styles.label}>Apellido</label>
                            <input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required style={styles.input} />
                        </div>
                    </div>

                    {/* Usuario y Email */}
                    <div style={styles.inputGroup}>
                        <label htmlFor="username" style={styles.label}>Nombre de Usuario</label>
                        <input type="text" id="username" name="username" value={formData.username} onChange={handleChange} required style={styles.input} />
                    </div>
                    <div style={styles.inputGroup}>
                        <label htmlFor="email" style={styles.label}>Correo Electrónico</label>
                        <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required style={styles.input} placeholder="ejemplo@nova.edu.mx" />
                    </div>
                    
                    {/* Contraseña */}
                    <div style={styles.inputGroup}>
                        <label htmlFor="password" style={styles.label}>Contraseña</label>
                        <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required minLength="6" style={styles.input} placeholder="Mínimo 6 caracteres" />
                    </div>

                    {/* Selección de Rol */}
                    <div style={styles.inputGroup}>
                        <label htmlFor="rol" style={styles.label}>Soy un:</label>
                        <select id="rol" name="rol" value={formData.rol} onChange={handleChange} style={styles.select}>
                            <option value="estudiante">Estudiante</option>
                            <option value="docente">Docente</option>
                        </select>
                    </div>

                    {/* Campos Condicionales (Solo Estudiantes) */}
                    {formData.rol === 'estudiante' && (
                        <div style={styles.academicSection}>
                            <p style={styles.sectionTitle}>Información Académica</p>
                            <div style={styles.inputGroup}>
                                <label htmlFor="carrera" style={styles.label}>Carrera</label>
                                <input type="text" id="carrera" name="carrera" value={formData.carrera} onChange={handleChange} required style={styles.input} />
                            </div>
                            <div style={styles.inputGroup}>
                                <label htmlFor="semestre" style={styles.label}>Semestre</label>
                                <input type="text" id="semestre" name="semestre" value={formData.semestre} onChange={handleChange} style={styles.input} />
                            </div>
                        </div>
                    )}
                    
                    <button 
                        type="submit" 
                        disabled={cargando} 
                        style={{
                            ...styles.button,
                            opacity: cargando ? 0.7 : 1,
                            cursor: cargando ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {cargando ? 'Registrando...' : 'Registrarme'}
                    </button>
                </form>

                <div style={styles.footer}>
                    <p style={styles.footerText}>
                        ¿Ya tienes cuenta? <Link to="/" style={styles.link}>Inicia Sesión</Link>
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
        background: 'linear-gradient(135deg, var(--nova-bg) 0%, #e8eceb 100%)', // Mismo fondo que Login
        padding: '40px 20px'
    },
    card: {
        width: '100%',
        maxWidth: '500px',
        padding: '40px',
        backgroundColor: 'var(--nova-white)',
        borderRadius: '16px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.06)',
        border: '1px solid rgba(0,0,0,0.02)'
    },
    header: {
        textAlign: 'center',
        marginBottom: '30px'
    },
    logo: {
        color: 'var(--nova-primary)',
        fontSize: '2.5rem',
        fontWeight: '900',
        margin: '0 0 5px 0',
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
        gap: '15px'
    },
    row: {
        display: 'flex',
        gap: '15px'
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '5px',
        flexGrow: 1
    },
    label: {
        fontSize: '0.85rem',
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
        transition: 'border-color 0.2s'
    },
    select: {
        padding: '12px 15px',
        borderRadius: '8px',
        border: '1px solid #ddd',
        fontSize: '1rem',
        backgroundColor: '#f9f9f9',
        outline: 'none',
        cursor: 'pointer'
    },
    academicSection: {
        backgroundColor: '#f0fdf4', // Fondo verde muy claro para destacar
        padding: '15px',
        borderRadius: '8px',
        border: '1px dashed var(--nova-secondary)',
        marginTop: '10px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
    },
    sectionTitle: {
        margin: '0 0 5px 0',
        fontSize: '0.9rem',
        fontWeight: 'bold',
        color: 'var(--nova-primary)'
    },
    button: {
        marginTop: '20px',
        padding: '14px',
        backgroundColor: 'var(--nova-primary)',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '1rem',
        fontWeight: 'bold',
        transition: 'background-color 0.2s',
        boxShadow: '0 4px 6px rgba(34, 123, 75, 0.2)'
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
        marginTop: '25px',
        textAlign: 'center',
        borderTop: '1px solid #f0f0f0',
        paddingTop: '20px'
    },
    footerText: {
        color: 'var(--nova-text-muted)',
        fontSize: '0.95rem'
    },
    link: {
        color: 'var(--nova-gold)',
        fontWeight: 'bold',
        textDecoration: 'none',
        marginLeft: '5px'
    }
};

export default Registro;