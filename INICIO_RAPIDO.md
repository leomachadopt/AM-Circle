# 🚀 Guia de Início Rápido

## ⚠️ IMPORTANTE: Erro de Conexão

Se você está vendo erros `ERR_CONNECTION_REFUSED`, significa que o **backend não está rodando**.

## 📋 Passos para Iniciar o Projeto

### 1. Iniciar o Backend (Obrigatório)

```bash
cd server
npm install  # Se ainda não instalou as dependências
npm run dev
```

O backend deve estar rodando em `http://localhost:3001`

### 2. Iniciar o Frontend

Em outro terminal:

```bash
# Na raiz do projeto
npm install  # Se ainda não instalou as dependências
npm start
```

O frontend estará disponível em `http://localhost:8080`

### 3. Verificar Conexão

- Acesse `http://localhost:3001/health` no navegador
- Deve retornar: `{"status":"ok","message":"API AirLigner Mastery está funcionando"}`

## 🔧 Configuração de Ambiente

### Backend
O arquivo `.env` já está configurado em `server/.env` com a conexão do Neon.

### Frontend
Crie um arquivo `.env.local` na raiz do projeto (já criado automaticamente):

```env
VITE_API_URL=http://localhost:3001/api
```

## ✅ Verificar se Tudo Está Funcionando

1. Backend rodando: `http://localhost:3001/health`
2. Frontend rodando: `http://localhost:8080`
3. Aulas carregando: Acesse `/academy` no frontend
4. Painel Admin: Acesse `/admin/academy` no frontend

## 🐛 Resolução de Problemas

### Erro: `ERR_CONNECTION_REFUSED`
- **Causa**: Backend não está rodando
- **Solução**: Execute `cd server && npm run dev`

### Erro: `Failed to fetch`
- **Causa**: Backend não está acessível ou URL incorreta
- **Solução**: Verifique se o backend está em `http://localhost:3001`

### Aulas não aparecem
- **Causa**: Banco de dados vazio
- **Solução**: Execute `cd server && npm run db:seed`

## 📝 Notas

- O backend deve estar rodando **antes** de acessar o frontend
- As aulas foram populadas no banco de dados via seed
- O frontend agora busca dados da API ao invés de usar dados hardcoded



