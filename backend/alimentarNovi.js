const mongoose = require('mongoose');
const dotenv = require('dotenv');
const InfoEscolar = require('./models/InfoEscolar');
const redisClient = require('./config/redis'); 

dotenv.config();

const datosNovi = [
    // ==========================================
    // 0. CONVERSACIÓN Y PERSONALIDAD
    // ==========================================
    {
        categoria: 'saludo',
        mensaje: "¡Hola! Soy Novi 🤖, tu asistente escolar.\n\nPuedes preguntarme por:\n🔹 Horarios de exámenes (Ej: '104-A')\n🔹 Fechas importantes (Ej: 'Vacaciones')\n🔹 Costos de trámites.",
        activa: true
    },
    {
        categoria: 'agradecimiento',
        mensaje: "¡De nada! Es un gusto ayudarte. 🎓\n¡Mucho éxito en tus evaluaciones!",
        activa: true
    },
    {
        categoria: 'semestre-b',
        mensaje: "ℹ️ SEMESTRE 2025-2026 B\n\nLa información detallada de horarios y cargas académicas se actualizará tan pronto comience el nuevo semestre (Enero 2026).",
        activa: true
    },

    // ==========================================
    // 1. INFORMACIÓN GENERAL
    // ==========================================
    {
        categoria: 'examen-general',
        mensaje: "🤖 Modo Exámenes Ordinarios\nPeriodo: 08 al 15 de Diciembre.\n\n🔍 Instrucciones: Escribe tu grupo para ver el detalle completo (Materia, Hora, Aulas y Profesores).\nEjemplo: 'Examen 104-A'",
        activa: true
    },
    {
        categoria: 'vacaciones',
        mensaje: `🏖️ PERIODO VACACIONAL

🔹 Vacaciones de Verano (Pasado):
Del 14 al 25 de Julio 2025.

🔹 Vacaciones de Invierno (Próximo):
Del 18 de Diciembre 2025 al 02 de Enero 2026.

🚫 Días Inhábiles:
16 Sep, 17 Nov y 25 Dic.`,
        activa: true
    },
    {
        categoria: 'calendario',
        mensaje: `🗓️ CALENDARIO SEMESTRE 2025 - 2026 A

🔹 Fechas Clave:
- Inicio: 25 de Agosto 2025
- Fin: 15 de Diciembre 2025

📝 Exámenes:
- Parciales: Sep, Oct, Nov.
- Ordinarios: 08-15 Dic.
- Extras: 05-09 Ene (1ª) y 19-23 Ene (2ª).

(Escribe "Vacaciones" para ver solo los descansos).`,
        activa: true
    },
    {
        categoria: 'tramites',
        mensaje: `💰 Aviso: Exámenes Extraordinarios

📅 Solicitud y Pago: Del 12 al 19 de Diciembre 2025.
(Juxtlahuaca: recepción hasta el día 17).

💲 Costos:
- Examen: $281.00
- Idiomas: $168.00

🌐 Trámite:
Generar línea de captura en: https://www.finanzasoaxaca.gob.mx/

⚠️ Nota: Entregar copia del comprobante en Recursos Financieros y verificar situación en Servicios Escolares.`,
        activa: true
    },

    // ==========================================
    // 2. CONSULTAS POR DÍA (Resumen General)
    // ==========================================
    {
        categoria: 'examen-dia-viernes',
        mensaje: `📅 Viernes 12 Diciembre (Resumen General)

🔹 08:00 AM: Agrofísica, Protección Cultivos, Hacienda Pública, Formulación Proyectos.
🔹 09:00 AM: Fundamentos Matemáticas, Inteligencia Artificial I, Prod. Flores y Ornamentales.
🔹 10:00 AM: Electrónica Digital, Fitopatología, Gestión Calidad.
🔹 11:00 AM: Matemáticas Admin., Fruticultura.
🔹 12:00 PM: Metodología Inv., Ing. Software II.`,
        activa: true
    },
    {
        categoria: 'examen-dia-lunes',
        mensaje: `📅 Lunes 15 Diciembre (Cierre de Semestre)

🔹 08:00 AM: Álgebra Lineal, Herr. Digitales, Prod. Forrajes, Entomología, Economía Local.
🔹 09:00 AM: Derecho Informática, TI I, Prod. Agropecuaria, Gestión Estratégica.
🔹 10:00 AM: Habilidades de Comunicación (Varios Grupos), Biotecnología, Mercadotecnia.`,
        activa: true
    },

    // ==========================================
    // 3. DETALLE POR GRUPO (INFO EXACTA DEL PDF)
    // ==========================================
    
    // --- GRUPO 104-A ---
    {
        categoria: 'examen-104-a',
        mensaje: `📅 Exámenes 104-A

🔹 Viernes 12 Dic
📚 Fundamentos de Matemáticas para Ingeniería
⏰ 09:00 - 11:00
🏫 Aulas: ST:01, SJ:A4E2, JUX:A1, NOP:Bibl-01
👩‍🏫 Titular: Dra. Ivonne L. Martínez Cortés
👥 Asistente: L.M.A. Liliana J. Manzano, L.M.A. Citlalliy Herrera, L.I. Víctor M. López.

🔹 Lunes 15 Dic
📚 Habilidades de Comunicación
⏰ 10:00 - 11:00
🏫 Aulas: ST:01, SJ:A4E2, JUX:A4, NOP:A2
👩‍🏫 Titular: M.E.S. Itzel Arellanes Esperanza
👥 Asistente: L.I. Martha I. Sánchez, L.I. Noé Laurencio, L.I. Víctor M. López.`,
        activa: true
    },

    // --- GRUPO 105-A ---
    {
        categoria: 'examen-105-a',
        mensaje: `📅 Exámenes 105-A

🔹 Viernes 12 Dic
📚 Matemáticas para la Administración
⏰ 11:00 - 14:00
🏫 Aulas: ST:02, SJ:A8E2, JUX:A4, NOP:A2
👨‍🏫 Titular: Dr. Miguel Antonio Morales Ramos
👥 Asistente: L.A.E. Miriam de los Ángeles López, L.A. Edith C. Ramírez, L.A. Emilio J. García.

🔹 Lunes 15 Dic
📚 Habilidades de Comunicación
⏰ 10:00 - 11:00
🏫 Aulas: ST:01, SJ:A8E2, JUX:A4, NOP:A2
👩‍🏫 Titular: M.E.S. Itzel Arellanes Esperanza
👥 Asistente: L.A.E. Miriam de los Ángeles López, L.I. Noé Laurencio, L.I. Víctor M. López.`,
        activa: true
    },

    // --- GRUPO 106-A ---
    {
        categoria: 'examen-106-a',
        mensaje: `📅 Exámenes 106-A

🔹 Viernes 12 Dic
📚 Agrofísica
⏰ 08:00 - 10:00
🏫 Aulas: ST:11, SJ:A5E2, JUX:A5, NOP:A4
👩‍🏫 Titular: Dra. María del Consuelo Acuayte
👥 Asistente: I.A. Vicente Antonio Martínez, I.A. Claudio Mendoza, I.A.Z. Pedro Martínez.

🔹 Lunes 15 Dic
📚 Habilidades de Comunicación
⏰ 10:00 - 11:00
🏫 Aulas: ST:01, SJ:A5E2, JUX:A5, NOP:A4
👩‍🏫 Titular: M.E.S. Itzel Arellanes Esperanza
👥 Asistente: L.A. Teresa Griselda Lustre, I.A. Marcelo Pauceno, I.A. Rosalba Santiago.`,
        activa: true
    },

    // --- GRUPO 304-A ---
    {
        categoria: 'examen-304-a',
        mensaje: `📅 Exámenes 304-A

🔹 Viernes 12 Dic
📚 Electrónica Digital
⏰ 10:00 - 12:00
🏫 Aulas: ST:10, SJ:A1E2, JUX:A3, NOP:LE-01
👨‍🏫 Titular: Dr. Alberto de Jesús Díaz Ortiz
👥 Asistente: L.I. Martha I. Sánchez, L.I. Noé Laurencio, L.I. Daniel Guzmán.

🔹 Lunes 15 Dic
📚 Álgebra Lineal
⏰ 08:00 - 10:00
🏫 Aulas: ST:01, SJ:A1E2, JUX:A1, NOP:Bibl-01
👩‍🏫 Titular: Dra. Ivonne L. Martínez Cortés
👥 Asistente: L.M.A. Liliana J. Manzano, L.M.A. Citlalliy Herrera, L.I. Daniel Guzmán.`,
        activa: true
    },

    // --- GRUPO 305-A ---
    {
        categoria: 'examen-305-a',
        mensaje: `📅 Exámenes 305-A

🔹 Viernes 12 Dic
📚 Metodología de la Investigación
⏰ 12:00 - 14:00 (2 h)
🏫 Aulas: ST:03, SJ:A1E1, JUX:A7
👩‍🏫 Titular: M.G.E. Diana G. Zenteno de la Riva
👥 Asistente: L.A. Teresa Griselda Lustre, L.A. María Guadalupe Vásquez.

🔹 Lunes 15 Dic
📚 Herramientas Digitales para MIPYMES
⏰ 08:00 - 10:00 (2 h)
🏫 Aulas: ST:06, SJ:A1E1, JUX:A7
👨‍🏫 Titular: M.D. Juan Manuel Martínez Z.
👥 Asistente: L.I. Santiago G. Cortés, L.B. y G.I. W. Alexander Bermúdez.`,
        activa: true
    },

    // --- GRUPO 306-A ---
    {
        categoria: 'examen-306-a',
        mensaje: `📅 Exámenes 306-A

🔹 Viernes 12 Dic
📚 Protección de Cultivos
⏰ 08:00 - 10:00
🏫 Aulas: ST:07, SJ:A7E2, JUX:A2, NOP:A5
👩‍🏫 Titular: Dra. Florinda García Pérez
👥 Asistente: I.F. Luz Divina Amador, I.A. Marcelo Pauceno, I.A. Gabriel Bautista.

🔹 Lunes 15 Dic
📚 Producción de Forrajes
⏰ 08:00 - 10:00
🏫 Aulas: ST:07, SJ:A7E2, JUX:A2, NOP:A5
👩‍🏫 Titular: M.C. Elizabeth Cruz Sosa
👥 Asistente: I.F. Miguel Crisanto, I.A. María Guadalupe Mendoza, I.A.Z Pedro Martínez.`,
        activa: true
    },

    // --- GRUPO 502-A ---
    {
        categoria: 'examen-502-a',
        mensaje: `📅 Exámenes 502-A

🔹 Viernes 12 Dic
📚 Fitopatología
⏰ 10:00 - 12:00
🏫 Aulas: ST:03, SJ:A7E1, JUX:A6
👩‍🏫 Titular: Dra. Florinda García Pérez
👥 Asistente: I.F. Luz Divina Amador, I.A. Marcelo Pauceno.

🔹 Lunes 15 Dic
📚 Entomología
⏰ 08:00 - 10:00
🏫 Aulas: ST:03, SJ:A7E1, JUX:A6
👩‍🏫 Titular: Dra. Florinda García Pérez
👥 Asistente: I.F. Luz Divina Amador, I.A. Marcelo Pauceno.`,
        activa: true
    },

    // --- GRUPO 503-A ---
    {
        categoria: 'examen-503-a',
        mensaje: `📅 Exámenes 503-A

🔹 Viernes 12 Dic
📚 Hacienda Pública Municipal
⏰ 08:00 - 10:00
🏫 Aulas: ST:05, SJ:A2E1, JUX:A6, NOP:A3
👨‍🏫 Titular: Dr. Ramón Fernández Mejía
👥 Asistente: L.A.E. Miriam de los Ángeles López, L.A. Edith C. Ramírez, I.A. Rosalba Santiago.

🔹 Lunes 15 Dic
📚 Economía Local y Regional
⏰ 08:00 - 10:00
🏫 Aulas: ST:05, SJ:A2E1, JUX:C13, NOP:A2
👨‍🏫 Titular: Dr. Marco A. Espinosa Trujillo
👥 Asistente: L.C.P. Mayra Luis López, L.E. Betzahí Miren López, L.A. Emilio J García.`,
        activa: true
    },

    // --- GRUPO 701-A ---
    {
        categoria: 'examen-701-a',
        mensaje: `📅 Exámenes 701-A

🔹 Viernes 12 Dic
📚 Ingeniería de Software II
⏰ 12:00 - 14:00
🏫 Aulas: ST:09, SJ:A3E2, JUX:L.E.
👩‍🏫 Titular: M.T.C.A. Neira Sánchez Rojas
👥 Asistente: L.I. Santiago G. Cortés, L.I. Noé Laurencio Carrasco.

🔹 Lunes 15 Dic
📚 Derecho y Legislación en Informática
⏰ 09:00 - 11:00
🏫 Aulas: ST:09, SJ:A3E2, JUX:L.E.
👩‍🏫 Titular: M.G.E. Diana G. Zenteno de la R.
👥 Asistente: L.A. Edgar E. Barrita, I.T.I.C. Feliciano Lorenzo.`,
        activa: true
    },

    // --- GRUPO 702-A ---
    {
        categoria: 'examen-702-a',
        mensaje: `📅 Exámenes 702-A

🔹 Viernes 12 Dic
📚 Fruticultura
⏰ 11:00 - 13:00
🏫 Aulas: ST:04, SJ:A3E1, JUX:A2, NOP:A6
👩‍🏫 Titular: Dra. Cecilia Osorio Ramírez
👥 Asistente: I.A. Vicente Antonio, I.A. Claudio Mendoza, I.A. Gabriel Bautista.

🔹 Lunes 15 Dic
📚 Biotecnología
⏰ 10:00 - 12:00
🏫 Aulas: ST:04, SJ:A3E1, JUX:A3, NOP:A6
👨‍🏫 Titular: M.C. Omar Córdova Campos
👥 Asistente: I.A. Vicente Antonio, I.A. María Guadalupe Mendoza, I.A. Gabriel Bautista.`,
        activa: true
    },

    // --- GRUPO 703-A ---
    {
        categoria: 'examen-703-a',
        mensaje: `📅 Exámenes 703-A

🔹 Viernes 12 Dic
📚 Formulación y Evaluación de Proyectos Sociales
⏰ 08:00 - 10:00 (2 h)
🏫 Aulas: ST:08, SJ:A6E1, JUX:A1, NOP:A1
👨‍🏫 Titular: Dr. Luis Mendoza Ramírez
👥 Asistente: M.M.T. Violeta M. Silva, L.A. María Guadalupe Vásquez, L.A. Emilio J. García.

🔹 Lunes 15 Dic
📚 Fundamentos de Mercadotecnia
⏰ 10:00 - 11:00
🏫 Aulas: ST:06, SJ:A6E1, JUX:DIR, NOP:A2
👩‍🏫 Titular: M.C. María Soledad Luna Martínez`,
        activa: true
    },

    // --- GRUPO 901-A ---
    {
        categoria: 'examen-901-a',
        mensaje: `📅 Exámenes 901-A

🔹 Viernes 12 Dic
📚 Inteligencia Artificial I
⏰ 09:00 - 11:00
🏫 Aula: SJ:A2E2
👩‍🏫 Titular: M.T.C.A. Rosa M. Gutiérrez Apolonio

🔹 Lunes 15 Dic
📚 Tecnología de Información I
⏰ 09:00 - 10:00
🏫 Aula: SJ:A2E2
👨‍🏫 Titular: M.T.C.A. Omar Martínez Osorio`,
        activa: true
    },

    // --- GRUPO 902-A ---
    {
        categoria: 'examen-902-a',
        mensaje: `📅 Exámenes 902-A

🔹 Viernes 12 Dic
📚 Producción de Flores y Ornamentales
⏰ 09:00 - 11:00
🏫 Aula: SJ:A5E1
👩‍🏫 Titular: Dra. Cecilia Osorio Ramírez

🔹 Lunes 15 Dic
📚 Producción Agropecuaria
⏰ 09:00 - 11:00
🏫 Aula: SJ:A5E1
👩‍🏫 Titular: Dra. Cecilia Osorio Ramírez`,
        activa: true
    },

    // --- GRUPO 903-A ---
    {
        categoria: 'examen-903-a',
        mensaje: `📅 Exámenes 903-A

🔹 Viernes 12 Dic
📚 Gestión de la Calidad en el Producto y Servicio
⏰ 10:00 - 11:00
🏫 Aula: SJ: A4E1
👩‍🏫 Titular: M.C. María Soledad Luna Martínez

🔹 Lunes 15 Dic
📚 Gestión Estratégica de Organizaciones
⏰ 09:00 - 11:00
🏫 Aula: SJ: A4E1
👨‍🏫 Titular: M.A. Eddi Jacobo Santos Martínez`,
        activa: true
    }
];

const importarDatos = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Conectado a MongoDB');

        await InfoEscolar.deleteMany();
        console.log('🗑️  Datos antiguos eliminados');

        await InfoEscolar.insertMany(datosNovi);
        console.log('✨ Base de datos de Novi actualizada');

        if (redisClient.isOpen) {
            await redisClient.flushAll();
            console.log('🧹 Caché reiniciada');
        }

        process.exit();
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
    }
};

importarDatos();