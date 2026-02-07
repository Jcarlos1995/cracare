-- CreateTable
CREATE TABLE "RegistroCuidadosDiario" (
    "id" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "fecha" DATE NOT NULL,
    "desayunado" BOOLEAN NOT NULL DEFAULT false,
    "almorzado" BOOLEAN NOT NULL DEFAULT false,
    "merendado" BOOLEAN NOT NULL DEFAULT false,
    "cenado" BOOLEAN NOT NULL DEFAULT false,
    "evacuado" BOOLEAN NOT NULL DEFAULT false,
    "evacuadoAlvo" BOOLEAN NOT NULL DEFAULT false,
    "dormido" BOOLEAN NOT NULL DEFAULT false,
    "hidratado" BOOLEAN NOT NULL DEFAULT false,
    "registradoPorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RegistroCuidadosDiario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BanoSemanal" (
    "id" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "diaSemana" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BanoSemanal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RegistroCuidadosDiario_pacienteId_idx" ON "RegistroCuidadosDiario"("pacienteId");

-- CreateIndex
CREATE INDEX "RegistroCuidadosDiario_fecha_idx" ON "RegistroCuidadosDiario"("fecha");

-- CreateIndex
CREATE UNIQUE INDEX "RegistroCuidadosDiario_pacienteId_fecha_key" ON "RegistroCuidadosDiario"("pacienteId", "fecha");

-- CreateIndex
CREATE INDEX "BanoSemanal_pacienteId_idx" ON "BanoSemanal"("pacienteId");

-- CreateIndex
CREATE INDEX "BanoSemanal_diaSemana_idx" ON "BanoSemanal"("diaSemana");

-- CreateIndex
CREATE UNIQUE INDEX "BanoSemanal_pacienteId_diaSemana_key" ON "BanoSemanal"("pacienteId", "diaSemana");

-- AddForeignKey
ALTER TABLE "RegistroCuidadosDiario" ADD CONSTRAINT "RegistroCuidadosDiario_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroCuidadosDiario" ADD CONSTRAINT "RegistroCuidadosDiario_registradoPorId_fkey" FOREIGN KEY ("registradoPorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BanoSemanal" ADD CONSTRAINT "BanoSemanal_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente"("id") ON DELETE CASCADE ON UPDATE CASCADE;
