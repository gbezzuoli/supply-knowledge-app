// Arquivo: src/services/databaseService.js (VERSÃO ESM COMPLETA)
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, '..', '..', 'users.db');
export const db = new Database(dbPath);

export function setupDatabase() {
  db.exec(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, is_admin BOOLEAN NOT NULL DEFAULT 0)`);
  db.exec(`CREATE TABLE IF NOT EXISTS permissions (user_id INTEGER, permission TEXT, PRIMARY KEY(user_id, permission), FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE)`);
  const adminUser = db.prepare('SELECT id FROM users WHERE username = ?').get('FABIO');
  if (!adminUser) {
    const passwordHash = bcrypt.hashSync('softland', 10);
    db.prepare('INSERT INTO users (username, password_hash, is_admin) VALUES (?, ?, ?)').run('FABIO', passwordHash, 1);
  } else {
    db.prepare('UPDATE users SET is_admin = 1 WHERE username = ?').run('FABIO');
  }
}