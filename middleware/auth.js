// backend/middleware/auth.js
const { verifyToken } = require("../utils/jwt");

/**
 * Middleware de autenticación
 * Verifica que la petición incluya un token JWT válido
 * Extrae los datos del usuario y los añade a req.user
 */
function authMiddleware(req, res, next) {
    try {
        // Obtener token del header Authorization
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                error: "No se proporcionó token de autenticación"
            });
        }

        // Formato esperado: "Bearer TOKEN"
        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                error: "Formato de token inválido"
            });
        }

        // Verificar y decodificar token
        const decoded = verifyToken(token);

        // Agregar datos del usuario a la petición
        req.user = decoded;

        next();
    } catch (error) {
        return res.status(401).json({
            error: error.message || "Token inválido"
        });
    }
}

/**
 * Middleware para verificar rol de administrador
 */
function adminMiddleware(req, res, next) {
    if (req.user.rol !== "Administrador") {
        return res.status(403).json({
            error: "Acceso denegado. Se requiere rol de administrador."
        });
    }
    next();
}

module.exports = {
    authMiddleware,
    adminMiddleware
};
