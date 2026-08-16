# Como colocar o sistema da Move na internet

No fim disto, o sistema vai estar no ar num endereço próprio. Você e a equipe
entram de qualquer lugar — computador ou celular — sem depender de nenhum
computador ligado.

**Custo: zero.** Usamos o plano gratuito de dois serviços.

Reserve uns 30 minutos. São duas peças:

| Peça | Serviço | Para quê |
| --- | --- | --- |
| Banco de dados | **Supabase** | Guarda clientes, contratos, demandas e o financeiro |
| O sistema | **Netlify** | Mostra as telas e faz tudo funcionar |

---

## Parte 1 — Criar o banco de dados (Supabase)

### 1.1 Criar a conta e o projeto

1. Abra **https://supabase.com** e clique em **Start your project**
2. Entre com sua conta do GitHub
3. Clique em **New project**
4. Preencha:
   - **Name**: `move`
   - **Database Password**: crie uma senha forte e **anote agora**, num bloco de
     notas. Essa senha **não aparece de novo** e você vai colar ela daqui a pouco
   - **Region**: escolha **South America (São Paulo)** — o sistema fica mais
     rápido para quem está no Brasil
5. Clique em **Create new project** e espere uns 2 minutos

### 1.2 Copiar os dois endereços de conexão

No topo do painel do projeto tem um botão **Connect**. Clique nele.

*(Se não achar o botão, o mesmo conteúdo está em **Project Settings** → **Database**
→ seção **Connection string**.)*

Você vai copiar **dois** endereços diferentes:

| No Supabase aparece como | Guarde como | Termina em |
| --- | --- | --- |
| **Transaction pooler** | `DATABASE_URL` | `:6543/postgres` |
| **Direct connection** | `DIRECT_URL` | `:5432/postgres` |

> ⚠️ **Nos dois, troque `[YOUR-PASSWORD]` pela senha do banco** que você anotou no
> passo anterior — os colchetes saem junto. **É o erro que mais trava gente aqui.**

### 1.3 Copiar as chaves da tela ao vivo

No menu lateral, vá em **Settings** → **API Keys** e copie:

- **Project URL** → guarde como `NEXT_PUBLIC_SUPABASE_URL`
- A **chave pública** → guarde como `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Sobre a chave pública: o Supabase está trocando o nome dela, então você vai ver
**uma** destas duas:

- **Publishable key** (começa com `sb_publishable_`) — o nome novo
- **anon public** (um texto bem longo) — o nome antigo

**Qualquer uma das duas funciona.** Se aparecerem as duas, pegue a **Publishable
key**: as antigas serão desativadas até o fim de 2026.

> São essas duas que fazem a tela de todo mundo se atualizar na hora, sem F5.
> Se você pular esta parte, o sistema continua funcionando — só passa a
> procurar novidades a cada 5 segundos, em vez de instantaneamente.

### 1.4 Criar a chave de segurança do login

Esta você inventa. Precisa ser uma sequência longa e aleatória — é ela que
impede alguém de forjar um login.

No Mac, abra o Terminal e rode:

```
openssl rand -hex 32
```

Copie o resultado e guarde como **SESSION_SECRET**.

> Sem Terminal à mão? Use um gerador de senha e crie algo com 50+ caracteres
> misturados. Só não use uma palavra ou uma data.

---

## Parte 2 — Publicar o sistema (Netlify)

### 2.1 Criar o site

1. Abra **https://netlify.com** e entre com sua conta do GitHub
2. Clique em **Add new site** → **Import an existing project**
3. Escolha **GitHub** e autorize
4. Selecione o repositório do sistema
5. Em **Branch to deploy**, escolha
   `claude/move-agency-management-system-6snhwa`
6. **Não clique em Deploy ainda** — falta cadastrar as senhas

### 2.2 Cadastrar as cinco variáveis

Na mesma tela, clique em **Add environment variables** e cadastre as cinco que
você guardou:

| Nome | O que colar |
| --- | --- |
| `DATABASE_URL` | O Transaction pooler (porta 6543) |
| `DIRECT_URL` | O Direct connection (porta 5432) |
| `SESSION_SECRET` | A sequência aleatória que você gerou |
| `NEXT_PUBLIC_SUPABASE_URL` | O Project URL do Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | A chave anon public |

> Confira que não sobrou `[YOUR-PASSWORD]` em nenhum dos dois endereços do banco.
> É o erro mais comum.

### 2.3 Publicar

Clique em **Deploy**. A primeira publicação demora uns 3 minutos.

Enquanto roda, o sistema cria sozinho as tabelas no Supabase. Você não precisa
fazer nada no banco.

Quando terminar, a Netlify mostra o endereço do site — algo como
`https://nome-aleatorio.netlify.app`. Dá para trocar por um nome melhor em
**Site configuration → Change site name**.

---

## Parte 3 — Primeiro acesso

1. Abra o endereço do site
2. Ele vai te levar direto para a tela **"Vamos criar o seu acesso de
   administradora"**
3. Preencha seu nome, e-mail e uma senha
4. Pronto — você já entra no sistema, como administradora

> **Essa tela aparece uma vez só.** Depois que o seu acesso existe, ela para de
> funcionar e todo mundo entra pela tela normal de login. É proposital: impede
> que qualquer pessoa que descubra o endereço crie uma conta de administrador.

### Cadastrar a equipe

Vá em **Equipe → + Adicionar pessoa**. Para cada uma, escolha o cargo com
atenção — é o cargo que decide o que ela enxerga:

- **Administrador** vê tudo, inclusive financeiro e contratos
- **Todos os outros cargos** veem apenas demandas da área deles, kanban, metas
  e calendário

Passe para cada pessoa o endereço do site e o e-mail/senha que você criou. Elas
podem trocar a própria senha em **Minha conta**.

---

## O que você precisa saber sobre o plano grátis

**O projeto do Supabase pausa depois de 1 semana sem nenhum acesso.** Com a
equipe usando no dia a dia isso não acontece. Se acontecer (férias coletivas,
por exemplo), você recebe um e-mail e reativa com um clique no painel.

**O limite é 0,5 GB de banco.** O sistema guarda texto e números — a agência
levaria muitos anos para chegar perto disso.

**Backup.** O Supabase faz cópias automáticas, mas no plano grátis elas são
limitadas. Uma vez por mês, entre em **Relatórios** e **Financeiro** e clique em
**Baixar planilha**. Guarde os arquivos no Drive. É simples e resolve.

---

## Publicando mudanças depois

Toda vez que o código mudar no GitHub, a Netlify republica sozinha. Você não
precisa fazer nada.

---

## Se algo der errado

**A publicação falhou com erro de banco**
Alguma das duas conexões está errada. Confira em **Site configuration →
Environment variables** se sobrou `[YOUR-PASSWORD]` sem trocar, ou se você
inverteu as portas (6543 é a `DATABASE_URL`, 5432 é a `DIRECT_URL`).

**O site abre mas dá erro ao entrar**
Provavelmente falta o `SESSION_SECRET`. Cadastre e clique em **Trigger deploy →
Deploy site**.

**A tela não atualiza sozinha quando outra pessoa salva**
Faltam as duas variáveis do Supabase (`NEXT_PUBLIC_...`). Sem elas o sistema usa
o modo reserva, conferindo a cada 5 segundos — funciona, só não é instantâneo.

**"Esta área é só do administrador"**
Está certo. Significa que a pessoa entrou com um cargo que não inclui aquela
tela. Para mudar, vá em **Equipe** e ajuste o cargo dela.

**O sistema ficou fora do ar do nada**
Veja se o projeto do Supabase pausou por inatividade. Entre em
supabase.com, abra o projeto e clique em **Restore**.
