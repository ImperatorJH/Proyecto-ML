const express = require('express');
const router = express.Router();
const { obtenerRegistros } = require('../controllers/registro.controller');


// Rutas públicas

router.get("/registro", obtenerRegistros);




module.exports = router;