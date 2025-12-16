
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import LoginPage from '../pages/InicioSesion';
import RegisterPage from '../pages/Registro';
import FeedPrincipal from '../pages/FeedPrincipal';
import PerfilUsuario from '../pages/PerfilUsuario';
import ChatPage from '../pages/ChatPage';
import ForosPage from '../pages/ForosPage'; 
import DetalleForo from '../pages/DetalleForo';
import DetalleHilo from '../pages/DetalleHilo';

// Componente de navegación
import NavBar from '../components/Layout/NavBar'; 

// Componente Layout que envuelve la barra de navegación y el contenido
const Layout = ({ children }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <NavBar /> 
            <main style={{ flexGrow: 1 }}>
                {children}
            </main>
        </div>
    );
};

// Componente para proteger las rutas
const RutaProtegida = ({ children }) => {
    const { usuario, cargando } = useAuth();

    if (cargando) {
        return <div style={{ textAlign: 'center', padding: '50px' }}>Cargando...</div>;
    }

    // Si el usuario no está logueado, redirige al login
    if (!usuario) {
        return <Navigate to="/login" replace />;
    }

    // Si está logueado, envuelve el contenido en el Layout con la NavBar
    return <Layout>{children}</Layout>;
};

const AppRutas = () => {
    return (
        <Router>
            <Routes>
                {/* Rutas Públicas */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/registro" element={<RegisterPage />} />

                {/* Ruta Raíz redirige a /feed */}
                <Route path="/" element={<Navigate to="/feed" replace />} />

                {/* =======================================================
                    RUTAS PRIVADAS (PROTEGIDAS)
                   ======================================================= */}
                
                <Route
                    path="/feed"
                    element={
                        <RutaProtegida>
                            <FeedPrincipal />
                        </RutaProtegida>
                    }
                />
                
                <Route
                    path="/perfil"
                    element={
                        <RutaProtegida>
                            <PerfilUsuario />
                        </RutaProtegida>
                    }
                />

                <Route
                    path="/chat"
                    element={
                        <RutaProtegida>
                            <ChatPage />
                        </RutaProtegida>
                    }
                />

                <Route
                    path="/foros"
                    element={
                        <RutaProtegida>
                            <ForosPage />
                        </RutaProtegida>
                    }
                />

                <Route
                    path="/foros/:idForo"
                    element={
                        <RutaProtegida>
                            <DetalleForo />
                        </RutaProtegida>
                    }
                />       

                <Route
                    path="/foros/hilo/:idHilo"
                    element={
                        <RutaProtegida>
                            <DetalleHilo />
                        </RutaProtegida>
                    }
                />                              
                
                {/* 404/Wildcard */}
                <Route path="*" element={<Navigate to="/feed" replace />} />
            </Routes>
        </Router>
    );
};

export default AppRutas;