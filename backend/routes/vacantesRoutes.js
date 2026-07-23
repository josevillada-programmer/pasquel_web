const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Obtener vacantes
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM vacantes');
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener vacantes:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Guardar nueva vacante
router.post('/', async (req, res) => {
  try {
    const { titulo, ubicacion, descripcion, emailAdmin } = req.body;
    
    // Imprimir en consola lo que llega del frontend
    console.log("Datos recibidos para vacante:", req.body);

    if (!emailAdmin || !emailAdmin.endsWith('@pasquelhermanos.com.mx')) {
      return res.status(403).json({ success: false, message: "No autorizado" });
    }

    await db.query(
      'INSERT INTO vacantes (titulo, ubicacion, descripcion) VALUES (?, ?, ?)',
      [titulo, ubicacion, descripcion]
    );

    res.json({ success: true, message: "Vacante guardada con éxito" });
  } catch (error) {
    console.error("Error al insertar vacante en MySQL:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;