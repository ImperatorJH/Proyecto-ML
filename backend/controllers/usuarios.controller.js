



async function crearUsuario(req, res) {
  const { nombre } = req.body;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No se envió ninguna imagen",
      });
    }

    // Obtener datos del usuario
    const [usuarioActual] = await db.query(
      `SELECT nombre, img_public_id FROM usuarios WHERE id_usuario = ?`,
      [id]
    );

    const publicIdAntiguo = usuarioActual[0]?.img_public_id;
    const nombreUsuario = usuarioActual[0]?.nombre || `usuario_${id}`;

    // Subir imagen a Cloudinary
    const uploadResult = await uploadToCloudinary(req.file.buffer, {
      folder: "lms/avatares",
      public_id: `user_${Date.now()}_${nombreUsuario.toLowerCase().replace(/\s+/g, "_")}`,
      transformation: [
        { width: 300, height: 300, crop: "fill", gravity: "face" },
        { quality: "auto:good" },
      ],
    });

    const avatarUrl = uploadResult.secure_url;
    const nuevoPublicId = uploadResult.public_id;

    // Actualizar en base de datos
    await db.query(
      `UPDATE usuarios 
       SET img_usuario = ?, img_public_id = ?, actualizado = NOW()
       WHERE id_usuario = ?`,
      [avatarUrl, nuevoPublicId, id]
    );

    // Eliminar avatar antiguo
    if (publicIdAntiguo) {
      eliminarAvatarAntiguo(publicIdAntiguo).catch(console.error);
    }

    res.status(200).json({
      success: true,
      message: "Avatar actualizado correctamente",
      data: {
        imagen: avatarUrl,
        publicId: nuevoPublicId,
      },
    });
  } catch (error) {
    console.error("Error al actualizar avatar:", error);
    res.status(500).json({
      success: false,
      message: "Error del servidor",
    });
  }
}
