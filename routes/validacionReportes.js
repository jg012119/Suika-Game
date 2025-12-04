const express = require("express");
const router = express.Router();
const db = require("../db");
const { authMiddleware, adminMiddleware } = require("../middleware/auth");

// 🔹 Obtener todos los reportes (para validación - solo admin)
router.get("/", authMiddleware, adminMiddleware, (req, res) => {
  const sql = `
    SELECT r.idReporte, r.titulo, r.descripcion, r.imagen,
           r.latitud, r.longitud, r.estadoReporte AS estado,
           c.nombre AS nombreCategoria
    FROM reportes r
    LEFT JOIN categoria c ON r.idCategoria = c.idCategoria
    ORDER BY r.fechaCreacion DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: "Error al obtener reportes" });
    res.json(results);
  });
});

// 🔹 Actualizar estado de un reporte (solo admin)
router.put("/:idReporte/estado", authMiddleware, adminMiddleware, (req, res) => {
  const { idReporte } = req.params;
  const { estado } = req.body;

  const estadosValidos = ["Pendiente", "Aprobado", "Rechazado"];
  if (!estadosValidos.includes(estado)) {
    return res.status(400).json({ error: "Estado no válido" });
  }

  const sql = `UPDATE reportes SET estadoReporte = ?, fechaActualizacion = NOW() WHERE idReporte = ?`;
  db.query(sql, [estado, idReporte], (err, result) => {
    if (err) return res.status(500).json({ error: "Error al actualizar estado" });
    res.json({ success: true, idReporte, estado });
  });
});

module.exports = router;
