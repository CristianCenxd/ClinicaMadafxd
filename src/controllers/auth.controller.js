const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getConnection } = require('../database');
const sql = require('mssql');

const register = async (req, res) => {
    const { email, password, nombre, rol } = req.body;

    if (!email || !password || !nombre || !rol) {
        return res.status(400).json({ message: 'Por favor, ingrese todos los campos.' });
    }

    try {
        const pool = await getConnection();
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        await pool.request()
            .input('email', sql.NVarChar, email)
            .input('passwordHash', sql.NVarChar, passwordHash)
            .input('nombre', sql.NVarChar, nombre)
            .input('rol', sql.NVarChar, rol)
            .query('INSERT INTO Usuarios (Email, PasswordHash, Nombre, Rol) VALUES (@email, @passwordHash, @nombre, @rol)');

        const result = await pool.request()
            .input('email', sql.NVarChar, email)
            .query('SELECT UsuarioID, Email, Rol FROM Usuarios WHERE Email = @email');
        
        const user = result.recordset[0];

        const token = jwt.sign({ id: user.UsuarioID, rol: user.Rol }, process.env.JWT_SECRET, {
            expiresIn: '1h'
        });

        res.status(201).json({ token });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al registrar el usuario.' });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Por favor, ingrese todos los campos.' });
    }

    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('email', sql.NVarChar, email)
            .query('SELECT * FROM Usuarios WHERE Email = @email');

        if (result.recordset.length === 0) {
            return res.status(400).json({ message: 'Credenciales incorrectas.' });
        }

        const user = result.recordset[0];

        const isMatch = await bcrypt.compare(password, user.PasswordHash);

        if (!isMatch) {
            return res.status(400).json({ message: 'Credenciales incorrectas.' });
        }

        const token = jwt.sign({ id: user.UsuarioID, rol: user.Rol }, process.env.JWT_SECRET, {
            expiresIn: '1h'
        });

        res.json({ token });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al iniciar sesión.' });
    }
};

module.exports = {
    register,
    login
};
