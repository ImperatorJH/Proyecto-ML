const db = require("../config/db.config.js");
const fs = require("fs/promises");
const path = require("path");

async function obtenerRegistros() {
  const [rows] = await db.query(`
    SELECT id, nombre, codigo, fecha, hora
    FROM registros
    ORDER BY fecha DESC, hora DESC, id DESC
  `);

  return rows;
}

function escaparCsv(valor) {
  const texto = String(valor ?? "");
  return `"${texto.replace(/"/g, '""')}"`;
}

async function generarReporteCsv() {
  const registros = await obtenerRegistros();
  const reportesDir = path.join(__dirname, "../reportes");
  await fs.mkdir(reportesDir, { recursive: true });

  const fechaArchivo = new Date()
    .toISOString()
    .replace(/[:.]/g, "-")
    .slice(0, 19);
  const nombreArchivo = `asistencia_${fechaArchivo}.csv`;
  const rutaArchivo = path.join(reportesDir, nombreArchivo);

  const encabezados = ["id", "nombre", "codigo", "fecha", "hora"];
  const lineas = [
    encabezados.join(","),
    ...registros.map((registro) =>
      [
        registro.id,
        registro.nombre,
        registro.codigo,
        registro.fecha,
        registro.hora,
      ].map(escaparCsv).join(",")
    ),
  ];

  await fs.writeFile(rutaArchivo, lineas.join("\n"), "utf8");

  return {
    nombreArchivo,
    rutaArchivo,
    total: registros.length,
  };
}

module.exports = {
  obtenerRegistros,
  generarReporteCsv,
};
