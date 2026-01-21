const fs = require('fs');
const path = require('path');
require('dotenv').config();

console.log('--- Environment Debug ---');
console.log('Current Directory:', process.cwd());
console.log('Files in current dir:', fs.readdirSync('.'));

const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const stats = fs.statSync(envPath);
  console.log('✅ .env file exists');
  console.log('   Size:', stats.size, 'bytes');
  if (stats.size > 0) {
    // Check if it has the key without printing the value
    const content = fs.readFileSync(envPath, 'utf8');
    console.log('   Contains DATABASE_URL:', content.includes('DATABASE_URL'));
    console.log('   Line count:', content.split('\n').length);
  } else {
    console.log('   ⚠️ .env file is EMPTY');
  }
} else {
  console.log('❌ .env file does NOT exist in', process.cwd());
}

console.log('\n--- process.env keys ---');
console.log(Object.keys(process.env).filter(k => !k.includes('SECRET') && !k.includes('PASSWORD') && !k.includes('KEY')));

if (process.env.DATABASE_URL) {
  console.log('\n✅ DATABASE_URL is available in process.env');
} else {
  console.log('\n❌ DATABASE_URL is NOT available in process.env');
}
console.log('------------------------');
