-- CreateTable
CREATE TABLE "TerapiaRehabilitacion" (
    "id" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "nombreTerapia" TEXT NOT NULL,
    "descripcion" TEXT,
    "efectuada" BOOLEAN NOT NULL DEFAULT false,
    "efectuadoAt" TIMESTAMP(3),
    "registradoPorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TerapiaRehabilitacion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TerapiaRehabilitacion_pacienteId_idx" ON "TerapiaRehabilitacion"("pacienteId");

-- CreateIndex
CREATE INDEX "TerapiaRehabilitacion_efectuada_idx" ON "TerapiaRehabilitacion"("efectuada");

-- AddForeignKey
ALTER TABLE "TerapiaRehabilitacion" ADD CONSTRAINT "TerapiaRehabilitacion_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TerapiaRehabilitacion" ADD CONSTRAINT "TerapiaRehabilitacion_registradoPorId_fkey" FOREIGN KEY ("registradoPorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
