const express = require('express');
const router = express.Router();
const db = require('../config/db');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.post('/', upload.single('cv'), async (req, res) => {
  try {
    const { vacante, nombre, email, telefono } = req.body;
    const cvFile = req.file;

    // Guardar en la base de datos de MySQL en Docker
    await db.query(
      'INSERT INTO postulaciones (vacante_titulo, nombre_aspirante, email_aspirante, telefono, cv_nombre) VALUES (?, ?, ?, ?, ?)',
      [vacante, nombre, email, telefono, cvFile ? cvFile.originalname : 'Sin CV']
    );

    res.json({ success: true, message: '¡Postulación guardada en la base de datos con éxito!' });
  } catch (error) {
    console.error('Error al registrar postulación:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;