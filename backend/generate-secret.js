// Helper script to generate a secure JWT_SECRET
import crypto from 'crypto';

const secret = crypto.randomBytes(32).toString('hex');
console.log('\n✅ Generated JWT_SECRET:');
console.log(secret);
console.log('\nAdd this to your .env file:');
console.log(`JWT_SECRET=${secret}\n`);


