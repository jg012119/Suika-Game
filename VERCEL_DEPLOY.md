# Deploy Backend en Vercel

## 📋 Información del Framework

**Framework**: Express.js (Node.js)  
**Tipo de Deploy**: Serverless Functions

## 🚀 Pasos para Deploy en Vercel

### 1. Instalar Vercel CLI (Opcional)
```bash
npm i -g vercel
```

### 2. Deploy desde GitHub (Recomendado)

#### Opción A: Desde el Dashboard de Vercel

1. Ve a https://vercel.com y haz login con GitHub
2. Click en **"Add New Project"**
3. Selecciona tu repositorio: `jg012119/Suika-Game`
4. Configura el proyecto:
   - **Framework Preset**: Selecciona **"Other"** o **"Express.js"**
   - **Root Directory**: `.` (raíz del proyecto)
   - **Build Command**: `npm install` (dejar por defecto)
   - **Output Directory**: Dejar vacío
   - **Install Command**: `npm install`

5. **Variables de Entorno** - Click en "Environment Variables" y agrega:

```
DB_HOST=db33735.public.databaseasp.net
DB_PORT=3306
DB_USER=db33735
DB_PASSWORD=c+9AX7a#%R5d
DB_NAME=db33735
CLOUDINARY_CLOUD_NAME=dvqcq0e3f
CLOUDINARY_API_KEY=767868261926247
CLOUDINARY_API_SECRET=gw1PUer_fqLO2v4U2K__SKPF-M
FRONTEND_URL=https://tu-frontend-url.vercel.app
NODE_ENV=production
```

6. Click en **"Deploy"**

#### Opción B: Desde la CLI

```bash
# Desde el directorio BACKEND
vercel

# Seguir las instrucciones:
# - Set up and deploy? Yes
# - Which scope? Tu cuenta
# - Link to existing project? No
# - Project name? all-in-backend
# - Directory? ./ (actual)
# - Override settings? No
```

### 3. Configurar Variables de Entorno (CLI)

```bash
vercel env add DB_HOST
# Ingresa: db33735.public.databaseasp.net

vercel env add DB_PORT
# Ingresa: 3306

vercel env add DB_USER
# Ingresa: db33735

vercel env add DB_PASSWORD
# Ingresa: c+9AX7a#%R5d

vercel env add DB_NAME
# Ingresa: db33735

vercel env add CLOUDINARY_CLOUD_NAME
# Ingresa: dvqcq0e3f

vercel env add CLOUDINARY_API_KEY
# Ingresa: 767868261926247

vercel env add CLOUDINARY_API_SECRET
# Ingresa: gw1PUer_fqLO2v4U2K__SKPF-M

vercel env add FRONTEND_URL
# Ingresa: tu URL del frontend

vercel env add NODE_ENV
# Ingresa: production
```

### 4. Re-deploy con Variables

```bash
vercel --prod
```

## 📂 Archivos Creados para Vercel

- ✅ `vercel.json` - Configuración de deployment
- ✅ `server.js` - Modificado para exportar la app (compatible con serverless)

## 🔗 URLs de la API

Después del deploy, tu API estará en:
```
https://your-project-name.vercel.app
```

Ejemplos de endpoints:
```
https://your-project-name.vercel.app/api/reporte
https://your-project-name.vercel.app/api/categoria
https://your-project-name.vercel.app/api/usuario/login
```

## ⚠️ Limitaciones de Vercel (Plan Gratuito)

- **Timeout**: 10 segundos máximo por función
- **Tamaño**: 50MB máximo por función
- **Ejecución**: Funciones serverless (no conexiones persistentes)
- **Conexiones DB**: Se crean/destruyen por cada request

### Optimización para MySQL

Vercel crea una nueva conexión de base de datos en cada request. Para optimizar:

1. Usar **connection pooling** (ya configurado en `db.js`)
2. Considerar usar **PlanetScale** o **Railway** si hay problemas de conexión
3. Mantener queries simples y rápidas

## 🔄 Actualizar el Deployment

### Desde GitHub
Cada vez que hagas push a la rama `main`, Vercel automáticamente hará re-deploy.

### Desde CLI
```bash
git add .
git commit -m "Update backend"
git push

# O directamente con Vercel CLI
vercel --prod
```

## 📝 Testing

Una vez deployado, prueba estos endpoints:

```bash
# Health check
curl https://your-app.vercel.app/api/reporte/ping

# List categories
curl https://your-app.vercel.app/api/categoria

# List reports
curl https://your-app.vercel.app/api/reporte
```

## 🎯 Próximos Pasos

1. ✅ Hacer commit de `vercel.json` y `server.js` actualizado
2. ✅ Push a GitHub
3. ✅ Deploy en Vercel
4. ✅ Configurar variables de entorno
5. ✅ Actualizar URL del backend en el frontend

## 💡 Tips

- Vercel detecta automáticamente cambios en GitHub
- Puedes ver logs en tiempo real en el dashboard de Vercel
- Cada deploy genera una URL única de preview
- Solo los deploys a `main` van a producción

---

**Framework**: Express.js  
**Plataforma**: Vercel Serverless  
**Costo**: Gratis (Hobby tier)
