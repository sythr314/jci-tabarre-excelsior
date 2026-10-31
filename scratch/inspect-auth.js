const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
});

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

async function inspect() {
  console.log('--- Auth Users ---');
  const { data: users, error: uErr } = await supabase.auth.admin.listUsers();
  if (uErr) console.error('Users error:', uErr);
  else {
    users.users.forEach(u => console.log(`User: ${u.email} | id: ${u.id} | confirmed: ${u.email_confirmed_at}`));
  }

  console.log('--- Admin Users ---');
  const { data: admins, error: aErr } = await supabase.from('admin_users').select('*');
  if (aErr) console.error('Admins error:', aErr);
  else console.log(admins);

  console.log('--- Members ---');
  const { data: members, error: mErr } = await supabase.from('members').select('id, user_id, email, first_name, last_name, status, role');
  if (mErr) console.error('Members error:', mErr);
  else console.log(members);
}

inspect();
