// Arquivo: inspect_db.js
// (Versão atualizada para se conectar ao servidor ChromaDB no Docker)

import { ChromaClient } from 'chromadb';

// --- CONFIGURAÇÃO ---
// Altere o nome da coleção que você quer inspecionar
const COLLECTION_TO_INSPECT = 'chatbot_documentacao'; // ou 'chatbot_documentacao'
const LIMIT = 1000; // Quantos documentos você quer ver? (Mude se precisar de mais)

async function inspectCollection() {
  console.log(`Tentando se conectar ao servidor ChromaDB em http://localhost:8000...`);
  
  // Conecta-se ao servidor Docker do ChromaDB
  const client = new ChromaClient({
      host: 'localhost',
      port: '8000'
  });

  try {
    console.log(`Buscando a coleção: "${COLLECTION_TO_INSPECT}"...`);
    const collection = await client.getCollection({ name: COLLECTION_TO_INSPECT });

    const count = await collection.count();
    console.log(`\n--- INSPECIONANDO COLEÇÃO: "${COLLECTION_TO_INSPECT}" ---`);
    console.log(`Total de documentos encontrados: ${count}\n`);

    if (count === 0) {
      console.log('A coleção está vazia.');
      return;
    }

    // O método .get() busca os dados. Podemos filtrar ou pegar tudo.
    // O include[] especifica o que queremos ver: metadados e os próprios documentos.
    const data = await collection.get({
      limit: LIMIT,
      include: ["metadatas", "documents"]
    });
    
    console.log(`Mostrando os primeiros ${data.ids.length} de ${count} documentos:\n`);

    // Itera sobre os dados e imprime de forma legível
    for (let i = 0; i < data.ids.length; i++) {
      console.log(`----------------------------------------`);
      console.log(`| Documento ID: ${data.ids[i]}`);
      console.log(`| Metadados:`);
      // Imprime cada par chave-valor dos metadados
      for (const key in data.metadatas[i]) {
        console.log(`|   - ${key}: ${data.metadatas[i][key]}`);
      }
      console.log(`|`);
      console.log(`| Conteúdo (Documento):`);
      // Formata o texto para que quebras de linha sejam exibidas corretamente
      const documentText = data.documents[i].replace(/\n/g, '\n|   ');
      console.log(`|   ${documentText}`);
      console.log(`----------------------------------------\n`);
    }

  } catch (error) {
    if (error.message && error.message.includes('404')) {
        console.error(`\nERRO: A coleção "${COLLECTION_TO_INSPECT}" não foi encontrada no banco de dados.`);
    } else if (error.message && error.message.includes('fetch failed')) {
        console.error('\nERRO: Falha ao conectar ao ChromaDB. Verifique se o contêiner Docker está rodando.');
    } else {
        console.error('\nOcorreu um erro inesperado:', error);
    }
  }
}

// Executa a função
inspectCollection();