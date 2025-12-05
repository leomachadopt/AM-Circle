# Deploy no Vercel - Instruções

## Configuração Necessária

### 1. Arquivo vercel.json
✅ Já criado na raiz do projeto

### 2. Variáveis de Ambiente no Vercel

Acesse as configurações do seu projeto no Vercel e adicione a seguinte variável de ambiente:

**Nome:** `VITE_API_URL`
**Valor:** URL da sua API backend em produção
**Exemplo:** `https://seu-backend.vercel.app/api`

> ⚠️ **Importante**: O prefixo `VITE_` é obrigatório para que o Vite exponha a variável no frontend.

### 3. Configuração do Build

O Vercel detectará automaticamente as configurações do `vercel.json`:
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Framework:** Vite

### 4. Deploy

1. Conecte seu repositório ao Vercel
2. Configure a variável de ambiente `VITE_API_URL`
3. Faça o deploy

### 5. Verificações Pós-Deploy

Após o deploy, verifique:
- [ ] A aplicação carrega na URL do Vercel
- [ ] As rotas da aplicação funcionam (ex: /academy, /community)
- [ ] A API está sendo chamada corretamente (verifique o console do navegador)
- [ ] Não há erros de CORS
- [ ] Assets estáticos (CSS, JS, imagens) estão carregando

## Troubleshooting

### Problema: Página em branco
**Solução:** Verifique o console do navegador para erros. Geralmente é problema com variável de ambiente.

### Problema: Rotas 404
**Solução:** Verifique se o `vercel.json` está na raiz do projeto e foi commitado.

### Problema: API não responde
**Solução:**
1. Verifique se a variável `VITE_API_URL` está configurada corretamente
2. Verifique se o backend está online
3. Verifique as configurações de CORS no backend

### Problema: Assets não carregam
**Solução:** Limpe o cache do Vercel e faça redeploy.

## Backend

Se você também está fazendo deploy do backend no Vercel:

1. Crie um projeto separado para o backend
2. Configure as variáveis de ambiente do backend (DATABASE_URL, JWT_SECRET, etc.)
3. Use a URL do backend no frontend como valor de `VITE_API_URL`
