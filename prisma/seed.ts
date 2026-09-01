/**
 * Preenche o sistema com dados de exemplo para a Move testar de imediato.
 * Rodar com: npm run seed
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { TRILHAS } from "../src/lib/constants";

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
  await db.quizResult.deleteMany();
  await db.lessonProgress.deleteMany();
  await db.lesson.deleteMany();
  await db.courseModule.deleteMany();
  await db.courseTrack.deleteMany();
  await db.course.deleteMany();
  await db.track.deleteMany();
  await db.comment.deleteMany();
  await db.attachment.deleteMany();
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
        endDate: inDays(45), // proposital: aparece no aviso de renovação
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

  const demandasCriadas = [];
  for (const [i, d] of demandas.entries()) {
    demandasCriadas.push(await db.demand.create({ data: { ...d, order: i } }));
  }

  // --- Conversa e materiais em algumas demandas ---------------------------
  const reels = demandasCriadas[0]; // "Editar 4 Reels da semana"
  const institucional = demandasCriadas[2]; // "Vídeo institucional 60s"

  await db.comment.createMany({
    data: [
      { demandId: reels.id, authorId: admin.id, text: "Bruno, a cliente pediu para começar pelo depoimento da Dona Cida. O resto pode seguir a ordem do roteiro." },
      { demandId: reels.id, authorId: editor.id, text: "Fechado. Já separei os melhores trechos. Devo subir os cortes hoje à noite." },
      { demandId: reels.id, authorId: copy.id, text: "Roteiro atualizado no link dos materiais, com as legendas revisadas." },
      { demandId: institucional.id, authorId: admin.id, text: "Cliente aprovou a trilha. Falta ajustar o final, que ficou corrido." },
    ],
  });

  await db.attachment.createMany({
    data: [
      { demandId: reels.id, title: "Roteiro dos Reels", url: "https://docs.google.com/document/d/exemplo-roteiro" },
      { demandId: reels.id, title: "Material bruto (drive)", url: "https://drive.google.com/drive/folders/exemplo-bruto" },
      { demandId: institucional.id, title: "Briefing do cliente", url: "https://drive.google.com/file/d/exemplo-briefing" },
    ],
  });

  // --- Contas a pagar -----------------------------------------------------
  await db.payable.createMany({
    data: [
      { description: "Adobe Creative Cloud (5 licenças)", supplier: "Adobe", category: "Software", amount: 1250, dueDate: inDays(4), status: "PENDENTE" },
      { description: "Aluguel do estúdio", supplier: "Imobiliária Central", category: "Estrutura", amount: 3200, dueDate: inDays(9), status: "PENDENTE" },
      { description: "Freelancer de motion", supplier: "Lucas Motion", category: "Equipe", amount: 1800, dueDate: inDays(-3), status: "PENDENTE", clientId: pulse.id },
      { description: "Impulsionamento das campanhas", supplier: "Meta Ads", category: "Mídia", amount: 3500, dueDate: inDays(-8), status: "PAGO", paidAt: inDays(-8), clientId: pulse.id },
      { description: "Diária de filmagem (freela)", supplier: "Rafa Câmera", category: "Equipe", amount: 900, dueDate: inDays(-12), status: "PAGO", paidAt: inDays(-12), clientId: padaria.id },
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


  // --- Cursos da Move -----------------------------------------------------
  // As trilhas vem do codigo (src/lib/constants.ts), porque o quiz pontua os
  // mesmos slugs. Aqui elas so ganham uma linha no banco.
  const trilhas = Object.fromEntries(
    await Promise.all(
      Object.entries(TRILHAS).map(async ([slug, info], i) => [
        slug,
        await db.track.create({ data: { slug, ...info, order: i } }),
      ]),
    ),
  ) as Record<string, { id: string }>;

  const CURSOS = [
    {
      slug: "fundamentos-da-move",
      title: "Fundamentos da Move",
      subtitle: "O jeito de pensar antes do jeito de fazer.",
      description:
        "A base que atravessa todas as trilhas: por que percepção vem antes de oferta e o que muda quando a direção existe.",
      level: "INICIANTE",
      cover: "violeta",
      featured: false,
      trilhas: ["posicionamento", "conteudo", "trafego", "audiovisual", "gestao"],
      modulos: [
        {
          title: "Como a Move enxerga o mercado",
          description: "Três aulas curtas. Nenhuma delas é sobre ferramenta.",
          level: "INICIANTE",
          aulas: [
            { title: "Movimento e direção não são a mesma coisa", durationMin: 9 },
            { title: "Atenção é ativo — e ativo se administra", durationMin: 11 },
            { title: "O que a gente escolhe não fazer", durationMin: 8 },
          ],
        },
      ],
    },
    {
      slug: "posicionamento-na-pratica",
      title: "Posicionamento na prática",
      subtitle: "Quem parece igual compete igual.",
      description:
        "Como uma marca deixa de disputar preço e passa a ocupar espaço. Do diagnóstico da percepção atual até a posição que se sustenta no tempo.",
      level: "INICIANTE",
      cover: "laranja",
      featured: true,
      trilhas: ["posicionamento"],
      modulos: [
        {
          title: "Percepção antes de oferta",
          description: "O ponto de partida de quem ainda não definiu posição.",
          level: "INICIANTE",
          aulas: [
            {
              title: "Marca é percepção acumulada",
              description: "Por que o mercado decide antes de você apresentar.",
              durationMin: 14,
            },
            { title: "O que já decidiram sobre você", durationMin: 11 },
            { title: "Quem parece igual compete igual", durationMin: 16 },
          ],
        },
        {
          title: "Encontrar a posição",
          description: "Para quem já comunica e quer parar de soar como todo mundo.",
          level: "INTERMEDIARIO",
          aulas: [
            { title: "Território, tensão e promessa", durationMin: 18 },
            { title: "A frase que sustenta todo o resto", durationMin: 13 },
            { title: "Testar a posição antes de anunciar", durationMin: 15 },
          ],
        },
        {
          title: "Sustentar a posição",
          description: "O que separa uma campanha de uma construção.",
          level: "AVANCADO",
          aulas: [
            { title: "Consistência sem repetição", durationMin: 17 },
            { title: "Quando mudar custa menos que ficar", durationMin: 14 },
          ],
        },
      ],
    },
    {
      slug: "narrativa-e-conteudo",
      title: "Narrativa e conteúdo que constrói",
      subtitle: "O problema não é aparecer. É ser lembrado.",
      description:
        "Estrutura de narrativa aplicada a conteúdo: abertura que gera tensão, desenvolvimento que raciocina e fechamento que fica.",
      level: "INTERMEDIARIO",
      cover: "grafite",
      featured: false,
      trilhas: ["conteudo", "posicionamento"],
      modulos: [
        {
          title: "Antes de escrever",
          level: "INICIANTE",
          aulas: [
            { title: "Assunto não é pauta", durationMin: 10 },
            { title: "Para quem você está escrevendo de verdade", durationMin: 12 },
          ],
        },
        {
          title: "Estrutura",
          description: "A parte que resolve a maioria dos textos travados.",
          level: "INTERMEDIARIO",
          aulas: [
            { title: "Abertura: a tensão em uma linha", durationMin: 15 },
            { title: "Desenvolvimento sem alívio rápido", durationMin: 16 },
            { title: "Fechamento memorável", durationMin: 11 },
          ],
        },
        {
          title: "Volume com direção",
          level: "AVANCADO",
          aulas: [
            { title: "Calendário que constrói percepção", durationMin: 18 },
            { title: "Repetir sem parecer repetição", durationMin: 14 },
          ],
        },
      ],
    },
    {
      slug: "trafego-com-direcao",
      title: "Tráfego com direção",
      subtitle: "Comprar atenção sem direção é aluguel caro.",
      description:
        "Estrutura de conta, criativo e leitura de número para campanhas que não dependem de sorte no mês.",
      level: "INTERMEDIARIO",
      cover: "oceano",
      featured: false,
      trilhas: ["trafego"],
      modulos: [
        {
          title: "Fundamentos de mídia",
          level: "INICIANTE",
          aulas: [
            { title: "Comprar atenção não é comprar demanda", durationMin: 13 },
            { title: "Estrutura de conta sem gordura", durationMin: 17 },
          ],
        },
        {
          title: "Oferta e criativo",
          level: "INTERMEDIARIO",
          aulas: [
            { title: "O criativo carrega a campanha", durationMin: 15 },
            { title: "Cinco ângulos para a mesma oferta", durationMin: 19 },
          ],
        },
        {
          title: "Leitura de número",
          level: "AVANCADO",
          aulas: [
            { title: "Métrica que decide, métrica que distrai", durationMin: 16 },
            { title: "Quando escalar e quando cortar", durationMin: 14 },
          ],
        },
      ],
    },
    {
      slug: "audiovisual-com-intencao",
      title: "Audiovisual com intenção",
      subtitle: "Estética sem direção é decoração.",
      description:
        "Direção, captação e montagem a serviço da mensagem. Da decupagem em uma folha à cor como assinatura.",
      level: "INICIANTE",
      cover: "vinho",
      featured: false,
      trilhas: ["audiovisual"],
      modulos: [
        {
          title: "Direção",
          level: "INICIANTE",
          aulas: [
            { title: "O que a imagem precisa dizer", durationMin: 12 },
            { title: "Decupagem em uma folha", durationMin: 15 },
          ],
        },
        {
          title: "Captação",
          level: "INTERMEDIARIO",
          aulas: [
            { title: "Luz que sustenta a marca", durationMin: 18 },
            { title: "Áudio: o erro que ninguém perdoa", durationMin: 11 },
          ],
        },
        {
          title: "Montagem",
          level: "AVANCADO",
          aulas: [
            { title: "Ritmo é argumento", durationMin: 16 },
            { title: "Cor como assinatura", durationMin: 13 },
          ],
        },
      ],
    },
    {
      slug: "gestao-de-operacao-criativa",
      title: "Gestão de uma operação criativa",
      subtitle: "Nada cresce parado — e nada cresce no improviso.",
      description:
        "Processo, precificação e comercial: a estrutura que sustenta o crescimento que a comunicação abre.",
      level: "INTERMEDIARIO",
      cover: "floresta",
      featured: false,
      trilhas: ["gestao"],
      modulos: [
        {
          title: "Rotina",
          level: "INICIANTE",
          aulas: [
            { title: "Processo é o que segura promessa", durationMin: 14 },
            { title: "Escopo fechado, cliente calmo", durationMin: 12 },
          ],
        },
        {
          title: "Preço",
          level: "INTERMEDIARIO",
          aulas: [
            { title: "Precificar por valor percebido", durationMin: 20 },
            { title: "Reajuste sem perder o cliente", durationMin: 13 },
          ],
        },
        {
          title: "Comercial",
          level: "AVANCADO",
          aulas: [{ title: "A reunião que vende sem empurrar", durationMin: 17 }],
        },
      ],
    },
  ];

  for (const [i, curso] of CURSOS.entries()) {
    const { trilhas: slugs, modulos, ...dados } = curso;
    await db.course.create({
      data: {
        ...dados,
        order: i,
        tracks: {
          create: slugs.map((slug, j) => ({
            trackId: trilhas[slug].id,
            order: j,
          })),
        },
        modules: {
          create: modulos.map((m, k) => ({
            title: m.title,
            description: "description" in m ? m.description : null,
            level: m.level,
            order: k,
            lessons: {
              create: m.aulas.map((a, l) => ({
                title: a.title,
                description: "description" in a ? a.description : null,
                durationMin: a.durationMin,
                order: l,
              })),
            },
          })),
        },
      },
    });
  }

  console.log(`Pronto! ${equipe.length} pessoas, ${clientes.length} clientes e ${demandas.length} demandas criadas.`);
  console.log(`${CURSOS.length} cursos publicados em ${Object.keys(trilhas).length} trilhas.`);
  console.log(`Entre com ${admin.email} e a senha move123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
