// Arquivo: src/services/dataProcessingService.js (VERSÃO ESM FINAL)

import * as cheerio from 'cheerio';
import * as geminiService from './geminiService.js';
import { JSDOM } from 'jsdom';

// -- getInitials não precisa ser exportada se só é usada aqui dentro --
function getInitials(fullName) {
  if (!fullName || !fullName.trim()) return "XX";
  const parts = fullName.trim().split(' ');
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// -- EXPORTANDO CADA FUNÇÃO PRINCIPAL --

export function runParserHtml(htmlContent) {
  const $ = cheerio.load(htmlContent);
  const chats = [];

  $('h2').each((position, header) => {
    const headerElem = $(header);
    const rightDivText = headerElem.find('div.right').text();
    const idMatch = rightDivText.match(/ID:\s*(\d+)/);
    if (!idMatch) return;
    const chatId = idMatch[1].trim();
    const mainText = headerElem.clone().find('div').remove().end().text().trim();
    const mainMatch = mainText.match(/(.+?),\s*(\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2})/);
    if (!mainMatch) return;
    const visitante = mainMatch[1].trim();
    const inicioChatStr = mainMatch[2].trim();
    const chatData = { chatId, visitante, inicio_chat: inicioChatStr, mensagens: [] };
    let operatorInitials = "XX";
    let foundOperator = false;

    let currentElement = headerElem.next();
    while (currentElement.length && !currentElement.is('h2')) {
      if (currentElement.is('div.message-row')) {
        const authorSpan = currentElement.find('span.usr-tit');
        if (authorSpan.length) {
          const authorName = authorSpan.text().trim().replace(':', '');
          const tipoAutor = authorSpan.hasClass('op-tit') ? "Operador" : "Visitante";
          if (!foundOperator && tipoAutor === 'Operador') {
            operatorInitials = getInitials(authorName);
            foundOperator = true;
          }
          const messageHtml = currentElement.clone().find('span, div.msg-date').remove().end().html();
          const dom = new JSDOM(`<!DOCTYPE html><body>${messageHtml}</body>`);
          const finalText = dom.window.document.body.textContent || "[Arquivo Anexado]";
          
          chatData.mensagens.push({ autor: authorName, tipo_autor: tipoAutor, texto: finalText.trim() });
        }
      }
      currentElement = currentElement.next();
    }
    if (chatData.mensagens.length > 0) {
      chatData.chat_index = `${new Date(inicioChatStr).getMonth() + 1}${position}${operatorInitials}`;
      chats.push(chatData);
    }
  });
  return chats;
}

export function runConsolidador(originalChats) {
  const closingPhrases = ["encerrado por inatividade", "encerrado por falta de resposta"];
  const consolidatedChats = [];
  for (const chat of originalChats) {
    const problemaBrutoLista = chat.mensagens.filter(m => m.tipo_autor === 'Visitante' && m.texto).map(m => m.texto.trim());
    const solucaoBrutaLista = chat.mensagens.filter(m => m.tipo_autor === 'Operador' && m.texto && !m.texto.toLowerCase().includes("seja bem-vindo ao suporte")).map(m => m.texto.trim());
    const problemaBrutoStr = problemaBrutoLista.join('\n');
    const solucaoBrutaStr = solucaoBrutaLista.join('\n');
    if (!problemaBrutoStr || !solucaoBrutaStr || closingPhrases.some(p => solucaoBrutaStr.toLowerCase().includes(p))) continue;
    consolidatedChats.push({
      chat_index: chat.chat_index,
      visitante: chat.visitante,
      problema_bruto: problemaBrutoStr,
      solucao_bruta: solucaoBrutaStr,
    });
  }
  return consolidatedChats;
}

export async function runGerarKb(consolidatedChats) {
  const knowledgeBase = [];
  const batchSize = 5;
  for (let i = 0; i < consolidatedChats.length; i += batchSize) {
    const batch = consolidatedChats.slice(i, i + batchSize);
    console.log(`Processando lote ${i / batchSize + 1}...`);
    const dialogosParaAnalise = batch.map(chat => `--- \nCHAT_ID_ORIGINAL: ${chat.chat_index}\nPROBLEMA DO CLIENTE:\n${chat.problema_bruto}\nSOLUÇÃO DO OPERADOR:\n${chat.solucao_bruta}\n---`).join('\n');
    const promptTemplate = `Sua tarefa é analisar uma lista de diálogos e, para CADA um, extrair um par Q&A e tags. O resultado deve ser uma LISTA DE OBJETOS JSON VÁLIDA. REGRAS: 1. Para cada diálogo, crie um objeto JSON com chaves "pergunta", "resposta", "tags" e "fonte_chat_index". 2. 'fonte_chat_index' DEVE ser o valor exato do CHAT_ID_ORIGINAL. 3. Retorne APENAS a lista JSON \`[ {{...}}, {{...}} ]\`. Não inclua nenhum outro texto ou formatação como \`\`\`json. EXEMPLO DE SAÍDA: [{"pergunta": "Como corrigir erro de ICMS?", "resposta": "Acesse Fiscal > Configs e marque...", "tags": ["nfe", "icms"], "fonte_chat_index": "41GR8"}] --- LOTE DE DIÁLOGOS PARA ANÁLISE: ${dialogosParaAnalise} ---`;
    try {
      const responseText = await geminiService.generateChatResponse(promptTemplate);
      const cleanedResponse = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const qaPairs = JSON.parse(cleanedResponse);
      if (Array.isArray(qaPairs)) {
        knowledgeBase.push(...qaPairs);
      }
    } catch (error) {
      console.error(`Erro ao processar o lote ${i / batchSize + 1}:`, error);
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  console.log(`Geração da KB concluída. ${knowledgeBase.length} itens criados.`);
  return knowledgeBase;
}