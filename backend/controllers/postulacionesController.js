const db = require('../config/db');

// Obtener todas las postulaciones
const getPostulaciones = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM postulaciones');
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Crear una nueva postulación
const createPostulacion = async (req, res) => {
    try {
        const { usuario_id, vacante_id } = req.body;
        
        const query = 'INSERT INTO postulaciones (usuario_id, vacante_id) VALUES (?, ?)';
        const [result] = await db.query(query, [usuario_id, vacante_id]);
        
        res.status(201).json({ 
            message: 'Postulación registrada exitosamente',
            id: result.insertId,
            usuario_id,
            vacante_id
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Eliminar una postulación (si el usuario se arrepiente)
const deletePostulacion = async (req, res) => {
    try {
        const { id } = req.params;
        const query = 'DELETE FROM postulaciones WHERE id = ?';
        const [result] = await db.query(query, [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Postulación no encontrada' });
        }
        res.status(200).json({ message: 'Postulación eliminada exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getPostulaciones,
    createPostulacion,
    deletePostulacion
};