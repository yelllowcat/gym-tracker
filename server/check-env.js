const fs = require('fs');
require('dotenv').config();

console.log('--- System Environment Keys ---');
console.log(Object.keys(process.env).sort());

console.log('\n--- .env File Status ---');
if (fs.existsSync('.env')) {
  const content = fs.readFileSync('.env', 'utf8');
  console.log('File exists, size:', fs.statSync('.env').size);
  console.log('Keys in .env file:', content.split('\n').map(l => l.split('=')[0].trim()).filter(Boolean));
} else {
  console.log('File does not exist');
}

if (process.env.DATABASE_URL) {
  console.log('\n✅ DATABASE_URL detected.');
} else {
  console.log('\n❌ DATABASE_URL NOT detected.');
}
