const db = require("../config/db.config.js");

async function crearUsuario(nombre, codigo) {
  const [result] = await db.query(
    "INSERT INTO usuarios (nombre, codigo) VALUES (?, ?)",
    [nombre, codigo]
  );

  return {
    id_usuario: result.insertId,
    nombre,
    codigo,
  };
}

async function guardarFotosUsuario(usuarioId, fotos) {
  if (!fotos.length) return [];

  const values = fotos.map((foto) => [
    usuarioId,
    foto.url,
    foto.publicId,
    foto.localPath,
  ]);

  await db.query(
    "INSERT INTO usuario_fotos (usuario_id, url, public_id, local_path) VALUES ?",
    [values]
  );

  return fotos;
}

async function obtenerUsuarios() {
  const [rows] = await db.query(`
    SELECT
      u.id_usuario,
      u.nombre,
      u.codigo,
      u.creado,
      COUNT(uf.id) AS total_fotos,
      MAX(uf.url) AS foto
    FROM usuarios u
    LEFT JOIN usuario_fotos uf ON uf.usuario_id = u.id_usuario
    GROUP BY u.id_usuario, u.nombre, u.codigo, u.creado
    ORDER BY u.creado DESC, u.id_usuario DESC
  `);

  return rows;
}

module.exports = {
  crearUsuario,
  guardarFotosUsuario,
  obtenerUsuarios,
};
