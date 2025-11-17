# Sistema de Gestión de Planes Móviles

## 🚀 Descripción del Proyecto

Aplicación móvil desarrollada con **Ionic + Angular** y **Supabase** para la gestión de planes móviles con tres tipos de usuarios:
- **Invitados**: Ver catálogo de planes
- **Usuarios Registrados**: Ver, contratar planes y chat con asesores
- **Asesores Comerciales**: CRUD de planes, gestión de contrataciones y chat con clientes

## ✨ Características Principales

### 🎯 Funcionalidades por Rol

#### Invitado
- ✅ Ver catálogo de planes móviles
- ✅ Ver detalles de cada plan
- ✅ Registro e inicio de sesión

#### Usuario Registrado
- ✅ Todas las funciones de invitado
- ✅ Contratar planes
- ✅ Ver historial de contrataciones
- ✅ Chat en tiempo real con asesor
- ✅ Gestión de perfil

#### Asesor Comercial
- ✅ Dashboard de gestión de planes
- ✅ Crear, editar y eliminar planes
- ✅ Subir imágenes para planes (Storage)
- ✅ Ver todas las contrataciones
- ✅ Aceptar o rechazar contrataciones
- ✅ Chat en tiempo real con clientes
- ✅ Filtrar contrataciones por estado

### 🔥 Características Técnicas

- ⚡ **Realtime**: Actualizaciones en tiempo real para planes, contrataciones y chat
- 🔐 **Autenticación**: Sistema completo con roles y permisos
- 📦 **Storage**: Gestión de imágenes en Supabase Storage
- 🛡️ **RLS**: Row Level Security configurado para máxima seguridad
- 🎨 **UI/UX**: Interfaz moderna con Ionic Components
- 📱 **Responsive**: Diseño adaptable a diferentes tamaños de pantalla

## 📋 Requisitos Previos

- Node.js (v16 o superior)
- npm o yarn
- Ionic CLI: `npm install -g @ionic/cli`
- Cuenta en Supabase

## 🛠️ Instalación

### 1. Clonar el repositorio
```bash
git clone <url-del-repositorio>
cd prueba2RichardPadilla
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar Supabase

#### A. Crear proyecto en Supabase
1. Ve a [supabase.com](https://supabase.com)
2. Crea un nuevo proyecto
3. Obtén tu `SUPABASE_URL` y `SUPABASE_ANON_KEY` desde Settings → API

#### B. Ejecutar script de base de datos
1. Ve a tu proyecto Supabase Dashboard
2. Ve a "SQL Editor"
3. Abre el archivo `supabase-schema.sql`
4. Copia y pega el contenido completo
5. Ejecuta el script

#### C. Crear bucket de Storage
1. Ve a Storage en Supabase Dashboard
2. Crea un nuevo bucket llamado `planes-imagenes`
3. Marca el bucket como **Público**
4. Ejecuta las políticas de Storage incluidas en el script SQL

#### D. Habilitar Realtime
1. Ve a Database → Replication
2. Habilita Realtime para:
   - `planes_moviles`
   - `contrataciones`
   - `mensajes_chat`

### 4. Configurar variables de entorno

Las credenciales ya están configuradas en:
- `src/environments/environment.ts`
- `src/environments/environment.prod.ts`

Tu URL y Key ya están incluidas en el proyecto.

## 🚀 Ejecutar la Aplicación

### Modo desarrollo
```bash
ionic serve
```

### Modo desarrollo con recarga en vivo
```bash
ionic serve --lab
```

### Probar en dispositivo/emulador Android
```bash
# Preparar assets nativos
ionic capacitor add android

# Sincronizar código
ionic capacitor sync android

# Abrir en Android Studio
ionic capacitor open android
```

## 📱 Generar APK

### Opción 1: Android Studio (Recomendado)
```bash
ionic capacitor build android
# Luego en Android Studio: Build → Build Bundle(s) / APK(s) → Build APK(s)
```

### Opción 2: Expo EAS (si usas Expo)
```bash
npm install -g eas-cli
eas build -p android --profile preview
```

## 🗂️ Estructura del Proyecto

```
src/
├── app/
│   ├── guards/              # Guards de autenticación y roles
│   │   ├── auth.guard.ts
│   │   └── role.guard.ts
│   ├── models/              # Interfaces y tipos TypeScript
│   │   └── database.types.ts
│   ├── services/            # Servicios de la aplicación
│   │   ├── supabase.service.ts
│   │   ├── auth.service.ts
│   │   ├── planes.service.ts
│   │   ├── contrataciones.service.ts
│   │   └── chat.service.ts
│   ├── pages/              # Páginas de la aplicación
│   │   ├── login/
│   │   ├── registro/
│   │   ├── catalogo/
│   │   ├── detalle-plan/
│   │   ├── mis-contrataciones/
│   │   ├── chat/
│   │   ├── perfil/
│   │   └── asesor/
│   │       ├── dashboard/
│   │       ├── crear-plan/
│   │       └── contrataciones-asesor/
│   ├── tabs/               # Navegación con tabs
│   └── app.routes.ts       # Configuración de rutas
├── environments/            # Variables de entorno
└── theme/                  # Estilos globales
```

## 🔑 Usuarios de Prueba

### Crear Asesor Comercial
1. Regístrate normalmente en la app
2. Ve a Supabase Dashboard → Table Editor → perfiles
3. Encuentra tu usuario y cambia el campo `rol` a `asesor_comercial`
4. Cierra sesión y vuelve a iniciar sesión

### Usuario Registrado
- Cualquier nuevo registro automáticamente es `usuario_registrado`

## 📊 Base de Datos

### Tablas Principales

#### `perfiles`
- Usuario con rol (invitado, usuario_registrado, asesor_comercial)
- Información personal (nombre, email, teléfono)

#### `planes_moviles`
- Planes disponibles con precio, datos, minutos, SMS
- Imagen almacenada en Storage
- Estado activo/inactivo

#### `contrataciones`
- Relación usuario-plan
- Estados: pendiente, aceptado, rechazado
- Notas del cliente

#### `mensajes_chat`
- Chat en tiempo real por contratación
- Estado leído/no leído

## 🔐 Seguridad

- ✅ Row Level Security (RLS) habilitado
- ✅ Políticas específicas por rol
- ✅ Autenticación con JWT
- ✅ Guards en rutas sensibles
- ✅ Validación de permisos en backend

## 🎨 Tecnologías Utilizadas

- **Frontend**: Ionic 7 + Angular 17
- **Backend**: Supabase
- **Base de Datos**: PostgreSQL (Supabase)
- **Storage**: Supabase Storage
- **Realtime**: Supabase Realtime
- **Autenticación**: Supabase Auth
- **Lenguaje**: TypeScript

## 📝 Próximos Pasos

1. **Ejecutar el script SQL** en Supabase
2. **Crear el bucket** `planes-imagenes`
3. **Habilitar Realtime** en las tablas
4. **Probar la aplicación** con `ionic serve`
5. **Crear usuarios de prueba** (1 asesor, 2-3 usuarios)
6. **Generar APK** para pruebas en dispositivo real

## 🐛 Solución de Problemas

### Error de conexión a Supabase
- Verifica que las credenciales en `environment.ts` sean correctas
- Asegúrate de que el proyecto Supabase esté activo

### Imágenes no se cargan
- Verifica que el bucket `planes-imagenes` sea público
- Revisa las políticas de Storage en Supabase

### Realtime no funciona
- Verifica que Realtime esté habilitado para las tablas
- Revisa las políticas RLS

### Errores de permisos
- Revisa que el usuario tenga el rol correcto
- Verifica las políticas RLS en Supabase

## 👨‍💻 Autor

Richard Padilla

## 📄 Licencia

Este proyecto es privado y de uso educativo.
