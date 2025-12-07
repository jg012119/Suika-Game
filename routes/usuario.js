// backend/routes/usuario.js
const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcryptjs");
const { authMiddleware } = require("../middleware/auth");

// Obtener todos los usuarios (protegido)
router.get("/", authMiddleware, (req, res) => {
  db.query(
    `SELECT u.idUsuario, u.nombreCompleto, u.correo, r.nombre AS rol
     FROM usuario u
     LEFT JOIN rol r ON u.idRol = r.idRol`,
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: "Error en la consulta" });
      }
      res.json(results);
    }
  );
});

// Registrar un nuevo usuario con rol "Usuario"
router.post("/", async (req, res) => {
  const { nombreCompleto, correo, contrasena } = req.body;

  if (!nombreCompleto || !correo || !contrasena) {
    return res.status(400).json({ error: "Todos los campos son requeridos" });
  }

  try {
    // Buscar id del rol "Usuario"
    db.query("SELECT idRol FROM rol WHERE nombre = 'Usuario'", async (err, rows) => {
      if (err) return res.status(500).json({ error: "Error al buscar rol" });

      if (rows.length === 0) {
        return res.status(400).json({ error: "No existe el rol 'Usuario'" });
      }

      const idRol = rows[0].idRol;

      // Encriptar contraseña
      const hashedPassword = await bcrypt.hash(contrasena, 10);

      // Insertar usuario
      db.query(
        "INSERT INTO usuario (idRol, nombreCompleto, correo, contrasena) VALUES (?, ?, ?, ?)",
        [idRol, nombreCompleto, correo, hashedPassword],
        (err, result) => {
          if (err) {
            if (err.code === "ER_DUP_ENTRY") {
              return res.status(400).json({ error: "El correo ya está registrado" });
            }
            return res.status(500).json({ error: "Error al registrar usuario" });
          }

          res.status(201).json({
            idUsuario: result.insertId,
            nombreCompleto,
            correo,
            rol: "Usuario",
          });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: "Error en el servidor" });
  }
});
// Login de usuario
router.post("/login", (req, res) => {
  const { correo, contrasena } = req.body;

  if (!correo || !contrasena) {
    return res.status(400).json({ error: "Correo y contraseña requeridos" });
  }

  db.query(
    `SELECT u.*, r.nombre AS rolNombre
     FROM usuario u
     LEFT JOIN rol r ON u.idRol = r.idRol
     WHERE u.correo = ?`,
    [correo],
    async (err, results) => {
      if (err) return res.status(500).json({ error: "Error en la consulta" });
      if (results.length === 0) {
        return res.status(400).json({ error: "Usuario no encontrado" });
      }

      const user = results[0];

      const match = await bcrypt.compare(contrasena, user.contrasena);
      if (!match) {
        return res.status(400).json({ error: "Contraseña incorrecta" });
      }

      // Generar token JWT
      const { generateToken } = require("../utils/jwt");
      const token = generateToken({
        idUsuario: user.idUsuario,
        correo: user.correo,
        rol: user.rolNombre
      });

      res.json({
        idUsuario: user.idUsuario,
        nombreCompleto: user.nombreCompleto,
        correo: user.correo,
        rol: user.rolNombre,
        foto: user.foto ? user.foto : null,
        token, // 🔑 Enviar token JWT
        mensaje: "Login exitoso ✅",
      });
    }
  );
});

// backend/routes/usuario.js

// Actualizar nombre de usuario (protegido - solo el propio usuario)
router.put("/:id", authMiddleware, (req, res) => {
  const { id } = req.params;
  const { nombreCompleto } = req.body;

  // Verificar que el usuario solo pueda editar su propio perfil
  if (req.user.idUsuario !== parseInt(id)) {
    return res.status(403).json({ error: "No puedes editar el perfil de otro usuario" });
  }

  if (!nombreCompleto) {
    return res.status(400).json({ error: "El nombre es requerido" });
  }

  db.query(
    "UPDATE usuario SET nombreCompleto = ? WHERE idUsuario = ?",
    [nombreCompleto, id],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Error al actualizar nombre" });
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }
      res.json({ mensaje: "Nombre actualizado correctamente", nombreCompleto });
    }
  );
});
const { uploadUsuarios } = require("../utils/cloudinary");


// Subir o actualizar foto (protegido)
router.put("/:id/foto", authMiddleware, (req, res, next) => {
  uploadUsuarios.single("foto")(req, res, (err) => {
    if (err) {
      console.error("❌ Error al subir foto (Cloudinary):", err);
      return res.status(500).json({ error: "Error subiendo foto: " + (err.message || err) });
    }
    next();
  });
}, (req, res) => {
  const { id } = req.params;
  const { nombreCompleto } = req.body;

  // Verificar ownership
  if (req.user.idUsuario !== parseInt(id)) {
    return res.status(403).json({ error: "No puedes editar el perfil de otro usuario" });
  }

  if (!req.file) return res.status(400).json({ error: "Archivo no recibido" });

  // Con Cloudinary, req.file.path contiene la URL segura
  const fotoUrl = req.file.path;

  let sql = "UPDATE usuario SET foto = ?";
  const params = [fotoUrl];

  if (nombreCompleto) {
    sql += ", nombreCompleto = ?";
    params.push(nombreCompleto);
  }

  sql += " WHERE idUsuario = ?";
  params.push(id);

  db.query(sql, params, (err) => {
    if (err) return res.status(500).json({ error: "Error al actualizar perfil" });
    res.json({ mensaje: "Perfil actualizado", nombreCompleto, foto: fotoUrl });
  });
});

// Quitar foto (protegido)
router.delete("/:id/foto", authMiddleware, (req, res) => {
  const { id } = req.params;

  // Verificar ownership
  if (req.user.idUsuario !== parseInt(id)) {
    return res.status(403).json({ error: "No puedes editar el perfil de otro usuario" });
  }

  db.query("UPDATE usuario SET foto = NULL WHERE idUsuario = ?", [id], (err) => {
    if (err) return res.status(500).json({ error: "Error al quitar foto" });
    res.json({ mensaje: "Foto eliminada" });
  });
});

module.exports = router;



