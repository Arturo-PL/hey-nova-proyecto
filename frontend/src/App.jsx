import React from 'react';
import AppRutas from './routes/AppRutas'; 
import NovaBot from './components/NovaBot'; // 1. Importamos el Bot
import { useSocket } from './context/SocketContext'; // 2. Importamos el hook para usar el socket

function App() {
  // 3. Obtenemos la conexión que ya creaste en main.jsx
  const { socket } = useSocket(); 

  return (
    <>
      {/* Todo tu sistema de rutas y páginas */}
      <AppRutas />
      
      {/* 4. El Bot flota sobre todo el sistema */}
      <NovaBot socket={socket} />
    </>
  );
}

export default App;