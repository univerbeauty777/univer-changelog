import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'UniverChangelog — Sistema de Changelog Integrado',
  description: 'Gerenciamento centralizado de changelog para todo o stack UniverBeauty',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
