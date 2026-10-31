const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function listTables() {
  const common = [
    'members', 'admin_users', 'activities', 'attendances', 'dues',
    'member_roles', 'projects', 'project_members', 'member_invitations',
    'audit_logs', 'member_applications', 'tasks'
  ];

  for (const t of common) {
    const { error } = await supabase.from(t).select('id').limit(1);
    console.log(t, error ? `ERROR: ${error.message}` : 'OK');
  }
}

listTables();
