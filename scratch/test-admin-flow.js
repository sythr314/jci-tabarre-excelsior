const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
});

async function testAdminFlow() {
  const email = 'kbcsc314@gmail.com';
  const password = '09876543210';
  const anonClient = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  const { data: authData, error: authErr } = await anonClient.auth.signInWithPassword({ email, password });
  if (authErr) {
    console.error('Sign in failed:', authErr);
    return;
  }
  console.log('Auth success. User ID:', authData.user.id);

  // Query admin_users with user's session
  const { data: adminCheck, error: adminErr } = await anonClient
    .from('admin_users')
    .select('role, is_active')
    .eq('email', email)
    .single();

  if (adminErr) {
    console.error('adminCheck FAILED:', adminErr);
  } else {
    console.log('adminCheck SUCCESS:', adminCheck);
  }

  // Also query members with user's session
  const { data: memberCheck, error: memberErr } = await anonClient
    .from('members')
    .select('id, first_name, last_name, status')
    .eq('user_id', authData.user.id)
    .single();

  if (memberErr) {
    console.error('memberCheck FAILED:', memberErr);
  } else {
    console.log('memberCheck SUCCESS:', memberCheck);
  }
}

testAdminFlow();
