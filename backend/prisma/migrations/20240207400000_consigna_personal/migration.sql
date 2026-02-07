-- CreateTable
CREATE TABLE "ConsignaPersonal" (
    "id" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "autorId" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConsignaPersonal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ConsignaPersonal_pacienteId_idx" ON "ConsignaPersonal"("pacienteId");

-- CreateIndex
CREATE INDEX "ConsignaPersonal_autorId_idx" ON "ConsignaPersonal"("autorId");

-- CreateIndex
CREATE INDEX "ConsignaPersonal_createdAt_idx" ON "ConsignaPersonal"("createdAt");

-- AddForeignKey
ALTER TABLE "ConsignaPersonal" ADD CONSTRAINT "ConsignaPersonal_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsignaPersonal" ADD CONSTRAINT "ConsignaPersonal_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
