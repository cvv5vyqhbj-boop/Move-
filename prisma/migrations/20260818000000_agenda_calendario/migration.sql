-- Compromissos marcados direto no calendario: gravacao, post, reuniao, entrega.
CREATE TABLE "Agenda" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'OUTRO',
    "date" TIMESTAMP(3) NOT NULL,
    "time" TEXT,
    "clientId" TEXT,
    "notes" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Agenda_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Agenda_date_idx" ON "Agenda"("date");

ALTER TABLE "Agenda" ADD CONSTRAINT "Agenda_clientId_fkey"
    FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Agenda" ADD CONSTRAINT "Agenda_createdById_fkey"
    FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
