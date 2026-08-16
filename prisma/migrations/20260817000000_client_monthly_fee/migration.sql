-- Quanto o cliente paga por mes (opcional). Se ficar em branco, o sistema
-- volta a somar os contratos ativos, como antes.
ALTER TABLE "Client" ADD COLUMN "monthlyFee" DOUBLE PRECISION;
