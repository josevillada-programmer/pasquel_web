const db = require('../config/db');

const getVacantes = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM vacantes');
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createVacante = async (req, res) => {
    try {
        // Extraemos exactamente los campos que tiene tu tabla
        // Si no mandan estado, le ponemos 'disponible' por defecto
        const { titulo, descripcion, requisitos, estado = 'disponible' } = req.body;
        
        const query = 'INSERT INTO vacantes (titulo, descripcion, requisitos, estado) VALUES (?, ?, ?, ?)';
        const [result] = await db.query(query, [titulo, descripcion, requisitos, estado]);
        
        res.status(201).json({ 
            message: 'Vacante creada exitosamente',
            id: result.insertId, 
            titulo, 
            descripcion, 
            requisitos, 
            estado 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateVacante = async (req, res) => {
    try {
        const { id } = req.params;
        const { titulo, descripcion, requisitos, estado } = req.body;
        
        const query = 'UPDATE vacantes SET titulo = ?, descripcion = ?, requisitos = ?, estado = ? WHERE id = ?';
        const [result] = await db.query(query, [titulo, descripcion, requisitos, estado, id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Vacante no encontrada' });
        }
        res.status(200).json({ message: 'Vacante actualizada exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteVacante = async (req, res) => {
    try {
        const { id } = req.params;
        const query = 'DELETE FROM vacantes WHERE id = ?';
        const [result] = await db.query(query, [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Vacante no encontrada' });
        }
        res.status(200).json({ message: 'Vacante eliminada exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getPostulantesPorVacante = async (req, res) => {
    try {
        const { id } = req.params;
        const query = `
            SELECT u.id, u.nombre, u.email 
            FROM usuarios u
            JOIN postulaciones p ON u.id = p.usuario_id
            WHERE p.vacante_id = ?
        `;
        const [rows] = await db.query(query, [id]);
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getVacantes,
    createVacante,
    updateVacante,
    deleteVacante,
    getPostulantesPorVacante
};