import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const projects = [
  {
    name: 'UniverCart',
    slug: 'univercart',
    description: 'Plugin WooCommerce — floating cart, discount engine, rewards meter, CEP shipping',
    icon: '🛒',
    color: '#6366F1',
    repoUrl: 'https://github.com/EuKennedy/univercart',
    order: 1
  },
  {
    name: 'UniverReviews',
    slug: 'univerreviews',
    description: 'SaaS reviews platform — WhatsApp native, AI PT-BR, WooCommerce/Shopify',
    icon: '⭐',
    color: '#F59E0B',
    repoUrl: 'https://github.com/univerbeauty777/univerreviews',
    order: 2
  },
  {
    name: 'Univer Agent v2',
    slug: 'univer-agent',
    description: 'AI WhatsApp agent builder — OpenAI + RAG pgvector, WAHA integration',
    icon: '🤖',
    color: '#8B5CF6',
    repoUrl: 'https://github.com/EuKennedy/univer-agent',
    order: 3
  },
  {
    name: 'ZapGrup',
    slug: 'zapgrup',
    description: 'WhatsApp group mass-management SaaS — bulk campaigns, anti-ban dispatch',
    icon: '📱',
    color: '#10B981',
    repoUrl: 'https://github.com/EuKennedy/zapgrup',
    order: 4
  },
  {
    name: 'UniverMaps',
    slug: 'univermaps',
    description: 'SaaS professional directory — geolocation, WhatsApp search, cartographic design',
    icon: '🗺️',
    color: '#3B82F6',
    repoUrl: 'https://github.com/EuKennedy/univermaps',
    order: 5
  },
  {
    name: 'Univer Links',
    slug: 'univer-links',
    description: 'URL shortener — UTM tracking, Chatwoot embed, agent attribution',
    icon: '🔗',
    color: '#EC4899',
    repoUrl: 'https://github.com/EuKennedy/univer-links',
    order: 6
  },
  {
    name: 'Play Giff',
    slug: 'play-giff',
    description: 'GIF generator from video URLs — Next.js, Docker/Coolify',
    icon: '🎞️',
    color: '#F97316',
    order: 7
  },
  {
    name: 'Lizzon Dashboard',
    slug: 'lizzon-dashboard',
    description: 'WooCommerce analytics — Chatwoot embed, SeuRastreio tracking',
    icon: '📊',
    color: '#D97706',
    order: 8
  },
  {
    name: 'Univer Shoppable Videos',
    slug: 'univer-shoppable-videos',
    description: 'WordPress plugin — Stories/Reels/Vitrine shortcodes, Bunny Stream',
    icon: '🎥',
    color: '#EF4444',
    order: 9
  },
  {
    name: 'Caddy Cart Manager',
    slug: 'caddy-cart-manager',
    description: 'WooCommerce cart optimization plugin',
    icon: '🛍️',
    color: '#06B6D4',
    order: 10
  },
  {
    name: 'Univer Multi Cart',
    slug: 'univer-multi-cart',
    description: 'Multiple carts management for WooCommerce',
    icon: '🛒',
    color: '#14B8A6',
    order: 11
  },
  {
    name: 'Univer Tag',
    slug: 'univer-tag',
    description: 'WordPress tagging system plugin',
    icon: '🏷️',
    color: '#84CC16',
    order: 12
  },
  {
    name: 'Univer Tabs',
    slug: 'univer-tabs',
    description: 'WordPress tabs system plugin',
    icon: '📑',
    color: '#A3E635',
    order: 13
  },
  {
    name: 'Univer Discount Rules',
    slug: 'univer-discount-rules',
    description: 'WooCommerce bundle/package discount engine',
    icon: '💰',
    color: '#FCD34D',
    order: 14
  },
  {
    name: 'Univer Ban',
    slug: 'univer-ban',
    description: 'WordPress ban system plugin',
    icon: '🚫',
    color: '#EF4444',
    order: 15
  },
  {
    name: 'Univer LAU',
    slug: 'univer-lau',
    description: 'Login as User v1.2.1 — REST API, Chatwoot Dashboard App',
    icon: '🔐',
    color: '#8B5CF6',
    order: 16
  },
  {
    name: 'Lizzon Cupons',
    slug: 'lizzon-cupons',
    description: 'WordPress raffle plugin + React standalone app',
    icon: '🎟️',
    color: '#D97706',
    order: 17
  },
  {
    name: 'UniverSpy',
    slug: 'universpy',
    description: 'Competitive intelligence dashboard — 97 competitors tracking',
    icon: '🕵️',
    color: '#6366F1',
    order: 18
  },
  {
    name: 'UniverRepost',
    slug: 'univerrepost',
    description: 'Cross-posting system — Instagram to YouTube Shorts + TikTok',
    icon: '🔄',
    color: '#EC4899',
    order: 19
  },
  {
    name: 'UniverFinance',
    slug: 'univerfinance',
    description: 'Financial management system — DRE, patrimônio, copiloto financeiro',
    icon: '💵',
    color: '#10B981',
    order: 20
  }
]

async function main() {
  console.log('Seeding projects...')
  
  for (const project of projects) {
    await prisma.project.upsert({
      where: { slug: project.slug },
      update: project,
      create: project
    })
    console.log(`✓ ${project.name}`)
  }
  
  console.log('Seed completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
