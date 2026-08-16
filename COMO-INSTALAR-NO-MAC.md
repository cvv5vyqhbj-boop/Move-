# Como instalar o sistema da Move no seu Mac

> **Você provavelmente não precisa disto.**
> O caminho principal agora é o sistema publicado na internet — veja
> **[COMO-PUBLICAR-NA-INTERNET.md](COMO-PUBLICAR-NA-INTERNET.md)**. Lá o sistema
> funciona de qualquer lugar, no celular e no computador, sem depender do seu
> Mac estar ligado.
>
> Este guia serve só para rodar o sistema também na sua máquina, apontando para
> o **mesmo banco de dados** do site publicado. Você vai precisar dos endereços
> de conexão do Supabase para concluir.

São **quatro passos**, e só o primeiro dá algum trabalho. Depois disso, usar o
sistema é dar dois cliques num arquivo.

Reserve uns 15 minutos.

---

## Passo 1 — Instalar o Node.js

O Node.js é o motor que faz o sistema funcionar. Ele é gratuito e você instala
uma vez só.

1. Abra **https://nodejs.org**
2. Clique no botão verde que diz **LTS** (é o da esquerda, o recomendado)
3. Abra o arquivo que baixou e vá clicando em **Continuar** até o fim
4. Quando terminar, pode fechar

---

## Passo 2 — Baixar os arquivos do sistema

1. Abra a página do sistema no GitHub
2. Clique no botão verde **Code**
3. Clique em **Download ZIP**
4. Vá na pasta **Downloads** e dê dois cliques no arquivo baixado para
   descompactar
5. Arraste a pasta que apareceu para **Documentos** e renomeie para **Move**

Agora você tem uma pasta chamada `Move` nos seus Documentos, e é ali que o
sistema vai morar.

---

## Passo 3 — Instalar (só uma vez)

Aqui tem um truque para você não precisar digitar nada complicado.

1. Aperte **Command + Barra de espaço**, escreva **Terminal** e aperte Enter.
   Vai abrir uma janela branca ou preta com texto.

2. Nessa janela, digite exatamente isto — **com o espaço no final**:

   ```
   bash 
   ```

3. **Sem apertar Enter ainda**: abra a pasta `Move` no Finder, e **arraste o
   arquivo `instalar.command` para dentro da janela do Terminal**.

   O endereço do arquivo aparece sozinho. Você não precisa digitar caminho
   nenhum.

4. Agora sim, aperte **Enter**.

5. A instalação começa. Vai demorar alguns minutos na primeira vez — é normal,
   pode deixar rodando.

6. Lá pelo meio, ele vai perguntar:
   - **Seu nome**
   - **Seu e-mail** — é com ele que você vai entrar no sistema
   - **Uma senha** — escolha uma com pelo menos 6 caracteres

   A senha não aparece na tela enquanto você digita. Isso é proposital.

7. Quando aparecer **"Pronto! O sistema está instalado"**, pode fechar a janela.

> **Por que arrastar em vez de dar dois cliques?**
> Arquivos baixados da internet vêm bloqueados pelo Mac. Arrastar para o
> Terminal contorna isso, e a própria instalação já libera o duplo clique para
> as próximas vezes.

---

## Passo 4 — Usar o sistema, todo dia

Na pasta `Move`, dê **dois cliques em `iniciar.command`**.

Uma janela preta abre e o navegador entra no sistema sozinho. Faça login com o
e-mail e a senha que você criou.

**Para desligar o sistema, feche a janela preta.**

---

## A sua equipe também pode usar

Quando você liga o sistema, a janela preta mostra dois endereços:

```
Neste computador:   http://localhost:3000
Para a equipe:      http://192.168.0.15:3000     ← o número muda no seu caso
```

O segundo endereço é o que sua equipe usa. Passe ele para o pessoal: eles
abrem no navegador do computador ou do celular e entram com o login que você
criar para cada um na tela **Equipe**.

**Duas condições:** todo mundo precisa estar no **mesmo wi-fi** que você, e o
**seu Mac precisa estar ligado com o sistema aberto**. Se você fechar a janela
preta ou levar o notebook para casa, a equipe perde o acesso.

Para o sistema funcionar de qualquer lugar, a qualquer hora, sem depender do seu
computador, ele precisa ser publicado na internet. É um passo separado — me
peça quando quiser.

---

## Cuidados importantes

**Faça cópia do seu banco de dados.** Todos os seus clientes, contratos,
demandas e o financeiro ficam dentro de um único arquivo:

```
Move / prisma / dev.db
```

De vez em quando — uma vez por semana é um bom ritmo — copie esse arquivo para
o iCloud, o Google Drive ou um pen drive. Se o Mac quebrar ou for roubado, é
essa cópia que salva a agência.

**Não compartilhe o arquivo `.env`.** É ele que guarda a chave de segurança do
seu login, criada só para o seu computador.

---

## Se algo der errado

**"command not found: node"**
O Node.js não foi instalado. Refaça o Passo 1 e rode a instalação de novo.

**A janela preta abre e fecha na hora**
O sistema ainda não foi instalado. Faça o Passo 3.

**"port 3000 is already in use"**
O sistema já está ligado em outra janela. Procure a janela preta que já está
aberta, ou feche todas e abra de novo.

**Esqueci minha senha**
Abra o Terminal, digite `bash ` com espaço, arraste o `instalar.command` de
novo e aperte Enter. Ele não apaga nada — e se você usar o mesmo e-mail, troca
a senha. (Se já houver gente cadastrada, ele não pergunta; nesse caso me chame
que eu te passo o comando certo.)

**Quero recomeçar do zero, apagando tudo**
Apague o arquivo `Move/prisma/dev.db` e rode a instalação de novo. Isso apaga
**todos** os dados, sem volta — faça uma cópia antes se tiver dúvida.
