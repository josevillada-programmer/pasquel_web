const db = require('../config/db');

const createUser = async (nombre, email, password, rol) => {
    const [result] = await db.execute(
        'INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)',
        [nombre, email, password, rol]
    );
    return result;
};

const getUserByEmail = async (email) => {
    const [rows] = await db.execute(
        'SELECT * FROM usuarios WHERE email = ?',
        [email]
    );
    return rows[0];
};

module.exports = {
    createUser,
    getUserByEmail
};