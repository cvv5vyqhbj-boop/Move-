#!/bin/bash
#
# Liga o sistema da Move.
#
# Dois cliques neste arquivo e o sistema abre no navegador.
# Para desligar, feche esta janela preta.

cd "$(dirname "$0")" || exit 1

echo ""
echo "==============================================="
echo "   Sistema da Move"
echo "==============================================="
echo ""

# Ainda não foi instalado? Avisa em vez de dar erro técnico.
if [ ! -d node_modules ] || [ ! -d .next ]; then
  echo "O sistema ainda não foi instalado neste computador."
  echo ""
  echo "Abra o arquivo 'instalar.command', aqui nesta mesma pasta, e siga"
  echo "as instruções. Depois volte aqui."
  echo ""
  read -r -p "Aperte Enter para fechar."
  exit 1
fi

# Descobre o endereço desta máquina no wi-fi, para a equipe acessar.
# en0 costuma ser o wi-fi no Mac; en1 é a alternativa comum.
IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "")

echo "Ligando..."
echo ""
echo "  Neste computador:   http://localhost:3000"
if [ -n "$IP" ]; then
  echo "  Para a equipe:      http://$IP:3000"
  echo ""
  echo "  (a equipe acessa por esse segundo endereço, no celular ou no"
  echo "   computador, desde que esteja no mesmo wi-fi que você)"
fi
echo ""
echo "-----------------------------------------------"
echo "  Para DESLIGAR o sistema, feche esta janela."
echo "-----------------------------------------------"
echo ""

# Abre o navegador assim que o sistema responder.
(
  for _ in $(seq 1 30); do
    if curl -s -o /dev/null "http://localhost:3000/entrar"; then
      open "http://localhost:3000" 2>/dev/null
      break
    fi
    sleep 1
  done
) &

npm run start
