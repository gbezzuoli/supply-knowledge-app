// Arquivo: src/services/authService.ts
import axios from 'axios';

const API_URL = 'http://localhost:3000/api/auth';

// Função para fazer login
export const login = async (credentials: { username: string, password: string }) => {
  const response = await axios.post(`${API_URL}/login`, credentials);
  if (response.data && response.data.token) {
    localStorage.setItem('authToken', response.data.token);
    // --- NOVA LINHA ---
    // Armazenamos o objeto do usuário como uma string JSON
    localStorage.setItem('currentUser', JSON.stringify(response.data.user));
  }
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('authToken');
  // --- NOVA LINHA ---
  localStorage.removeItem('currentUser'); // Limpa o usuário também
};

// --- NOVA FUNÇÃO ---
export const getCurrentUser = (): { username: string } | null => {
  const user = localStorage.getItem('currentUser');
  return user ? JSON.parse(user) : null;
};

// Função para pegar o token
export const getToken = (): string | null => {
  return localStorage.getItem('authToken');
};

// Função para verificar se o usuário está logado
export const isLoggedIn = (): boolean => {
  return !!getToken();
};

// Dentro de src/services/authService.ts
export const signup = async (credentials: { username: string, password: string }) => {
  // O backend ainda não tem essa rota, mas o frontend estará pronto.
  const response = await axios.post(`${API_URL}/register`, credentials);
  return response.data;
};