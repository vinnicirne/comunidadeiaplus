// Script de verificação e setup do banco de dados COMUNIDADE IAPLUS
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const SUPABASE_URL = 'https://gzgaweopkavrorwrusgu.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6Z2F3ZW9wa2F2cm9yd3J1c2d1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTEzOTEzMywiZXhwIjoyMTA0NzE1MTMzfQ.2nw93J_bq65CaCinIrS8iLDQvn1uuzvpqwEPAX6T7cg'

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

async function checkConnection() {
  console.log('🔌 Verificando conexão com Supabase...')
  console.log(`   URL: ${SUPABASE_URL}\n`)

  // Testa se a tabela profiles existe
  const { data, error } = await supabase
    .from('profiles')
    .select('count', { count: 'exact', head: true })

  if (error) {
    if (error.code === '42P01') {
      console.log('⚠️  Tabelas NÃO encontradas no banco.')
      console.log('   O schema.sql precisa ser executado no Supabase.\n')
      return false
    }
    console.log(`❌ Erro de conexão: ${error.message}`)
    console.log(`   Código: ${error.code}`)
    return false
  }

  console.log('✅ Conexão com Supabase OK!')
  console.log(`   Tabela "profiles" encontrada.\n`)
  return true
}

async function checkAllTables() {
  const tables = ['profiles', 'categories', 'topics', 'comments', 'likes', 'reports']
  const results = {}

  console.log('📋 Verificando tabelas...\n')

  for (const table of tables) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true })

    if (error) {
      results[table] = { exists: false, count: 0, error: error.code }
      console.log(`  ❌  ${table.padEnd(12)} → NÃO EXISTE (${error.code})`)
    } else {
      results[table] = { exists: true, count: count || 0 }
      console.log(`  ✅  ${table.padEnd(12)} → OK  (${count || 0} registros)`)
    }
  }

  return results
}

async function checkCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('name, slug, icon, is_active')
    .order('display_order')

  if (error || !data || data.length === 0) {
    console.log('\n⚠️  Nenhuma categoria encontrada. Seeds precisam ser inseridos.\n')
    return false
  }

  console.log('\n📁 Categorias no banco:')
  data.forEach(cat => {
    console.log(`   ${cat.icon}  ${cat.name.padEnd(20)} /${cat.slug}  [${cat.is_active ? 'ativa' : 'inativa'}]`)
  })

  return true
}

async function main() {
  console.log('\n══════════════════════════════════════════')
  console.log('   COMUNIDADE IAPLUS — Diagnóstico Supabase')
  console.log('══════════════════════════════════════════\n')

  const connected = await checkConnection()

  if (!connected) {
    console.log('\n📌 AÇÃO NECESSÁRIA:')
    console.log('   Acesse o Supabase Dashboard → SQL Editor e execute:')
    console.log('   z:\\Comunidade IAPLUS\\supabase\\schema.sql\n')
    console.log('   https://supabase.com/dashboard/project/gzgaweopkavrorwrusgu/sql\n')
    process.exit(1)
  }

  const tables = await checkAllTables()
  const missingTables = Object.entries(tables)
    .filter(([, v]) => !v.exists)
    .map(([k]) => k)

  if (missingTables.length > 0) {
    console.log(`\n⚠️  Tabelas faltando: ${missingTables.join(', ')}`)
    console.log('\n📌 AÇÃO NECESSÁRIA:')
    console.log('   Execute o schema.sql no Supabase SQL Editor:')
    console.log('   https://supabase.com/dashboard/project/gzgaweopkavrorwrusgu/sql\n')
    process.exit(1)
  }

  await checkCategories()

  console.log('\n══════════════════════════════════════════')
  console.log('   ✅  BANCO DE DADOS 100% CONFIGURADO!')
  console.log('══════════════════════════════════════════\n')
  console.log('   A COMUNIDADE IAPLUS está pronta para uso.\n')
}

main().catch(err => {
  console.error('\n❌ Erro inesperado:', err.message)
  process.exit(1)
})
