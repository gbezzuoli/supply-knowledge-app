// Arquivo: src/api/auth.routes.js (VERSÃO COMPLETA E CORRETA)

import express from 'express';
import jwt from 'jsonwebtoken';
import * as userService from '../services/userService.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// --- ROTA DE LOGIN ---
// POST /api/auth/login
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Usuário e senha são obrigatórios.' });
  }

  try {
    const user = userService.findUserByUsername(username);
    if (!user) {
      return res.status(401).json({ message: 'Usuário ou senha inválidos.' });
    }

    const isPasswordValid = userService.verifyPassword(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Usuário ou senha inválidos.' });
    }

    const payload = {
      id: user.id,
      username: user.username,
      isAdmin: Boolean(user.is_admin),
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });

    res.status(200).json({
      message: 'Login bem-sucedido!',
      token: token,
      user: payload,
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ message: 'Erro interno no servidor.' });
  }
});


// --- ROTA DE CADASTRO ---
// POST /api/auth/register
router.post('/register', (req, res) => {
  const { username, password } = req.body;

  try {
    // A função addUser que acabamos de criar no userService
    userService.addUser(username, password);
    res.status(201).json({ message: 'Usuário criado com sucesso!' });
  } catch (error) {
    // Se o erro for de violação de chave única (usuário já existe)
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ message: 'Este nome de usuário já existe.' });
    }
    // Outros erros (como campos em branco, que já são tratados no serviço)
    console.error('Erro no registro:', error);
    res.status(500).json({ message: error.message || 'Erro interno no servidor.' });
  }
});


// --- ROTA DE PERFIL (EXEMPLO DE ROTA PROTEGIDA) ---
// GET /api/auth/profile
router.get('/profile', authenticateToken, (req, res) => {
  // Graças ao middleware, agora temos acesso a req.user
  res.json({
    message: 'Você acessou uma rota protegida!',
    userProfile: req.user
  });
});


export default router;