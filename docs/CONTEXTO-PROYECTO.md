# CRACare — Contexto del proyecto

**Última actualización:** Febrero 2025

Este archivo resume el estado del proyecto para retomar el trabajo o para que el asistente de Cursor tenga contexto en la próxima sesión.

---

## Qué es CRACare

Sistema de gestión para una **casa de reposo**. Incluye backend (Node.js, Express, Prisma, PostgreSQL), frontend (React, Vite) y base de datos en **AWS RDS**.

- **Repositorio:** https://github.com/Jcarlos1995/cracare
- **Ruta local:** `c:\Users\JoseCarlos.DESKTOP-842LG29.000\Desktop\sistemas\CRACare`

---

## Roles del sistema

| Rol | Descripción |
|-----|-------------|
| ADMINISTRADOR | Logística; gestiona usuarios, inventario, contratos, reportes, pacientes, solicitudes de insumo |
| RAA | Jefa de OSS; por piso; equipo OSS, inventario (notificar insumos), horarios, pacientes de su piso |
| RAS | Jefa de Enfermería (pendiente detallar) |
| OSS | Operador Socio Sanitario (asignado a una RAA) |
| MEDICO, ENFERMERA, FISIOTERAPEUTA, RECEPCIONISTA | Definidos en schema; pendiente implementar módulos por rol |

---

## Lo que ya está implementado

### Backend
- Auth (login, JWT), usuarios CRUD (admin), contratos (subida PDF).
- **Admin:** dashboard (profesionales, pacientes, solicitudes de insumo con estados), inventario, consignas, movimientos, reportes (mensual + export CSV), pacientes (con raaId y hoja clínica PDF).
- **RAA:** dashboard (OSS en equipo), solicitudes de insumo (crear, marcar completada), horarios mensuales (turnos: Mañana 1/2, Tarde 1/2, Guardia), pacientes de su piso (CRUD + hoja clínica PDF).
- Consignas: todos los roles pueden **crear**; solo admin editar/eliminar.

### Frontend
- Login, dashboard (admin: stats + solicitudes; RAA: OSS en equipo).
- **Admin:** Inventario, Consignas, Contratos, Reportes, Pacientes, Usuarios.
- **RAA:** Inventario (notificar insumo + listar sus solicitudes), Horarios (calendario mensual), Pacientes (suyos, con Ver/Subir PDF hoja clínica).
- Consignas: todos pueden ver y crear.

### Base de datos (Prisma)
- User, Inventario, Consigna, Movimiento, Paciente (raaId, hojaClinicaUrl), SolicitudInsumo, HorarioDia (turnos por RAA).

---

## Cómo arrancar

1. **Backend:** `cd backend` → `npm run dev` (puerto 4000).
2. **Frontend:** `cd frontend` → `npm run dev` (puerto 5173 o el que asigne Vite).
3. **Login:** admin@cracare.com / admin123.

Si la BD está en AWS, en `backend` debe existir `.env` con `DATABASE_URL`. Migraciones: `npx prisma migrate deploy`.

---

## Próximos pasos sugeridos

- Implementar módulos para **RAS** (jefa de enfermeras) y **Enfermeras**.
- Luego **Médico**, **Fisioterapeuta**, **Recepcionista** según lo que se acuerde.
- Si se pierde contexto en el chat, decir: “Lee docs/CONTEXTO-PROYECTO.md y continúa desde ahí.”
