const express = require("express");
const router = express.Router();
const db = require("../db");

// Obtener todas las categorías
router.get("/", (req, res) => {
  db.query("SELECT * FROM categoria", (err, results) => {
    if (err) return res.status(500).json({ error: err.message || 'Error en la base de datos' });
    res.json(results);
  });
});

// Obtener una categoría por ID
router.get("/:idCategoria", (req, res) => {
  const { idCategoria } = req.params;
  db.query("SELECT * FROM categoria WHERE idCategoria = ?", [idCategoria], (err, results) => {
    if (err) return res.status(500).json({ error: err.message || 'Error en la base de datos' });
    res.json(results[0]);
  });
});

// Crear nueva categoría
router.post("/", (req, res) => {
  console.log("POST body:", req.body);
  const { nombre, descripcion } = req.body;
  db.query(
    "INSERT INTO categoria (nombre, descripcion) VALUES (?, ?)",
    [nombre, descripcion],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message || 'Error en la base de datos' });
      res.json({ idCategoria: result.insertId, nombre, descripcion });
    }
  );
});

// Actualizar categoría
router.put("/:idCategoria", (req, res) => {
  const { idCategoria } = req.params;
  const { nombre, descripcion } = req.body;
  db.query(
    "UPDATE categoria SET nombre = ?, descripcion = ? WHERE idCategoria = ?",
    [nombre, descripcion, idCategoria],
    (err) => {
      if (err) return res.status(500).json({ error: err.message || 'Error en la base de datos' });
      res.json({ idCategoria: parseInt(idCategoria), nombre, descripcion });
    }
  );
});


// Eliminar categoría
router.delete("/:idCategoria", (req, res) => {
  const { idCategoria } = req.params;
  db.query("DELETE FROM categoria WHERE idCategoria = ?", [idCategoria], (err) => {
    if (err) return res.status(500).json({ error: err.message || 'Error en la base de datos' });
    res.json({ success: true });
  });
});

module.exports = router;
