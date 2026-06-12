const express = require("express");
const router = express.Router();
const {
  crearUsuario,
  obtenerUsuarios,
  eliminarUsuario,
} = require("../controllers/usuarios.controller");
const {
  upload,
  handleUploadErrors,
} = require("../config/cloudinary.config");

router.get("/", obtenerUsuarios);

router.delete("/:id", eliminarUsuario);

router.post(
  "/crear-usuario",
  upload.array("fotos", 10),
  handleUploadErrors,
  crearUsuario
);

module.exports = router;
