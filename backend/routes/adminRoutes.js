const express = require('express');
const router = express.Router();
const { OAuth2Client } = require('google-auth-library');
const db = require('../config/db'); // Tu archivo de conexión a MySQL

const client = new OAuth2Client('695642488122-lhuaqt8v7qdi8f5cebbr0mf6c87b281o.apps.googleusercontent.com');

// Ruta para procesar el login/registro con Google
router.post('/google-login', async (req, res) => {
  try {
    const { token } = req.body;

    // 1. Verificar el token con Google
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: '695642488122-lhuaqt8v7qdi8f5cebbr0mf6c87b281o.apps.googleusercontent.com',
    });
    
    const payload = ticket.getPayload();
    const email = payload.email;
    const nombre = payload.name;

    // 2. Definir el rol automáticamente según el dominio corporativo
    const rol = email.endsWith('@pasquelhermanos.com.mx') ? 'admin' : 'user';

    // 3. Verificar si el usuario ya existe en tu base de datos MySQL, si no, registrarlo
    const [rows] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);

    if (rows.length === 0) {
      // Insertar nuevo usuario en MySQL
      await db.query('INSERT INTO usuarios (nombre, email, rol, password) VALUES (?, ?, ?, ?)', [nombre, email, rol, 'GOOGLE_AUTH']);
    } else {
      // Opcional: actualizar el rol si corresponde
      await db.query('UPDATE usuarios SET rol = ? WHERE email = ?', [rol, email]);
    }

    // 4. Responder al frontend con los datos limpios para el localStorage
    res.json({
      success: true,
      user: {
        email: email,
        nombre: nombre,
        rol: rol
      }
    });

  } catch (error) {
    console.error("Error en autenticación de Google:", error);
    res.status(401).json({ success: false, message: "Token de Google inválido o error en BD" });
  }
});

module.exports = router;