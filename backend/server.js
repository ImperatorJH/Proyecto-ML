const express = require("express");
const cors = require("cors");
const path = require("path");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./docs/swagger");

require("dotenv").config();

// import rutas
const registroRoutes = require("./routes/registro.routes");
const reconocimientoRoutes = require("./routes/reconocimiento.routes");
const usuariosRoutes = require("./routes/usuarios.routes");

const app = express();

const frontendPath = path.join(__dirname, "../frontend");
const frontendDistPath = path.join(frontendPath, "dist");

// Configuracion CORS para cookies
const corsOptions = {
  origin: ["http://127.0.0.1:5500", "http://localhost:5173", "http://127.0.0.1:5173"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json());

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/api/docs.json", (req, res) => {
  res.json(swaggerSpec);
});

app.get("/", (req, res) => {
  res.sendFile(path.join(frontendDistPath, "index.html"));
});

app.get("/portafolio", (req, res) => {
  res.sendFile(path.join(frontendPath, "portafolio.html"));
});

app.get("/sistema", (req, res) => {
  res.sendFile(path.join(frontendDistPath, "index.html"));
});

app.use(express.static(frontendDistPath, { index: false }));
app.use(express.static(frontendPath, { index: false }));

// url de endpoint
app.use("/api/registro", registroRoutes);
app.use("/api/reconocimiento", reconocimientoRoutes);
app.use("/api/usuarios", usuariosRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
