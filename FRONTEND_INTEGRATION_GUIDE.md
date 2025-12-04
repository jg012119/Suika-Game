# Guía de Integración Frontend con JWT

Esta guía explica cómo actualizar el frontend para trabajar con el nuevo sistema de autenticación JWT del backend.

## 📋 Cambios Necesarios en el Frontend

### 1. Actualizar el Componente de Login

```javascript
// Ejemplo: LoginPage.jsx o similar

async function handleLogin(e) {
  e.preventDefault();
  
  try {
    const response = await fetch('http://localhost:3001/api/usuario/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        correo: email, 
        contrasena: password 
      })
    });

    const data = await response.json();

    if (response.ok && data.token) {
      // ✅ Guardar token y datos del usuario
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userData', JSON.stringify({
        idUsuario: data.idUsuario,
        nombreCompleto: data.nombreCompleto,
        correo: data.correo,
        rol: data.rol,
        foto: data.foto
      }));

      // Redirigir al usuario
      navigate('/dashboard');
    } else {
      alert(data.error || 'Error al iniciar sesión');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error de conexión');
  }
}
```

---

### 2. Crear Utilidad para Peticiones Autenticadas

Crea un archivo `api.js` o similar para centralizar las peticiones:

```javascript
// utils/api.js

const API_URL = 'http://localhost:3001/api';

// Obtener token del localStorage
function getToken() {
  return localStorage.getItem('authToken');
}

// Obtener datos del usuario
function getUser() {
  const userData = localStorage.getItem('userData');
  return userData ? JSON.parse(userData) : null;
}

// Petición autenticada genérica
async function authFetch(endpoint, options = {}) {
  const token = getToken();
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  };

  const response = await fetch(`${API_URL}${endpoint}`, config);
  
  // Si el token expiró o es inválido
  if (response.status === 401) {
    // Limpiar sesión y redirigir al login
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    window.location.href = '/login';
    throw new Error('Sesión expirada');
  }

  return response;
}

export { authFetch, getToken, getUser };
```

---

### 3. Actualizar Creación de Reportes

**ANTES** (enviabas `idUsuario` en el body):
```javascript
const response = await fetch('http://localhost:3001/api/reporte', {
  method: 'POST',
  body: formData // incluía idUsuario
});
```

**AHORA**:
```javascript
import { authFetch, getToken } from './utils/api';

// Si usas FormData (para imágenes)
const formData = new FormData();
formData.append('titulo', titulo);
formData.append('descripcion', descripcion);
formData.append('idCategoria', idCategoria);
formData.append('latitud', latitud);
formData.append('longitud', longitud);
formData.append('urgencia', urgencia);
// ❌ NO envíes idUsuario - se extrae del token
formData.append('imagen', imageFile);

const token = getToken();
const response = await fetch('http://localhost:3001/api/reporte', {
  method: 'POST',
  headers: {
    // ⚠️ NO incluyas 'Content-Type' cuando envías FormData
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

---

### 4. Actualizar Sistema de Votos

**ANTES**:
```javascript
await fetch(`http://localhost:3001/api/reporte/${idReporte}/votar`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ idUsuario })
});
```

**AHORA**:
```javascript
import { authFetch } from './utils/api';

await authFetch(`/reporte/${idReporte}/votar`, {
  method: 'POST'
  // ❌ NO envíes body - idUsuario se extrae del token
});
```

---

### 5. Actualizar Comentarios

**ANTES**:
```javascript
await fetch(`/api/reporte/${idReporte}/comentarios`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ idUsuario, comentario })
});
```

**AHORA**:
```javascript
import { authFetch } from './utils/api';

await authFetch(`/reporte/${idReporte}/comentarios`, {
  method: 'POST',
  body: JSON.stringify({ comentario }) // Solo el comentario
});
```

---

### 6. Actualizar "Mis Reportes"

**ANTES**:
```javascript
const response = await fetch(`/api/MisReportes/${idUsuario}`);
```

**AHORA**:
```javascript
import { authFetch } from './utils/api';

const response = await authFetch('/MisReportes'); // Sin idUsuario en la URL
const data = await response.json();
```

---

### 7. Actualizar Edición de Perfil

**ANTES**:
```javascript
await fetch(`/api/usuario/${idUsuario}`, {
  method: 'PUT',
  body: JSON.stringify({ nombreCompleto })
});
```

**AHORA**:
```javascript
import { authFetch, getUser } from './utils/api';

const user = getUser();

await authFetch(`/usuario/${user.idUsuario}`, {
  method: 'PUT',
  body: JSON.stringify({ nombreCompleto })
});
```

---

### 8. Botón de Logout

```javascript
function handleLogout() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userData');
  navigate('/login');
}
```

---

### 9. Proteger Rutas en el Frontend

Si usas React Router:

```javascript
// components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { getToken } from './utils/api';

function ProtectedRoute({ children }) {
  const token = getToken();
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

export default ProtectedRoute;
```

Usar en tus rutas:

```javascript
<Route path="/dashboard" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />
```

---

## 🔍 Testing con Postman

Para probar los endpoints manualmente:

1. **Login**: POST `http://localhost:3001/api/usuario/login`
   - Body: `{ "correo": "usuario@example.com", "contrasena": "password" }`
   - Copiar el `token` de la respuesta

2. **Peticiones protegidas**: Agregar header
   - Key: `Authorization`
   - Value: `Bearer TU_TOKEN_AQUI`

---

## ⚠️ Errores Comunes

### Error 401: "No se proporcionó token de autenticación"
**Causa**: No estás enviando el header `Authorization`
**Solución**: Asegúrate de incluir `Authorization: Bearer <token>` en todas las rutas protegidas

### Error 401: "Token inválido o expirado"
**Causa**: El token expiró (7 días por defecto) o fue modificado
**Solución**: Hacer logout y login nuevamente

### Error 403: "No puedes editar el perfil de otro usuario"
**Causa**: Intentas editar un recurso que no te pertenece
**Solución**: Verifica que el `idUsuario` en la URL coincida con el del token

---

## 📝 Resumen de URLs que Cambiaron

| Antes | Ahora | Notas |
|-------|-------|-------|
| `GET /api/MisReportes/:idUsuario` | `GET /api/MisReportes` | idUsuario del token |
| Body con `idUsuario` en POST reporte | Sin `idUsuario` | Se extrae del token |
| Body con `idUsuario` en votar | Sin body | Se extrae del token |
| Body con `idUsuario` en comentarios | Solo `comentario` | Se extrae del token |
