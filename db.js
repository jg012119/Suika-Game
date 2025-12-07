// backend/db.js
require("dotenv").config();
const mysql = require("mysql2");

// Crear pool de conexiones (mejor para producción)
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "all_in",
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Probar conexión inicial
pool.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Error de conexión a MySQL:", err);
    return;
  }
  console.log("✅ Conectado a MySQL");
  connection.release(); // Devolver conexión al pool
});

module.exports = pool;

