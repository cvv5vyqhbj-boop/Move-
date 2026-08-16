#!/bin/bash
#
# Instalador do sistema da Move — roda uma vez só.
#
# Prepara tudo no computador: instala o que o sistema precisa, cria o banco de
# dados vazio e cria o seu acesso de administrador.
#
# Depois disso, para usar o sistema no dia a dia, é só dar dois cliques no
# arquivo "iniciar.command".

# Vai para a pasta onde este arquivo está, funcione de onde for chamado.
cd "$(dirname "$0")" || exit 1

# Para na primeira falha, em vez de seguir quebrando em silêncio.
set -e

echo ""
echo "==============================================="
echo "   Instalação do sistema da Move"
echo "==============================================="
echo ""

# ---------------------------------------------------------------------------
# 1. O Node.js está instalado?
# ---------------------------------------------------------------------------
if ! command -v node >/dev/null 2>&1; then
  echo "Falta instalar o Node.js — é ele que faz o sistema funcionar."
  echo ""
  echo "Vou abrir o site agora. Baixe o botão verde (LTS), instale clicando"
  echo "em 'Continuar' até o fim, e depois rode esta instalação de novo."
  echo ""
  open "https://nodejs.org" 2>/dev/null || true
  echo "Site: https://nodejs.org"
  echo ""
  exit 1
fi

echo "Node.js encontrado ($(node -v))."
echo ""

# ---------------------------------------------------------------------------
# 2. Instalar o que o sistema precisa
# ---------------------------------------------------------------------------
echo "Instalando os componentes do sistema. Isso demora alguns minutos na"
echo "primeira vez — pode deixar rodando."
echo ""
npm install --no-audit --no-fund

# ---------------------------------------------------------------------------
# 3. Onde ficam os dados (banco no Supabase)
# ---------------------------------------------------------------------------
# O sistema guarda tudo num banco na internet (Supabase), o mesmo usado pelo
# site publicado. Aqui pedimos os dois endereços de conexão, uma vez só.
if [ ! -f .env ]; then
  echo ""
  echo "-----------------------------------------------"
  echo "   Conexão com o banco de dados"
  echo "-----------------------------------------------"
  echo ""
  echo "No painel do Supabase, vá em Project Settings > Database e copie os"
  echo "dois endereços de conexão (troque [YOUR-PASSWORD] pela sua senha):"
  echo ""

  while [ -z "$BANCO_POOL" ]; do
    read -r -p "Cole o 'Transaction pooler' (porta 6543): " BANCO_POOL
  done

  while [ -z "$BANCO_DIRETO" ]; do
    read -r -p "Cole o 'Direct connection' (porta 5432): " BANCO_DIRETO
  done

  echo ""
  echo "Criando a chave de segurança deste computador..."
  CHAVE=$(openssl rand -hex 32)

  cat > .env <<ARQUIVO
# Banco de dados no Supabase
DATABASE_URL="$BANCO_POOL"
DIRECT_URL="$BANCO_DIRETO"

# Chave que assina o login deste computador. Nao compartilhe.
SESSION_SECRET="$CHAVE"
ARQUIVO
  echo "Pronto."
fi

# ---------------------------------------------------------------------------
# 4. Criar o banco de dados
# ---------------------------------------------------------------------------
echo ""
echo "Preparando o banco de dados..."
npx prisma migrate deploy
npx prisma generate >/dev/null

# ---------------------------------------------------------------------------
# 5. Criar o administrador (só se ainda não houver ninguém)
# ---------------------------------------------------------------------------
JA_TEM_GENTE=$(node -e "
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();
db.user.count().then((n) => { console.log(n); return db.\$disconnect(); }).catch(() => console.log(0));
" 2>/dev/null || echo 0)

# Se a contagem vier vazia ou estranha, trata como banco vazio.
case "$JA_TEM_GENTE" in
  ''|*[!0-9]*) JA_TEM_GENTE=0 ;;
esac

if [ "$JA_TEM_GENTE" -gt 0 ]; then
  echo ""
  echo "O sistema já tem $JA_TEM_GENTE pessoa(s) cadastrada(s) — não vou mexer nisso."
  echo "Se precisar trocar sua senha, use a tela 'Minha conta' dentro do sistema."
else
  echo ""
  echo "-----------------------------------------------"
  echo "   Vamos criar o seu acesso de administrador"
  echo "-----------------------------------------------"
  echo ""

  # Pergunta até vir uma resposta válida, em vez de falhar por campo vazio.
  while [ -z "$ADMIN_NOME" ]; do
    read -r -p "Seu nome: " ADMIN_NOME
  done

  while [ -z "$ADMIN_EMAIL" ]; do
    read -r -p "Seu e-mail (é com ele que você entra): " ADMIN_EMAIL
  done

  while true; do
    read -r -s -p "Crie uma senha (mínimo 6 caracteres): " ADMIN_SENHA
    echo ""
    if [ ${#ADMIN_SENHA} -lt 6 ]; then
      echo "Senha curta demais. Tente de novo."
      continue
    fi
    read -r -s -p "Repita a senha: " SENHA_CONFIRMA
    echo ""
    if [ "$ADMIN_SENHA" != "$SENHA_CONFIRMA" ]; then
      echo "As senhas não são iguais. Tente de novo."
      continue
    fi
    break
  done

  echo ""
  ADMIN_NOME="$ADMIN_NOME" ADMIN_EMAIL="$ADMIN_EMAIL" ADMIN_SENHA="$ADMIN_SENHA" \
    npx tsx scripts/criar-admin.ts
fi

# ---------------------------------------------------------------------------
# 6. Montar o sistema
# ---------------------------------------------------------------------------
echo ""
echo "Montando o sistema. Só mais um minuto..."
npm run build

# ---------------------------------------------------------------------------
# 7. Liberar o duplo clique no iniciar.command
# ---------------------------------------------------------------------------
# Baixar um ZIP tira a permissão de execução dos arquivos. Devolvemos aqui.
chmod +x iniciar.command 2>/dev/null || true
chmod +x instalar.command 2>/dev/null || true

# O macOS marca tudo que vem da internet como "suspeito" e bloqueia o duplo
# clique. Como você acabou de rodar esta instalação por conta própria, tiramos
# essa marca do iniciar.command para ele abrir normalmente.
xattr -d com.apple.quarantine iniciar.command 2>/dev/null || true

echo ""
echo "==============================================="
echo "   Pronto! O sistema está instalado."
echo "==============================================="
echo ""
echo "A partir de agora, para usar o sistema é só dar DOIS CLIQUES no"
echo "arquivo 'iniciar.command', aqui nesta mesma pasta."
echo ""
echo "Pode fechar esta janela."
echo ""
