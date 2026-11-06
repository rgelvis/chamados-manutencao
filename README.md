# Chamados de manutenção

Sistema web para a equipe de uma escola municipal registrar pedidos de conserto do prédio e acompanhar o status. O programa não faz a obra: guarda o pedido, o status e o histórico de cada mudança.

Alunos não usam o sistema. Não há campo para dado de aluno.

O nome da escola começa em branco. Ele só aparece depois que alguém da equipe preencher em **Dados da escola**.

## Telas

- **Abrir chamado.** Local, tipo e descrição. O status inicial é sempre **Aberto**.
- **Lista da direção.** Quem atende vê todos os chamados, com status em palavra e ícone, e registra a mudança. **Concluído** só é aceito com um texto de atualização.
- **Meus chamados.** Quem pediu consulta os próprios chamados e o histórico.

A entrada pede nome e papel: **Solicita o conserto** ou **Atende o chamado**. Não há senha.

Há também a tela **Dados da escola**. O CEP do prédio é consultado na [ViaCEP](https://viacep.com.br/ws/{cep}/json/) e preenche logradouro e município. O nome da escola não vem dessa consulta.

## Exemplos de demonstração

A visita à escola ainda não aconteceu. Três chamados de exemplo entram sozinhos para as telas funcionarem:

1. Entre em [http://localhost:4317](http://localhost:4317).
2. Para a consulta, escolha **Solicita o conserto** e use o nome **Demonstração**.
3. Para a lista da direção, escolha **Atende o chamado** e use qualquer nome.

Os exemplos aparecem com a etiqueta **Exemplo**. Eles não são registro de uma escola visitada.

## Como rodar

Requisitos: Node.js 22.

```bash
npm install
npm run dev
```

O servidor de desenvolvimento sobe em [http://localhost:4317](http://localhost:4317).

Testes do fluxo (criar com status Aberto e só concluir com texto de atualização):

```bash
npm test
```

## Banco de dados

O schema é PostgreSQL (`migrations/001_esquema.sql`).

- Com `DATABASE_URL`, o sistema usa esse Postgres (`pg`). Na Vercel, essa variável é a conexão do Neon. O comando `npm run build` aplica as migrações nesse banco.
- Sem `DATABASE_URL`, o desenvolvimento local continua no [PGlite](https://pglite.dev/), Postgres em WebAssembly, no arquivo `.data/pglite`, com o mesmo schema. Não é preciso instalar nada. Os dados locais ficam nessa pasta e somem se ela for apagada. Na Vercel, sem `DATABASE_URL`, o build para: lá não há PGlite.

Para um Postgres de verdade na máquina, com Docker, defina a senha só no seu ambiente. O arquivo `.env.example` lista os nomes, sem senha e sem URL. Copie para `.env` e preencha aí, ou exporte no terminal. Não commite esse valor.

```bash
docker compose up -d
```

A `DATABASE_URL` local fica só no ambiente, no formato `postgres://USUARIO:SENHA@localhost:54329/chamados`, com o usuário e a senha que você escolheu. Não grave essa URL num arquivo commitado. Se a variável já existir para outro banco, rode sem ela (`env -u DATABASE_URL npm run dev`) para usar o PGlite local.

O cookie de sessão é assinado com `SESSAO_SEGREDO`. No desenvolvimento, se a variável estiver vazia, o sistema cria um arquivo em `.data/sessao-segredo`, que não entra no Git. Na Vercel o segredo vem só da variável de ambiente: sem ela a sessão não é assinada, e cada instância não inventa um segredo próprio. O papel de quem entrou é lido no banco, não no valor que o navegador enviaria.

SQLite não é usado: o fallback local também é Postgres.

## Publicar na Vercel com Neon

O plano gratuito da Vercel (Hobby) e o plano gratuito do Neon bastam. O build do projeto é `npm run build`: gera a aplicação Next.js e, se `DATABASE_URL` existir, aplica as migrações. A Vercel publica o resultado desse build. `npm start` serve a mesma build nesta máquina, na porta 4317 ou na `PORT` do ambiente.

Não grave senha, connection string nem `SESSAO_SEGREDO` no Git.

1. **Criar o projeto na Vercel a partir do GitHub.** Entre no painel da Vercel e crie um projeto importando este repositório do GitHub. Deixe o framework em Next.js e o comando de build em `npm run build`. A Vercel escolhe o endereço do site; ele não está escrito neste arquivo.

2. **Criar o banco no Neon.** No Neon, crie um projeto Postgres no plano gratuito. No painel do banco, copie a connection string com pooler: o host contém `-pooler`. Esse texto é o `DATABASE_URL`. Não cole a string no repositório.

3. **Colar `DATABASE_URL` e `SESSAO_SEGREDO` na Vercel.** Em Settings → Environment Variables, no ambiente Production, crie as duas variáveis. Deixe as duas disponíveis durante o build, para as migrações rodarem.
   - `DATABASE_URL`: a connection string copiada do Neon.
   - `SESSAO_SEGREDO`: um texto aleatório com pelo menos 32 caracteres. Gere na sua máquina e copie o resultado só para a Vercel:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
```

4. **Abrir o endereço publicado.** Salve as variáveis e faça o deploy. Se o primeiro deploy rodou antes das variáveis, dispare o deploy de novo. Quando terminar, abra o endereço que a Vercel mostrar na página do projeto.
