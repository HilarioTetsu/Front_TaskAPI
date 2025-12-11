# 🚀 TaskEnterprise – Frontend  
Aplicación Frontend desarrollada con Vue 3 + Vite + TypeScript para la gestión de proyectos, tareas e invitaciones.

Este proyecto forma parte de un sistema empresarial donde los usuarios pueden:

- Gestionar proyectos.
- Ver y administrar miembros por rol (OWNER / EDITOR / VIEWER).
- Enviar invitaciones para colaborar en proyectos.
- Aceptar o rechazar invitaciones.
- Visualizar métricas y estadísticas en un dashboard.
- Administrar tareas dentro de cada proyecto.

Este repositorio contiene únicamente el frontend, el cual se comunica con una API REST construida con Spring Boot.

---

## 🛠️ Tecnologías utilizadas

| Tecnología | Uso |
|-----------|-----|
| Vue 3 (Composition API) | Base del frontend |
| Vite | Empaquetado y servidor dev |
| TypeScript | Tipado estricto |
| Pinia | Store global |
| Vue Router | Navegación SPA |
| Axios | Cliente HTTP |
| TailwindCSS | Estilos |
| Heroicons | Iconos SVG |

---

## 📁 Estructura principal del proyecto

src/
├── components/
│ ├── layout/ # AppShell, Sidebar, Header
│ └── projects/ # Tabs y componentes de proyectos
├── stores/ # Pinia stores (auth, projects, invitations)
├── services/ # Axios instance + API handlers
├── views/ # Pantallas principales
│ ├── DashboardView.vue
│ ├── InvitationsView.vue
│ └── projects/
├── router/ # Vue Router config
└── assets/


---

## ⚙️ Configuración del entorno

### 1️⃣ Clonar repositorio

```bash
git clone https://github.com/tu-repo/taskenterprise-frontend.git
cd taskenterprise-frontend

2️⃣ Instalar dependencias
npm install

3️⃣ Configurar el archivo .env

Crear archivo:

VITE_API_URL=http://localhost:8080/ExampleAPI/v1

4️⃣ Iniciar en modo desarrollo
npm run dev

5️⃣ Compilar para producción
npm run build

🔐 Autenticación

El frontend utiliza un AuthStore (Pinia) que almacena:

JWT token

Datos del usuario autenticado

Estado isAuthenticated

El backend expone un endpoint de login:

POST /auth/login


Axios adjunta el token automáticamente en cada petición mediante un interceptor.

📬 Sistema de invitaciones

El sitio permite:

Enviar invitaciones
POST /invitations

Aceptar invitaciones
PATCH /invitations/{id}/4

Rechazar invitaciones
PATCH /invitations/{id}/5

Consultar invitaciones pendientes
GET /invitations?status=PENDING

🔔 Contador de invitaciones pendientes

El Sidebar muestra un badge indicando cuántas invitaciones están pendientes.
El contador se actualiza:

Al cargar el layout tras iniciar sesión.

Tras aceptar o rechazar una invitación.

Al navegar a la sección de invitaciones.

Al cambiar el estado de autenticación.

📂 Gestión de proyectos

Incluye:

Listado de proyectos.

Vista detallada por proyecto.

Miembros con roles:

OWNER

EDITOR

VIEWER

Cambio de rol de miembros.

Eliminación de miembros.

Tabs de tareas y miembros.

📊 Dashboard

Incluye widgets:

Proyectos activos

Proyectos donde el usuario es Owner

Tareas pendientes

Tareas del día

Gráficas por prioridad

Gráficas por estado de tareas

🧪 Estado actual del proyecto

✔️ Autenticación funcional

✔️ Gestión de proyectos

✔️ Sistema de invitaciones implementado

✔️ Sidebar con contador dinámico

✔️ Roles y permisos

