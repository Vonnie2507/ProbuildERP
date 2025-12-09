// CORRECTED seed script for Railway Postgres - uses proper snake_case columns
import pg from 'pg';
const { Client } = pg;

const users = [
  {
    username: "vonnie",
    password: "password123",
    email: "vonnie@probuildpvc.com.au",
    first_name: "Vonnie",
    last_name: "Bradley",
    phone: "0412 345 678",
    role: "admin",
    is_active: true
  },
  {
    username: "dave",
    password: "password123",
    email: "dave@probuildpvc.com.au",
    first_name: "Dave",
    last_name: "Smith",
    phone: "0423 456 789",
    role: "sales",
    is_active: true
  },
  {
    username: "craig",
    password: "password123",
    email: "craig@probuildpvc.com.au",
    first_name: "Craig",
    last_name: "Johnson",
    phone: "0434 567 890",
    role: "scheduler",
    is_active: true
  }
];

async function seed() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Clear existing users
    await client.query('DELETE FROM users');
    console.log('🧹 Cleared existing users');

    // Insert users with CORRECT snake_case column names
    for (const user of users) {
      await client.query(
        `INSERT INTO users (username, password, email, first_name, last_name, phone, role, is_active) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [user.username, user.password, user.email, user.first_name, user.last_name, user.phone, user.role, user.is_active]
      );
      console.log(`✅ Created user: ${user.email}`);
    }

    console.log('\n🎉 Seed complete!');
    console.log('\nYou can now login with:');
    console.log('  Email: vonnie@probuildpvc.com.au');
    console.log('  Password: password123');
    console.log('\nOther test users:');
    console.log('  dave@probuildpvc.com.au / password123 (sales)');
    console.log('  craig@probuildpvc.com.au / password123 (scheduler)');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code) console.error('Error code:', error.code);
    throw error;
  } finally {
    await client.end();
  }
}

seed().catch(console.error);
