const { execSync } = require('child_process');

try {
  console.log('Pushing to origin...');
  execSync('git push origin main', { stdio: 'inherit', timeout: 90000 });
  console.log('Pushing to other...');
  execSync('git push other main', { stdio: 'inherit', timeout: 90000 });
  console.log('PUSH COMPLETE!');
} catch (e) {
  console.error('Push error:', e.message);
}
