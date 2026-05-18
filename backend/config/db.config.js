const mysql = require('mysql2/promise');
require('dotenv').config();

const connection = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "admin",
  database: "asistencia_ml",
});



module.exports = connection;