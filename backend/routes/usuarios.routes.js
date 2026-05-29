const express = require("express");
const router = express.Router();
const {
  crearUsuario,
  obtenerUsuarios,
} = require("../controllers/usuarios.controller");
const {
  upload,
  handleUploadErrors,
} = require("../config/cloudinary.config");

router.get("/", obtenerUsuarios);

router.post(
  "/crear-usuario",
  upload.array("fotos", 10),
  handleUploadErrors,
  crearUsuario
);

module.exports = router;
