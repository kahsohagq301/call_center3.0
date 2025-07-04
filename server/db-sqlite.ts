import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from "@shared/schema";

const sqlite = new Database('callcenter_crm.db');
export const db = drizzle(sqlite, { schema });