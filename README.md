# Sistema de Gestión de Planes Móviles

## Descripción

Aplicación móvil que facilita la gestión y contratación de planes móviles. Los usuarios pueden explorar diferentes opciones de planes, contactar con asesores comerciales y gestionar sus contrataciones, todo desde una interfaz moderna e intuitiva.

## Roles de Usuario

### Invitado
Los visitantes pueden navegar libremente por el catálogo de planes sin necesidad de registrarse. Tienen acceso a toda la información de los planes disponibles, incluyendo precios, características y beneficios. Cuando encuentran un plan de su interés, pueden registrarse para proceder con la contratación.

### Usuario Registrado
Una vez registrados, los usuarios pueden contratar los planes que les interesen. El sistema guarda un historial completo de todas sus contrataciones, permitiéndoles revisar el estado de cada una. Además, cuentan con un sistema de chat donde pueden comunicarse directamente con los asesores comerciales para resolver dudas o gestionar sus solicitudes. También pueden actualizar su información personal en cualquier momento.

### Asesor Comercial
Los asesores tienen acceso a un panel administrativo completo donde gestionan todo el catálogo de planes. Pueden crear nuevos planes, modificar los existentes, activarlos o desactivarlos según sea necesario. Reciben todas las solicitudes de contratación de los usuarios y deciden si aprobarlas o rechazarlas. El sistema de chat les permite mantener comunicación constante con los clientes para brindar soporte personalizado.

## Módulos del Sistema

### Autenticación

El sistema cuenta con un módulo de registro e inicio de sesión seguro. Los usuarios pueden crear su cuenta proporcionando información básica, y el sistema automáticamente les asigna el rol de usuario registrado. Los asesores comerciales son designados por el administrador del sistema.

**Capturas de pantalla:**

[Pantalla de Login]

[Pantalla de Registro]

---

### Catálogo de Planes

Este es el corazón de la aplicación. Muestra todos los planes móviles disponibles con su información completa: precio mensual, cantidad de datos, minutos de llamada y mensajes SMS incluidos. Cada plan tiene una imagen representativa y está categorizado según el tipo de usuario al que va dirigido (estudiantes, profesionales, uso familiar, etc.).

**Capturas de pantalla:**

[Vista del Catálogo - Todos los planes]

[Detalle de un Plan específico]

---

### Mis Contrataciones (Usuario)

Los usuarios registrados tienen acceso a su historial personal de contrataciones. Aquí pueden ver el estado actual de cada solicitud: si está pendiente de revisión, si fue aceptada o si fue rechazada. Para cada contratación, pueden ver toda la información del plan y acceder directamente al chat con su asesor asignado.

**Capturas de pantalla:**

[Lista de Contrataciones del Usuario]

[Detalle de una Contratación]

---

### Gestión de Planes (Asesor)

Los asesores comerciales administran todo el catálogo desde su panel personalizado. Pueden ver todos los planes existentes de un vistazo, crear nuevos planes completando un formulario intuitivo, editar cualquier aspecto de los planes actuales, y activar o desactivar planes según la disponibilidad. Al crear o editar un plan, pueden subir imágenes que se almacenan de forma segura en la nube.

**Capturas de pantalla:**

[Dashboard del Asesor - Vista general de planes]

[Formulario de Creación de Plan]

[Formulario de Edición de Plan]

---

### Gestión de Contrataciones (Asesor)

En esta sección, los asesores ven todas las solicitudes de contratación realizadas por los usuarios. Pueden filtrar por estado para enfocarse en las pendientes, revisar las aceptadas o consultar el historial de rechazadas. Para cada solicitud, tienen acceso a la información completa del cliente y del plan solicitado, pudiendo aprobar o rechazar según corresponda. Desde aquí también pueden iniciar conversaciones con los clientes.

**Capturas de pantalla:**

[Lista de Contrataciones Pendientes]

[Lista de Contrataciones Aceptadas]

[Detalle de Contratación con opciones de Aprobar/Rechazar]

---

### Chat en Tiempo Real

El sistema de mensajería conecta a usuarios y asesores de forma instantánea. Cada contratación tiene su propio chat asociado, lo que facilita el seguimiento de las conversaciones. Los mensajes se actualizan en tiempo real, por lo que ambas partes pueden mantener una comunicación fluida sin necesidad de recargar la aplicación. El sistema marca los mensajes como leídos automáticamente.

**Capturas de pantalla:**

[Chat desde la vista del Usuario]

[Chat desde la vista del Asesor]

[Lista de Conversaciones]

---

### Perfil de Usuario

Cada usuario tiene acceso a su perfil personal donde puede consultar y actualizar su información. Pueden modificar su nombre, número de teléfono y otros datos de contacto. También tienen la opción de cambiar su contraseña y cerrar sesión de forma segura.

**Capturas de pantalla:**

[Pantalla de Perfil]

[Edición de Información Personal]

---

## Tecnologías

La aplicación está desarrollada con Ionic y Angular, lo que permite una experiencia nativa en dispositivos móviles. El backend utiliza Supabase, que proporciona una base de datos PostgreSQL, almacenamiento en la nube para las imágenes, y actualizaciones en tiempo real para el chat y las notificaciones. Todo el sistema cuenta con autenticación segura y políticas de acceso que garantizan que cada usuario solo pueda ver y modificar la información que le corresponde.

## Autor

Richard Padilla
