const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../.env' }); // O ajusta la ruta del env si está en la raíz

// Configuración inteligente: Si existe la URL pública de Railway, la usa; si no, usa las credenciales individuales
const connectionConfig = process.env.MYSQL_PUBLIC_URL || process.env.MYSQL_URL
  ? process.env.MYSQL_PUBLIC_URL || process.env.MYSQL_URL
  : {
      host: process.env.DB_HOST || process.env.MYSQLHOST || 'localhost',
      user: process.env.DB_USER || process.env.MYSQLUSER || process.env.MYSQLUSER === 'raíz' ? 'root' : 'root',
      password: process.env.DB_PASSWORD || process.env.MYSQL_ROOT_CONTRASEÑA || process.env.MYSQLCONTRASEÑA || '',
      database: process.env.DB_NAME || process.env.MYSQLDATABASE || process.env.MYSQL_BASE_DE_DATOS || 'pasquel_db',
      port: process.env.DB_PORT || process.env.MYSQLPORT || 3306
    };

const pool = mysql.createPool(connectionConfig);

// Verificación explícita de la conexión
async function probarConexion() {
  try {
    const connection = await pool.getConnection();
    console.log('¡Conexión exitosa a la base de datos de MySQL! 🚀');
    connection.release();
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error.message);
  }
}

// Ejecutar la prueba al iniciar
probarConexion();

module.exports = pool;