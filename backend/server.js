const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: '../.env' });

// 1. Inicializar app primero
const app = express();

const db = require('./config/db');
const adminRoutes = require('./routes/adminRoutes');
const vacantesRoutes = require('./routes/vacantesRoutes');
const postulacionesRoutes = require('./routes/postulacionesRoutes');


// 2. Configurar middlewares y rutas después de declarar app
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

app.use('/api/admin', adminRoutes);
app.use('/api/vacantes', vacantesRoutes);
app.use('/api/postulaciones', postulacionesRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor activo en el puerto ${PORT}`);
});