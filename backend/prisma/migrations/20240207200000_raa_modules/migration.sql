-- AlterTable Paciente: raaId, hojaClinicaUrl
ALTER TABLE "Paciente" ADD COLUMN IF NOT EXISTS "raaId" TEXT;
ALTER TABLE "Paciente" ADD COLUMN IF NOT EXISTS "hojaClinicaUrl" TEXT;
CREATE INDEX IF NOT EXISTS "Paciente_raaId_idx" ON "Paciente"("raaId");

-- CreateEnum EstadoSolicitudInsumo
CREATE TYPE "EstadoSolicitudInsumo" AS ENUM ('PENDIENTE', 'RECIBIDA', 'PEDIDO_LISTO', 'COMPLETADA');

-- CreateTable SolicitudInsumo
CREATE TABLE "SolicitudInsumo" (
    "id" TEXT NOT NULL,
    "solicitanteId" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "estado" "EstadoSolicitudInsumo" NOT NULL DEFAULT 'PENDIENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SolicitudInsumo_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "SolicitudInsumo_solicitanteId_idx" ON "SolicitudInsumo"("solicitanteId");
CREATE INDEX "SolicitudInsumo_estado_idx" ON "SolicitudInsumo"("estado");

-- CreateEnum TurnoCalendario
CREATE TYPE "TurnoCalendario" AS ENUM ('MANANA_1', 'MANANA_2', 'TARDE_1', 'TARDE_2', 'GUARDIA');

-- CreateTable HorarioDia
CREATE TABLE "HorarioDia" (
    "id" TEXT NOT NULL,
    "raaId" TEXT NOT NULL,
    "fecha" DATE NOT NULL,
    "ossId" TEXT,
    "turno" "TurnoCalendario" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HorarioDia_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "HorarioDia_raaId_fecha_turno_key" ON "HorarioDia"("raaId", "fecha", "turno");
CREATE INDEX "HorarioDia_raaId_idx" ON "HorarioDia"("raaId");
CREATE INDEX "HorarioDia_raaId_fecha_idx" ON "HorarioDia"("raaId", "fecha");
