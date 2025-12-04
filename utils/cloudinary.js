const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

// Configurar Cloudinary con credenciales de entorno
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configurar almacenamiento para Usuarios (Fotos de perfil)
const storageUsuarios = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "usuarios", // Carpeta en Cloudinary
        allowed_formats: ["jpg", "png", "jpeg", "webp"],
        transformation: [{ width: 500, height: 500, crop: "limit" }], // Optimización básica
    },
});

// Configurar almacenamiento para Reportes (Evidencia)
const storageReportes = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "reportes", // Carpeta en Cloudinary
        allowed_formats: ["jpg", "png", "jpeg", "webp"],
        // No forzamos dimensiones aquí para mantener calidad de evidencia
    },
});

const uploadUsuarios = multer({ storage: storageUsuarios });
const uploadReportes = multer({ storage: storageReportes });

module.exports = {
    cloudinary,
    uploadUsuarios,
    uploadReportes,
};
