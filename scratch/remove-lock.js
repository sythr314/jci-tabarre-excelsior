const fs = require('fs');
if (fs.existsSync('.git/index.lock')) {
  fs.unlinkSync('.git/index.lock');
  console.log('index.lock removed');
} else {
  console.log('No index.lock found');
}
