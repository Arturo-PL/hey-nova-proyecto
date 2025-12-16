const redis = require('redis');
const dotenv = require('dotenv');

dotenv.config();

// 1. Crear el cliente con la URL de Redis Cloud
const client = redis.createClient({
    url: process.env.REDIS_URL
});

client.on('error', (err) => console.log('Redis Client Error', err));
client.on('connect', () => console.log('¡Conectado a Redis exitosamente!'));

// 2. Conectar (esto es asíncrono, pero en versiones nuevas de node-redis se maneja así)
(async () => {
    await client.connect();
})();

module.exports = client;
