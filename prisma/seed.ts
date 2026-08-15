/**
 * Preenche o sistema com dados de exemplo para a Move testar de imediato.
 * Rodar com: npm run seed
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

/** Data relativa a hoje, em dias. */
function inDays(days: number) {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d;
}

/** Data relativa a hoje, em meses. */
function inMonths(months: number) {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setMonth(d.getMonth() + months);
  return d;
}

async function main() {
  // Limpa antes de popular, para poder rodar de novo sem duplicar.
  await db.goal.deleteMany();
  await db.receivable.deleteMany();
  await db.payable.deleteMany();
  await db.demand.deleteMany();
  await db.contract.deleteMany();
  await db.client.deleteMany();
  await db.user.deleteMany();

  const senha = await bcrypt.hash("move123", 10);

  // --- Equipe -------------------------------------------------------------
  const equipe = await Promise.all(
    [
      { name: "Alyson (Move)", email: "admin@move.com", role: "ADMIN" },
      { name: "Bruno Editor", email: "edicao@move.com", role: "EDICAO" },
      { name: "Carla Social", email: "social@move.com", role: "SOCIAL" },
      { name: "Diego Tráfego", email: "trafego@move.com", role: "TRAFEGO" },
      { name: "Elisa Design", email: "design@move.com", role: "DESIGN" },
      { name: "Felipe Copy", email: "copy@move.com", role: "COPY" },
      { name: "Gabi Filmmaker", email: "filmagem@move.com", role: "FILMAGEM" },
    ].map((u) => db.user.create({ data: { ...u, passwordHash: senha } })),
  );

  const [admin, editor, social, trafego, design, copy, filmmaker] = equipe;

  // --- Clientes -----------------------------------------------------------
  const clientes = await Promise.all(
    [
      {
        name: "Studio Bem Viver",
        company: "Bem Viver Saúde LTDA",
        contactName: "Renata Alves",
        email: "renata@bemviver.com.br",
        phone: "(11) 98888-1122",
        startDate: inMonths(-27),
        status: "ATIVO",
        notes: "Cliente mais antigo. Foco em vídeo e social.",
      },
      {
        name: "Padaria do Bairro",
        company: "Pão Nosso Comércio ME",
        contactName: "Seu Antônio",
        email: "contato@padariadobairro.com.br",
        phone: "(11) 97777-3344",
        startDate: inMonths(-14),
        status: "ATIVO",
        notes: "Gosta de conteúdo do dia a dia da loja.",
      },
      {
        name: "Academia Pulse",
        company: "Pulse Fitness LTDA",
        contactName: "Marcos Lima",
        email: "marcos@pulsefit.com.br",
        phone: "(21) 96666-5566",
        startDate: inMonths(-8),
        status: "ATIVO",
        notes: "Investe forte em tráfego pago.",
      },
      {
        name: "Odonto Sorriso",
        company: "Clínica Sorriso",
        contactName: "Dra. Paula",
        email: "paula@odontosorriso.com.br",
        phone: "(31) 95555-7788",
        startDate: inMonths(-3),
        status: "ATIVO",
        notes: "Entrou este trimestre.",
      },
      {
        name: "Móveis Horizonte",
        company: "Horizonte Design de Interiores",
        contactName: "Júlio Ramos",
        email: "julio@moveishorizonte.com.br",
        phone: "(48) 94444-9900",
        startDate: inMonths(-19),
        status: "PAUSADO",
        notes: "Pausou o contrato para revisar o orçamento.",
      },
    ].map((c) => db.client.create({ data: c })),
  );

  const [bemViver, padaria, pulse, sorriso, horizonte] = clientes;

  // --- Contratos ----------------------------------------------------------
  const contratos = await Promise.all(
    [
      {
        clientId: bemViver.id,
        title: "Social media + edição de vídeo",
        monthlyValue: 4500,
        startDate: inMonths(-27),
        status: "ATIVO",
        notes: "Renovado em janeiro.",
      },
      {
        clientId: padaria.id,
        title: "Gestão de redes sociais",
        monthlyValue: 1800,
        startDate: inMonths(-14),
        status: "ATIVO",
      },
      {
        clientId: pulse.id,
        title: "Tráfego pago + criativos",
        monthlyValue: 6200,
        startDate: inMonths(-8),
        status: "ATIVO",
      },
      {
        clientId: sorriso.id,
        title: "Pacote start (social + design)",
        monthlyValue: 2400,
        startDate: inMonths(-3),
        endDate: inMonths(9),
        status: "ATIVO",
      },
      {
        clientId: horizonte.id,
        title: "Conteúdo institucional",
        monthlyValue: 3000,
        startDate: inMonths(-19),
        endDate: inMonths(-1),
        status: "ENCERRADO",
        notes: "Encerrado por decisão do cliente.",
      },
    ].map((c) => db.contract.create({ data: c })),
  );

  // --- Demandas -----------------------------------------------------------
  const demandas = [
    // Edição de vídeo
    { title: "Editar 4 Reels da semana", clientId: bemViver.id, area: "EDICAO", assigneeId: editor.id, status: "EM_ANDAMENTO", priority: "ALTA", dueDate: inDays(2) },
    { title: "Cortes do podcast (episódio 12)", clientId: pulse.id, area: "EDICAO", assigneeId: editor.id, status: "A_FAZER", priority: "MEDIA", dueDate: inDays(5) },
    { title: "Vídeo institucional 60s", clientId: sorriso.id, area: "EDICAO", assigneeId: editor.id, status: "REVISAO", priority: "ALTA", dueDate: inDays(-1) },
    { title: "Legendar depoimentos de clientes", clientId: bemViver.id, area: "EDICAO", assigneeId: editor.id, status: "CONCLUIDO", priority: "BAIXA", dueDate: inDays(-6) },
    { title: "Testar novo formato de abertura", area: "EDICAO", assigneeId: editor.id, status: "BACKLOG", priority: "BAIXA" },

    // Social media
    { title: "Calendário de conteúdo do mês", clientId: padaria.id, area: "SOCIAL", assigneeId: social.id, status: "EM_ANDAMENTO", priority: "ALTA", dueDate: inDays(1) },
    { title: "Responder comentários e directs", clientId: pulse.id, area: "SOCIAL", assigneeId: social.id, status: "A_FAZER", priority: "MEDIA", dueDate: inDays(3) },
    { title: "Relatório de desempenho do Instagram", clientId: bemViver.id, area: "SOCIAL", assigneeId: social.id, status: "CONCLUIDO", priority: "MEDIA", dueDate: inDays(-4) },

    // Tráfego
    { title: "Subir campanha de matrícula", clientId: pulse.id, area: "TRAFEGO", assigneeId: trafego.id, status: "EM_ANDAMENTO", priority: "ALTA", dueDate: inDays(0) },
    { title: "Otimizar públicos do remarketing", clientId: sorriso.id, area: "TRAFEGO", assigneeId: trafego.id, status: "A_FAZER", priority: "MEDIA", dueDate: inDays(7) },
    { title: "Revisar orçamento diário das campanhas", clientId: pulse.id, area: "TRAFEGO", assigneeId: trafego.id, status: "REVISAO", priority: "ALTA", dueDate: inDays(-2) },

    // Design
    { title: "Criar 6 artes para feed", clientId: padaria.id, area: "DESIGN", assigneeId: design.id, status: "A_FAZER", priority: "MEDIA", dueDate: inDays(4) },
    { title: "Criativos para campanha de matrícula", clientId: pulse.id, area: "DESIGN", assigneeId: design.id, status: "EM_ANDAMENTO", priority: "ALTA", dueDate: inDays(1) },
    { title: "Atualizar identidade do cliente novo", clientId: sorriso.id, area: "DESIGN", assigneeId: design.id, status: "BACKLOG", priority: "BAIXA" },

    // Copy
    { title: "Roteiros dos Reels da semana", clientId: bemViver.id, area: "COPY", assigneeId: copy.id, status: "CONCLUIDO", priority: "MEDIA", dueDate: inDays(-3) },
    { title: "Textos da campanha de matrícula", clientId: pulse.id, area: "COPY", assigneeId: copy.id, status: "EM_ANDAMENTO", priority: "ALTA", dueDate: inDays(2) },
    { title: "E-mail de reativação de clientes", clientId: sorriso.id, area: "COPY", assigneeId: copy.id, status: "A_FAZER", priority: "BAIXA", dueDate: inDays(9) },

    // Filmagem
    { title: "Gravação na loja (dia todo)", clientId: padaria.id, area: "FILMAGEM", assigneeId: filmmaker.id, status: "A_FAZER", priority: "ALTA", dueDate: inDays(6) },
    { title: "Captação de depoimentos", clientId: bemViver.id, area: "FILMAGEM", assigneeId: filmmaker.id, status: "REVISAO", priority: "MEDIA", dueDate: inDays(-1) },
    { title: "Organizar equipamentos para a próxima diária", area: "FILMAGEM", assigneeId: filmmaker.id, status: "BACKLOG", priority: "BAIXA" },
  ];

  for (const [i, d] of demandas.entries()) {
    await db.demand.create({ data: { ...d, order: i } });
  }

  // --- Contas a pagar -----------------------------------------------------
  await db.payable.createMany({
    data: [
      { description: "Adobe Creative Cloud (5 licenças)", supplier: "Adobe", category: "Software", amount: 1250, dueDate: inDays(4), status: "PENDENTE" },
      { description: "Aluguel do estúdio", supplier: "Imobiliária Central", category: "Estrutura", amount: 3200, dueDate: inDays(9), status: "PENDENTE" },
      { description: "Freelancer de motion", supplier: "Lucas Motion", category: "Equipe", amount: 1800, dueDate: inDays(-3), status: "PENDENTE" },
      { description: "Internet e telefonia", supplier: "Vivo Empresas", category: "Estrutura", amount: 430, dueDate: inDays(12), status: "PENDENTE" },
      { description: "Contador", supplier: "Contabilize", category: "Impostos", amount: 890, dueDate: inDays(-10), status: "PAGO", paidAt: inDays(-10) },
      { description: "Impostos do mês (Simples)", supplier: "Receita Federal", category: "Impostos", amount: 2740, dueDate: inDays(-15), status: "PAGO", paidAt: inDays(-15) },
      { description: "Banco de imagens e trilhas", supplier: "Envato", category: "Software", amount: 320, dueDate: inDays(20), status: "PENDENTE" },
    ],
  });

  // Gastos fixos dos meses anteriores, ja pagos (dao historico ao grafico).
  const gastosFixos = [
    { description: "Aluguel do estúdio", supplier: "Imobiliária Central", category: "Estrutura", amount: 3200 },
    { description: "Adobe Creative Cloud (5 licenças)", supplier: "Adobe", category: "Software", amount: 1250 },
    { description: "Impostos do mês (Simples)", supplier: "Receita Federal", category: "Impostos", amount: 2400 },
  ];

  await db.payable.createMany({
    data: [5, 4, 3, 2, 1].flatMap((atras) =>
      gastosFixos.map((g) => {
        const vencimento = inMonths(-atras);
        vencimento.setDate(5);
        return { ...g, dueDate: vencimento, status: "PAGO", paidAt: vencimento };
      }),
    ),
  });

  // --- Contas a receber ---------------------------------------------------
  // Mensalidades dos ultimos 5 meses (recebidas) e a deste mes (em aberto),
  // para o grafico do financeiro ja nascer com historico.
  const mensalidades = contratos
    .filter((c) => c.status === "ATIVO")
    .flatMap((c) =>
      [5, 4, 3, 2, 1, 0].map((atras) => {
        // A do mes atual ainda vai vencer; as anteriores ja foram recebidas.
        const vencimento = atras === 0 ? inDays(7) : inMonths(-atras);
        if (atras > 0) vencimento.setDate(10);
        const recebida = atras > 0;
        return {
          description: `Mensalidade - ${c.title}`,
          clientId: c.clientId,
          contractId: c.id,
          amount: c.monthlyValue,
          dueDate: vencimento,
          status: recebida ? "RECEBIDO" : "PENDENTE",
          receivedAt: recebida ? vencimento : null,
        };
      }),
    );

  await db.receivable.createMany({
    data: [
      ...mensalidades,
      {
        description: "Diária extra de filmagem",
        clientId: padaria.id,
        amount: 1500,
        dueDate: inDays(-2),
        status: "PENDENTE",
      },
      {
        description: "Ensaio fotográfico avulso",
        clientId: sorriso.id,
        amount: 2200,
        dueDate: inDays(14),
        status: "PENDENTE",
      },
    ],
  });

  // --- Metas do mês -------------------------------------------------------
  const hoje = new Date();
  const mes = hoje.getMonth() + 1;
  const ano = hoje.getFullYear();

  await db.goal.createMany({
    data: [
      { title: "Faturamento da agência", scope: "AGENCIA", month: mes, year: ano, targetValue: 20000, currentValue: 14900, unit: "R$", description: "Meta de receita fechada no mês." },
      { title: "Fechar 2 clientes novos", scope: "AGENCIA", month: mes, year: ano, targetValue: 2, currentValue: 1, unit: "un" },
      { title: "Entregar 40 vídeos editados", scope: "PESSOAL", ownerId: editor.id, area: "EDICAO", month: mes, year: ano, targetValue: 40, currentValue: 26, unit: "un", description: "Reels, cortes e institucionais somados." },
      { title: "Zerar a fila de revisão até sexta", scope: "PESSOAL", ownerId: editor.id, area: "EDICAO", month: mes, year: ano, targetValue: 100, currentValue: 70, unit: "%" },
      { title: "Publicar 60 posts no mês", scope: "PESSOAL", ownerId: social.id, area: "SOCIAL", month: mes, year: ano, targetValue: 60, currentValue: 41, unit: "un" },
      { title: "Custo por lead abaixo de R$ 12", scope: "PESSOAL", ownerId: trafego.id, area: "TRAFEGO", month: mes, year: ano, targetValue: 100, currentValue: 85, unit: "%" },
      { title: "Entregar 30 artes", scope: "PESSOAL", ownerId: design.id, area: "DESIGN", month: mes, year: ano, targetValue: 30, currentValue: 18, unit: "un" },
      { title: "Escrever 25 roteiros", scope: "PESSOAL", ownerId: copy.id, area: "COPY", month: mes, year: ano, targetValue: 25, currentValue: 15, unit: "un" },
      { title: "6 diárias de gravação", scope: "PESSOAL", ownerId: filmmaker.id, area: "FILMAGEM", month: mes, year: ano, targetValue: 6, currentValue: 4, unit: "un" },
      { title: "Nenhuma entrega atrasada", scope: "EQUIPE", month: mes, year: ano, targetValue: 100, currentValue: 88, unit: "%", description: "Percentual de demandas entregues no prazo." },
    ],
  });

  console.log(`Pronto! ${equipe.length} pessoas, ${clientes.length} clientes e ${demandas.length} demandas criadas.`);
  console.log(`Entre com ${admin.email} e a senha move123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
