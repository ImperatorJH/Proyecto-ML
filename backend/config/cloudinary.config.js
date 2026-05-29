// config/cloudinary.js
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const { Readable } = require("stream");

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
  secure: true,
});

const uploadToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    // Determinar resource_type basado en el tipo de archivo
    let resource_type = options.resource_type || "auto";
    
    // Si no se especificó, Cloudinary detectará automáticamente
    const uploadOptions = {
      folder: options.folder || "Recfacilal/usuarios",
      resource_type: resource_type,
      public_id: options.public_id,
      allowed_formats: options.allowed_formats || ["jpg", "jpeg", "png", "webp", "gif", "mp4", "mov", "avi", "mkv", "pdf"],
      transformation: options.transformation || [],
      timeout: 120000, // 2 minutos de timeout para archivos grandes
    };

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          console.error("Error en uploadToCloudinary:", error);
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    const bufferStream = new Readable();
    bufferStream.push(buffer);
    bufferStream.push(null);
    bufferStream.pipe(uploadStream);
  });
};


const eliminarArchivoCloudinary = async (publicId) => {
  if (!publicId || publicId.trim() === '') {
    console.log('No hay public_id para eliminar');
    return null;
  }

  try {
    console.log(`Intentando eliminar archivo: ${publicId}`);
    
    const result = await cloudinary.uploader.destroy(publicId, {
      invalidate: true
    });
    
    console.log(`Resultado eliminación ${publicId}:`, result.result);
    return result;
    
  } catch (error) {
    console.error(`Error al eliminar archivo ${publicId}:`, error);
    
    if (error.message.includes('not found') || error.http_code === 404) {
      console.log(`El archivo ${publicId} ya no existe en Cloudinary`);
      return { result: 'not_found' };
    }
    
    throw error;
  }
};


const eliminarMultiplesArchivos = async (publicIds) => {
  if (!publicIds || publicIds.length === 0) {
    return [];
  }

  const resultados = [];
  
  for (const publicId of publicIds) {
    try {
      const resultado = await eliminarArchivoCloudinary(publicId);
      resultados.push({ publicId, resultado });
    } catch (error) {
      console.error(`Fallo eliminando ${publicId}:`, error);
      resultados.push({ publicId, error: error.message });
    }
  }
  
  return resultados;
};

// Configuración de multer - TAMAÑO AUMENTADO (500MB para videos)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Permitir imágenes y videos
  if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
    cb(null, true);
  } else {
    cb(new Error("Solo se permiten archivos de imagen o video"), false);
  }
};

// Crear middleware de upload - CON LÍMITES ALTOS
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500 MB para videos
    files: 20, // Máximo 20 archivos
    fieldSize: 10 * 1024 * 1024, // 10 MB para campos de texto
  },
  fileFilter: fileFilter,
});

// Middleware para manejar errores de upload
const handleUploadErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "El archivo excede el tamaño máximo de 500MB",
      });
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        message: "Has excedido el número máximo de archivos permitidos (20)",
      });
    }
    if (err.code === "LIMIT_FIELD_SIZE") {
      return res.status(400).json({
        success: false,
        message: "Los datos del formulario exceden el tamaño permitido",
      });
    }
    return res.status(400).json({
      success: false,
      message: `Error al subir el archivo: ${err.message}`,
    });
  } else if (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
  next();
};

module.exports = {
  cloudinary,
  uploadToCloudinary,
  upload,
  handleUploadErrors,
  eliminarArchivoCloudinary,
  eliminarMultiplesArchivos
};
