# CRACare — Contexto del proyecto

**Última actualización:** Febrero 2025

Este archivo resume el estado del proyecto para retomar el trabajo o para que el asistente de Cursor tenga contexto en la próxima sesión.

---

## Qué es CRACare

Sistema de gestión para una **casa de reposo**. Ejecución **local** con base de datos en **AWS RDS**.

- **Backend:** Node.js, Express, Prisma (ORM), PostgreSQL.
- **Frontend:** React, Vite, React Router.
- **Base de datos:** PostgreSQL en **AWS RDS** (ver `docs/AWS-BASE-DATOS.md`).

- **Repositorio:** https://github.com/Jcarlos1995/cracare  
- **Ruta local:** `c:\Users\JoseCarlos.DESKTOP-842LG29.000\Desktop\sistemas\CRACare`

---

## Roles del sistema

| Rol | Descripción | Módulos principales |
|-----|-------------|----------------------|
| **ADMINISTRADOR** | Logística; gestión global de usuarios, inventario, reportes, pacientes, solicitudes de insumo. | Dashboard, Usuarios, Inventario, Consignas, Contratos, Reportes, Pacientes (todos), Citas (solo vista en dashboard). |
| **RAA** | Jefa de OSS; por piso. Gestiona equipo OSS, horarios, pacientes de su piso, registro de cuidados, actividades (baño semanal). | Dashboard, Inventario (notificar insumo), Horarios (turnos OSS), Pacientes (suyos), Registro diario, Actividades (baño semanal), Diario unificado. |
| **RAS** | Jefa de Enfermería. Gestiona equipo de enfermeras y horarios de enfermería. | Dashboard, Inventario, Horarios Enfermera, Pacientes (suyos), Medicaciones, Diario medicaciones. |
| **OSS** | Operador Socio Sanitario (asignado a una RAA). Solo lectura de pacientes; registro diario de cuidados; actividades (baño) en solo lectura. | Dashboard, Mis turnos, Pacientes (solo ver), Registro diario, Actividades (ver semana), Diario unificado, Consignas personales. |
| **MEDICO** | Médico. Pacientes en lectura; medicaciones y tratamientos. | Dashboard, Pacientes (ver), Medicaciones, Diario medicaciones, Consignas personales. |
| **ENFERMERA** | Enfermera (asignada a RAS). Medicaciones, tratamientos, pacientes. | Igual que RAS en medicaciones/tratamientos según permisos. |
| **RECEPCIONISTA** | Visitas de familiares/amigos, citas, ingresos de materiales. | Dashboard (citas agendadas), Citas, Materiales, Pacientes (solo lista/detalle, sin medicaciones/tratamientos). |
| **FISIOTERAPEUTA** | Terapias de rehabilitación por residente. Pacientes en solo lectura + consigna personal. | Dashboard (terapias pendientes/efectuadas), Pacientes (ver + consigna personal), Terapia (registro y marcar efectuada). |

---

## Lo que está implementado

### Backend

- **Estructura:** `backend/src/app.js` define la app Express; `backend/src/index.js` arranca el servidor en local.
- **Auth:** login (JWT), `/api/auth/me`; CORS con `FRONTEND_URL`.
- **Config:** `backend/src/config/` — `index.js` (port, JWT, frontendUrl, uploadsDir), `database.js` (Prisma), `upload.js` (multer: contratos y hojas clínicas en `backend/uploads/`).

**Controladores y rutas (resumen por módulo):**

| Módulo | Controlador | Rutas API (resumen) | Roles |
|--------|-------------|---------------------|--------|
| Auth | auth.controller | `/api/auth/login`, `/api/auth/me` | Público / autenticado |
| Usuarios | user.controller | `/api/users`, `/api/users/:id/contrato` | Admin |
| Dashboard | dashboard.controller | `/api/dashboard` | Autenticado (contenido según rol) |
| Inventario | inventario.controller | CRUD inventario | Admin |
| Consignas | consigna.controller | CRUD consignas | Todos crean; admin edita/elimina |
| Consignas personales | consignaPersonal.controller | por paciente, diario unificado | Autenticado |
| Movimientos | movimiento.controller | CRUD movimientos | Admin |
| Pacientes | paciente.controller | CRUD, hoja clínica PDF | Admin, RAA (suyos); otros según rol |
| Medicamentos paciente | medicamentoPaciente.controller | por paciente, grid, diario | RAS, Médico, Enfermera |
| Tratamientos | tratamientoPaciente.controller | por paciente | RAS, Médico, Enfermera |
| Solicitudes insumo | solicitudInsumo.controller | CRUD, estados | RAA/RAS crean; Admin gestiona |
| Horarios (OSS) | horario.controller | equipo, mes, día, mis-turnos | RAA (asignar); OSS (mis turnos) |
| Horarios enfermera | horarioEnfermera.controller | equipo, mes, día | RAS |
| Registro cuidados diario | registroCuidadosDiario.controller | por fecha, upsert | OSS, RAA |
| Baño semanal (actividades) | banoSemanal.controller | actividades, banos (get/set) | OSS (lectura), RAA (edición) |
| Visitantes / Citas | visitante.controller, cita.controller | CRUD visitantes, CRUD citas, agendadas | Recepcionista |
| Ingresos materiales | ingresoMaterial.controller | CRUD por categoría SANITARIA/BASICOS_OTROS | Recepcionista |
| Terapias rehabilitación | terapiaRehabilitacion.controller | CRUD terapias, por paciente | Fisioterapeuta |
| Reportes | reportes.controller | mensual, export Excel | Admin |

### Frontend

- **Rutas (App.jsx):** Login, Dashboard, Inventario, Consignas, Contratos, Reportes, Pacientes, PacienteDetalle, Medicaciones, Diario medicaciones, Diario unificado, Horarios (RAA), Horarios Enfermera (RAS), Citas, Materiales, Registro diario, Actividades, Mis turnos, Terapias, Usuarios/UserForm.
- **Layout:** menú según rol (Admin, RAA, RAS, OSS, Recepcionista, Fisioterapeuta, etc.).
- **API:** `frontend/src/api/client.js` — `VITE_API_URL` para base de la API (en local suele ser `http://localhost:4000` o vacío si usas el proxy de Vite).
- **Páginas:** cada módulo tiene su página en `frontend/src/pages/` con estilos `.module.css`.

### Base de datos (Prisma)

- **Ubicación del schema:** `backend/prisma/schema.prisma`.
- **Modelos principales:** User (roles, raaId, rasId, contratoUrl), Inventario, Consigna, Movimiento, Paciente (raaId, hojaClinicaUrl), ConsignaPersonal, MedicamentoPaciente, TratamientoPaciente, SolicitudInsumo, HorarioDia (RAA/OSS), HorarioEnfermeraDia, Visitante, Cita, IngresoMaterial, RegistroCuidadosDiario, BanoSemanal, TerapiaRehabilitacion.
- **Enums:** Role, Turno, TurnoCalendario, TurnoEnfermera, EstadoCita, EstadoSolicitudInsumo, CategoriaMaterial, TipoMovimiento.
- **Migraciones:** en `backend/prisma/migrations/`; aplicar con `npx prisma migrate deploy` (con `DATABASE_URL` en `backend/.env`). Ver **`docs/AWS-BASE-DATOS.md`** para conectar con AWS RDS.

---

## Cómo arrancar en local

1. **Backend:** `cd backend` → crear `.env` con `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL=http://localhost:5173` → `npm run dev` (puerto 4000).
2. **Frontend:** `cd frontend` → opcionalmente `.env` con `VITE_API_URL=http://localhost:4000` → `npm run dev` (puerto 5173).
3. **Login de prueba:** admin@cracare.com / admin123 (si existe el seed).

Migraciones: `cd backend` → `npx prisma migrate deploy`. Seed: `npm run db:seed`.

---

## Notas para el asistente

- Si se pierde contexto en el chat: “Lee docs/CONTEXTO-PROYECTO.md y continúa desde ahí.”
- **RAA y pacientes:** el backend filtra pacientes con `raaId = null` o `raaId = user.id` para la RAA. OSS ve según sus turnos y registro diario.
- **Citas y Materiales:** solo rol RECEPCIONISTA; Admin solo ve citas en el dashboard.
