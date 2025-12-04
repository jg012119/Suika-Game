// backend/db.js
require("dotenv").config();
const mysql = require("mysql2");

// Crear la conexión usando variables de entorno
const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "all_in",
  port: process.env.DB_PORT || 3306
});

// Conectar
db.connect((err) => {
  if (err) {
    console.error("❌ Error de conexión a MySQL:", err);
    return;
  }
  console.log("✅ Conectado a MySQL");
});

module.exports = db;

