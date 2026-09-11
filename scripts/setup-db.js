// Script para executar o schema completo via Supabase Management API
const fs = require('fs')
const path = require('path')

const PROJECT_REF = 'gzgaweopkavrorwrusgu'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6Z2F3ZW9wa2F2cm9yd3J1c2d1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTEzOTEzMywiZXhwIjoyMTA0NzE1MTMzfQ.2nw93J_bq65CaCinIrS8iLDQvn1uuzvpqwEPAX6T7cg'
const SUPABASE_URL = `https://${PROJECT_REF}.supabase.co`

async function runSQL(sql) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'apikey': SERVICE_ROLE_KEY,
    },
    body: JSON.stringify({ sql }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`HTTP ${response.status}: ${text}`)
  }

  return await response.json()
}

// SQL direto de criação das tabelas principais (sem depender de exec_sql)
async function createTablesViaRPC() {
  const SUPABASE_URL_DB = `https://${PROJECT_REF}.supabase.co`
  
  // Tentativa via endpoint de query direto do Supabase (apenas para service_role)
  const sqlStatements = [
    // Profiles
    `CREATE TABLE IF NOT EXISTS public.profiles (
      id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      username TEXT UNIQUE NOT NULL,
      full_name TEXT,
      avatar_url TEXT,
      bio TEXT,
      role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin')),
      is_blocked BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`,
    // Categories
    `CREATE TABLE IF NOT EXISTS public.categories (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      icon TEXT,
      is_active BOOLEAN NOT NULL DEFAULT true,
      display_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`,
    // Topics
    `CREATE TABLE IF NOT EXISTS public.topics (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
      category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      content TEXT NOT NULL,
      is_published BOOLEAN NOT NULL DEFAULT true,
      views_count INT NOT NULL DEFAULT 0,
      likes_count INT NOT NULL DEFAULT 0,
      comments_count INT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`,
    // Comments
    `CREATE TABLE IF NOT EXISTS public.comments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
      author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
      parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      is_deleted BOOLEAN NOT NULL DEFAULT false,
      likes_count INT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`,
    // Likes
    `CREATE TABLE IF NOT EXISTS public.likes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
      topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE,
      comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`,
    // Reports
    `CREATE TABLE IF NOT EXISTS public.reports (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
      topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE,
      comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
      reason TEXT NOT NULL CHECK (reason IN ('spam', 'ofensivo', 'propaganda', 'conteudo_inadequado', 'outro')),
      details TEXT,
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'ignored')),
      action_taken TEXT CHECK (action_taken IN ('ignored', 'content_deleted', 'user_blocked')),
      reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      resolved_at TIMESTAMPTZ
    )`,
  ]

  for (const sql of sqlStatements) {
    const tableName = sql.match(/TABLE IF NOT EXISTS public\.(\w+)/)?.[1] || 'unknown'
    process.stdout.write(`  Criando tabela: ${tableName.padEnd(15)}`)
    
    const res = await fetch(`${SUPABASE_URL_DB}/rest/v1/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'apikey': SERVICE_ROLE_KEY,
        'X-Client-Info': 'supabase-js/2.0',
      },
      body: sql,
    })
    
    // Tenta via pg endpoint
    console.log('→ iniciando via pg...')
  }
}

async function main() {
  console.log('\n══════════════════════════════════════════════════')
  console.log('   COMUNIDADE IAPLUS — Setup Automático do Banco')
  console.log('══════════════════════════════════════════════════\n')

  // Tenta via Management API (requer personal access token, não service_role)
  // Como não temos o PAT, vamos guiar o usuário

  const schemaPath = path.join(__dirname, '..', 'supabase', 'schema.sql')
  const schema = fs.readFileSync(schemaPath, 'utf-8')

  console.log('📌 Para completar o setup, acesse o Supabase SQL Editor:')
  console.log('')
  console.log(`   🔗 https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new`)
  console.log('')
  console.log('   1. Clique no link acima')
  console.log('   2. Cole o conteúdo do arquivo: supabase/schema.sql')
  console.log('   3. Clique em "Run" (ou Ctrl+Enter)')
  console.log('')
  console.log('   O schema está em: z:\\Comunidade IAPLUS\\supabase\\schema.sql')
  console.log('')
  console.log('   Após executar, rode novamente: node scripts/check-db.js')
  console.log('')
  console.log('══════════════════════════════════════════════════\n')

  // Copia o SQL para a área de transferência se possível
  const { execSync } = require('child_process')
  try {
    execSync(`echo ${JSON.stringify(schema.slice(0, 100))} | clip`, { shell: 'cmd' })
  } catch (e) {
    // ignora erro de clipboard
  }
}

main().catch(err => {
  console.error('\n❌ Erro:', err.message)
})
