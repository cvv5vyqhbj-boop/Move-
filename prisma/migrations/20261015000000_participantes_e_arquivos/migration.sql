-- Varias pessoas no mesmo chamado (alem do responsavel principal)
-- e arquivos enviados (PDF, imagem) junto dos links da demanda.

-- AlterTable
ALTER TABLE "Attachment" ADD COLUMN     "mimeType" TEXT,
ADD COLUMN     "path" TEXT,
ADD COLUMN     "size" INTEGER,
ALTER COLUMN "url" DROP NOT NULL;

-- CreateTable
CREATE TABLE "_Participantes" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_Participantes_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_Participantes_B_index" ON "_Participantes"("B");

-- AddForeignKey
ALTER TABLE "_Participantes" ADD CONSTRAINT "_Participantes_A_fkey" FOREIGN KEY ("A") REFERENCES "Demand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Participantes" ADD CONSTRAINT "_Participantes_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

