// Arquivo: src/services/chromaService.js (VERSÃO FINAL COM EXPORTS CORRETOS)

import { ChromaClient } from 'chromadb';
// Importamos o MÓDULO INTEIRO para usar em nossa classe de embedding
import * as geminiService from './geminiService.js';

// Usando a conexão explícita com o Docker
export const client = new ChromaClient({
  host: 'localhost',
  port: '8000'
});

class CustomGoogleEmbeddingFunction {
  async generate(texts) {
    // Agora chama a função de lote unificada do geminiService
    return geminiService.generateEmbeddings(texts);
  }
}

const embedder = new CustomGoogleEmbeddingFunction();

/**
 * Função base para pegar ou criar uma coleção.
 */
export async function getOrCreateCollection(collectionName) {
  const collection = await client.getOrCreateCollection({
    name: collectionName,
    embeddingFunction: embedder
  });
  console.log(`Coleção '${collectionName}' acessada/criada com sucesso.`);
  return collection;
}

/**
 * Função para LER/BUSCAR no banco de dados.
 */
export async function queryCollection(collectionName, queryEmbedding, nResults = 3) {
  try {
    const collection = await getOrCreateCollection(collectionName);
    const results = await collection.query({
      queryEmbeddings: [queryEmbedding],
      nResults: nResults
    });
    return results;
  } catch (error) {
    console.error(`Erro ao buscar na coleção '${collectionName}':`, error);
    throw error;
  }
}

/**
 * Função para ESCREVER no banco de dados em lote.
 */
export async function addKnowledgeBaseToCollection(collectionName, knowledgeBase) {
  if (!knowledgeBase || knowledgeBase.length === 0) {
    console.log('Base de conhecimento vazia. Nada a indexar.');
    return;
  }
  const collection = await getOrCreateCollection(collectionName);
  const ids = knowledgeBase.map(item => item.fonte_chat_index);
  const documents = knowledgeBase.map(item => item.resposta);
  const metadatas = knowledgeBase.map(item => ({
    pergunta: item.pergunta,
    tags: Array.isArray(item.tags) ? item.tags.join(', ') : '',
    fonte: item.fonte_chat_index,
    visitante: item.visitante || "N/A",
  }));
  await collection.add({ ids, documents, metadatas });
  console.log(`Indexação para '${collectionName}' concluída com sucesso.`);
}

export async function inspectCollection(collectionName) {
  console.log(`Inspecionando a coleção: ${collectionName}`);
  const collection = await getOrCreateCollection(collectionName);
  const count = await collection.count();
  
  if (count === 0) {
    return { count: 0, items: [] };
  }

  // Pega todos os itens da coleção
  const data = await collection.get({
    include: ["metadatas", "documents"]
  });

  // Formata os dados para o frontend
  const items = data.ids.map((id, index) => ({
    ID: id,
    Pergunta: data.metadatas[index]?.pergunta || 'N/A',
    Resposta: data.documents[index] || 'N/A',
    Visitante: data.metadatas[index]?.visitante || 'N/A',
    Tags: data.metadatas[index]?.tags || 'N/A',
  }));

  return { count, items };
}
// NÃO PRECISAMOS de 'export { client }' no final, pois já exportamos tudo na declaração.