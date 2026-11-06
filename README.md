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

- Com `DATABASE_URL`, o sistema usa esse Postgres (`pg`). Na publicação, o banco é criado pela plataforma. O build aplica as migrações.
- Sem `DATABASE_URL`, o sistema sobe com [PGlite](https://pglite.dev/), Postgres em WebAssembly, no arquivo `.data/pglite`, com o mesmo schema. Não é preciso instalar nada. Os dados locais ficam nessa pasta e somem se ela for apagada.

Para um Postgres de verdade na máquina, com Docker, defina a senha só no seu ambiente. O arquivo `.env.example` lista o nome da variável, sem senha. Copie para `.env` e preencha aí, ou exporte no terminal. Não commite esse valor.

```bash
docker compose up -d
```

A `DATABASE_URL` também fica só no ambiente, no formato `postgres://USUARIO:SENHA@localhost:54329/chamados`, com o usuário e a senha que você escolheu. Não grave essa URL num arquivo commitado. Se a variável já existir para outro banco, rode sem ela (`env -u DATABASE_URL npm run dev`) para usar o PGlite local.

O cookie de sessão é assinado. O segredo é `SESSAO_SEGREDO`. No desenvolvimento, se a variável estiver vazia, o sistema cria um arquivo em `.data/sessao-segredo`, que não entra no Git. Na publicação, defina `SESSAO_SEGREDO` para a sessão continuar depois de um reinício. O papel de quem entrou é lido no banco, não no valor que o navegador enviaria.

SQLite não é usado: o fallback local também é Postgres.
