import React, { useState, useEffect, useRef } from 'react';

const NovaBot = ({ socket }) => {
    // Estado para abrir/cerrar la ventanita
    const [isOpen, setIsOpen] = useState(false);
    
    // Estado para el texto que escribe el usuario
    const [mensajeActual, setMensajeActual] = useState('');
    
    // Estado para guardar la conversación
    const [historial, setHistorial] = useState([
        { tipo: 'bot', texto: '¡Hola! Soy Novi 🤖. Pregúntame sobre horarios, exámenes o dudas escolares y te ayudare en lo que pueda.' }
    ]);
    
    // Referencia para que el chat baje automáticamente al último mensaje
    const finalChatRef = useRef(null);

    // Función para auto-scroll
    const scrollToBottom = () => {
        finalChatRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [historial, isOpen]);
    
    useEffect(() => {
        if (!socket) return;

        // Escuchar cuando el bot responde
        socket.on('respuesta-bot', (data) => {
            setHistorial((prev) => [...prev, { tipo: 'bot', texto: data.texto }]);
        });

        // Limpiar para no duplicar escuchas
        return () => {
            socket.off('respuesta-bot');
        };
    }, [socket]);

    const enviarPregunta = () => {
        if (!mensajeActual.trim()) return;

        // 1. Agregar visualmente mi pregunta
        setHistorial((prev) => [...prev, { tipo: 'user', texto: mensajeActual }]);

        // 2. Enviar al Backend
        if (socket) {
            socket.emit('pregunta-bot', mensajeActual);
        }

        // 3. Limpiar input
        setMensajeActual('');
    };

    // Permitir enviar con la tecla Enter
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') enviarPregunta();
    };

    return (
        <div className="nova-bot-container">
            
            {/* VENTANA DEL CHAT (Solo se ve si isOpen es true) */}
            {isOpen && (
                <div className="nova-chat-window">
                    <div className="chat-header">
                        <span>Asistente Novi 🤖</span>
                        <button className="close-btn" onClick={() => setIsOpen(false)}>×</button>
                    </div>
                    
                    <div className="chat-body">
                        {historial.map((msg, index) => (
                            <div key={index} className={`msg ${msg.tipo}`}>
                                {msg.texto}
                            </div>
                        ))}
                        {/* Elemento invisible para empujar el scroll */}
                        <div ref={finalChatRef} />
                    </div>

                    <div className="chat-footer">
                        <input 
                            type="text" 
                            placeholder="Escribe tu duda..." 
                            value={mensajeActual}
                            onChange={(e) => setMensajeActual(e.target.value)}
                            onKeyPress={handleKeyPress}
                        />
                        <button onClick={enviarPregunta}>➤</button>
                    </div>
                </div>
            )}

            {/* BOTÓN FLOTANTE (FAB) */}
            <button className="nova-fab" onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? '💬' : '🤖'}
            </button>
        </div>
    );
};

export default NovaBot;