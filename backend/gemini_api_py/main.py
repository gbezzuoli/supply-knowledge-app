# Arquivo: gemini_api_py/main.py
# (VERSÃO FINAL COM AMBOS OS PARÂMETROS CORRIGIDOS)

import os
from flask import Flask, request, jsonify
from google import genai
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    raise ValueError("ERRO CRÍTICO: GOOGLE_API_KEY não definida.")

client = genai.Client(api_key=api_key)
app = Flask(__name__)

EMBEDDING_MODEL_NAME = 'models/text-embedding-004'
GENERATION_MODEL_NAME = 'gemini-2.5-flash'

@app.route('/embed', methods=['POST'])
def embed_contents():
    try:
        data = request.get_json()
        if not data or 'texts' not in data:
            return jsonify({"error": "Payload inválido. 'texts' é obrigatório."}), 400

        # Esta função agora está correta.
        result = client.models.embed_content(
            model=EMBEDDING_MODEL_NAME,
            contents=data['texts']
        )
        
        list_of_embeddings = [embedding.values for embedding in result.embeddings]
        return jsonify({"embeddings": list_of_embeddings})

    except Exception as e:
        print(f"Erro no endpoint /embed: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/generate', methods=['POST'])
def generate_text():
    try:
        data = request.get_json()
        if not data or 'prompt' not in data:
            return jsonify({"error": "Payload inválido. 'prompt' é obrigatório."}), 400

        # --- A CORREÇÃO FINAL ESTÁ AQUI ---
        # Trocando 'model_name' por 'model'
        result = client.models.generate_content(
            model=GENERATION_MODEL_NAME, # <--- MUDANÇA AQUI
            contents=data['prompt']
        )
        # --- FIM DA CORREÇÃO ---
        
        return jsonify({"text": result.text})

    except Exception as e:
        print(f"Erro no endpoint /generate: {e}")
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    print("Iniciando servidor Python para API Gemini na porta 5001...")
    app.run(host='0.0.0.0', port=5001)