const Foro = require('../models/Foro');
const Hilo = require('../models/Hilo');
const redisClient = require('../config/redis'); 

// TIEMPOS DE EXPIRACIÓN (en segundos)
const TTL_FOROS_LIST = 3600; // 1 hora
const TTL_HILOS_LIST = 300;  // 5 minutos
const TTL_HILO_SINGLE = 600; // 10 minutos

// ======================================================
// 1. CREAR UN FORO NUEVO
// ======================================================
const crearForo = async (req, res) => {
    try {
        const { titulo, descripcion, categoria } = req.body;

        if (!titulo || !descripcion) {
            return res.status(400).json({ msg: 'Por favor completa todos los campos' });
        }

        const nuevoForo = new Foro({
            titulo,
            descripcion,
            categoria,
            creador: req.usuario._id 
        });

        const foroGuardado = await nuevoForo.save();

        // LOG DE PRUEBA
        console.log('🗑️  INVALIDACIÓN: Se creó un foro, borrando caché de lista de foros.');
        await redisClient.del('heynova:foros:todos');

        res.status(201).json(foroGuardado);

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Hubo un error al crear el foro' });
    }
};

// ======================================================
// 2. OBTENER TODOS LOS FOROS (CON LOGS)
// ======================================================
const obtenerForos = async (req, res) => {
    try {
        const cacheKey = 'heynova:foros:todos';
        
        // Intentar obtener de Redis
        const datosCheados = await redisClient.get(cacheKey);
        
        if (datosCheados) {
            // LOG SI ENCUENTRA EN CACHÉ
            console.log('⚡ REDIS HIT: Sirviendo lista de Foros desde caché');
            return res.json(JSON.parse(datosCheados));
        }

        // LOG SI TIENE QUE IR A MONGO
        console.log('🐢 MONGO QUERY: No estaba en caché, buscando en BD...');
        
        const foros = await Foro.find()
            .populate('creador', 'firstName lastName username rol') 
            .sort({ createdAt: -1 });

        await redisClient.set(cacheKey, JSON.stringify(foros), { EX: TTL_FOROS_LIST });

        res.json(foros);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al obtener los foros' });
    }
};

// ======================================================
// 3. CREAR UN HILO
// ======================================================
const crearHilo = async (req, res) => {
    try {
        const { idForo } = req.params; 
        const { titulo, contenido } = req.body;

        const foroExiste = await Foro.findById(idForo);
        if (!foroExiste) {
            return res.status(404).json({ msg: 'El foro no existe' });
        }

        const nuevoHilo = new Hilo({
            titulo,
            contenido,
            foro: idForo,
            autor: req.usuario._id 
        });

        const hiloGuardado = await nuevoHilo.save();
        
        const hiloConAutor = await Hilo.findById(hiloGuardado._id)
            .populate('autor', 'firstName lastName username img'); 

        // LOG DE PRUEBA
        console.log(`🗑️  INVALIDACIÓN: Nuevo hilo creado, borrando caché del foro ${idForo}`);
        await redisClient.del(`heynova:foro:${idForo}:hilos`);

        res.status(201).json(hiloConAutor);

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al crear la discusión' });
    }
};

// ======================================================
// 4. OBTENER HILOS DE UN FORO ESPECÍFICO (CON LOGS)
// ======================================================
const obtenerHilosDeForo = async (req, res) => {
    try {
        const { idForo } = req.params;
        const cacheKey = `heynova:foro:${idForo}:hilos`;

        const datosCheados = await redisClient.get(cacheKey);

        if (datosCheados) {
            console.log(`⚡ REDIS HIT: Sirviendo hilos del foro ${idForo} desde caché`);
            return res.json(JSON.parse(datosCheados));
        }

        console.log(`🐢 MONGO QUERY: Buscando hilos del foro ${idForo} en BD...`);
        
        const hilos = await Hilo.find({ foro: idForo })
            .populate('autor', 'firstName lastName username rol') 
            .sort({ createdAt: -1 });

        await redisClient.set(cacheKey, JSON.stringify(hilos), { EX: TTL_HILOS_LIST });

        res.json(hilos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al cargar las discusiones' });
    }
};

// ======================================================
// 5. AGREGAR COMENTARIO A UN HILO
// ======================================================
const agregarComentario = async (req, res) => {
    try {
        const { idHilo } = req.params;
        const { texto } = req.body;

        if (!texto) {
            return res.status(400).json({ msg: 'El comentario no puede estar vacío' });
        }

        const hilo = await Hilo.findById(idHilo);
        if (!hilo) {
            return res.status(404).json({ msg: 'La discusión no existe' });
        }

        const nuevoComentario = {
            usuario: req.usuario._id,
            texto,
            fecha: Date.now()
        };

        hilo.comentarios.push(nuevoComentario);
        await hilo.save();

        const hiloActualizado = await Hilo.findById(idHilo)
            .populate('autor', 'firstName lastName')
            .populate('comentarios.usuario', 'firstName lastName username');

        // LOG DE PRUEBA
        console.log(`🗑️  INVALIDACIÓN: Comentario nuevo, borrando caché del hilo ${idHilo}`);
        await redisClient.del(`heynova:hilo:${idHilo}`);

        res.json(hiloActualizado);

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al publicar comentario' });
    }
};

// ======================================================
// 6. OBTENER UN HILO INDIVIDUAL (CON LOGS)
// ======================================================
const obtenerHilo = async (req, res) => {
    try {
        const { idHilo } = req.params;
        const cacheKey = `heynova:hilo:${idHilo}`;

        const datosCheados = await redisClient.get(cacheKey);

        if(datosCheados) {
            console.log(`⚡ REDIS HIT: Sirviendo hilo individual ${idHilo} desde caché`);
            return res.json(JSON.parse(datosCheados));
        }

        console.log(`🐢 MONGO QUERY: Buscando hilo individual ${idHilo} en BD...`);

        const hilo = await Hilo.findById(idHilo)
            .populate('autor', 'firstName lastName username img')
            .populate('comentarios.usuario', 'firstName lastName username img'); 

        if (!hilo) {
            return res.status(404).json({ msg: 'Hilo no encontrado' });
        }

        await redisClient.set(cacheKey, JSON.stringify(hilo), { EX: TTL_HILO_SINGLE });

        res.json(hilo);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al obtener el hilo' });
    }
};

module.exports = {
    crearForo,
    obtenerForos,
    crearHilo,
    obtenerHilosDeForo,
    agregarComentario,
    obtenerHilo
};