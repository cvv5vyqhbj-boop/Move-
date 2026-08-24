-- Id do lancamento no Cora — usado para nao importar duas vezes.
ALTER TABLE "Payable" ADD COLUMN "coraEntryId" TEXT;
CREATE UNIQUE INDEX "Payable_coraEntryId_key" ON "Payable"("coraEntryId");

ALTER TABLE "Receivable" ADD COLUMN "coraEntryId" TEXT;
CREATE UNIQUE INDEX "Receivable_coraEntryId_key" ON "Receivable"("coraEntryId");

-- Pequenas configuracoes do sistema (ultima sincronizacao com o Cora, etc.).
CREATE TABLE "AppSetting" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AppSetting_pkey" PRIMARY KEY ("key")
);
