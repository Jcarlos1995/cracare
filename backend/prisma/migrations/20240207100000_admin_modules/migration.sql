-- AlterTable: añadir contratoUrl a User
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "contratoUrl" TEXT;

-- CreateTable: Inventario
CREATE TABLE "Inventario" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "cantidad" INTEGER NOT NULL DEFAULT 0,
    "unidad" TEXT NOT NULL,
    "categoria" TEXT NOT NULL DEFAULT 'sanidad',
    "minimo" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Inventario_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Consigna
CREATE TABLE "Consigna" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "autorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Consigna_pkey" PRIMARY KEY ("id")
);

-- CreateEnum: TipoMovimiento
CREATE TYPE "TipoMovimiento" AS ENUM ('INGRESO', 'GASTO');

-- CreateTable: Movimiento
CREATE TABLE "Movimiento" (
    "id" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "tipo" "TipoMovimiento" NOT NULL,
    "concepto" TEXT NOT NULL,
    "monto" DECIMAL(12,2) NOT NULL,
    "categoria" TEXT,
    "mes" INTEGER NOT NULL,
    "anio" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Movimiento_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Movimiento_anio_mes_idx" ON "Movimiento"("anio", "mes");

-- CreateTable: Paciente
CREATE TABLE "Paciente" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellidos" TEXT,
    "dniNif" TEXT,
    "fechaNacimiento" TIMESTAMP(3),
    "fechaIngreso" TIMESTAMP(3),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Paciente_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey: Consigna -> User
ALTER TABLE "Consigna" ADD CONSTRAINT "Consigna_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "Consigna_autorId_idx" ON "Consigna"("autorId");
