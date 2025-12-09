import pg from 'pg';
const { Client } = pg;

const testEmail = 'vonnie@probuildpvc.com.au';
const testPassword = 'password123';

async function testLogin() {
  const client = new Client({
    connectionString: 'postgresql://postgres:MWAiPFRdCaVHzNBlQmitfozpSHELSQvR@hopper.proxy.rlwy.net:22230/railway',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');
    
    // Simulate storage.getUserByEmail
    console.log('🔍 Step 1: getUserByEmail()');
    console.log(`   Looking for: ${testEmail}`);
    const result = await client.query(
      'SELECT * FROM users WHERE email = $1',
      [testEmail]
    );
    
    const user = result.rows[0];
    
    if (!user) {
      console.log('❌ User not found!');
      return;
    }
    
    console.log('✅ User found:', user.email);
    console.log('');
    
    // Step 2: Check isActive
    console.log('🔍 Step 2: Check isActive');
    console.log(`   user.is_active = ${user.is_active} (${typeof user.is_active})`);
    if (!user.is_active) {
      console.log('❌ User is not active!');
      return;
    }
    console.log('✅ User is active');
    console.log('');
    
    // Step 3: Password comparison
    console.log('🔍 Step 3: Password comparison');
    console.log(`   Input password: "${testPassword}" (length: ${testPassword.length})`);
    console.log(`   DB password: "${user.password}" (length: ${user.password.length})`);
    console.log(`   Types: input=${typeof testPassword}, db=${typeof user.password}`);
    console.log(`   Comparison: user.password !== password = ${user.password !== testPassword}`);
    console.log(`   Match: ${user.password === testPassword}`);
    
    if (user.password !== testPassword) {
      console.log('❌ Password mismatch!');
      console.log('');
      console.log('Character comparison:');
      for (let i = 0; i < Math.max(testPassword.length, user.password.length); i++) {
        const inputChar = testPassword[i] || '';
        const dbChar = user.password[i] || '';
        const match = inputChar === dbChar ? '✓' : '✗';
        console.log(`   [${i}] input: '${inputChar}' (${inputChar.charCodeAt(0)}) | db: '${dbChar}' (${dbChar.charCodeAt(0)}) ${match}`);
      }
      return;
    }
    
    console.log('✅ Password matches!');
    console.log('');
    console.log('🎉 Login should succeed!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

testLogin();
