import pg from 'pg';
const { Client } = pg;

async function verifyUsers() {
  const client = new Client({
    connectionString: "postgresql://postgres:MWAiPFRdCaVHzNBlQmitfozpSHELSQvR@hopper.proxy.rlwy.net:22230/railway",
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to Railway Postgres\n');
    
    const result = await client.query(`
      SELECT id, email, username, role, is_active 
      FROM users 
      ORDER BY id
    `);
    
    console.log('📊 Current users in database:');
    console.table(result.rows);
    
    console.log('\n🔑 Test these credentials:');
    result.rows.forEach(user => {
      if (user.is_active) {
        console.log(`   Email: ${user.email}`);
        console.log(`   Password: password123`);
        console.log(`   Role: ${user.role}\n`);
      }
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

verifyUsers();
