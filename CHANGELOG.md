# CHANGELOG

## Versão 0.0.2 (em desenvolvimento)

### Melhorias e Correções

- **Estrutura do Projeto:**
    - Adicionado `requirements.txt` na pasta `backend` principal para facilitar a instalação das dependências Python do servidor Flask e do serviço Gemini.
    - O arquivo `.zip` do projeto foi otimizado para excluir pastas desnecessárias (`node_modules`, `venv`, `__pycache__`, `chroma_db`, `debug_screenshots`, `.git`) para um tamanho de arquivo menor e transferências mais rápidas.

- **Configuração do Frontend:**
    - Esclarecida a instrução de inicialização do frontend: o comando correto para iniciar o ambiente de desenvolvimento é `npm run dev`, e não `npm start`, conforme configurado no `package.json` do projeto Vite.

- **Dependências do Backend (Preparação):**
    - Atualizado o `requirements.txt` para incluir a nova biblioteca `genai` (https://googleapis.github.io/python-genai/) em preparação para a migração da `google.generativeai`, que terá o suporte à versão 2.5 descontinuado.

### Próximos Passos

- **Fase 1 - Estabilização e Refinamento:**
    - Continuar com a implementação das telas de "Atualizar Base", "Relatórios" e "Painel de Administração" no frontend, conectando-as aos endpoints do backend.
    - Finalizar a interface de "Curadoria de IA" para revisão e aprovação do conhecimento gerado pelo agente.
    - Melhorias contínuas no CSS e responsividade do frontend, conforme solicitado.


