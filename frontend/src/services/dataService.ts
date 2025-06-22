// Arquivo: src/services/dataService.ts
import axios from 'axios';
import { getToken } from './authService';

// A rota base para nossas operações de dados
const API_URL = 'http://localhost:3000/api/data';



/**
 * Busca o conteúdo de uma coleção do ChromaDB.
 * @param collectionName O nome da coleção a ser inspecionada.
 */

export const inspectCollection = async (collectionName: string) => {
  const token = getToken();
  if (!token) {
    throw new Error('Token de autenticação não encontrado.');
  }

  // Faz uma requisição GET para o nosso novo endpoint de inspeção
  const response = await axios.get(`${API_URL}/inspect`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    params: {
      // Passa o nome da coleção como um query parameter
      collection: collectionName,
    }
  });

  
  return response.data;
};

export const debugSearch = async (query: string) => {
  const token = getToken();
  const response = await axios.post(`${API_URL}/debug-search`, { query }, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return response.data;
};