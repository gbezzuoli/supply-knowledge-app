# Agente-Flux (para Supply-Knowledge-App)
**Versão:** `1.0.0-beta.20250622`

O Agente-Flux é um sistema de aprendizado autônomo projetado para explorar, entender e documentar aplicações web complexas. Atualmente, ele está sendo desenvolvido e testado no contexto do projeto **Supply-Knowledge-App**, com o objetivo de criar uma base de conhecimento dinâmica para um sistema ERP.

O sistema é composto por três partes principais:
1.  **Backend (Node.js/Express):** Serve a API principal, gerencia usuários e a comunicação com o banco de dados vetorial.
2.  **Frontend (React/Vite):** A interface do usuário para interagir com o chatbot e as ferramentas de administração.
3.  **Agente-Flux (Python/Playwright):** O agente de IA que navega na aplicação web, aprende os fluxos de trabalho e alimenta a base de conhecimento.

---

## Tecnologias Utilizadas

*   **Backend:** Node.js, Express, JWT, Axios, ChromaDB (via Docker)
*   **Frontend:** React, Vite, TypeScript, Material-UI (MUI), React Router
*   **Agente-Flux:** Python, Playwright, Google Gemini API, ChromaDB Client
*   **Orquestração:** Concurrently, Nodemon

---

## Pré-requisitos

Antes de começar, garanta que você tem as seguintes ferramentas instaladas:

*   **Node.js:** v20.x ou superior
*   **Python:** v3.10 ou superior
*   **Docker Desktop:** Essencial para rodar o banco de dados vetorial ChromaDB.
*   **Git:** Para clonar o repositório.

---

## Como Rodar o Projeto Completo

Siga estes passos para iniciar todos os serviços (Backend, Frontend, Agente e Banco de Dados).

### 1. Preparação Inicial

**a. Clone o Repositório:**
```bash
git clone <URL_DO_SEU_REPOSITORIO_PRIVADO>
cd supply-knowledge-app
```

**b. Configure as Variáveis de Ambiente:**
Na raiz do projeto, crie um arquivo chamado `.env` e cole o seguinte conteúdo, substituindo pela sua chave de API do Google.

```env
# Arquivo: .env

# Backend Node.js
PORT=3000
JWT_SECRET=um-segredo-muito-forte-e-aleatorio-aqui

# API Python e Agente-Flux
GOOGLE_API_KEY="SUA_CHAVE_DE_API_DO_GOOGLE_AQUI"
```

### 2. Inicie o Banco de Dados Vetorial

**a. Inicie o Docker Desktop** e espere ele ficar totalmente operacional (ícone verde).

**b. Abra um terminal** e execute o comando para iniciar o contêiner do ChromaDB:
```bash
docker run -p 8000:8000 chromadb/chroma
```
**Deixe este terminal aberto.** Ele é o seu banco de dados.

### 3. Inicie o Backend (Node.js + API Python)

Nós usamos um único comando para iniciar os dois servidores do backend.

**a. Abra um segundo terminal** e navegue até a pasta `backend`:
```bash
cd backend
```

**b. Instale as dependências:**
```bash
npm install
```

**c. Instale as dependências do serviço Python:**
```bash
# Navegue para a pasta do serviço de API em Python
cd gemini_api_py 
# Crie e ative um ambiente virtual (altamente recomendado)
python -m venv venv
# Ativar no Windows
.\venv\Scripts\activate
# Ativar no Linux/macOS
# source venv/bin/activate
pip install -r requirements.txt # Vamos criar este arquivo
# Volte para a pasta backend
cd ..
```

**d. Inicie os dois servidores com um único comando:**
```bash
npm run dev:all
```
**Deixe este terminal aberto.** Ele está rodando seu backend Node.js e a API em Python.

### 4. Inicie o Frontend (React)

**a. Abra um terceiro terminal** e navegue até a pasta `frontend`:
```bash
cd frontend
```

**b. Instale as dependências:**
```bash
npm install
```

**c. Inicie a aplicação React:**
```bash
npm run dev
```
O Vite irá iniciar e fornecer uma URL (geralmente `http://localhost:5173`) para você abrir no navegador.

### 5. Execute o Agente-Flux (Quando Quiser Treinar)

**a. Abra um quarto terminal** e navegue até a pasta `agent-flux` (ou a pasta onde o agente está).

**b. Configure o ambiente Python do agente:**
```bash
python -m venv venv
# Ativar no Windows
.\venv\Scripts\activate
# Ativar no Linux/macOS
# source venv/bin/activate
pip install -r requirements.txt```

**c. Execute o agente:**
```bash
python agente_flux.py
```
Siga as instruções no console para treinar o agente.

---
## Estrutura do Projeto

```
/
├── agent-flux/         # Lógica do Agente de Aprendizagem
├── backend/            # API principal e lógica de negócio
├── frontend/           # Interface do usuário em React
├── .gitignore
└── README.md
```