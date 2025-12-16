import axios from 'axios';

const API_URL = 'https://heyynova-api.onrender.com/api/foros';

// Esta función se ejecuta antes de cada petición para "armar" el permiso.
const getAuthConfig = () => {
    // 1. Buscamos la llave exacta que usas en tu AuthContext
    const usuarioAlmacenado = localStorage.getItem('usuarioInfo');
    
    let token = null;

    if (usuarioAlmacenado) {
        const usuarioObj = JSON.parse(usuarioAlmacenado);
        // Ajusta esto si tu token está en usuarioObj.token o usuarioObj.tokenAcceso
        token = usuarioObj.token; 
    }

    // 2. Retornamos la configuración de cabeceras para Axios
    return {
        headers: {
            Authorization: `Bearer ${token}`, // Formato estándar JWT
        },
    };
};


const foroService = {
    // 1. OBTENER TODOS LOS FOROS
    obtenerForos: async () => {
        const response = await axios.get(API_URL, getAuthConfig());
        return response.data;
    },

    // 2. CREAR UN FORO (Solo Docentes)

    crearForo: async (datosForo) => {
        // datosForo espera: { titulo, descripcion, categoria }
        const response = await axios.post(API_URL, datosForo, getAuthConfig());
        return response.data;
    },

    // 3. OBTENER HILOS (TEMAS) DE UN FORO
    obtenerHilos: async (idForo) => {
        const response = await axios.get(`${API_URL}/${idForo}/hilos`, getAuthConfig());
        return response.data;
    },

    // 4. CREAR UN HILO NUEVO
    crearHilo: async (idForo, datosHilo) => {
        // datosHilo espera: { titulo, contenido }
        const response = await axios.post(`${API_URL}/${idForo}/hilos`, datosHilo, getAuthConfig());
        return response.data;
    },

    // 5. COMENTAR EN UN HILO
    crearComentario: async (idHilo, textoComentario) => {
        const response = await axios.post(
            `${API_URL}/hilo/${idHilo}/comentar`, 
            { texto: textoComentario }, 
            getAuthConfig()
        );
        return response.data;
    },

    // 6. OBTENER UN HILO ESPECÍFICO
    obtenerHilo: async (idHilo) => {
        const response = await axios.get(`${API_URL}/hilo/${idHilo}`, getAuthConfig());
        return response.data;
    },    

};

export default foroService;