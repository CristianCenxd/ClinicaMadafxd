const { Router } = require('express');
const { verifyToken, checkRole } = require('../middlewares/auth.middleware');

const router = Router();

// Esta ruta solo será accesible para usuarios con rol 'Medico' o 'Admin'
router.get('/medico', [verifyToken, checkRole(['Medico', 'Admin'])], (req, res) => {
    res.json({ 
        message: `Bienvenido, ${req.user.Email}. Tienes acceso a la ruta de médicos.`,
        user: req.user 
    });
});

// Esta ruta será accesible para cualquier usuario autenticado
router.get('/paciente', verifyToken, (req, res) => {
    res.json({ 
        message: `Bienvenido, ${req.user.Email}. Tienes acceso a la información de paciente.`,
        user: req.user 
    });
});


// Ruta para Cajeros (y Admin)
router.get('/cajero', [verifyToken, checkRole(['Cajero', 'Admin'])], (req, res) => {
    res.json({ 
        message: `Bienvenido, ${req.user.Email}. Tienes acceso a la ruta de CAJA.`,
        user: req.user 
    });
});

// Ruta para Farmacéuticos (y Admin)
router.get('/farmaceutico', [verifyToken, checkRole(['Farmaceutico', 'Admin'])], (req, res) => {
    res.json({ 
        message: `Bienvenido, ${req.user.Email}. Tienes acceso a la ruta de FARMACIA.`,
        user: req.user 
    });
});

// Ruta solo para Administradores
router.get('/admin', [verifyToken, checkRole(['Admin'])], (req, res) => {
    res.json({ 
        message: `Bienvenido, ${req.user.Email}. Tienes acceso a la ruta de ADMINISTRACIÓN.`,
        user: req.user 
    });
});


module.exports = router;
