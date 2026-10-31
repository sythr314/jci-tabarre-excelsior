const fs = require('fs');
const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
});

async function trySql() {
  const endpoints = [
    '/pg/query',
    '/database/query',
    '/sql',
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}${ep}`, {
        method: 'POST',
        headers: {
          'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: 'SELECT 1;' })
      });
      console.log(ep, res.status);
    } catch (e) {
      console.log(ep, 'Error:', e.message);
    }
  }
}

trySql();
