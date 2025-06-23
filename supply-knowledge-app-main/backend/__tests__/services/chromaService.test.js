// Arquivo: __tests__/services/chromaService.test.js

import { describe, it, expect, vi, beforeEach } from 'vitest';
// Importamos a função que queremos testar
import { addKnowledgeBaseToCollection } from '../../src/services/chromaService.js';
// Importamos a biblioteca que a função usa, para que o mock a intercepte
import { ChromaClient } from 'chromadb';

// Mockamos a biblioteca 'chromadb' inteira.
vi.mock('chromadb', () => {
  // Criamos um mock para o método 'add' que queremos verificar
  const mockAdd = vi.fn().mockResolvedValue(true);
  // Criamos um mock para o método getOrCreateCollection
  const mockGetOrCreateCollection = vi.fn(() => Promise.resolve({ add: mockAdd }));
  
  // A classe mockada do ChromaClient retorna os métodos que precisamos
  const MockChromaClient = vi.fn(() => ({
    getOrCreateCollection: mockGetOrCreateCollection
  }));
  
  // Exportamos a classe mockada para que o nosso serviço a utilize
  return { ChromaClient: MockChromaClient };
});

describe('addKnowledgeBaseToCollection', () => {
  beforeEach(() => {
    vi.clearAllMocks(); // Limpa os mocks antes de cada teste
  });

  it('deve formatar os dados e chamar o método .add() da coleção', async () => {
    // Arrange: Preparamos uma pequena base de conhecimento
    const collectionName = 'test_collection';
    const kb = [
      {
        fonte_chat_index: 'id1',
        resposta: 'Resposta 1',
        pergunta: 'Pergunta 1',
        tags: ['tag1', 'tag2'],
        visitante: 'Visitante 1'
      }
    ];

    // Act: Executamos nossa função
    await addKnowledgeBaseToCollection(collectionName, kb);

    // Assert: Verificamos se os métodos mockados foram chamados corretamente
    const chromaInstance = new ChromaClient();
    expect(chromaInstance.getOrCreateCollection).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'test_collection' })
    );
    
    const collection = await chromaInstance.getOrCreateCollection();
    expect(collection.add).toHaveBeenCalledTimes(1);
    expect(collection.add).toHaveBeenCalledWith({
      ids: ['id1'],
      documents: ['Resposta 1'],
      metadatas: [{
        pergunta: 'Pergunta 1',
        tags: 'tag1, tag2',
        fonte: 'id1',
        visitante: 'Visitante 1'
      }]
    });
  });

  it('não deve chamar .add() se a base de conhecimento for vazia', async () => {
    // Arrange
    const collectionName = 'test_collection';
    const kb = []; // Base de conhecimento vazia

    // Act
    await addKnowledgeBaseToCollection(collectionName, kb);

    // Assert
    const { getOrCreateCollection } = new ChromaClient();
    const collection = await getOrCreateCollection();
    // Esperamos que o método .add nunca seja chamado
    expect(collection.add).not.toHaveBeenCalled();
  });
});