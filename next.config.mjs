/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/admin',
        permanent: true,
      },
      {
        source: '/dashboard/usuarios',
        destination: '/admin/usuarios',
        permanent: true,
      },
      {
        source: '/dashboard/topicos',
        destination: '/admin/topicos',
        permanent: true,
      },
      {
        source: '/dashboard/comentarios',
        destination: '/admin/comentarios',
        permanent: true,
      },
      {
        source: '/dashboard/denuncias',
        destination: '/admin/denuncias',
        permanent: true,
      },
      {
        source: '/dashboard/categorias',
        destination: '/admin/categorias',
        permanent: true,
      },
    ]
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL:
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.SUPABASE_URL ||
      '',
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      '',
  },
}

export default nextConfig
