// Quick seed script for Railway Postgres using standard pg driver
import pg from 'pg';
const { Client } = pg;

const users = [
  {
    username: "vonnie",
    password: "password123",
    email: "vonnie@probuildpvc.com.au",
    firstName: "Vonnie",
    lastName: "Bradley",
    phone: "0412 345 678",
    role: "admin",
    isActive: true
  },
  {
    username: "dave",
    password: "password123",
    email: "dave@probuildpvc.com.au",
    firstName: "Dave",
    lastName: "Smith",
    phone: "0423 456 789",
    role: "sales",
    isActive: true
  },
  {
    username: "craig",
    password: "password123",
    email: "craig@probuildpvc.com.au",
    firstName: "Craig",
    lastName: "Johnson",
    phone: "0434 567 890",
    role: "scheduler",
    isActive: true
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

    // Insert users
    for (const user of users) {
      await client.query(
        `INSERT INTO users (username, password, email, "firstName", "lastName", phone, role, "isActive") 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [user.username, user.password, user.email, user.firstName, user.lastName, user.phone, user.role, user.isActive]
      );
      console.log(`✅ Created user: ${user.email}`);
    }

    console.log('\n🎉 Seeding complete!');
    console.log('\nYou can now login with:');
    console.log('  Email: vonnie@probuildpvc.com.au');
    console.log('  Password: password123');

  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

seed().catch(console.error);
