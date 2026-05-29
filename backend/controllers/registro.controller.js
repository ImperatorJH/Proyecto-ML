const Registro = require("../models/registro.models");

// Obtener todos los registros
async function obtenerRegistros(req, res) {
  try {
    const registros = await Registro.obtenerRegistros();

    res.status(200).json({
      success: true,
      data: registros
    });
  } catch (err) {
    console.error("Error al obtener registros:", err);
    res.status(500).json({
      success: false,
      message: "Error del servidor al obtener registros"
    });
  }
} 

async function generarReporte(req, res) {
  try {
    const reporte = await Registro.generarReporteCsv();

    res.status(200).json({
      success: true,
      message: "Reporte generado correctamente",
      data: reporte
    });
  } catch (err) {
    console.error("Error al generar reporte:", err);
    res.status(500).json({
      success: false,
      message: "Error del servidor al generar reporte"
    });
  }
}

module.exports = { 
    obtenerRegistros,
    generarReporte
};
