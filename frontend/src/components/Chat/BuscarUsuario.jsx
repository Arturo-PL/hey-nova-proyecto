import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';

const API_SEARCH_USER_URL = 'https://heyynova-api.onrender.com/api/user'; 

const BuscarUsuario = () => {
    const { usuario } = useAuth();
    const { accederConversacion } = useChat(); 

    const [busqueda, setBusqueda] = useState('');
    const [resultados, setResultados] = useState([]);
    const [cargandoBusqueda, setCargandoBusqueda] = useState(false);
    const [errorBusqueda, setErrorBusqueda] = useState('');

    const handleBuscar = async (e) => {
        e.preventDefault();
        setErrorBusqueda('');
        setResultados([]); 
        
        if (!busqueda.trim()) return;

        setCargandoBusqueda(true);
        try {
            const config = {
                headers: { Authorization: `Bearer ${usuario.token}` },
                params: { search: busqueda }
            };
            
            const { data } = await axios.get(API_SEARCH_USER_URL, config);
            const filteredResults = data.filter(user => user._id !== usuario._id);

            setResultados(filteredResults);
            if (filteredResults.length === 0) {
                setErrorBusqueda("No se encontraron usuarios.");
            }
        } catch (error) {
            console.error(error);
            setErrorBusqueda('Fallo al buscar usuarios.');
        } finally {
            setCargandoBusqueda(false);
        }
    };

    const handleIniciarChat = (userId) => {
        accederConversacion(userId);
        setBusqueda('');
        setResultados([]);
        setErrorBusqueda('');
    };

    return (
        <div style={styles.searchContainer}>
            <form onSubmit={handleBuscar} style={styles.searchForm}>
                <input
                    type="text"
                    placeholder="Buscar o iniciar un nuevo chat..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    style={styles.searchInput}
                />
                <button type="submit" disabled={cargandoBusqueda} style={styles.searchButton}>
                    {cargandoBusqueda ? '...' : '🔍'}
                </button>
            </form>

            {/* DROPDOWN DE RESULTADOS */}
            {(resultados.length > 0 || errorBusqueda || cargandoBusqueda) && (
                <div style={styles.resultsDropdown}>
                    {cargandoBusqueda && <p style={styles.message}>Buscando...</p>}
                    
                    {errorBusqueda && <p style={styles.errorMessage}>{errorBusqueda}</p>}

                    {!cargandoBusqueda && resultados.map((user) => (
                        <div 
                            key={user._id} 
                            style={styles.resultItem}
                            onClick={() => handleIniciarChat(user._id)}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0fdf4'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            <div style={styles.avatarPlaceholder}>
                                {user.firstName.charAt(0)}
                            </div>
                            <div>
                                <strong style={{color: 'var(--nova-text)'}}>{user.firstName} {user.lastName}</strong>
                                <div style={styles.userEmail}>{user.email}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// ==========================================
// ESTILOS NOVATHEME
// ==========================================
const styles = {
    searchContainer: {
        position: 'relative', 
        zIndex: 20, 
    },
    searchForm: {
        display: 'flex',
        gap: '8px',
        alignItems: 'center'
    },
    searchInput: {
        flexGrow: 1,
        padding: '10px 15px',
        borderRadius: '25px',
        border: '1px solid #ddd',
        backgroundColor: '#f9f9f9',
        fontSize: '0.95rem',
        outline: 'none',
        transition: 'border-color 0.2s',
        color: 'var(--nova-text)'
    },
    searchButton: {
        background: 'var(--nova-primary)', // Verde Institucional
        color: 'white',
        border: 'none',
        borderRadius: '50%', // Botón redondo
        width: '40px',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
    },
    resultsDropdown: {
        position: 'absolute',
        top: '110%', 
        left: 0,
        right: 0,
        backgroundColor: 'var(--nova-white)',
        border: '1px solid rgba(0,0,0,0.05)',
        borderRadius: '12px',
        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)',
        maxHeight: '300px',
        overflowY: 'auto',
        zIndex: 100
    },
    resultItem: {
        padding: '12px 15px',
        borderBottom: '1px solid #f0f0f0',
        cursor: 'pointer',
        transition: 'background-color 0.1s',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
    },
    avatarPlaceholder: {
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        backgroundColor: 'var(--nova-secondary)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.9rem',
        fontWeight: 'bold'
    },
    userEmail: {
        fontSize: '0.8rem',
        color: 'var(--nova-text-muted)',
    },
    message: {
        textAlign: 'center',
        padding: '15px',
        margin: 0,
        color: 'var(--nova-text-muted)',
        fontStyle: 'italic'
    },
    errorMessage: {
        textAlign: 'center',
        padding: '15px',
        margin: 0,
        color: 'var(--nova-accent)',
        fontWeight: '500'
    }
};

export default BuscarUsuario;