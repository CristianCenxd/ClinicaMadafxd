const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();
const { getConnection } = require('./database');

// Verificar conexión a la BD al iniciar
async function checkDbConnection() {
    try {
        const pool = await getConnection();
        console.log('Conexión a la base de datos establecida correctamente.');
        pool.close();
    } catch (error) {
        console.error('No se pudo conectar a la base de datos.');
    }
}

checkDbConnection();

const app = express();

// Middlewares
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Rutas
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/test', require('./routes/test.routes'));
app.use(express.static('public'));
app.use('/api/auth', require('./routes/auth.routes'));

app.get('/', (req, res) => {
    res.send('API Gateway y Autenticación');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
