// Arquivo: test_gemini.js
import 'dotenv/config';
import { GoogleGenAI } from '@google/genai'; // Usando a biblioteca e o construtor que você identificou

async function runTest() {
  if (!process.env.GOOGLE_API_KEY) {
    console.error("ERRO: GOOGLE_API_KEY não encontrada no arquivo .env");
    return;
  }

  console.log("--- 1. Inicializando o cliente GoogleGenAI ---");
  const genAI = new GoogleGenAI(process.env.GOOGLE_API_KEY);
  console.log("Cliente inicializado com sucesso.");

  console.log("\n--- 2. Inspecionando o objeto 'genAI' ---");
  console.log("Chaves disponíveis em 'genAI':", Object.keys(genAI));
  
  if (genAI.models) {
    console.log("\n--- 3. Inspecionando 'genAI.models' ---");
    console.log("genAI.models é um objeto. Suas chaves são:", Object.keys(genAI.models));
  } else {
    console.log("\n--- 3. 'genAI.models' NÃO EXISTE. ---");
  }
  
  try {
    console.log("\n--- 4. Tentando chamar a função de embedding ---");
    const model = genAI.getGenerativeModel({ model: "text-embedding-latest" });
    console.log("Instância do modelo de embedding obtida com sucesso.");

    const result = await model.embedContent("Olá, mundo!");
    console.log("\n--- 5. SUCESSO! Embedding gerado. ---");
    console.log("Tamanho do vetor:", result.embedding.values.length);
    console.log("A estrutura da API correta é: genAI.getGenerativeModel({...}).embedContent(...)");

  } catch (error) {
    console.error("\n--- 5. FALHA ao chamar a função de embedding. ---");
    console.error("O erro foi:", error);
  }
}

runTest();