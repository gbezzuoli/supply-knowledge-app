// Arquivo: src/api/data.routes.js (VERSÃO ESM COMPLETA)

import express from 'express';
import multer from 'multer';
import { authenticateToken, isAdmin } from '../middleware/auth.middleware.js';
import * as chromaService from '../services/chromaService.js';
import * as dataProcessingService from '../services/dataProcessingService.js';
import * as geminiService from '../services/geminiService.js';

const router = express.Router();

// Configuração do Multer para armazenar o arquivo em memória
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// POST /api/data/add
// Protegido por token e permissão de admin
router.post('/add', [authenticateToken, isAdmin], async (req, res) => {
  const { collectionName, documents, metadatas, ids } = req.body;

  if (!collectionName || !documents || !metadatas || !ids) {
    return res.status(400).json({ message: 'Dados de entrada incompletos.' });
  }

  try {
    const collection = await chromaService.getOrCreateCollection(collectionName);
    
    await collection.add({
      ids: ids,
      metadatas: metadatas,
      documents: documents,
    });

    res.status(201).json({ message: `Adicionados ${documents.length} documentos à coleção '${collectionName}' com sucesso.` });
  
  } catch (error) {
    console.error("Erro ao adicionar dados:", error);
    res.status(500).json({ message: 'Erro interno ao adicionar dados.' });
  }
});

// POST /api/data/process-chats-html
router.post(
  '/process-chats-html',
  [authenticateToken, isAdmin],
  upload.single('file'),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: 'Nenhum arquivo enviado.' });
    }

    try {
      const htmlContent = req.file.buffer.toString('utf-8');
      console.log(`Processando arquivo HTML: ${req.file.originalname}`);

      const parsedData = dataProcessingService.runParserHtml(htmlContent);
      const consolidatedData = dataProcessingService.runConsolidador(parsedData);
      console.log(`${parsedData.length} chats extraídos, ${consolidatedData.length} chats consolidados.`);

      console.log("Iniciando geração de KB pela IA. Isso pode levar alguns minutos...");
      const knowledgeBase = await dataProcessingService.runGerarKb(consolidatedData);
      console.log("Geração de KB finalizada.");

      // --- PASSO NOVO E FINAL ---
      // Agora, indexamos essa nova KB na coleção apropriada.
      if (knowledgeBase.length > 0) {
        console.log(`Iniciando indexação de ${knowledgeBase.length} itens...`);
        // O nome da coleção 'chatbot_resolucoes' corresponde ao que o chatbot usa para buscar.
        await chromaService.addKnowledgeBaseToCollection('chatbot_resolucoes', knowledgeBase);
      }
      // --- FIM DO PASSO NOVO ---

      // Retornamos uma resposta de sucesso completa.
      res.status(200).json({
        message: 'HTML processado, KB gerada e indexada com sucesso!',
        summary: {
          originalName: req.file.originalname,
          chatsFound: parsedData.length,
          consolidatedChats: consolidatedData.length,
          kbItemsGenerated: knowledgeBase.length,
          kbItemsIndexed: knowledgeBase.length, // Nova informação no resumo
        },
        // Não precisamos mais retornar a KB inteira, um resumo é suficiente.
        // knowledgeBase: knowledgeBase, 
      });

    } catch (error) {
      console.error("Erro ao processar o arquivo HTML e gerar KB:", error);
      res.status(500).json({ message: 'Erro interno ao processar o arquivo.' });
    }
  }
);


router.post('/ask', authenticateToken, async (req, res) => {
  const { query } = req.body;
  if (!query) { return res.status(400).json({ message: 'A query é obrigatória.' }); }

  try {
    // --- MUDANÇA AQUI ---
    // 1. Chamamos a função de lote, passando a query dentro de um array
    const embeddings = await geminiService.generateEmbeddings([query]);
    // 2. Pegamos o primeiro (e único) embedding do resultado
    const queryEmbedding = embeddings[0];
    // --- FIM DA MUDANÇA ---

    const resultsChats = await chromaService.queryCollection('chatbot_resolucoes', queryEmbedding, 2);
    // ... (o resto do código permanece o mesmo) ...

  } catch (error) {
    console.error('Erro no endpoint do chatbot:', error);
    res.status(500).json({ message: 'Ocorreu um erro ao processar sua pergunta.' });
  }
});

router.get('/inspect', [authenticateToken, isAdmin], async (req, res) => {
  const { collection: collectionName } = req.query;

  if (!collectionName) {
    return res.status(400).json({ message: 'O nome da coleção é obrigatório.' });
  }

  try {
    const result = await chromaService.inspectCollection(collectionName);
    res.status(200).json(result);
  } catch (error) {
    console.error(`Erro ao inspecionar a coleção ${collectionName}:`, error);
    res.status(500).json({ message: 'Erro interno ao buscar dados da coleção.' });
  }
});

router.post('/debug-search', [authenticateToken, isAdmin], async (req, res) => {
  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ message: 'A query é obrigatória.' });
  }

  try {
    console.log(`[DEBUG] Iniciando busca para: "${query}"`);

    // 1. Gera o embedding para a query original
    const queryEmbedding = await geminiService.generateEmbeddings([query]);
    
    // 2. Busca na coleção
    const collection = await chromaService.getOrCreateCollection('chatbot_documentacao');
    const searchResults = await collection.query({
      queryEmbeddings: queryEmbedding,
      nResults: 5, // Pega os 5 mais próximos para análise
      include: ["metadatas", "documents", "distances"] // INCLUI A DISTÂNCIA/SIMILARIDADE
    });

    // 3. Formata a resposta para ser fácil de ler
    const debugInfo = {
      query: query,
      results: searchResults.ids[0].map((id, index) => ({
        id: id,
        distance: searchResults.distances[0][index], // 0 = perfeito, 2 = oposto
        document: searchResults.documents[0][index],
        metadata: searchResults.metadatas[0][index],
      }))
    };

    res.status(200).json(debugInfo);

  } catch (error) {
    console.error('[DEBUG] Erro no diagnóstico de busca:', error);
    res.status(500).json({ message: 'Erro interno ao executar o diagnóstico.' });
  }
});



export default router;