const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/reportes", (req, res) => {
  const query = `
    SELECT 
      SUM(CASE WHEN LOWER(TRIM(estadoReporte)) = 'pendiente' THEN 1 ELSE 0 END) AS pendientes,
      SUM(CASE WHEN LOWER(TRIM(estadoReporte)) = 'aprobado' THEN 1 ELSE 0 END) AS resueltos,
      SUM(CASE WHEN LOWER(TRIM(estadoReporte)) = 'rechazado' THEN 1 ELSE 0 END) AS rechazados
    FROM reportes
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message || 'Error en la base de datos' });
    res.json(results[0]);
  });
});


// Obtener cantidad de usuarios
router.get("/usuario", (req, res) => {
  db.query("SELECT COUNT(*) AS totalUsuarios FROM usuario", (err, results) => {
    if (err) return res.status(500).json({ error: err.message || 'Error en la base de datos' });
    res.json({ totalUsuarios: results[0].totalUsuarios });
  });
});

// Reportes por categoría
router.get("/categoria", (req, res) => {
  const query = `
    SELECT c.nombre AS categoria, COUNT(*) AS total
    FROM reportes r
    LEFT JOIN categoria c ON r.idCategoria = c.idCategoria
    GROUP BY c.nombre
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message || 'Error en la base de datos' });
    res.json(results);
  });
});

// Votos por reporte
router.get("/votos", (req, res) => {
  db.query(
    "SELECT titulo, votos FROM reportes ORDER BY votos DESC LIMIT 10",
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message || 'Error en la base de datos' });
      res.json(results);
    }
  );
});

module.exports = router;
