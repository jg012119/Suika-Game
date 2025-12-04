// backend/routes/reporte.js
const express = require("express");
const router = express.Router();
const db = require("../db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { authMiddleware } = require("../middleware/auth");

/* ========= Comprobación ========= */
router.get("/ping", (req, res) => {
  res.json({ ok: true, msg: "Ruta /reporte activa ✅" });
});

const { uploadReportes } = require("../utils/cloudinary");


/* ========= Crear reporte (protegido) ========= */
router.post("/", authMiddleware, uploadReportes.single("imagen"), (req, res) => {
  const {
    titulo,
    descripcion,
    idCategoria,
    latitud,
    longitud,
    urgencia,
    estadoReporte,
  } = req.body;

  // Extraer idUsuario del token (ya autenticado)
  const idUsuario = req.user.idUsuario;

  if (!titulo || !descripcion || !idCategoria || !latitud || !longitud || !urgencia) {
    return res.status(400).json({ error: "Faltan campos requeridos" });
  }

  // Con Cloudinary, req.file.path contiene la URL segura
  const imagenRuta = req.file ? req.file.path : null;

  const sql = `
  INSERT INTO reportes
  (idUsuario, titulo, descripcion, idCategoria, imagen, latitud, longitud, urgencia, estadoReporte, fechaCreacion, fechaActualizacion, votos, estado)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), 0, 1)
`;

  db.query(
    sql,
    [
      idUsuario,
      titulo,
      descripcion,
      idCategoria,
      imagenRuta,
      latitud,
      longitud,
      urgencia,
      estadoReporte || "Pendiente",
    ],

    (err, result) => {
      if (err) {
        console.error("Error al crear reporte:", err);
        return res.status(500).json({ error: "Error al registrar reporte" });
      }

      res.status(201).json({
        idReporte: result.insertId,
        mensaje: "Reporte creado correctamente",
        imagen: imagenRuta,
      });
    }
  );
});

/* ========= Listar reportes ========= */
router.get("/", (req, res) => {
  const sql = `
    SELECT r.*, u.nombreCompleto AS usuario, c.nombre AS categoria
    FROM reportes r
    LEFT JOIN usuario u ON u.idUsuario = r.idUsuario
    LEFT JOIN categoria c ON c.idCategoria = r.idCategoria
    WHERE r.estado = 1
    ORDER BY r.fechaCreacion DESC
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error al obtener reportes:", err);
      return res.status(500).json({ error: "Error en la consulta" });
    }
    res.json(results);
  });
});

/* ========= Detalle por ID ========= */
router.get("/:id", (req, res) => {
  const { id } = req.params;
  const idNum = Number(id);
  if (!Number.isFinite(idNum)) {
    return res.status(400).json({ error: "ID inválido" });
  }

  const sql = `
    SELECT r.*, u.nombreCompleto AS usuario, c.nombre AS categoria
    FROM reportes r
    LEFT JOIN usuario u ON u.idUsuario = r.idUsuario
    LEFT JOIN categoria c ON c.idCategoria = r.idCategoria
    WHERE r.idReporte = ? AND r.estado = 1
    LIMIT 1
  `;
  db.query(sql, [idNum], (err, rows) => {
    if (err) {
      console.error("Error al obtener reporte:", err);
      return res.status(500).json({ error: "Error en la consulta" });
    }
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: "Reporte no encontrado" });
    }
    res.json(rows[0]);
  });
});
/* ========= Votar o quitar voto (protegido) ========= */
router.post("/:id/votar", authMiddleware, (req, res) => {
  const { id } = req.params;
  const idUsuario = req.user.idUsuario; // Del token

  const checkSql = "SELECT * FROM votos WHERE idUsuario = ? AND idReporte = ?";
  db.query(checkSql, [idUsuario, id], (err, rows) => {
    if (err) return res.status(500).json({ error: "Error al verificar voto" });

    // Si ya votó → eliminar voto
    if (rows.length > 0) {
      const delSql = "DELETE FROM votos WHERE idUsuario = ? AND idReporte = ?";
      db.query(delSql, [idUsuario, id], (err2) => {
        if (err2) return res.status(500).json({ error: "Error al eliminar voto" });

        // Resta 1 en reportes
        db.query(
          "UPDATE reportes SET votos = GREATEST(votos - 1, 0) WHERE idReporte = ?",
          [id],
          (err3) => {
            if (err3) return res.status(500).json({ error: "Error al actualizar votos" });
            res.json({ message: "Voto eliminado", liked: false });
          }
        );
      });
    } else {
      // Si no votó → insertar voto
      const insertSql = "INSERT INTO votos (idUsuario, idReporte) VALUES (?, ?)";
      db.query(insertSql, [idUsuario, id], (err4) => {
        if (err4) return res.status(500).json({ error: "Error al registrar voto" });

        db.query(
          "UPDATE reportes SET votos = votos + 1 WHERE idReporte = ?",
          [id],
          (err5) => {
            if (err5) return res.status(500).json({ error: "Error al actualizar votos" });
            res.json({ message: "Voto registrado", liked: true });
          }
        );
      });
    }
  });
});

/* ========= Obtener cantidad y estado de voto ========= */
router.get("/:id/votos/:idUsuario", (req, res) => {
  const { id, idUsuario } = req.params;
  const sqlTotal = "SELECT votos FROM reportes WHERE idReporte = ?";
  const sqlUser = "SELECT * FROM votos WHERE idReporte = ? AND idUsuario = ?";

  db.query(sqlTotal, [id], (err, totalRows) => {
    if (err) return res.status(500).json({ error: "Error al obtener votos" });

    db.query(sqlUser, [id, idUsuario], (err2, userRows) => {
      if (err2) return res.status(500).json({ error: "Error al verificar usuario" });

      res.json({
        total: totalRows[0]?.votos || 0,
        liked: userRows.length > 0,
      });
    });
  });
});

/* ========= Listar comentarios de un reporte ========= */
router.get("/:id/comentarios", (req, res) => {
  const { id } = req.params;
  const sql = `
    SELECT c.idComentario, c.idUsuario, u.nombreCompleto AS nombreUsuario, c.comentario, c.fechaComentario
    FROM comentarios c
    LEFT JOIN usuario u ON u.idUsuario = c.idUsuario
    WHERE c.idReporte = ? AND c.estado = 1
    ORDER BY c.fechaComentario ASC
  `;
  db.query(sql, [id], (err, rows) => {
    if (err) {
      console.error("Error al obtener comentarios:", err);
      return res.status(500).json({ error: "Error al listar comentarios" });
    }
    res.json(rows);
  });
});

/* ========= Crear nuevo comentario (protegido) ========= */
router.post("/:id/comentarios", authMiddleware, (req, res) => {
  const { id } = req.params;
  const { comentario } = req.body;
  const idUsuario = req.user.idUsuario; // Del token

  if (!comentario || !comentario.trim()) {
    return res.status(400).json({ error: "El comentario es requerido" });
  }

  const sql = `
    INSERT INTO comentarios (idReporte, idUsuario, comentario, fechaComentario, estado)
    VALUES (?, ?, ?, NOW(), 1)
  `;
  db.query(sql, [id, idUsuario, comentario], (err, result) => {
    if (err) {
      console.error("Error al crear comentario:", err);
      return res.status(500).json({ error: "No se pudo registrar el comentario" });
    }

    res.status(201).json({
      idComentario: result.insertId,
      idUsuario,
      comentario,
      fechaComentario: new Date(),
    });
  });
});

module.exports = router;
