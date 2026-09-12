import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const envContent = fs.readFileSync('.env.local', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...vals] = trimmed.split('=');
    env[key.trim()] = vals.join('=').trim();
  }
});

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Testing Supabase URL:', url);
const supabase = createClient(url, key);

async function run() {
  const tables = ['profiles', 'categories', 'topics', 'comments', 'reports', 'articles', 'resources'];
  for (const table of tables) {
    try {
      const { data, error, count } = await supabase.from(table).select('*', { count: 'exact', head: true });
      if (error) {
        console.log(`❌ Table [${table}]:`, error.message);
      } else {
        console.log(`✅ Table [${table}]: OK (${count} rows)`);
      }
    } catch (e) {
      console.log(`💥 Table [${table}]:`, e.message);
    }
  }
}

run();
