import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://comunidadeiaplus.com.br')
  ),
  title: {
    default: 'Comunidade IA PLUS - Converse sobre Inteligência Artificial',
    template: '%s | Comunidade IA PLUS',
  },
  description: 'Comunidade aberta para engenheiros, criadores e pesquisadores conversarem sobre Inteligência Artificial.',
  icons: {
    icon: '/logo.svg',
  },
  openGraph: {
    title: 'Comunidade IA PLUS - Inteligência Artificial & Engenharia de Prompts',
    description: 'Comunidade aberta para engenheiros, criadores e pesquisadores conversarem sobre Inteligência Artificial.',
    siteName: 'Comunidade IA PLUS',
    locale: 'pt_BR',
    type: 'website',
    images: [
      {
        url: '/api/og?title=Comunidade%20IA%20PLUS&subtitle=O%20ponto%20de%20encontro%20de%20criadores%20e%20pesquisadores%20de%20IA',
        width: 1200,
        height: 630,
        alt: 'Comunidade IA PLUS',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Comunidade IA PLUS - Inteligência Artificial & Engenharia de Prompts',
    description: 'Comunidade aberta para engenheiros, criadores e pesquisadores conversarem sobre Inteligência Artificial.',
    images: ['/api/og?title=Comunidade%20IA%20PLUS&subtitle=O%20ponto%20de%20encontro%20de%20criadores%20e%20pesquisadores%20de%20IA'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('theme');
                  if (saved === 'dark') {
                    document.documentElement.classList.add('dark');
                    document.documentElement.classList.remove('light');
                  } else if (saved === 'light') {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.classList.add('light');
                  } else {
                    // Default para o layout claro original do mockup
                    document.documentElement.classList.remove('dark');
                    document.documentElement.classList.add('light');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="bg-surface font-body-md text-body-md text-on-surface antialiased min-h-screen">
        {children}
      </body>
    </html>
  )
}
