const jwt = require('jsonwebtoken');
const { getConnection } = require('../database');
const sql = require('mssql');

const verifyToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
        return res.status(403).json({ message: 'No se proporcionó un token.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const pool = await getConnection();
        const result = await pool.request()
            .input('userId', sql.Int, decoded.id)
            .query('SELECT UsuarioID, Email, Rol FROM Usuarios WHERE UsuarioID = @userId');

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        req.user = result.recordset[0];
        next();
    } catch (error) {
        return res.status(401).json({ message: 'No autorizado. Token inválido o expirado.' });
    }
};

const checkRole = (roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.Rol)) {
            return res.status(403).json({ message: 'No tienes el rol necesario para acceder a este recurso.' });
        }
        next();
    };
};

module.exports = {
    verifyToken,
    checkRole
};
