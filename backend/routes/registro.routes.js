const express = require('express');
const router = express.Router();
const { obtenerRegistros, generarReporte } = require('../controllers/registro.controller');


// Rutas públicas

router.get("/registro", obtenerRegistros);
router.get("/reporte", generarReporte);




module.exports = router;
