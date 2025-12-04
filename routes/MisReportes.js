// backend/routes/MisReportes.js
const express = require("express");
const router = express.Router();
const db = require("../db");
const { authMiddleware } = require("../middleware/auth");

/**
 * GET /api/MisReportes
 * Devuelve SOLO los reportes creados por el usuario autenticado
 */
router.get("/", authMiddleware, (req, res) => {
  const idUsuario = req.user.idUsuario; // Del token

  const sql = `
    SELECT 
      r.idReporte,
      r.titulo,
      r.descripcion,
      r.idCategoria,
      c.nombre AS categoriaNombre,
      r.imagen,
      r.latitud,
      r.longitud,
      r.estadoReporte,
      r.fechaCreacion
    FROM reportes r
    LEFT JOIN categoria c ON c.idCategoria = r.idCategoria
    WHERE r.estado = 1
      AND r.idUsuario = ?
    ORDER BY r.fechaCreacion DESC
  `;

  db.query(sql, [idUsuario], (err, rows) => {
    if (err) {
      console.error("Error al listar MisReportes:", err);
      return res.status(500).json({ error: "Error en la consulta" });
    }
    res.json(rows || []);
  });
});

/**
 * PUT /api/MisReportes/:idReporte
 * Actualiza un reporte SI pertenece al usuario autenticado.
 */
router.put("/:idReporte", authMiddleware, (req, res) => {
  const idReporte = Number(req.params.idReporte);
  const { titulo, descripcion, idCategoria, estado } = req.body;
  const idUsuario = req.user.idUsuario; // Del token

  if (!Number.isInteger(idReporte)) {
    return res.status(400).json({ error: "idReporte inválido" });
  }

  // normaliza estado para tu BD
  const estadoBD = String(estado || "")
    .toLowerCase()
    .replace("aprobado", "aprobado")
    .replace("rechazado", "rechazado")
    .replace("pendiente", "pendiente") || "pendiente";

  const sql = `
    UPDATE reportes
    SET 
      titulo            = COALESCE(?, titulo),
      descripcion       = COALESCE(?, descripcion),
      idCategoria       = COALESCE(?, idCategoria),
      estadoReporte     = COALESCE(?, estadoReporte),
      fechaActualizacion= NOW()
    WHERE idReporte = ?
      AND idUsuario = ?
      AND estado = 1
  `;

  db.query(
    sql,
    [titulo ?? null, descripcion ?? null, idCategoria ?? null, estadoBD, idReporte, idUsuario],
    (err, result) => {
      if (err) {
        console.error("Error al actualizar MisReportes:", err);
        return res.status(500).json({ error: "Error al actualizar reporte" });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "No encontrado o no te pertenece" });
      }
      res.json({ ok: true, mensaje: "Reporte actualizado" });
    }
  );
});

module.exports = router;
