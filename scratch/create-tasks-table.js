const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function testSql() {
  const sql = `
    CREATE TABLE IF NOT EXISTS tasks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      description TEXT,
      activity_id UUID REFERENCES activities(id) ON DELETE SET NULL,
      commission TEXT,
      assigned_to UUID REFERENCES members(id) ON DELETE SET NULL,
      assigned_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
      priority TEXT NOT NULL DEFAULT 'normale' CHECK (priority IN ('basse','normale','haute','urgente')),
      status TEXT NOT NULL DEFAULT 'a_faire' CHECK (status IN ('a_faire','en_cours','termine','valide')),
      due_date DATE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
  `;

  // Check if we can use rpc
  const { data, error } = await supabase.rpc('exec_sql', { sql });
  if (error) {
    console.log('rpc exec_sql error:', error.message);
  } else {
    console.log('rpc exec_sql success:', data);
  }
}

testSql();
