import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// 1. Crear el Contexto
const AuthContext = createContext();

// URL base de tu backend
const API_URL = 'https://heyynova-api.onrender.com/api/auth/'; 
;

// 2. Crear el Proveedor (Provider) del Contexto
export const AuthProvider = ({ children }) => {
    // Estado para almacenar la información del usuario y el token
    const [usuario, setUsuario] = useState(null);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const usuarioAlmacenado = localStorage.getItem('usuarioInfo');
        if (usuarioAlmacenado) {
            setUsuario(JSON.parse(usuarioAlmacenado));
        }
        setCargando(false);
    }, []);

    const iniciarSesion = async (email, password) => {
        try {
            const config = {
                headers: { 'Content-Type': 'application/json' },
            };

            const { data } = await axios.post(
                API_URL + 'login',
                { email, password },
                config
            );

            setUsuario(data);
            localStorage.setItem('usuarioInfo', JSON.stringify(data));
            
            return { success: true };

        } catch (error) {
            const mensajeError = error.response && error.response.data.mensaje
                ? error.response.data.mensaje
                : 'Error de conexión con el servidor.';
            
            return { success: false, error: mensajeError };
        }
    };

    const registrarUsuario = async (datosRegistro) => {
        try {
            const config = {
                headers: { 'Content-Type': 'application/json' },
            };

            const { data } = await axios.post(
                API_URL + 'registro',
                datosRegistro, 
                config
            );

            setUsuario(data);
            localStorage.setItem('usuarioInfo', JSON.stringify(data));
            
            return { success: true };

        } catch (error) {
             const mensajeError = error.response && error.response.data.mensaje
                ? error.response.data.mensaje
                : 'Error de conexión con el servidor.';
            
            return { success: false, error: mensajeError };
        }
    };

    const cerrarSesion = () => {
        localStorage.removeItem('usuarioInfo');
        setUsuario(null);
    };


    const value = {
        usuario,
        setUsuario,
        cargando,
        iniciarSesion,
        registrarUsuario,
        cerrarSesion,
    };

    return (
        <AuthContext.Provider value={value}>
            {!cargando && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};