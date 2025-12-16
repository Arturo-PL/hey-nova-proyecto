const InfoEscolar = require('../models/InfoEscolar');
const redisClient = require('../config/redis'); 

// Tiempo de vida en caché (1 hora)
const TTL_BOT = 3600; 

const procesarPregunta = async (textoUsuario) => {
    // 1. Limpieza agresiva: quitamos acentos, pasamos a minúsculas y quitamos espacios extra
    const texto = textoUsuario.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    
    let categoriaDetectada = null;
    let esConsultaEspecifica = false;

    if (texto === 'hola' || texto.includes('buenos dias') || texto.includes('buenas') || texto.includes('que tal')) {
        categoriaDetectada = 'saludo';
    } else if (texto.includes('gracias') || texto.includes('agradezco')) {
        categoriaDetectada = 'agradecimiento';
    } else if (texto.includes('semestre b') || texto.includes('siguiente semestre')) {
        categoriaDetectada = 'semestre-b';
    }


    // Regex: Busca 3 dígitos, espacios/guiones opcionales, y 1 letra (Ej: 104-a, 104 a, 104a)
    if (!categoriaDetectada) {
        const grupoMatch = texto.match(/\b(\d{3})[\s-]*([a-z])\b/i);
        if (grupoMatch) {
            const numero = grupoMatch[1];
            const letra = grupoMatch[2];
            // Estandarizamos para buscar en BD como 'examen-104-a'
            categoriaDetectada = `examen-${numero}-${letra}`;
            esConsultaEspecifica = true;
        }
    }
    

    if (!categoriaDetectada) {
        if (texto.includes('lunes')) categoriaDetectada = 'examen-dia-lunes';
        else if (texto.includes('martes')) categoriaDetectada = 'examen-dia-martes';
        else if (texto.includes('miercoles')) categoriaDetectada = 'examen-dia-miercoles';
        else if (texto.includes('jueves')) categoriaDetectada = 'examen-dia-jueves';
        else if (texto.includes('viernes')) categoriaDetectada = 'examen-dia-viernes';
    }


    if (!categoriaDetectada) {
        // 1. Trámites y Dinero
        if (texto.includes('extra') || texto.includes('costo') || texto.includes('pago') || texto.includes('precio')) {
            categoriaDetectada = 'tramites';
        
        // 2. Vacaciones (¡Separado para ser más claro!)
        } else if (texto.includes('vacaciones') || texto.includes('descanso') || texto.includes('regreso')) {
            categoriaDetectada = 'vacaciones'; 

        // 3. Calendario General
        } else if (texto.includes('calendario') || texto.includes('inicio') || texto.includes('fin') || texto.includes('semestre')) {
            categoriaDetectada = 'calendario';
            
        // 4. Exámenes Generales
        } else if (texto.includes('examen') || texto.includes('parcial') || texto.includes('ordinario')) {
            categoriaDetectada = 'examen-general';
        }
    }

    if (!categoriaDetectada) {
        return "Soy Novi 🤖. No entendí bien tu pregunta. Intenta con:\n- Tu grupo: 'Examen 104-A'\n- Un día: 'Exámenes del viernes'\n- Info: '¿Cuándo son las vacaciones?'";
    }


    const cacheKey = `heynova:bot:${categoriaDetectada}`;
    try {
        const respuestaCache = await redisClient.get(cacheKey);
        if (respuestaCache) {
            console.log(`⚡ BOT FAST: Respondiendo '${categoriaDetectada}' desde Redis`);
            return respuestaCache;
        }
    } catch (error) { 
        console.error("Error lectura Redis:", error); 
    }


    console.log(`🐢 BOT THINKING: Buscando '${categoriaDetectada}' en BD...`);
    const info = await InfoEscolar.findOne({ categoria: categoriaDetectada, activa: true });

    let respuestaFinal = "";

    if (info) {
        respuestaFinal = info.mensaje;
    } else {
        // Manejo inteligente de "No encontrado"
        if (esConsultaEspecifica) {
            respuestaFinal = `Lo siento, no tengo horarios cargados para el grupo indicado en este periodo de exámenes. Por favor verifica que esté bien escrito (Ej: 104-A).`;
        } else {
            respuestaFinal = "No tengo información específica sobre ese tema por ahora. Intenta preguntar de otra forma.";
        }
    }


    try {
        await redisClient.set(cacheKey, respuestaFinal, { EX: TTL_BOT });
    } catch (error) {
        console.error("Error escritura Redis:", error);
    }
    
    return respuestaFinal;
};

// Función auxiliar para crear info manualmente (Postman)
const crearRespuestaBot = async (req, res) => {
    const { categoria, mensaje } = req.body;
    try {
        const nuevaInfo = await InfoEscolar.create({ categoria, mensaje });
        // Invalidamos caché por si estamos actualizando algo existente
        await redisClient.del(`heynova:bot:${categoria}`);
        res.status(201).json(nuevaInfo);
    } catch (error) { 
        res.status(500).json({msg: "Error creando info", error}); 
    }
};

module.exports = { procesarPregunta, crearRespuestaBot };