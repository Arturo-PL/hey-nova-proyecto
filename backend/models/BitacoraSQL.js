const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sqlDb');

const Bitacora = sequelize.define('Bitacora', {
    // ID se crea solo en SQL
    accion: {
        type: DataTypes.STRING,
        allowNull: false
    },
    usuario_nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    usuario_id: {
        type: DataTypes.STRING,
        allowNull: false
    },
    detalle: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    // Sequelize agrega automáticamente createdAt y updatedAt
});

module.exports = Bitacora;