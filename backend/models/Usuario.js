const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const usuarioSchema = new mongoose.Schema({

    rol: {
        type: String,
        required: [true, 'El rol de usuario es obligatorio.'],
        enum: ['estudiante', 'docente', 'admin'], 
        default: 'estudiante'
    },
    username: { 
        type: String, 
        required: [true, 'El nombre de usuario es obligatorio.'], 
        unique: true,
        trim: true 
    },
    email: { 
        type: String, 
        required: [true, 'El correo electrónico es obligatorio.'],
        unique: true,
        lowercase: true,
        match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Por favor, introduce un correo electrónico válido.'],
    },
    password: { 
        type: String, 
        required: [true, 'La contraseña es obligatoria.'], 
        select: false, // Oculta el campo password en consultas por defecto
        minlength: [6, 'La contraseña debe tener al menos 6 caracteres.'], 
    }, 

    firstName: { 
        type: String,
        required: [true, 'El nombre es obligatorio.']
    }, 
    lastName: { 
        type: String,
        required: [true, 'El apellido es obligatorio.']
    }, 
    
    // Estos campos son opcionales para docentes y admins, pero obligatorios para estudiantes.
    carrera: { 
        type: String, 
        default: 'No especificada',
        // 'required: true' solo si el rol es 'estudiante'
        required: function() { return this.rol === 'estudiante'; } 
    },
    semestre: { 
        type: String, 
        default: 'N/A' 
    },
    universidad: { 
        type: String, 
        default: 'No especificada' 
    },
    campus: { 
        type: String, 
        default: 'No especificado' 
    },
    promedio: { 
        type: Number, 
        default: 0.00 
    },

    profileComplete: { 
        type: Boolean, 
        default: false 
    }, 
    

}, {
    // Agrega los campos 'createdAt' y 'updatedAt' automáticamente
    timestamps: true 
});

usuarioSchema.pre('save', async function(next) {
    // Solo cifra si la contraseña ha sido modificada
    if (!this.isModified('password')) { 
        return next();
    }
    
    const salt = await bcrypt.genSalt(10); 
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

usuarioSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
}


module.exports = mongoose.model('Usuario', usuarioSchema);