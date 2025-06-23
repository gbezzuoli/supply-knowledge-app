# Arquivo: migrate.py
import chromadb
import requests
import json

# --- CONFIGURAÇÃO ---
OLD_CHROMA_PATH = "C:\conversor\parser-chats\chroma_db" # Caminho para sua pasta de dados antiga
API_ENDPOINT = "http://localhost:3000/api/data/add"

# Cole aqui um token JWT válido para o seu usuário ADMIN (FABIO)
# Obtenha um token novo fazendo login no Thunder Client
ADMIN_JWT_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJGQUJJTyIsImlzQWRtaW4iOnRydWUsImlhdCI6MTc1MDQzMDY1NSwiZXhwIjoxNzUwNDU5NDU1fQ.tBNejre7EudGpKQ0oBQsu2hcTMz2v3xxzbqxWgX8g3w"

HEADERS = {
    "Authorization": f"Bearer {ADMIN_JWT_TOKEN}",
    "Content-Type": "application/json"
}

def migrate_collection(collection_name):
    print(f"\n--- Iniciando migração para a coleção: {collection_name} ---")
    try:
        # Conecta-se ao DB antigo localmente
        client = chromadb.PersistentClient(path=OLD_CHROMA_PATH)
        collection = client.get_collection(name=collection_name)

        # Pega TODOS os dados da coleção
        data = collection.get() # Inclui ids, metadatas, documents

        if not data or not data['ids']:
            print("Coleção está vazia. Nada a migrar.")
            return

        # Prepara o corpo da requisição para a nossa API Node.js
        payload = {
            "collectionName": collection_name,
            "ids": data['ids'],
            "documents": data['documents'],
            "metadatas": data['metadatas']
        }
        
        print(f"Enviando {len(data['ids'])} documentos para a API...")

        # Envia os dados para o endpoint de importação
        response = requests.post(API_ENDPOINT, headers=HEADERS, data=json.dumps(payload))

        # Verifica o resultado
        if response.status_code == 201:
            print(f"SUCESSO! Resposta da API: {response.json().get('message')}")
        else:
            print(f"ERRO! Status: {response.status_code}, Resposta: {response.text}")

    except Exception as e:
        print(f"Ocorreu um erro durante a migração: {e}")

# --- EXECUÇÃO ---
if __name__ == '__main__':
    # Execute a migração para cada coleção que você tinha
    migrate_collection("chatbot_resolucoes")
    migrate_collection("chatbot_documentacao")