-- Prazo interno da equipe (antes do prazo combinado com o cliente).
ALTER TABLE "Demand" ADD COLUMN "internalDueDate" TIMESTAMP(3);

-- Link do contrato assinado (Drive, Docs, PDF em nuvem).
ALTER TABLE "Contract" ADD COLUMN "pdfUrl" TEXT;
