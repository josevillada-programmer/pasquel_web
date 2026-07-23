const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../.env' }); // O ajusta la ruta del env si está en la raíz

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'pasquel_db',
  port: process.env.DB_PORT || 3306
});

// Verificación explícita de la conexión a Docker
async function probarConexion() {
  try {
    const connection = await pool.getConnection();
    console.log('¡Conexión exitosa a la base de datos de MySQL en Docker! 🚀');
    connection.release();
  } catch (error) {
    console.error('Error al conectar con la base de datos de Docker:', error.message);
  }