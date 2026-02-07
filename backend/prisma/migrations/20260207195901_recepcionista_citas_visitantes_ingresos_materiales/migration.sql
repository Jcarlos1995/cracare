-- CreateEnum
CREATE TYPE "EstadoCita" AS ENUM ('AGENDADA', 'REALIZADA', 'CANCELADA', 'NO_ASISTIO');

-- CreateEnum
CREATE TYPE "CategoriaMaterial" AS ENUM ('SANITARIA', 'BASICOS_OTROS');

-- CreateTable
CREATE TABLE "Visitante" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellidos" TEXT,
    "telefono" TEXT,
    "email" TEXT,
    "relacionConPaciente" TEXT,
    "documento" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Visitante_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cita" (
    "id" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "visitanteId" TEXT NOT NULL,
    "fechaHora" TIMESTAMP(3) NOT NULL,
    "estado" "EstadoCita" NOT NULL DEFAULT 'AGENDADA',
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cita_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IngresoMaterial" (
    "id" TEXT NOT NULL,
    "fecha" DATE NOT NULL,
    "categoria" "CategoriaMaterial" NOT NULL,
    "descripcion" TEXT NOT NULL,
    "cantidad" INTEGER DEFAULT 1,
    "unidad" TEXT,
    "observaciones" TEXT,
    "registradoPorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IngresoMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Visitante_nombre_idx" ON "Visitante"("nombre");

-- CreateIndex
CREATE INDEX "Cita_pacienteId_idx" ON "Cita"("pacienteId");

-- CreateIndex
CREATE INDEX "Cita_visitanteId_idx" ON "Cita"("visitanteId");

-- CreateIndex
CREATE INDEX "Cita_fechaHora_idx" ON "Cita"("fechaHora");

-- CreateIndex
CREATE INDEX "Cita_estado_idx" ON "Cita"("estado");

-- CreateIndex
CREATE INDEX "IngresoMaterial_fecha_idx" ON "IngresoMaterial"("fecha");

-- CreateIndex
CREATE INDEX "IngresoMaterial_categoria_idx" ON "IngresoMaterial"("categoria");

-- AddForeignKey
ALTER TABLE "SolicitudInsumo" ADD CONSTRAINT "SolicitudInsumo_solicitanteId_fkey" FOREIGN KEY ("solicitanteId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cita" ADD CONSTRAINT "Cita_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cita" ADD CONSTRAINT "Cita_visitanteId_fkey" FOREIGN KEY ("visitanteId") REFERENCES "Visitante"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IngresoMaterial" ADD CONSTRAINT "IngresoMaterial_registradoPorId_fkey" FOREIGN KEY ("registradoPorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
