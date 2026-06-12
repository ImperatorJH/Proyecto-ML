const Usuario = require("../models/usuario.model");
const fs = require("fs/promises");
const path = require("path");
const {
  uploadToCloudinary,
  eliminarMultiplesArchivos,
} = require("../config/cloudinary.config");

function limpiarNombreArchivo(nombre) {
  return nombre
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 60) || "usuario";
}

async function guardarFotoLocal(buffer, carpetaUsuario, nombreArchivo) {
  const datasetDir = path.join(__dirname, "../../ML/dataset", carpetaUsuario);
  await fs.mkdir(datasetDir, { recursive: true });

  const rutaFoto = path.join(datasetDir, nombreArchivo);
  await fs.writeFile(rutaFoto, buffer);

  return rutaFoto;
}

async function guardarMetadataLocal(carpetaUsuario, datos) {
  const datasetDir = path.join(__dirname, "../../ML/dataset", carpetaUsuario);
  await fs.mkdir(datasetDir, { recursive: true });

  await fs.writeFile(
    path.join(datasetDir, "usuario.json"),
    JSON.stringify(datos, null, 2)
  );
}

async function limpiarCacheDeepFace() {
  const datasetDir = path.join(__dirname, "../../ML/dataset");

  try {
    const archivos = await fs.readdir(datasetDir);
    const caches = archivos.filter((archivo) => archivo.endsWith(".pkl"));

    await Promise.all(
      caches.map((cache) =>
        fs.rm(path.join(datasetDir, cache), { force: true })
      )
    );

    return caches;
  } catch (error) {
    console.error("Error limpiando cache de DeepFace:", error);
    return [];
  }
}

async function crearUsuario(req, res) {
  const nombre = String(req.body.nombre || "").trim();
  const codigo = String(req.body.codigo || "").trim();
  const archivos = req.files || [];
  const publicIdsSubidos = [];

  try {
    if (!nombre) {
      return res.status(400).json({
        success: false,
        message: "El nombre del usuario es requerido",
      });
    }

    if (!codigo) {
      return res.status(400).json({
        success: false,
        message: "El codigo del usuario es requerido",
      });
    }

    if (!archivos.length) {
      return res.status(400).json({
        success: false,
        message: "Debes enviar al menos una foto del usuario",
      });
    }

    const basePublicId = limpiarNombreArchivo(nombre);
    const carpetaUsuario = `${limpiarNombreArchivo(codigo)}__${basePublicId}`;
    await guardarMetadataLocal(carpetaUsuario, { nombre, codigo });

    const fotosSubidas = await Promise.all(
      archivos.map(async (archivo, index) => {
        const nombreArchivo = `foto_${index + 1}.jpg`;
        const localPath = await guardarFotoLocal(
          archivo.buffer,
          carpetaUsuario,
          nombreArchivo
        );

        const resultado = await uploadToCloudinary(archivo.buffer, {
          folder: `recfacial/usuarios/${carpetaUsuario}`,
          public_id: `${carpetaUsuario}_${Date.now()}_${index + 1}`,
          resource_type: "image",
          allowed_formats: ["jpg", "jpeg", "png", "webp"],
          transformation: [
            { width: 700, height: 700, crop: "fill", gravity: "face" },
            { quality: "auto:good" },
            { fetch_format: "auto" },
          ],
        });

        publicIdsSubidos.push(resultado.public_id);

        return {
          url: resultado.secure_url,
          publicId: resultado.public_id,
          localPath,
        };
      })
    );

    const usuario = await Usuario.crearUsuario(nombre, codigo);
    await Usuario.guardarFotosUsuario(usuario.id_usuario, fotosSubidas);
    await limpiarCacheDeepFace();

    return res.status(201).json({
      success: true,
      message: "Usuario creado correctamente",
      data: {
        usuario,
        fotos: fotosSubidas,
      },
    });
  } catch (error) {
    console.error("Error al crear usuario:", error);

    if (publicIdsSubidos.length) {
      eliminarMultiplesArchivos(publicIdsSubidos).catch(console.error);
    }

    return res.status(500).json({
      success: false,
      message: "Error del servidor al crear usuario",
    });
  }
}

async function obtenerUsuarios(req, res) {
  try {
    const usuarios = await Usuario.obtenerUsuarios();

    return res.status(200).json({
      success: true,
      data: usuarios,
    });
  } catch (error) {
    console.error("Error al obtener usuarios:", error);

    return res.status(500).json({
      success: false,
      message: "Error del servidor al obtener usuarios",
    });
  }
}

async function eliminarUsuario(req, res) {
  const usuarioId = Number(req.params.id);

  try {
    if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID de usuario invalido",
      });
    }

    const usuario = await Usuario.obtenerUsuarioPorId(usuarioId);

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    const fotos = await Usuario.obtenerFotosUsuario(usuarioId);
    const publicIds = fotos
      .map((foto) => foto.public_id)
      .filter(Boolean);
    const carpetasLocales = [
      ...new Set(
        fotos
          .map((foto) => foto.local_path && path.dirname(foto.local_path))
          .filter(Boolean)
      ),
    ];

    const resultadoCloudinary = await eliminarMultiplesArchivos(publicIds);

    await Promise.all(
      carpetasLocales.map((carpeta) =>
        fs.rm(carpeta, { recursive: true, force: true })
      )
    );

    await Usuario.eliminarUsuario(usuarioId);
    const cachesEliminados = await limpiarCacheDeepFace();

    return res.status(200).json({
      success: true,
      message: "Usuario eliminado correctamente",
      data: {
        usuario,
        fotosEliminadas: fotos.length,
        cachesEliminados,
        cloudinary: resultadoCloudinary,
      },
    });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);

    return res.status(500).json({
      success: false,
      message: "Error del servidor al eliminar usuario",
    });
  }
}

module.exports = {
  crearUsuario,
  obtenerUsuarios,
  eliminarUsuario,
};
