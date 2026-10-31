const fs = require('fs');
const { execSync } = require('child_process');

if (fs.existsSync('.git/index.lock')) {
  try { fs.unlinkSync('.git/index.lock'); console.log('Removed stale index.lock'); } catch (e) {}
}

function run(cmd) {
  console.log(`> ${cmd}`);
  const out = execSync(cmd, { encoding: 'utf8', env: process.env });
  console.log(out);
  return out;
}

try {
  run('git add -A');
  run('git commit -m "fix(netlify,auth): configure https://jci-excelsior.netlify.app in netlify.toml, remove conflicting middleware.ts, and use session client in member space"');
  console.log('Pushing to origin...');
  run('git push origin main');
  console.log('Pushing to other...');
  run('git push other main');
  console.log('ALL DONE SUCCESSFULLY');
} catch (err) {
  console.error('CMD FAILED:', err.message);
  if (err.stdout) console.log('STDOUT:', err.stdout.toString());
  if (err.stderr) console.error('STDERR:', err.stderr.toString());
}
