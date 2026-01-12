require('dotenv').config();
const mongoose = require('mongoose');

const testConnection = async () => {
  try {
    console.log('\n🔍 Testing MongoDB Connection...\n');
    console.log('URI:', process.env.MONGODB_URI.replace(/:[^:@]+@/, ':****@'));
    console.log('\nConnecting...\n');
    
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('✅ SUCCESS! MongoDB Connected!');
    console.log('📊 Database:', mongoose.connection.name);
    console.log('🌐 Host:', mongoose.connection.host);
    console.log('📌 Port:', mongoose.connection.port || 'SRV');
    console.log('\n✨ Your backend can now connect to MongoDB!\n');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ CONNECTION FAILED!\n');
    console.error('Error Message:', error.message);
    console.error('\n🔧 Possible Solutions:');
    console.error('1. Check username and password in MongoDB Atlas');
    console.error('2. Verify user has "Read and write" permissions');
    console.error('3. Ensure IP address is whitelisted (0.0.0.0/0)');
    console.error('4. URL-encode special characters in password');
    console.error('5. Check MongoDB Atlas cluster is running');
    console.error('\n📖 See MONGODB_TROUBLESHOOTING.md for detailed help\n');
    process.exit(1);
  }
};

testConnection();
