import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import bcrypt from 'bcrypt';
import * as schema from "@shared/schema";

// Use SQLite for development
const sqlite = new Database('callcenter_crm.db');
export const db = drizzle(sqlite, { schema });

// Create tables if they don't exist
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'cc_agent',
    phone TEXT,
    profile_image TEXT,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER DEFAULT (strftime('%s', 'now'))
  );

  CREATE TABLE IF NOT EXISTS call_numbers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phone_number TEXT NOT NULL,
    assigned_agent_id INTEGER NOT NULL,
    category TEXT,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    categorized_at INTEGER,
    FOREIGN KEY (assigned_agent_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT NOT NULL,
    customer_number TEXT NOT NULL,
    biodata TEXT,
    description TEXT,
    agent_id INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    transferred_to INTEGER,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (agent_id) REFERENCES users(id),
    FOREIGN KEY (transferred_to) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    agent_id INTEGER NOT NULL,
    online_calls INTEGER NOT NULL DEFAULT 0,
    offline_calls INTEGER NOT NULL DEFAULT 0,
    total_leads INTEGER NOT NULL DEFAULT 0,
    report_date TEXT NOT NULL,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (agent_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS daily_tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    agent_id INTEGER NOT NULL,
    task_date TEXT NOT NULL,
    leads_added INTEGER NOT NULL DEFAULT 0,
    leads_transferred INTEGER NOT NULL DEFAULT 0,
    report_submitted INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (agent_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    sess TEXT NOT NULL,
    expire INTEGER NOT NULL
  );
`);

// Insert a default admin user if none exists
const existingAdmin = sqlite.prepare('SELECT id FROM users WHERE role = ?').get('super_admin');
if (!existingAdmin) {
  // Use bcrypt to hash the password
  const hashedPassword = bcrypt.hashSync('admin123', 10);
  sqlite.prepare(`
    INSERT INTO users (email, password, name, role) 
    VALUES (?, ?, ?, ?)
  `).run('admin@example.com', hashedPassword, 'Admin User', 'super_admin');
}