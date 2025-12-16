const { Sequelize } = require('sequelize');

// Creamos la conexión. Esto creará 'database.sqlite'
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './auditoria_nova.sqlite', // Nombre del archivo de la BD
    logging: false // Para no ensuciar la consola
});

const conectarSQL = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Conectado a SQL (SQLite) para Auditoría.');
        // Esta línea crea las tablas automáticamente si no existen
        await sequelize.sync(); 
    } catch (error) {
        console.error('❌ Error conectando a SQL:', error);
    }
};

module.exports = { sequelize, conectarSQL };
