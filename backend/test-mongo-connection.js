// Quick test script to verify MongoDB connection
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGODB_URI;

console.log('Testing MongoDB connection...');
console.log('URI (without password):', uri?.replace(/:[^:@]+@/, ':****@'));

mongoose.connect(uri)
  .then(() => {
    console.log('✅ Connection successful!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Connection failed:', err.message);
    console.log('\nTroubleshooting:');
    console.log('1. Verify MONGODB_URI is set correctly in your .env file');
    console.log('2. Check MongoDB Atlas Network Access (IP whitelist)');
    console.log('3. Ensure database user was created with correct permissions');
    process.exit(1);
  });

