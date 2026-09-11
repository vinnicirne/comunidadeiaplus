// Script para inserir as categorias iniciais do PRD na COMUNIDADE IAPLUS
const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = 'https://gzgaweopkavrorwrusgu.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6Z2F3ZW9wa2F2cm9yd3J1c2d1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTEzOTEzMywiZXhwIjoyMTA0NzE1MTMzfQ.2nw93J_bq65CaCinIrS8iLDQvn1uuzvpqwEPAX6T7cg'

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

const CATEGORIES = [
  {
    name: 'IA Geral',
    slug: 'ia-geral',
    description: 'Discussões gerais, novidades e debates sobre Inteligência Artificial.',
    icon: '🤖',
    is_active: true,
    display_order: 1,
  },
  {
    name: 'Programação',
    slug: 'programacao',
    description: 'Vibe Coding, desenvolvimento de software, criação de apps e agentes com IA.',
    icon: '💻',
    is_active: true,
    display_order: 2,
  },
  {
    name: 'Imagens e Vídeos',
    slug: 'imagens-e-videos',
    description: 'Geração de arte, renderização de vídeos, modelos visuais e prompts criativos.',
    icon: '🎨',
    is_active: true,
    display_order: 3,
  },
  {
    name: 'Negócios',
    slug: 'negocios',
    description: 'Automação comercial, monetização, marketing, produtividade e SaaS com IA.',
    icon: '💼',
    is_active: true,
    display_order: 4,
  },
]

async function seedCategories() {
  console.log('\n══════════════════════════════════════════')
  console.log('   COMUNIDADE IAPLUS — Seed de Categorias')
  console.log('══════════════════════════════════════════\n')

  // Verifica se já existem
  const { data: existing } = await supabase
    .from('categories')
    .select('slug')

  const existingSlugs = new Set((existing || []).map(c => c.slug))

  const toInsert = CATEGORIES.filter(c => !existingSlugs.has(c.slug))

  if (toInsert.length === 0) {
    console.log('✅ Todas as categorias já existem no banco. Nada a fazer.\n')
    
    const { data } = await supabase.from('categories').select('*').order('display_order')
    console.log('📁 Categorias atuais:')
    data.forEach(cat => {
      console.log(`   ${cat.icon}  ${cat.name.padEnd(20)} /${cat.slug}  [${cat.is_active ? 'ativa' : 'inativa'}]`)
    })
    return
  }

  console.log(`📦 Inserindo ${toInsert.length} categoria(s)...\n`)

  const { data, error } = await supabase
    .from('categories')
    .insert(toInsert)
    .select()

  if (error) {
    console.error('❌ Erro ao inserir categorias:', error.message)
    process.exit(1)
  }

  data.forEach(cat => {
    console.log(`  ✅  ${cat.icon}  ${cat.name.padEnd(20)} → inserida com ID: ${cat.id}`)
  })

  console.log('\n══════════════════════════════════════════')
  console.log('   ✅  CATEGORIAS INSERIDAS COM SUCESSO!')
  console.log('══════════════════════════════════════════\n')
  console.log('   A comunidade já está pronta para receber tópicos!\n')
}

seedCategories().catch(err => {
  console.error('\n❌ Erro inesperado:', err.message)
  process.exit(1)
})
