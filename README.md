# CRACare — Sistema Casa de Reposo

Sistema de gestión para una casa de reposo: backend (Node.js + Prisma), frontend (React) y base de datos (PostgreSQL, compatible con AWS RDS).

## Estructura del proyecto

```
CRACare/
├── backend/          # API REST (Express, Prisma, JWT)
├── frontend/         # Aplicación React (Vite)
├── docs/             # Documentación (p. ej. AWS)
└── README.md
```

## Roles del sistema

| Rol | Descripción |
|-----|-------------|
| Administrador | Logística de la empresa; gestiona usuarios |
| Médico | Médico |
| RAS | Jefa de Enfermería |
| Enfermera | Enfermera (puede asignarse a una RAS) |
| RAA | Jefa de OSS |
| OSS | Operador Socio Sanitario (puede asignarse a una RAA) |
| Fisioterapeuta | Fisioterapeuta |
| Recepcionista | Recepción |

## Base de datos (local o AWS)

- **Local**: PostgreSQL en tu máquina. Crea una base de datos `cracare` y configura `DATABASE_URL` en `backend/.env`.
- **AWS**: Guía paso a paso en [docs/AWS-BASE-DATOS.md](docs/AWS-BASE-DATOS.md) para crear la base en Amazon RDS (PostgreSQL) y conectar el backend.

## Puesta en marcha

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edita .env y configura DATABASE_URL (local o AWS)
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

API en `http://localhost:4000`. Usuario por defecto: **admin@cracare.com** / **admin123**.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

App en `http://localhost:5173`. El frontend usa el proxy hacia el backend en desarrollo.

### 3. Producción

- **Backend**: `npm run start` (y `prisma migrate deploy` si usas BD en AWS).
- **Frontend**: `npm run build` y sirve la carpeta `dist` con tu servidor o hosting estático.
- Configura `FRONTEND_URL` y `VITE_API_URL` (o la URL de tu API) según tu despliegue.

## Resumen de tecnologías

- **Backend**: Node.js, Express, Prisma, PostgreSQL, JWT, bcrypt.
- **Frontend**: React 18, Vite, React Router.
- **Base de datos**: PostgreSQL (local o Amazon RDS).
