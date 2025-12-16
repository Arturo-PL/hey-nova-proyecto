const mongoose = require('mongoose');

const conectarDB = async () => {
    try {
        // La función .connect() utiliza automáticamente la URI de process.env.MONGO_URI
        const conn = await mongoose.connect(process.env.MONGO_URI);
        
        console.log(`💾 MongoDB Conectado: ${conn.connection.host}`);
    } catch (error) {
        // Muestra el error si la conexión falla (ej. credenciales incorrectas o problemas de red)
        console.error(`❌ Error al conectar MongoDB: ${error.message}`);
        
        // Finaliza el proceso de Node con un error (1)
        process.exit(1); 
    }
};

module.exports = conectarDB;
