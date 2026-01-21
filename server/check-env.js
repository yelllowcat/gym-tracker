console.log('--- Environment Check ---');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Available keys:', Object.keys(process.env).filter(k => !k.includes('SECRET') && !k.includes('PASSWORD') && !k.includes('KEY')));
if (process.env.DATABASE_URL) {
  console.log('✅ DATABASE_URL is set (length: ' + process.env.DATABASE_URL.length + ')');
} else {
  console.log('❌ DATABASE_URL is NOT set');
}
console.log('------------------------');
