# AirLigner Mastery - Backend API

Backend API para o projeto AirLigner Mastery, construído com Express, TypeScript e Drizzle ORM, conectado ao banco de dados Neon PostgreSQL.

## 🚀 Tecnologias

- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **TypeScript** - Superset tipado do JavaScript
- **Drizzle ORM** - ORM moderno e type-safe
- **PostgreSQL** - Banco de dados (Neon)
- **Postgres.js** - Cliente PostgreSQL

## 📋 Pré-requisitos

- Node.js 18+
- npm ou pnpm
- Conta no Neon com banco de dados configurado

## 🔧 Instalação

1. Instale as dependências:

```bash
cd server
npm install
```

2. Configure as variáveis de ambiente:

Crie um arquivo `.env` na pasta `server/` com o seguinte conteúdo:

```env
DATABASE_URL=postgresql://neondb_owner:npg_g75IbXKncoeV@ep-plain-hall-ab3093yl-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
PORT=3001
NODE_ENV=development
```

## 🗄️ Banco de Dados

### Gerar Migrações

```bash
npm run db:generate
```

### Executar Migrações

```bash
npm run db:migrate
```

### Popular Banco com Dados Iniciais

```bash
tsx src/db/seed.ts
```

### Abrir Drizzle Studio (Interface Visual)

```bash
npm run db:studio
```

## 🏃 Executar o Servidor

### Modo Desenvolvimento

```bash
npm run dev
```

O servidor estará disponível em `http://localhost:3001`

### Modo Produção

```bash
npm run build
npm start
```

## 📡 Endpoints da API

### Health Check
- `GET /health` - Verifica se a API está funcionando

### Usuários
- `GET /api/users` - Lista todos os usuários
- `GET /api/users/:id` - Obtém usuário por ID
- `POST /api/users` - Cria novo usuário
- `PUT /api/users/:id` - Atualiza usuário

### Aulas
- `GET /api/lessons` - Lista todas as aulas
- `GET /api/lessons/:id` - Obtém aula por ID
- `GET /api/lessons/user/:userId` - Obtém aulas com progresso do usuário
- `GET /api/lessons/:id/progress/:userId` - Obtém progresso do usuário em uma aula
- `POST /api/lessons/:id/progress` - Atualiza progresso do usuário

### Eventos/Mentorias
- `GET /api/events` - Lista todos os eventos
- `GET /api/events/:id` - Obtém evento por ID
- `GET /api/events/type/:type` - Obtém eventos por tipo (Em Direto/Gravação)
- `POST /api/events` - Cria novo evento

### Ferramentas
- `GET /api/tools` - Lista todas as ferramentas
- `GET /api/tools/:id` - Obtém ferramenta por ID
- `GET /api/tools/category/:category` - Obtém ferramentas por categoria

### Posts da Comunidade
- `GET /api/posts` - Lista todos os posts
- `GET /api/posts/:id` - Obtém post por ID
- `POST /api/posts` - Cria novo post
- `POST /api/posts/:id/like` - Curtir post
- `GET /api/posts/:id/comments` - Obtém comentários de um post
- `POST /api/posts/:id/comments` - Adiciona comentário

### KPIs
- `GET /api/kpis/user/:userId` - Obtém KPIs de um usuário
- `POST /api/kpis` - Cria novo KPI

### Perguntas para Mentorias
- `GET /api/questions` - Lista todas as perguntas
- `GET /api/questions/user/:userId` - Obtém perguntas de um usuário
- `POST /api/questions` - Cria nova pergunta
- `PUT /api/questions/:id/answer` - Marca pergunta como respondida

## 📁 Estrutura do Projeto

```
server/
├── src/
│   ├── db/
│   │   ├── index.ts          # Configuração do banco de dados
│   │   ├── schema.ts         # Schema do banco de dados
│   │   ├── migrate.ts        # Script de migração
│   │   └── seed.ts           # Script de seed (dados iniciais)
│   ├── routes/
│   │   ├── lessons.ts        # Rotas de aulas
│   │   ├── events.ts         # Rotas de eventos
│   │   ├── users.ts          # Rotas de usuários
│   │   ├── tools.ts          # Rotas de ferramentas
│   │   ├── posts.ts          # Rotas de posts
│   │   ├── kpis.ts           # Rotas de KPIs
│   │   └── questions.ts       # Rotas de perguntas
│   └── index.ts              # Servidor Express
├── drizzle/                  # Migrações geradas
├── package.json
├── tsconfig.json
└── drizzle.config.ts         # Configuração do Drizzle
```

## 🔐 Variáveis de Ambiente

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `DATABASE_URL` | URL de conexão com o banco Neon | `postgresql://...` |
| `PORT` | Porta do servidor | `3001` |
| `NODE_ENV` | Ambiente de execução | `development` ou `production` |

## 🛠️ Scripts Disponíveis

- `npm run dev` - Inicia servidor em modo desenvolvimento
- `npm run build` - Compila TypeScript para JavaScript
- `npm start` - Inicia servidor em modo produção
- `npm run db:generate` - Gera migrações do banco
- `npm run db:migrate` - Executa migrações
- `npm run db:studio` - Abre Drizzle Studio

## 📝 Notas

- O banco de dados está configurado para usar o Neon PostgreSQL
- As migrações são geradas automaticamente pelo Drizzle Kit
- O seed popula o banco com dados iniciais baseados nos mocks do frontend


