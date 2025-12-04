# All-In Backend API

Sistema de reportes ciudadanos - Backend API REST

## 🚀 Descripción

API REST para la plataforma "All-In", una aplicación de reportes ciudadanos que permite a los usuarios reportar problemas en su ciudad, votarlos, comentarlos y hacer seguimiento de su estado.

## 🛠️ Tecnologías

- **Node.js** v18+
- **Express.js** v5.1.0
- **MySQL** v8.0+
- **Cloudinary** (almacenamiento de imágenes)
- **JWT** (autenticación)
- **bcrypt** (encriptación de contraseñas)

## 📋 Requisitos Previos

- Node.js v18 o superior
- MySQL v8.0 o superior
- Cuenta de Cloudinary (para almacenamiento de imágenes)

## 🔧 Instalación Local

1. **Clonar el repositorio**
```bash
git clone https://github.com/jg012119/Suika-Game.git
cd Suika-Game
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**

Crear archivo `.env` en la raíz del proyecto:

```env
# Database Configuration
DB_HOST=tu_host_mysql
DB_PORT=3306
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_NAME=nombre_base_datos

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

# Frontend URL (CORS)
FRONTEND_URL=http://localhost:5173
```

4. **Iniciar el servidor**
```bash
node server.js
```

El servidor se iniciará en `http://localhost:3001`

## 📊 Base de Datos

### Tablas

- `usuario` - Usuarios del sistema
- `rol` - Roles (Usuario, Administrador)
- `categoria` - Categorías de reportes
- `reportes` - Reportes ciudadanos
- `comentarios` - Comentarios en reportes
- `votos` - Votos de usuarios en reportes
- `historial_estado` - Historial de cambios de estado

### Esquema SQL

El esquema completo está configurado en la base de datos hosteada. Ver documentación de base de datos para detalles.

## 🔐 Autenticación

La API usa **JWT (JSON Web Tokens)** para autenticación. 

Para endpoints protegidos, incluir el token en el header:
```
Authorization: Bearer <token>
```

## 📡 Endpoints Principales

### Autenticación

- `POST /usuario` - Registrar nuevo usuario
- `POST /usuario/login` - Iniciar sesión

### Reportes

- `GET /reporte` - Listar todos los reportes
- `GET /reporte/:id` - Obtener reporte por ID
- `POST /reporte` - Crear nuevo reporte (protegido)
- `POST /reporte/:id/votar` - Votar/quitar voto (protegido)
- `GET /reporte/:id/votos/:idUsuario` - Estado de voto
- `GET /reporte/:id/comentarios` - Listar comentarios
- `POST /reporte/:id/comentarios` - Crear comentario (protegido)

### Categorías

- `GET /categoria` - Listar categorías
- `GET /categoria/:id` - Obtener categoría por ID
- `POST /categoria` - Crear categoría
- `PUT /categoria/:id` - Actualizar categoría
- `DELETE /categoria/:id` - Eliminar categoría

### Usuarios

- `GET /usuario` - Listar usuarios (protegido)
- `PUT /usuario/:id` - Actualizar nombre (protegido)
- `PUT /usuario/:id/foto` - Subir foto de perfil (protegido)
- `DELETE /usuario/:id/foto` - Eliminar foto (protegido)

### Administración

- `GET /validacionReportes` - Listar reportes para validación (admin)
- `PUT /validacionReportes/:id/estado` - Cambiar estado de reporte (admin)

### Dashboard

- `GET /dashboard/reportes` - Estadísticas de reportes
- `GET /dashboard/usuario` - Total de usuarios
- `GET /dashboard/categoria` - Reportes por categoría
- `GET /dashboard/votos` - Top reportes por votos

### Mis Reportes

- `GET /MisReportes/:idUsuario` - Reportes del usuario (protegido)

## 📁 Estructura del Proyecto

```
BACKEND/
├── middleware/
│   └── auth.js              # Middleware de autenticación
├── routes/
│   ├── categoria.js         # Rutas de categorías
│   ├── dashboard.js         # Estadísticas
│   ├── historial_estado.js  # Historial de cambios
│   ├── MisReportes.js       # Reportes por usuario
│   ├── reporte.js           # Rutas de reportes
│   ├── usuario.js           # Rutas de usuarios
│   ├── validacionReportes.js# Validación de reportes (admin)
│   └── votos.js             # Sistema de votos
├── utils/
│   ├── cloudinary.js        # Configuración Cloudinary
│   └── jwt.js               # Generación de tokens JWT
├── .env                     # Variables de entorno (NO COMMITEAR)
├── .env.example             # Ejemplo de variables
├── .gitignore               # Archivos ignorados
├── db.js                    # Conexión a base de datos
├── package.json             # Dependencias
└── server.js                # Punto de entrada
```

## 🌐 Deploy en Render.com (Gratis)

1. **Crear cuenta en Render**: https://render.com
2. **Crear Web Service**:
   - Conectar repositorio GitHub
   - Build Command: `npm install`
   - Start Command: `node server.js`
3. **Configurar variables de entorno** en Render:
   - Agregar todas las variables del archivo `.env`
4. **Deploy** automático

## 🔒 Seguridad

- ✅ Contraseñas encriptadas con bcrypt
- ✅ Autenticación JWT
- ✅ Variables de entorno para credenciales
- ✅ CORS configurado
- ✅ `.env` excluido del repositorio
- ✅ Foreign keys con constraints

## 👥 Roles

- **Usuario**: Puede crear reportes, votar, comentar
- **Administrador**: Además puede validar/rechazar reportes

## 📝 Notas

- Las imágenes se almacenan en **Cloudinary** (no en servidor)
- Base de datos hosteada en **databaseasp.net**
- Puerto por defecto: **3001**

## 📄 Licencia

Proyecto privado - All-In

---

**Desarrollado para la plataforma All-In de reportes ciudadanos**
