// backend/utils/jwt.js
require("dotenv").config();
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "default_secret_key";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

/**
 * Genera un token JWT para un usuario
 * @param {Object} payload - Datos del usuario (idUsuario, correo, rol)
 * @returns {String} Token JWT
 */
function generateToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verifica un token JWT
 * @param {String} token - Token a verificar
 * @returns {Object} Payload decodificado
 * @throws {Error} Si el token es inválido o expiró
 */
function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        throw new Error("Token inválido o expirado");
    }
}

module.exports = {
    generateToken,
    verifyToken
};
