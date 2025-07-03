import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import bcrypt from 'bcrypt';
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });

// Initialize database with admin user
async function initializeDatabase() {
  try {
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
    }
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

// Call initialization
initializeDatabase();