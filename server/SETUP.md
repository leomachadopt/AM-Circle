# 🚀 Guia Rápido de Setup

## Passo 1: Instalar Dependências

```bash
cd server
npm install
```

## Passo 2: Configurar Variáveis de Ambiente

Crie um arquivo `.env` na pasta `server/` com o seguinte conteúdo:

```env
DATABASE_URL=postgresql://neondb_owner:npg_g75IbXKncoeV@ep-plain-hall-ab3093yl-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
PORT=3001
NODE_ENV=development
```

**⚠️ IMPORTANTE:** O arquivo `.env` não foi criado automaticamente por questões de segurança. Você precisa criá-lo manualmente.

## Passo 3: Gerar e Executar Migrações

```bash
# Gerar migrações do banco de dados
npm run db:generate

# Executar migrações (criar tabelas no banco)
npm run db:migrate
```

## Passo 4: Popular Banco com Dados Iniciais (Opcional)

```bash
npm run db:seed
```

## Passo 5: Iniciar o Servidor

```bash
npm run dev
```

O servidor estará rodando em `http://localhost:3001`

## ✅ Verificar se está funcionando

Acesse: `http://localhost:3001/health`

Você deve ver:
```json
{
  "status": "ok",
  "message": "API AirLigner Mastery está funcionando"
}
```

## 📝 Comandos Úteis

- `npm run dev` - Inicia servidor em modo desenvolvimento
- `npm run build` - Compila TypeScript
- `npm start` - Inicia servidor em produção
- `npm run db:generate` - Gera migrações
- `npm run db:migrate` - Executa migrações
- `npm run db:seed` - Popula banco com dados iniciais
- `npm run db:studio` - Abre interface visual do Drizzle

## 🔍 Testar Endpoints

Após iniciar o servidor, você pode testar os endpoints:

```bash
# Health check
curl http://localhost:3001/health

# Listar aulas
curl http://localhost:3001/api/lessons

# Listar eventos
curl http://localhost:3001/api/events

# Listar usuários
curl http://localhost:3001/api/users
```



