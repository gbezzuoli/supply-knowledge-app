// Arquivo: src/services/userService.js (VERSÃO ESM)

// 1. Convertendo os 'require' para 'import'
import { db } from './databaseService.js'; // Importação nomeada do nosso DB
import bcrypt from 'bcryptjs';

// 2. Exportando as funções diretamente
export function findUserByUsername(username) {
  const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
  return stmt.get(username);
}

export function addUser(username, password) {
  // Validação básica
  if (!username || !password) {
    throw new Error("Usuário e senha não podem estar em branco.");
  }
  
  const passwordHash = bcrypt.hashSync(password, 10);
  
  // Usamos .run() que lança um erro em caso de falha (ex: UNIQUE constraint)
  const stmt = db.prepare('INSERT INTO users (username, password_hash, is_admin) VALUES (?, ?, ?)');
  stmt.run(username, passwordHash, 0); // 0 para não-admin
}

export function verifyPassword(password, hash) {
  return bcrypt.compareSync(password, hash);
}

