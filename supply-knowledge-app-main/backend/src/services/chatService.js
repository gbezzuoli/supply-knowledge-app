// Arquivo: src/services/chatService.js

import * as geminiService from './geminiService.js';
import * as chromaService from './chromaService.js';

/**
 * Orquestra a resposta do chatbot, desde a busca até a geração final.
 * @param {object} params - Parâmetros da requisição.
 * @param {string} params.query - A pergunta do usuário.
 * @param {Array} params.history - O histórico da conversa.
 * @param {Buffer | null} params.imageBuffer - O buffer da imagem, se houver.
 * @returns {Promise<string>} A resposta final do chatbot.
 */
export async function getChatbotResponse({ query, history, imageBuffer }) {
  
  // --- LÓGICA PARA COMANDOS ESPECIAIS ---
  if (query.trim().toLowerCase() === '!flux-aprender') {
    console.log("Comando FLUX detectado. Iniciando autoanálise.");
    
    const resolucoes = await chromaService.inspectCollection('chatbot_resolucoes');
    const documentacao = await chromaService.inspectCollection('chatbot_documentacao');

    const summary = `
      ### Autoanálise da Base de Conhecimento
      - **Base 'Resoluções de Chat':** Contém **${resolucoes.count}** documentos.
      - **Base 'Documentação' (Aprendizado do FLUX):** Contém **${documentacao.count}** documentos.
    `;

    const analysisPrompt = `
      Com base no resumo a seguir sobre meu conhecimento, aja com uma personalidade sincera e autoconsciente.
      Apresente o resumo e, em seguida, sugira 3 perguntas específicas e complexas que um usuário poderia fazer para testar as áreas onde você tem menos conhecimento ou onde os tópicos são mais críticos.
      RESUMO DO MEU CONHECIMENTO ATUAL:
      ${summary}
    `;
    
    return geminiService.generateChatResponse(analysisPrompt);
  }

  // --- LÓGICA PRINCIPAL DE PERGUNTA E RESPOSTA ---

  // 1. EXPANSÃO DE QUERY (HyDE)
  console.log("Gerando uma resposta hipotética para melhorar a busca...");
  const hypoteticalAnswerPrompt = `Gere uma resposta curta e direta para a seguinte pergunta do usuário, como se você soubesse a resposta. Pergunta: "${query}"`;
  const hypotheticalAnswer = await geminiService.generateChatResponse(hypoteticalAnswerPrompt);
  const richQuery = `${query}\n\n${hypotheticalAnswer}`;
  
  // 2. BUSCA VETORIAL
  console.log(`Buscando na base por: "${richQuery.substring(0, 100)}..."`);
  const queryEmbedding = await geminiService.generateEmbeddings([richQuery]);
  
  const resultsDocs = await chromaService.queryCollection('chatbot_documentacao', queryEmbedding[0], 2);
  const resultsChats = await chromaService.queryCollection('chatbot_resolucoes', queryEmbedding[0], 2);

  // 3. CONSTRUÇÃO DO CONTEXTO COM FILTRO DE RELEVÂNCIA
  let context = "";
  const DISTANCE_THRESHOLD = 0.85; // Limite de distância. Aumentado ligeiramente para ser mais permissivo.

  const addResultsToContext = (results, sourceType) => {
    if (results?.documents?.[0]?.length > 0) {
      let addedToContext = false;
      for (let i = 0; i < results.documents[0].length; i++) {
        if (results.distances[0][i] < DISTANCE_THRESHOLD) {
          if (!addedToContext) {
            context += `CONTEXTO DE '${sourceType}':\n`;
            addedToContext = true;
          }
          console.log(`[CONTEXTO] Adicionando documento de '${sourceType}' com distância: ${results.distances[0][i]}`);
          context += `- Pergunta similar: ${results.metadatas[0][i].pergunta}\n  - Solução: ${results.documents[0][i]}\n\n`;
        }
      }
    }
  };

  addResultsToContext(resultsDocs, 'Documentação (FLUX)');
  addResultsToContext(resultsChats, 'Resoluções de Chat');

  // 4. FORMULAÇÃO DO PROMPT FINAL
  let finalPrompt;
  const persona = "Você é o CHAT-BOT (Guilherme Ramos), um assistente especialista focado EXCLUSIVAMENTE no sistema interno. Sua personalidade é prestativa, objetiva e concisa.";

  if (context.trim() !== "") {
    // CASO 1: Contexto encontrado.
    console.log("Contexto relevante encontrado. Formulando resposta baseada nos dados internos.");
    finalPrompt = `
      ${persona}
      Sua tarefa é responder à pergunta do usuário usando APENAS as informações do CONTEXTO fornecido abaixo.
      NÃO use nenhum conhecimento externo. Se a resposta não estiver no contexto, informe que os detalhes encontrados não são suficientes para responder completamente.
      Seja amigável e direto.

      CONTEÚDO INTERNO:
      ${context}
      ---
      PERGUNTA DO USUÁRIO: ${query}

      SUA RESPOSTA:`;
  } else {
    // CASO 2: Nenhum contexto relevante encontrado.
    console.log("Nenhum contexto interno relevante encontrado. Formulando resposta de 'não sei'.");
    finalPrompt = `
      ${persona}
      Você realizou uma busca em sua base de conhecimento interna para a pergunta do usuário, mas não encontrou uma resposta relevante.
      Sua tarefa é informar ao usuário, de forma educada e atenciosa, que você não possui a informação solicitada em sua base de dados no momento.
      NÃO tente responder a pergunta usando conhecimento geral. NÃO mencione outros sistemas. Apenas admita que você não sabe a resposta para aquela pergunta específica.

      PERGUNTA DO USUÁRIO: ${query}

      SUA RESPOSTA (admitindo não saber):`;
  }

  // 5. GERAÇÃO DA RESPOSTA
  console.log("Gerando resposta final...");
  const finalResponse = await geminiService.generateChatResponse(finalPrompt);

  return finalResponse;
}