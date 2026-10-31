const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function setPassword() {
  const email = 'kbcsc314@gmail.com';
  const newPassword = '09876543210';

  console.log(`Setting password for ${email}...`);
  const { data: users, error: listErr } = await supabase.auth.admin.listUsers();
  if (listErr) {
    console.error('List users error:', listErr);
    return;
  }

  const user = users.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    console.error(`User with email ${email} not found!`);
    return;
  }

  const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
    password: newPassword,
    email_confirm: true,
  });

  if (error) {
    console.error('Update password error:', error);
    return;
  }

  console.log('Password updated successfully for user ID:', user.id);

  // Now test signing in with this new password using anon key to verify!
  const anonClient = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const { data: signInData, error: signInErr } = await anonClient.auth.signInWithPassword({
    email,
    password: newPassword,
  });

  if (signInErr) {
    console.error('Test sign-in FAILED:', signInErr.message);
  } else {
    console.log('Test sign-in SUCCESS! User authenticated:', signInData.user.email);
  }
}

setPassword();
