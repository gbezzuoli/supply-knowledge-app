// Arquivo: src/server.js (VERSÃO ESM COMPLETA)
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { setupDatabase } from './services/databaseService.js';
import authRoutes from './api/auth.routes.js';
import chatbotRoutes from './api/chatbot.routes.js';
import dataRoutes from './api/data.routes.js';

const app = express();
const PORT = process.env.PORT || 3001;
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/api/auth', authRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/data', dataRoutes);
app.get('/', (req, res) => { res.send('<h1>Servidor do CHATBOT-Guilherme está no ar!</h1>'); });

app.listen(PORT, () => {
  try {
    setupDatabase();
    console.log('Banco de dados conectado e configurado com sucesso.');
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
  } catch (err) {
    console.error('Falha ao iniciar o servidor:', err);
    process.exit(1);
  }
});