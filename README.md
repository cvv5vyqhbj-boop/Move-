# Sistema da Move

Sistema de gestão da agência: clientes, contratos, demandas, kanban, financeiro e
metas do mês — com acesso separado por cargo.

---

## Como rodar no seu computador

Você precisa ter o [Node.js](https://nodejs.org) instalado (versão 20 ou mais nova).

Abra o terminal na pasta do projeto e rode, na ordem:

```bash
npm install                        # instala o que o sistema precisa
npx prisma migrate dev --name init # cria o banco de dados
npm run seed                       # preenche com dados de exemplo
npm run dev                        # liga o sistema
```

Depois é só abrir **http://localhost:3000** no navegador.

## Entrar no sistema

Os dados de exemplo já criam uma pessoa para cada cargo. **A senha de todas é
`move123`.**

| Entre como        | E-mail              | O que essa pessoa vê                       |
| ----------------- | ------------------- | ------------------------------------------ |
| Administrador     | `admin@move.com`    | **Tudo**                                   |
| Editor de vídeo   | `edicao@move.com`   | Só demandas de edição, metas e calendário  |
| Social media      | `social@move.com`   | Só demandas de social, metas e calendário  |
| Gestor de tráfego | `trafego@move.com`  | Só demandas de tráfego, metas e calendário |
| Designer          | `design@move.com`   | Só demandas de design, metas e calendário  |
| Copywriter        | `copy@move.com`     | Só demandas de copy, metas e calendário    |
| Filmmaker         | `filmagem@move.com` | Só demandas de filmagem, metas e calendário|

> Para começar do zero, sem os dados de exemplo, pule o passo `npm run seed`.

---

## O que tem no sistema

| Tela              | Para quê serve                                                        | Quem vê |
| ----------------- | --------------------------------------------------------------------- | ------- |
| **Painel**        | Resumo do mês: entregas próximas, atrasos e metas                     | Todos   |
| **Demandas**      | Lista de tudo que precisa ser feito, com cliente, responsável e prazo | Todos   |
| **Kanban**        | Quadro de arrastar e soltar (Ideias → A fazer → Fazendo → Revisão → Pronto) | Todos |
| **Metas do mês**  | Objetivos da agência, da equipe e de cada pessoa, com barra de progresso | Todos |
| **Calendário**    | Prazos de entrega e (para o admin) vencimentos do mês                 | Todos   |
| **Clientes**      | Ficha do cliente, tempo de casa, contratos e histórico                | Admin   |
| **Contratos**     | O que cada cliente contratou, por quanto e desde quando               | Admin   |
| **Financeiro**    | Contas a pagar, a receber e o resumo com gráfico do mês               | Admin   |
| **Relatórios**    | Quanto cada cliente rendeu e quanto já foi entregue                   | Admin   |
| **Equipe**        | Quem tem acesso, com qual cargo e senha                               | Admin   |
| **Minha conta**   | Cada pessoa troca a própria senha (clique no seu nome, no rodapé do menu) | Todos |

### Atualização na hora, para todo mundo

Ninguém precisa apertar F5. Assim que uma pessoa salva qualquer coisa, o servidor
avisa todos os navegadores que estão com o sistema aberto e as telas se atualizam
sozinhas — um card movido no kanban aparece na hora na tela de quem está olhando a
lista de demandas.

Quem faz isso: `src/lib/eventos.ts` (o aviso), `src/app/api/atualizacoes/route.ts`
(a conexão que fica aberta) e `src/components/atualizacao-automatica.tsx` (o lado do
navegador). Toda ação que grava chama `atualizarTudo()` de `src/lib/atualizar.ts` —
é o único lugar a mexer se um dia isso mudar.

### Como funciona o controle de acesso

Cada pessoa tem um **cargo**, e o cargo define o que ela enxerga. Isso é conferido
em três lugares diferentes, então não adianta digitar o endereço na mão:

1. **Antes da página abrir** (`src/middleware.ts`) — quem não pode é mandado para a
   tela "Esta área é só do administrador".
2. **Ao carregar e ao salvar** (`requireModule` em `src/lib/auth.ts`) — toda tela e
   toda ação que grava dados confere de novo.
3. **No menu** — o que a pessoa não pode acessar nem aparece na lateral.

Quem não é administrador vê, nas demandas e no kanban, **as demandas da sua área
mais as que estão no nome dela** (regra em `src/lib/demandas.ts`).

Para mudar quem vê o quê, mexa em um arquivo só: **`src/lib/permissions.ts`**.

---

## Onde fica cada coisa (para quem for mexer no código)

```
prisma/schema.prisma     desenho do banco de dados
prisma/seed.ts           dados de exemplo
src/lib/permissions.ts   quem vê o quê  ← regra central de acesso
src/lib/constants.ts     todos os textos e listas (áreas, cargos, situações)
src/lib/format.ts        formatação de dinheiro, datas e "tempo de casa"
src/lib/financeiro.ts    contas do financeiro, usadas no painel e nos relatórios
src/app/(sistema)/       as telas de dentro do sistema
src/app/actions/         ações que gravam no banco
src/components/          peças de tela reaproveitadas (tabelas, formulários, etiquetas)
```

Feito com Next.js, Prisma e Tailwind CSS. O banco é um arquivo local (SQLite), então
não é preciso instalar banco de dados nenhum.

## Ao publicar na internet

1. Troque o `SESSION_SECRET` no arquivo `.env` por um valor secreto e aleatório.
2. Troque as senhas de todo mundo pela tela **Equipe**.
3. Se for para uso pesado, dá para mudar o banco de SQLite para PostgreSQL
   alterando o `provider` e a `DATABASE_URL`.
