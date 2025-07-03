const { Pool } = require('@neondatabase/serverless');
const bcrypt = require('bcrypt');
const ws = require('ws');

// Configure neon
const neonConfig = require('@neondatabase/serverless').neonConfig;
neonConfig.webSocketConstructor = ws;

async function createSuperAdmin() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    // Check if super admin already exists
    const existingAdmin = await pool.query("SELECT * FROM users WHERE email = 'sohaghasunbd@gmail.com'");
    
    if (existingAdmin.rows.length > 0) {
      console.log('Super admin already exists');
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash('sohagq301', 10);
    
    // Insert super admin
    await pool.query(`
      INSERT INTO users (email, password, name, role, phone, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
    `, [
      'sohaghasunbd@gmail.com',
      hashedPassword,
      'Super Administrator',
      'super_admin',
      '+1-555-0100'
    ]);
    
    console.log('Super admin created successfully');
  } catch (error) {
    console.error('Error creating super admin:', error);
  } finally {
    await pool.end();
  }
}

createSuperAdmin();
