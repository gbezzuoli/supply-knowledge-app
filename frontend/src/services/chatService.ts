// Arquivo: src/services/chatService.ts
import axios from 'axios';
import { getToken } from './authService';

const API_URL = 'http://localhost:3000/api/chatbot';

type AskPayload = {
  query: string;
  history: { role: string; text: string }[];
  image?: File | null;
};

export const askBot = async ({ query, history, image }: AskPayload) => {
  const token = getToken();
  if (!token) {
    throw new Error('Token de autenticação não encontrado.');
  }

  // Usamos FormData para enviar texto e um arquivo na mesma requisição
  const formData = new FormData();
  formData.append('query', query);
  formData.append('history', JSON.stringify(history));
  if (image) {
    formData.append('image', image);
  }

  const response = await axios.post(`${API_URL}/ask`, formData, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'multipart/form-data', // Essencial para o upload
    },
  });

  return response.data;
};

export const inspectCollection = async (collectionName: string) => {
  const token = getToken();
  const response = await axios.get(`${API_URL}/inspect?collection=${collectionName}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return response.data;
};