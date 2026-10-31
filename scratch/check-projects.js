const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data: p, error: pErr } = await supabase.from('projects').select('*').limit(1);
  console.log('projects:', pErr ? pErr.message : 'EXISTS', p);
  const { data: pm, error: pmErr } = await supabase.from('project_members').select('*').limit(1);
  console.log('project_members:', pmErr ? pmErr.message : 'EXISTS', pm);
}
check();
