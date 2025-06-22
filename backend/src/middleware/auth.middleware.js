// Arquivo: src/middleware/auth.middleware.js (VERSÃO ESM)

import jwt from 'jsonwebtoken';

// MUDANÇA: 'function authenticateToken...' vira 'export function authenticateToken...'
// Estamos exportando a função diretamente na sua declaração.
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    return res.status(401).json({ message: 'Acesso negado. Nenhum token fornecido.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido ou expirado.' });
    }
    req.user = user;
    next();
  });
}

// Fazemos o mesmo para a função isAdmin
export function isAdmin(req, res, next) {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(403).json({ message: 'Acesso negado. Requer privilégios de administrador.' });
    }
}