// Arquivo: __tests__/services/dataProcessingService.test.js (VERSÃO VITEST COMPLETA)

// 1. Importa as funções do Vitest
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Importa o código que vamos testar
import { runConsolidador, runGerarKb } from '../../src/services/dataProcessingService.js';
// Importa o MÓDULO INTEIRO que queremos mockar
import * as geminiService from '../../src/services/geminiService.js';

// 2. Mockando com a API do Vitest. É mais limpo e funciona nativamente com ESM.
vi.mock('../../src/services/geminiService.js', () => ({
  // Definimos as funções que queremos substituir por mocks vazios
  generateChatResponse: vi.fn(),
  generateEmbedding: vi.fn(),
}));

// Bloco de testes para a função runConsolidador
describe('runConsolidador', () => {

  it('deve consolidar um chat simples em problema e solução', () => {
    // Arrange: Preparamos os dados de entrada
    const chatsDeEntrada = [
      {
        chat_index: '123',
        visitante: 'Cliente Teste',
        mensagens: [
          { tipo_autor: 'Visitante', texto: 'Meu sistema não abre.' },
          { tipo_autor: 'Operador', texto: 'Olá, seja bem-vindo ao suporte!' },
          { tipo_autor: 'Operador', texto: 'Por favor, reinicie o computador.' },
          { tipo_autor: 'Visitante', texto: 'Ok, obrigado.' },
        ],
      },
    ];

    // Act: Executamos a função
    const resultado = runConsolidador(chatsDeEntrada);

    // Assert: Verificamos o resultado
    expect(resultado).toHaveLength(1);
    expect(resultado[0].problema_bruto).toBe('Meu sistema não abre.\nOk, obrigado.');
    expect(resultado[0].solucao_bruta).toBe('Por favor, reinicie o computador.');
    expect(resultado[0].chat_index).toBe('123');
  });

  it('deve ignorar chats que foram encerrados por inatividade', () => {
    const chatsDeEntrada = [
      {
        chat_index: '456',
        visitante: 'Cliente Fantasma',
        mensagens: [
          { tipo_autor: 'Visitante', texto: 'Oi?' },
          { tipo_autor: 'Operador', texto: 'Olá, como posso ajudar?' },
          { tipo_autor: 'Operador', texto: 'Este chat foi encerrado por inatividade.' },
        ],
      },
    ];

    const resultado = runConsolidador(chatsDeEntrada);

    expect(resultado).toHaveLength(0);
  });

  it('deve ignorar chats sem problema ou sem solução do operador', () => {
    const chatsDeEntrada = [
      { // Chat sem solução
        chat_index: '789',
        visitante: 'Cliente Mudo',
        mensagens: [{ tipo_autor: 'Visitante', texto: 'Preciso de ajuda.' }],
      },
      { // Chat sem problema
        chat_index: '101',
        visitante: 'Curioso',
        mensagens: [{ tipo_autor: 'Operador', texto: 'Tente fazer isso.' }],
      }
    ];

    const resultado = runConsolidador(chatsDeEntrada);
    expect(resultado).toHaveLength(0);
  });
});

// Bloco de testes para a função runGerarKb
describe('runGerarKb', () => {

  // Limpa os mocks antes de cada teste
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve chamar a API do GenAI e transformar os chats em KB', async () => {
    // Arrange
    const chatsConsolidados = [{ chat_index: '123', problema_bruto: 'p', solucao_bruta: 's' }];
    const respostaDaIA = `[{"pergunta":"P", "resposta":"S", "fonte_chat_index":"123"}]`;

    // Configuramos o mock para retornar um valor específico para este teste
    geminiService.generateChatResponse.mockResolvedValue(respostaDaIA);

    // Act
    const kb = await runGerarKb(chatsConsolidados);

    // Assert
    expect(kb).toHaveLength(1);
    expect(kb[0].pergunta).toBe('P');
    expect(geminiService.generateChatResponse).toHaveBeenCalledTimes(1);
  });

  it('deve retornar uma KB vazia se a resposta da IA for um JSON inválido', async () => {
    // Arrange
    const chatsConsolidados = [{ problema_bruto: 'p', solucao_bruta: 's' }];
    geminiService.generateChatResponse.mockResolvedValue("isso não é um json");

    // Act
    const knowledgeBase = await runGerarKb(chatsConsolidados);

    // Assert
    expect(knowledgeBase).toEqual([]);
    expect(geminiService.generateChatResponse).toHaveBeenCalledTimes(1);
  });
});