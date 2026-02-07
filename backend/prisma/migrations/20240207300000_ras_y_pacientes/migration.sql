-- AlterTable Paciente: alergias, patologias
ALTER TABLE "Paciente" ADD COLUMN IF NOT EXISTS "alergias" TEXT;
ALTER TABLE "Paciente" ADD COLUMN IF NOT EXISTS "patologias" TEXT;

-- CreateTable MedicamentoPaciente
CREATE TABLE "MedicamentoPaciente" (
    "id" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "medicamento" TEXT NOT NULL,
    "dosis" TEXT,
    "frecuencia" TEXT,
    "indicaciones" TEXT,
    "creadoPorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MedicamentoPaciente_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "MedicamentoPaciente_pacienteId_idx" ON "MedicamentoPaciente"("pacienteId");
ALTER TABLE "MedicamentoPaciente" ADD CONSTRAINT "MedicamentoPaciente_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable TratamientoPaciente
CREATE TABLE "TratamientoPaciente" (
    "id" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "creadoPorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TratamientoPaciente_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "TratamientoPaciente_pacienteId_idx" ON "TratamientoPaciente"("pacienteId");
ALTER TABLE "TratamientoPaciente" ADD CONSTRAINT "TratamientoPaciente_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateEnum TurnoEnfermera
CREATE TYPE "TurnoEnfermera" AS ENUM ('MANANA_1', 'MANANA_2', 'MANANA_3', 'TARDE_1', 'TARDE_2');

-- CreateTable HorarioEnfermeraDia
CREATE TABLE "HorarioEnfermeraDia" (
    "id" TEXT NOT NULL,
    "rasId" TEXT NOT NULL,
    "fecha" DATE NOT NULL,
    "enfermeraId" TEXT,
    "turno" "TurnoEnfermera" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HorarioEnfermeraDia_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "HorarioEnfermeraDia_rasId_fecha_turno_key" ON "HorarioEnfermeraDia"("rasId", "fecha", "turno");
CREATE INDEX "HorarioEnfermeraDia_rasId_idx" ON "HorarioEnfermeraDia"("rasId");
CREATE INDEX "HorarioEnfermeraDia_rasId_fecha_idx" ON "HorarioEnfermeraDia"("rasId", "fecha");
