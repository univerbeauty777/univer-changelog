# UniverChangelog

Sistema centralizado de changelog para todo o stack UniverBeauty. Interface GODMODE premium com abas por projeto, filtros avançados, export Markdown, e gestão completa de histórico.

## Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL 17
- **ORM**: Prisma 5
- **Styling**: CSS Variables (dark/light mode ready)
- **Deploy**: Docker + Coolify

## Features

✨ **Interface GODMODE Premium**
- Header com ícone gradiente e stats bar com métricas
- Sistema de abas por projeto (20 projetos pré-configurados)
- Toolbar com busca, filtros por tipo, data range
- Table view com paginação (25/50/100/250 entries)
- Empty state premium

📝 **Gestão Completa**
- CRUD de changelog entries
- Suporte Markdown nas descrições
- Tipos: feature, fix, breaking, chore, docs, refactor, perf, test
- Versioning semântico (1.0.0)
- Tags customizáveis
- Links para commits, PRs, issues

📤 **Export/Import**
- Export CHANGELOG.md formatado por projeto
- Agrupamento por versão e tipo
- Emojis automáticos por tipo
- Formato compatível com Keep a Changelog

## Projetos Pré-configurados

O seed inclui todos os seus projetos:

- UniverCart, UniverReviews, Univer Agent v2, ZapGrup
- UniverMaps, Univer Links, Play Giff, Lizzon Dashboard
- Univer Shoppable Videos, Caddy Cart Manager, Univer Multi Cart
- Univer Tag, Univer Tabs, Univer Discount Rules, Univer Ban
- Univer LAU, Lizzon Cupons, UniverSpy, UniverRepost, UniverFinance

Cada projeto tem ícone, cor, descrição, e link para repo.

## Setup Local

```bash
# Clone
git clone <repo>
cd univerchangelog

# Install
npm install

# Environment
cp .env.example .env
# Edite DATABASE_URL no .env

# Database
npx prisma migrate dev
npx prisma db seed

# Dev
npm run dev
# http://localhost:3000
```

## Deploy no Coolify

### 1. Criar Novo Resource

No Coolify:
- **Type**: Docker Compose
- **Source**: Seu repo GitHub (EuKennedy/univerchangelog)
- **Branch**: main
- **Port**: 3000

### 2. Configurar Environment Variables

```env
DATABASE_URL=postgresql://postgres:SENHA_SEGURA@postgres:5432/univerchangelog
NODE_ENV=production
```

> **Nota**: Coolify cria o serviço PostgreSQL automaticamente se você usar `postgres` como host.

### 3. Configurar Build

No `docker-compose.yml` do Coolify, o serviço `app` já tem o comando correto:

```yaml
command: sh -c "npx prisma migrate deploy && npx prisma db seed && node server.js"
```

Isso garante que:
1. Migrations rodam na primeira build
2. Seed popula os 20 projetos
3. App inicia normalmente

### 4. Deploy

- Commit & push → Coolify auto-deploys
- Primeira build demora ~3-5min (instala deps, roda migrations, seed)
- Builds subsequentes são mais rápidas (cache)

### 5. Acesso

Acesse via domínio configurado no Coolify:
```
https://changelog.univerzap.cloud
```

## Uso

### Adicionar Entrada

1. Clique em **Nova Entrada**
2. Preencha:
   - Projeto (seletor com ícones)
   - Versão (ex: 1.0.0)
   - Tipo (feature/fix/breaking/etc)
   - Título (resumo de uma linha)
   - Descrição (Markdown)
   - Autor, Data, Commit Hash, PR/Issue URLs, Tags
3. **Criar Entrada**

### Filtrar

- **Abas**: Clique em um projeto para filtrar
- **Busca**: Digite palavras-chave
- **Tipo**: Filtre por feature, fix, etc
- **Data**: Range com "até"
- **Limpar filtros**: Remove todos os filtros ativos

### Export CHANGELOG.md

1. Selecione um projeto (aba)
2. Clique em **Export .md**
3. Arquivo `{slug}-changelog.md` é baixado
4. Formato Keep a Changelog:
   ```markdown
   # Changelog — UniverCart
   
   ## [1.0.0] - 2025-05-13
   
   ### ✨ Features
   - **Floating cart** ...
   
   ### 🐛 Bug Fixes
   - **CEP validation** ...
   ```

## Tipos de Changelog

| Tipo | Emoji | Uso |
|------|-------|-----|
| `feature` | ✨ | Nova funcionalidade |
| `fix` | 🐛 | Correção de bug |
| `breaking` | 💥 | Mudança incompatível |
| `chore` | 🔧 | Manutenção, deps |
| `docs` | 📝 | Documentação |
| `refactor` | ♻️ | Refatoração de código |
| `perf` | ⚡ | Performance |
| `test` | ✅ | Testes |

## Database Schema

### Project
- name, slug (unique), description
- icon (emoji), color (hex)
- repoUrl (GitHub)
- active, order
- _count.entries

### ChangelogEntry
- projectId → Project
- version, type, title, description
- author, commitHash, prUrl, issueUrl
- tags (array)
- date, createdAt, updatedAt

## API Routes

```
GET    /api/projects              # Lista projetos com contagem
POST   /api/projects              # Cria projeto

GET    /api/changelog             # Lista entries (query params: projectId, type, version, startDate, endDate, search)
POST   /api/changelog             # Cria entry
PATCH  /api/changelog             # Atualiza entry (body: id + campos)
DELETE /api/changelog?id={id}    # Deleta entry

GET    /api/export?projectId={id}&format=markdown  # Export CHANGELOG.md
```

## Estrutura de Arquivos

```
univerchangelog/
├── prisma/
│   ├── schema.prisma          # Models Project + ChangelogEntry
│   └── seed.ts                # 20 projetos pré-configurados
├── app/
│   ├── api/
│   │   ├── changelog/route.ts # CRUD entries
│   │   ├── projects/route.ts  # Lista projetos
│   │   └── export/route.ts    # Export .md
│   ├── globals.css            # CSS Variables + GODMODE styles
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Wrapper para ChangelogManager
│   └── ChangelogManager.tsx   # Componente principal (client)
├── lib/
│   └── db.ts                  # Prisma singleton
├── .env.example               # Template env vars
├── Dockerfile                 # Multi-stage build
├── docker-compose.yml         # Dev local + Coolify
├── next.config.js
├── package.json
└── tsconfig.json
```

## Comandos Úteis

```bash
# Development
npm run dev

# Build
npm run build
npm start

# Prisma
npx prisma studio              # UI para DB
npx prisma migrate dev         # Nova migration
npx prisma db seed             # Re-seed projetos
npx prisma generate            # Regenera client

# Docker local
docker-compose up -d           # Sobe PostgreSQL + App
docker-compose logs -f app     # Logs
docker-compose down            # Para tudo
```

## Customização

### Adicionar Novo Projeto

Edite `prisma/seed.ts`:

```typescript
{
  name: 'Novo Projeto',
  slug: 'novo-projeto',
  description: 'Descrição breve',
  icon: '🚀',
  color: '#6366F1',
  repoUrl: 'https://github.com/user/repo',
  order: 21
}
```

Rode:
```bash
npx prisma db seed
```

### Adicionar Novo Tipo de Changelog

1. Adicione emoji em `typeEmojis` no ChangelogManager.tsx
2. Adicione label em `typeLabels` no export route
3. Adicione CSS badge classe em globals.css:
   ```css
   .badge-meutipo { background: rgba(X, X, X, 0.1); color: #XXXXXX; }
   ```

### Dark/Light Mode

Alterne o atributo `data-theme` no `<html>`:
```javascript
document.documentElement.setAttribute('data-theme', 'dark')
```

Todas as cores usam CSS variables e respondem automaticamente.

## Troubleshooting

### Migration Error no Coolify

Se falhar com "relation already exists":
```bash
# No container do app
npx prisma migrate resolve --applied <migration_name>
npx prisma migrate deploy
```

### Seed Não Rodou

```bash
# Dentro do container
npx prisma db seed
```

### Stats Não Atualizam

Certifique-se que `filterEntries()` está sendo chamado no `useEffect`.

### Export Download Não Funciona

Verifique se o projeto está selecionado (aba ativa) antes de clicar Export.

## Licença

Interno — UniverBeauty

---

**Autor**: Diego (EuKennedy)  
**Stack**: Next.js 14 + Prisma 5 + PostgreSQL 17  
**Deploy**: Coolify @ Hostinger  
**Repo**: https://github.com/EuKennedy/univerchangelog
