// Arquivo: src/services/geminiService.js
// (VERSÃO FINAL, AGORA UM CLIENTE PARA A NOSSA API PYTHON)

import axios from 'axios';

// O endereço do nosso servidor Python local
const PYTHON_API_URL = 'http://localhost:5001';

/**
 * Função para gerar embeddings fazendo uma chamada para a nossa API Python.
 * @param {string[]} texts - O array de textos.
 * @returns {Promise<number[][]>} Um array de arrays de vetores.
 */
export async function generateEmbeddings(texts) {
  try {
    const response = await axios.post(`${PYTHON_API_URL}/embed`, {
      texts: texts,
    });
    return response.data.embeddings;
  } catch (error) {
    console.error('Erro ao chamar a API de embedding em Python:', error.response ? error.response.data : error.message);
    throw new Error('Falha ao gerar embeddings no serviço Python.');
  }
}

/**
 * Função para gerar uma resposta de chat fazendo uma chamada para a API Python.
 * @param {string} prompt - O prompt para o modelo.
 * @returns {Promise<string>} A resposta gerada.
 */
export async function generateChatResponse(prompt) {
  try {
    const response = await axios.post(`${PYTHON_API_URL}/generate`, {
      prompt: prompt,
    });
    return response.data.text;
  } catch (error) {
    console.error('Erro ao chamar a API de geração em Python:', error.response ? error.response.data : error.message);
    throw new Error('Falha ao gerar resposta no serviço Python.');
  }
}