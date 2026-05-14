import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const projects = [
  // ───── APPS (SaaS Next.js standalone) ─────
  { slug: 'univerreviews',          name: 'UniverReviews',         category: 'APPS',     order: 1,  color: '#fbbf24', description: 'Reviews platform — WooCommerce/Shopify/Yampi/Tray/Nuvemshop', repoUrl: 'https://github.com/univerbeauty777/univerreviews' },
  { slug: 'univermaps',             name: 'UniverMaps',            category: 'APPS',     order: 2,  color: '#10b981', description: 'SaaS professional directory com map/geolocation', repoUrl: null },
  { slug: 'univer-agent',           name: 'Univer Agent v2',       category: 'APPS',     order: 3,  color: '#a855f7', description: 'AI WhatsApp Agent — agent.univerzap.cloud', repoUrl: 'https://github.com/EuKennedy/univer-agent' },
  { slug: 'zapgrup',                name: 'ZapGrup',               category: 'APPS',     order: 4,  color: '#22c55e', description: 'WhatsApp group mass-management — zapgrup.univerzap.cloud', repoUrl: 'https://github.com/EuKennedy/zapgrup' },
  { slug: 'univer-links',           name: 'Univer Links',          category: 'APPS',     order: 5,  color: '#3b82f6', description: 'URL shortener — link.univerzap.cloud', repoUrl: null },
  { slug: 'play-giff',              name: 'Play Giff',             category: 'APPS',     order: 6,  color: '#ec4899', description: 'GIF generator from video URLs', repoUrl: null },
  { slug: 'lizzon-dashboard',       name: 'Lizzon Dashboard',      category: 'APPS',     order: 7,  color: '#f59e0b', description: 'WooCommerce analytics + Chatwoot embed + tracking', repoUrl: null },
  { slug: 'universpy',              name: 'UniverSpy',             category: 'APPS',     order: 8,  color: '#ef4444', description: 'Competitive intelligence dashboard (~97 competitors)', repoUrl: null },
  { slug: 'univerrepost',           name: 'UniverRepost',          category: 'APPS',     order: 9,  color: '#06b6d4', description: 'Cross-platform video publishing (IG → YouTube + TikTok)', repoUrl: null },
  { slug: 'univerfinance',          name: 'UniverFinance',         category: 'APPS',     order: 10, color: '#84cc16', description: 'Financial copilot — DRE, patrimônio, projeções', repoUrl: null },

  // ───── PLUGINS (WordPress/WooCommerce) ─────
  { slug: 'univercart',             name: 'UniverCart',            category: 'PLUGINS',  order: 20, color: '#6366f1', description: 'Plugin WooCommerce — floating cart, discount engine, rewards, CEP shipping', repoUrl: 'https://github.com/EuKennedy/univercart' },
  { slug: 'univer-shoppable-videos',name: 'Univer Shoppable Videos',category: 'PLUGINS', order: 21, color: '#d946ef', description: 'WP plugin v3.2 — Stories, Reels, Vitrine shortcodes + Bunny Stream', repoUrl: null },
  { slug: 'caddy-cart-manager',     name: 'Caddy Cart Manager',    category: 'PLUGINS',  order: 22, color: '#f97316', description: 'Add-on para Caddy WooCommerce — active cart viewing/clearing/creation', repoUrl: null },
  { slug: 'univer-multi-cart',      name: 'Univer Multi Cart',     category: 'PLUGINS',  order: 23, color: '#0ea5e9', description: 'Multi-cart support para WooCommerce', repoUrl: null },
  { slug: 'univer-tag',             name: 'Univer Tag',            category: 'PLUGINS',  order: 24, color: '#eab308', description: 'Tag management para WordPress', repoUrl: null },
  { slug: 'univer-tabs',            name: 'Univer Tabs',           category: 'PLUGINS',  order: 25, color: '#14b8a6', description: 'Tabs customizadas para WordPress', repoUrl: null },
  { slug: 'univer-discount-rules',  name: 'Univer Discount Rules', category: 'PLUGINS',  order: 26, color: '#f43f5e', description: 'Bundle/package discount engine para WooCommerce', repoUrl: null },
  { slug: 'univer-ban',             name: 'Univer Ban',            category: 'PLUGINS',  order: 27, color: '#dc2626', description: 'Ban management para WordPress/WooCommerce', repoUrl: null },
  { slug: 'univer-lau',             name: 'Univer LAU',            category: 'PLUGINS',  order: 28, color: '#8b5cf6', description: 'Login as User — REST API, Chatwoot App, email templates', repoUrl: null },
  { slug: 'lizzon-cupons',          name: 'Lizzon Cupons',         category: 'PLUGINS',  order: 29, color: '#facc15', description: 'WordPress plugin + React raffle site (black/gold)', repoUrl: null },

  // ───── SITES (domínios/sites) ─────
  { slug: 'lizzon-site',            name: 'Lizzon.com.br',         category: 'SITES',    order: 40, color: '#1a1a1a', description: 'Site B2B/B2C Lizzon Professional — WooCommerce', repoUrl: 'https://lizzon.com.br' },
  { slug: 'liso-blindado-site',     name: 'LisoBlindado.com.br',   category: 'SITES',    order: 41, color: '#d4a574', description: 'Site Liso Blindado Express — institucional', repoUrl: 'https://lisoblindado.com.br' },
]

async function main() {
  console.log('🌱 Seeding UniverChangelog (upsert mode)...\n')
  
  for (const p of projects) {
    const result = await prisma.project.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        category: p.category,
        order: p.order,
        color: p.color,
        description: p.description,
        repoUrl: p.repoUrl,
        active: true,
      },
      create: {
        slug: p.slug,
        name: p.name,
        category: p.category,
        order: p.order,
        color: p.color,
        description: p.description,
        repoUrl: p.repoUrl,
        icon: null,
        active: true,
      },
    })
    console.log(`  ✓ [${p.category.padEnd(8)}] ${result.name}`)
  }
  
  const counts = await prisma.project.groupBy({
    by: ['category'],
    _count: { _all: true },
  })
  console.log('\n📊 Por categoria:')
  for (const c of counts) {
    console.log(`  ${c.category}: ${c._count._all} projetos`)
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
