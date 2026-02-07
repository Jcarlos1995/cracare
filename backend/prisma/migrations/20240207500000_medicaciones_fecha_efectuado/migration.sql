-- AlterTable MedicamentoPaciente: add fechaHora, efectuado, efectuadoAt, efectuadoPorId
ALTER TABLE "MedicamentoPaciente" ADD COLUMN "fechaHora" TIMESTAMP(3);
ALTER TABLE "MedicamentoPaciente" ADD COLUMN "efectuado" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "MedicamentoPaciente" ADD COLUMN "efectuadoAt" TIMESTAMP(3);
ALTER TABLE "MedicamentoPaciente" ADD COLUMN "efectuadoPorId" TEXT;

-- CreateIndex
CREATE INDEX "MedicamentoPaciente_efectuado_idx" ON "MedicamentoPaciente"("efectuado");
CREATE INDEX "MedicamentoPaciente_efectuadoAt_idx" ON "MedicamentoPaciente"("efectuadoAt");

-- AddForeignKey
ALTER TABLE "MedicamentoPaciente" ADD CONSTRAINT "MedicamentoPaciente_efectuadoPorId_fkey" FOREIGN KEY ("efectuadoPorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
