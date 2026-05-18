const db = require("../config/db.config.js");

async function obtenerRegistros() {
  const [rows] = await db.query(`
    SELECT id,nombre,fecha,hora FROM registros
  `);

  return rows;
}

module.exports = {
  obtenerRegistros
};
