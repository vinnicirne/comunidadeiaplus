import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const title = searchParams.get('title') || 'Comunidade IA PLUS'
    const subtitle = searchParams.get('subtitle') || 'Converse sobre Inteligência Artificial, Modelos e Ferramentas'
    const category = searchParams.get('category') || 'Comunidade'
    const type = searchParams.get('type') || 'Discussão'

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '60px 80px',
            backgroundColor: '#0c1322',
            backgroundImage: 'radial-gradient(circle at 25px 25px, #1c273e 2%, transparent 0%), radial-gradient(circle at 75px 75px, #141e33 2%, transparent 0%)',
            backgroundSize: '100px 100px',
            fontFamily: 'sans-serif',
            color: '#ffffff',
          }}
        >
          {/* Top Brand Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '14px',
                  backgroundColor: '#6366f1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '26px',
                  fontWeight: 'bold',
                  color: '#ffffff',
                  boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)',
                }}
              >
                &lt;/&gt;
              </div>
              <span style={{ fontSize: '28px', fontWeight: 'bold', letterSpacing: '-0.5px' }}>
                Comunidade IA PLUS
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 22px',
                borderRadius: '999px',
                backgroundColor: 'rgba(99, 102, 241, 0.15)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                color: '#a5b4fc',
                fontSize: '18px',
                fontWeight: 600,
              }}
            >
              {category}
            </div>
          </div>

          {/* Title and Subtitle */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div
              style={{
                fontSize: title.length > 60 ? '42px' : '52px',
                fontWeight: 800,
                lineHeight: 1.2,
                color: '#f8f9ff',
                letterSpacing: '-1px',
              }}
            >
              {title}
            </div>
            {subtitle && (
              <div
                style={{
                  fontSize: '24px',
                  color: '#94a3b8',
                  lineHeight: 1.4,
                  maxWidth: '900px',
                }}
              >
                {subtitle.slice(0, 140)}
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTop: '1px solid rgba(148, 163, 184, 0.2)',
              paddingTop: '24px',
              color: '#94a3b8',
              fontSize: '18px',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {type === 'artigo' ? '📰 Artigo Técnico' : '💬 Fórum de Discussão'}
            </span>
            <span style={{ color: '#818cf8', fontWeight: 600 }}>
              comunidadeiaplus.com.br
            </span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (e: any) {
    return new Response(`Failed to generate the image`, {
      status: 500,
    })
  }
}
