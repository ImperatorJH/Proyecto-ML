const express = require("express");
const cors = require("cors");
const path = require("path");

require("dotenv").config();

// import rutas
const registroRoutes = require("./routes/registro.routes");
const reconocimientoRoutes = require("./routes/reconocimiento.routes");
const usuariosRoutes = require("./routes/usuarios.routes");

const app = express();

// Configuracion CORS para cookies
const corsOptions = {
  origin: "http://127.0.0.1:5500",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend")));

// url de endpoint
app.use("/api/registro", registroRoutes);
app.use("/api/reconocimiento", reconocimientoRoutes);
app.use("/api/usuarios", usuariosRoutes);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
