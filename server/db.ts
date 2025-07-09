import dotenv from 'dotenv';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import bcrypt from 'bcrypt';
import * as schema from "@shared/schema";

// Load environment variables
dotenv.config();

// Configure Neon with WebSocket
neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 10
});
export const db = drizzle({ client: pool, schema });

// Initialize database with admin user
async function initializeDatabase() {
  let retries = 3;
  
  while (retries > 0) {
    try {
      // Test database connection first
      await pool.query('SELECT 1');
      console.log('Database connection established');
      
      // Check if admin user exists
      const existingAdmin = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.role, 'super_admin')
      });
      
      if (!existingAdmin) {
        // Create default admin user
        const hashedPassword = bcrypt.hashSync('admin123', 10);
        await db.insert(schema.users).values({
          email: 'admin@example.com',
          password: hashedPassword,
          name: 'Admin User',
          role: 'super_admin'
        });
        console.log('Default admin user created');
      } else {
        console.log('Admin user already exists');
      }
      
      return; // Success, exit function
    } catch (error) {
      retries--;
      console.error(`Database initialization error (${3 - retries}/3):`, error);
      
      if (retries > 0) {
        console.log(`Retrying in 2 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      } else {
        console.error('Failed to initialize database after 3 attempts');
        // Don't throw error to prevent server crash
      }
    }
  }
}

// Call initialization with a delay to allow server to start
setTimeout(() => {
  initializeDatabase();
}, 1000);