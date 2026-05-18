const express = require("express");
const cors = require("cors");

require("dotenv").config();




//import rutas
const registroRoutes = require("./routes/registro.routes");
const reconocimientoRoutes = require("./routes/reconocimiento.routes");


const app = express();


// Configuración CORS para cookies
const corsOptions = {
  origin: 'http://127.0.0.1:5500',
  credentials: true, // IMPORTANTE: Permite enviar cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));



app.use(express.json());

//url de endpoint
app.use("/api/registro", registroRoutes);
app.use("/api/reconocimiento", reconocimientoRoutes);



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});