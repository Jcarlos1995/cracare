# Base de datos en AWS (Amazon RDS) para CRACare

Repositorio: [https://github.com/Jcarlos1995/cracare](https://github.com/Jcarlos1995/cracare)

## Conexión actual (instancia existente)

| Dato | Valor |
|------|--------|
| **Host** | `cracaree.cb0gu42yichl.eu-north-1.rds.amazonaws.com` |
| **Puerto** | 5432 |
| **Usuario** | cracaree |
| **Base de datos** | cracaree |
| **SSL** | Requerido (`sslmode=require`) |

El archivo `backend/.env` ya está configurado con esta conexión. **No subas `.env` a Git** (está en `.gitignore`). Para otro equipo o despliegue, copia `backend/.env.example` a `.env` y sustituye `TU_PASSWORD_AQUI` por la contraseña maestra.

Si en RDS la base de datos se llama `postgres` y no `cracaree`, crea la BD desde la consola de AWS o conectando con `psql` a `postgres` y ejecutando: `CREATE DATABASE cracaree;` Luego usa `dbname=cracaree` en la URL.

---

## 1. Crear la base de datos en Amazon RDS (referencia)

1. Entra en la **Consola de AWS** → **RDS** → **Create database**.

2. **Engine**: Amazon PostgreSQL (por ejemplo PostgreSQL 15).

3. **Template**: Free tier (para pruebas) o Production según necesites.

4. **Configuración**:
   - **DB instance identifier**: p. ej. `cracare-db`
   - **Master username**: p. ej. `cracare_admin`
   - **Master password**: contraseña segura (guárdala para el `DATABASE_URL`)

5. **Instance configuration**: elige instancia (en free tier suele ser `db.t3.micro`).

6. **Storage**: deja valores por defecto o ajusta si lo necesitas.

7. **Connectivity**:
   - **VPC**: por defecto o la tuya.
   - **Public access**: **Yes** si quieres conectar desde tu PC (desarrollo). En producción suele ser **No** y el backend corre dentro de la VPC.
   - **VPC security group**: crea uno nuevo o usa existente. Si hay acceso público, en las reglas de entrada añade **PostgreSQL (5432)** desde tu IP o `0.0.0.0/0` solo para desarrollo.

8. **Database name**: `cracare` (así coincide con el ejemplo de `DATABASE_URL`).

9. Crea la base de datos y espera a que el estado sea **Available**.

## 2. Obtener el endpoint

En RDS → **Databases** → clic en tu instancia. Copia el **Endpoint** (ej: `cracare-db.xxxxx.us-east-1.rds.amazonaws.com`).

## 3. Configurar el backend

En la carpeta `backend` crea o edita el archivo `.env` (no lo subas a Git):

```env
# Sustituye USER, PASSWORD y ENDPOINT por los de tu instancia RDS
DATABASE_URL="postgresql://cracare_admin:TU_PASSWORD@cracare-db.xxxxx.us-east-1.rds.amazonaws.com:5432/cracare?schema=public"

JWT_SECRET="un-secreto-muy-largo-y-aleatorio-para-produccion"
JWT_EXPIRES="7d"
FRONTEND_URL="http://localhost:5173"
PORT=4000
```

- **USER**: Master username (ej. `cracare_admin`).
- **PASSWORD**: la contraseña del paso 1.
- **ENDPOINT**: el endpoint de RDS (sin `:5432`; ya va en la URL).
- Si el password tiene caracteres especiales, codifícalos en URL (ej. `@` → `%40`).

## 4. Ejecutar migraciones y seed

Desde la raíz del proyecto, en la carpeta `backend`:

```bash
cd backend
npm install
npx prisma migrate deploy
npx prisma db seed
```

- `prisma migrate deploy` aplica las tablas en la base de datos de AWS.
- `prisma db seed` crea el usuario administrador por defecto (admin@cracare.com / admin123).

## 5. Probar la conexión

Arranca el backend:

```bash
npm run dev
```

Si no hay errores de conexión, la API ya está usando la base de datos en AWS.

## Seguridad (producción)

- No uses **Public access** en RDS en producción; pon el backend en la misma VPC (EC2, ECS, Lambda en VPC, etc.).
- Usa **JWT_SECRET** fuerte y distinto por entorno.
- Restringe el **security group** de RDS solo a la IP o al security group del backend.
- Cambia la contraseña del administrador tras el primer acceso.
