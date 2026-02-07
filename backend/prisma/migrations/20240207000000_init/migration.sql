-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMINISTRADOR', 'MEDICO', 'RAS', 'ENFERMERA', 'RAA', 'OSS', 'FISIOTERAPEUTA', 'RECEPCIONISTA');

-- CreateEnum
CREATE TYPE "Turno" AS ENUM ('MANANA', 'TARDE', 'NOCHE', 'GUARDIA');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellidos" TEXT,
    "dniNif" TEXT,
    "telefono" TEXT,
    "rol" "Role" NOT NULL DEFAULT 'RECEPCIONISTA',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "numColegiado" TEXT,
    "especialidad" TEXT,
    "certificacionOss" TEXT,
    "turno" "Turno",
    "rasId" TEXT,
    "raaId" TEXT,
    "departamento" TEXT,
    "fechaAlta" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
