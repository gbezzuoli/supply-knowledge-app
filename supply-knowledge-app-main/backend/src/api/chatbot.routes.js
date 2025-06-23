// Arquivo: src/api/chatbot.routes.js (VERSÃO ATUALIZADA PARA IMAGENS)

import express from 'express';
import multer from 'multer';
import { authenticateToken } from '../middleware/auth.middleware.js';
import * as chatService from '../services/chatService.js'; // Vamos criar este serviço

const router = express.Router();

// Configuração do Multer para armazenar o arquivo em memória
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Rota principal do chatbot, agora aceitando um campo 'image' opcional
router.post(
  '/ask', 
  [authenticateToken], 
  upload.single('image'), // <-- Processa o upload do campo 'image'
  async (req, res) => {
    try {
      // O texto da pergunta e o histórico virão do corpo do formulário
      const { query, history } = req.body;
      // O buffer da imagem (se existir) virá do req.file
      const imageBuffer = req.file ? req.file.buffer : null;

      if (!query) {
        return res.status(400).json({ message: 'A query (pergunta) é obrigatória.' });
      }

      // Parse do histórico, que virá como uma string JSON
      const parsedHistory = history ? JSON.parse(history) : [];

      // Chamamos um novo serviço de chat que conterá nossa lógica principal
      const response = await chatService.getChatbotResponse({
        query,
        history: parsedHistory,
        imageBuffer
      });

      res.status(200).json({ answer: response });

    } catch (error) {
      console.error('Erro no endpoint do chatbot:', error);
      res.status(500).json({ message: 'Ocorreu um erro ao processar sua pergunta.' });
    }
});

export default router;