const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function inspectSchema() {
  const tableList = ['members', 'admin_users', 'activities', 'activity_attendees', 'tasks', 'audit_logs', 'roles'];
  for (const t of tableList) {
    const { data, error } = await supabase.from(t).select('*').limit(1);
    if (error) {
      console.log(`Table [${t}]: NOT FOUND or Error: ${error.message}`);
    } else {
      console.log(`Table [${t}]: EXISTS. Sample keys:`, data[0] ? Object.keys(data[0]) : '(empty table)');
    }
  }
}

inspectSchema();
