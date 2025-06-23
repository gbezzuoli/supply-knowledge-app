// Arquivo: list_models.js
// (VERSÃO FINAL COM VERIFICAÇÃO DE SEGURANÇA)

import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

async function listAvailableModels() {
  try {
    console.log("Conectando à API do Google para listar modelos...");
    const genAI = new GoogleGenAI(process.env.GOOGLE_API_KEY);

    const pager = await genAI.models.list();
    const modelsArray = pager.pageInternal;
    
    if (!modelsArray || modelsArray.length === 0) {
        console.log("Nenhum modelo foi retornado pela API.");
        return;
    }

    console.log("\n--- Modelos Disponíveis e Seus Métodos Suportados ---");

    for (const model of modelsArray) {
      console.log("----------------------------------------------------");
      console.log(`> ID do Modelo: ${model.name}`);
      console.log(`  - Nome: ${model.displayName}`);
      
      // --- A CORREÇÃO ESTÁ AQUI ---
      // Verificamos se a propriedade existe ANTES de tentar usá-la.
      if (model.supportedGenerationMethods && Array.isArray(model.supportedGenerationMethods)) {
        console.log(`  - MÉTODOS SUPORTADOS: [ ${model.supportedGenerationMethods.join(', ')} ]`);
      } else {
        // Se não existir, imprimimos uma mensagem informativa.
        console.log(`  - MÉTODOS SUPORTADOS: [ N/A (Modelo de Embedding ou especializado) ]`);
      }
      // --- FIM DA CORREÇÃO ---
    }
    console.log("----------------------------------------------------");

  } catch (error) {
    console.error("\nERRO ao tentar listar os modelos:", error);
  }
}

listAvailableModels();