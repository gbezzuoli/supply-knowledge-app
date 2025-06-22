# Arquivo: agente_flux.py (Versão 1.1 - Precisão Aprimorada)

import asyncio
from playwright.async_api import async_playwright
from bs4 import BeautifulSoup
import json
import os
import google.generativeai as genai
from dotenv import load_dotenv
import chromadb
from PIL import Image

# --- MÓDULO DE CONFIGURAÇÃO ---
def setup_apis():
    try:
        print("Configurando APIs...")
        load_dotenv()
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key: raise ValueError("GOOGLE_API_KEY não encontrada.")
        genai.configure(api_key=api_key)
        chroma_client = chromadb.HttpClient(host='localhost', port=8000)
        chroma_client.heartbeat()
        print("✅ Configuração concluída com sucesso.")
        return genai.GenerativeModel('gemini-2.5-flash'), chroma_client
    except Exception as e:
        print(f"❌ ERRO CRÍTICO NA INICIALIZAÇÃO: {e}"); exit()

# --- MÓDULO 1: INTERAÇÃO WEB ---
async def iniciar_navegador_e_logar(playwright, url_login, usuario, senha, empresa_valor):
    browser = await playwright.chromium.launch(headless=False, slow_mo=50, args=['--start-maximized'])
    page = await browser.new_page()
    await page.set_viewport_size({'width': 1920, 'height': 1080})
    await page.goto(url_login)
    print(f"Navegando para: {url_login}")
    
    await page.wait_for_selector("#usuario")
    print("Preenchendo credenciais...")
    await page.fill("#usuario", usuario)
    await page.fill("#senha", senha)
    await page.select_option("#codigoEmpresa", value=empresa_valor)
    
    print("Realizando login...")
    await page.click("button[type='submit']")
    
    SELETOR_DASHBOARD = 'text="Cadastros"'
    print(f"Aguardando carregamento do dashboard (esperando por: {SELETOR_DASHBOARD})...")
    await page.wait_for_selector(SELETOR_DASHBOARD, timeout=15000)
    print(f"✅ Login realizado! URL atual: {page.url}")
    return browser, page

# --- MÓDULO 2: PERCEPÇÃO VISUAL ---
async def perceber_estado_visual_da_tela(page, screenshot_filename):
    print("\n👀 Percebendo o estado visual da tela...")
    await page.wait_for_timeout(1000)
    
    await page.evaluate("() => document.querySelectorAll('.agent-overlay').forEach(e => e.remove())")
    
    os.makedirs("debug_screenshots", exist_ok=True)
    screenshot_path = f"debug_screenshots/{screenshot_filename}.png"
    await page.screenshot(path=screenshot_path)
    
    seletores = 'a[href], button, input:not([type="hidden"]), select, textarea'
    elementos_encontrados = await page.locator(seletores).all()

    elementos_visiveis = []
    for i, elemento in enumerate(elementos_encontrados):
        if await elemento.is_visible():
            box = await elemento.bounding_box()
            if box and box['width'] > 0 and box['height'] > 0:
                texto = await elemento.inner_text() or await elemento.get_attribute('aria-label') or await elemento.get_attribute('placeholder')
                elementos_visiveis.append({
                    "label": str(i + 1),
                    "text": texto.strip().replace('\n', ' ') if texto else "",
                    "box": box,
                    "elemento_playwright": elemento
                })

    await page.evaluate("""
        (elementos) => {
            elementos.forEach(el => {
                const box = el.box;
                const label = el.label;
                const numberTag = document.createElement('div');
                numberTag.className = 'agent-overlay';
                numberTag.style.cssText = `
                    position: absolute;
                    left: ${box.x}px;
                    top: ${box.y - 24 < 0 ? box.y + 2 : box.y - 24}px;
                    background-color: red; color: white; padding: 2px 6px;
                    font-size: 14px; font-weight: bold; border-radius: 4px;
                    z-index: 10000; font-family: sans-serif;
                    pointer-events: none;
                `;
                numberTag.textContent = label;
                document.body.appendChild(numberTag);
            });
        }
    """, elementos_visiveis)

    print(f"✅ Percepção concluída. {len(elementos_visiveis)} elementos visíveis anotados.")
    return {"url": page.url, "screenshot_path": screenshot_path, "elementos": elementos_visiveis}

# --- MÓDULO 3: DECISÃO MULTIMODAL ---
async def decidir_proxima_acao_visual(model, chroma_client, estado_tela, objetivo):
    print("🧠 Agente pensando (análise visual)...")
    conhecimento_relevante = ""
    try:
        collection = chroma_client.get_or_create_collection(name="agent_actions")
        query_text = f"O que fazer na tela {estado_tela['url']} para o objetivo '{objetivo}'?"
        results = collection.query(query_texts=[query_text], n_results=3)
        if results and results['documents'] and results['documents'][0]:
            conhecimento_relevante = "\n\nMEMÓRIA (Ações que funcionaram para objetivos similares):\n" + "\n".join(f"- {doc}" for doc in results['documents'][0])
            print("✅ Conhecimento relevante encontrado na memória.")
    except Exception as e:
        print(f"⚠️ Não foi possível consultar a memória de ações: {e}")

    elementos_para_ia = [{"label": e["label"], "text": e["text"]} for e in estado_tela['elementos']]
    elementos_formatados = json.dumps(elementos_para_ia, indent=2, ensure_ascii=False)
    
    prompt = [
        f"""Você é um agente especialista em automação de sistemas ERP.
        Seu objetivo é: "{objetivo}".
        Você está na URL: "{estado_tela['url']}".
        {conhecimento_relevante}
        Analise a imagem da tela. Os elementos interativos estão marcados com rótulos numéricos para sua referência.
        Abaixo está a lista de elementos e seus rótulos correspondentes.

        Elementos (label e texto):
        {elementos_formatados}

        Com base no seu objetivo, na sua memória e no que você vê, liste as 4 ações mais lógicas a serem tomadas.
        Responda APENAS com uma lista JSON de objetos. Cada objeto deve ter as chaves "label" e "action_reasoning".
        """,
        Image.open(estado_tela['screenshot_path'])
    ]
    
    try:
        response = await model.generate_content_async(prompt)
        return json.loads(response.text.strip().replace("```json", "").replace("```", ""))
    except Exception as e:
        print(f"❌ Erro na decisão visual: {e}"); return None

# --- MÓDULO 4: MEMÓRIA E REFLEXÃO ---
async def salvar_micro_conhecimento(chroma_client, estado, acao, objetivo):
    print(f"🧠 Memorizando micro-tarefa...")
    try:
        collection = chroma_client.get_or_create_collection(name="agent_actions")
        tag_name = await acao['elemento_playwright'].evaluate('node => node.tagName.toLowerCase()')
        descricao_acao = f"Para o objetivo '{objetivo}' na tela '{estado['url']}', uma ação útil é interagir com o elemento <{tag_name}> com texto '{acao['text']}'."
        doc_id = f"action-{abs(hash(descricao_acao))}"
        collection.add(ids=[doc_id], documents=[descricao_acao], metadatas=[{"url": estado['url'], "objetivo": objetivo, "texto_elemento": acao['text']}])
        print(f"✅ Micro-tarefa memorizada!")
    except Exception as e:
        print(f"❌ Erro ao memorizar micro-tarefa: {e}")

async def gerar_embedding_para_texto(texto):
    """Gera um único vetor de embedding para um texto."""
    try:
        # Usamos o método direto que a documentação do google-genai provou funcionar
        result = genai.embed_content(
            model=EMBEDDING_MODEL_NAME_AGENT,
            content=texto,
            task_type="RETRIEVAL_DOCUMENT"
        )
        return result['embedding']
    except Exception as e:
        print(f"❌ Erro ao gerar embedding localmente: {e}")
        return None

async def refletir_e_salvar_conhecimento_missao(model, chroma_client, objetivo, historico_de_acoes):
    print("\n🤔 Refletindo sobre a missão concluída...")
    passos = "\n".join([f"- Na tela '{item['estado']}', a ação foi clicar no elemento com texto '{item['acao']}'." for item in historico_de_acoes])
    prompt_reflexao = f"""
    Você é um especialista em criar documentação técnica. A sequência de ações a seguir foi executada com sucesso para atingir o objetivo: "{objetivo}".
    Sequência de Passos Executados: {passos}
    Com base nisso, crie um guia passo a passo claro. Formule uma pergunta que um usuário faria e que seria respondida por este guia. Sugira até 5 tags relevantes.
    Responda APENAS com um objeto JSON com as chaves "pergunta", "resposta" e "tags".
    """
    try:
            response = await model.generate_content_async(prompt_reflexao)
            conhecimento = json.loads(response.text.strip().replace("```json", "").replace("```", ""))
            
            print("💾 Conhecimento gerado. Gerando embedding para o novo conhecimento...")
            
            # --- A CORREÇÃO ESTÁ AQUI ---
            # 1. Geramos o embedding para a resposta (o documento) usando nossa nova função.
            embedding_do_documento = await gerar_embedding_para_texto(conhecimento['resposta'])

            if not embedding_do_documento:
                print("❌ Falha ao gerar embedding. O conhecimento não será salvo.")
                return

            # 2. Conectamos à coleção.
            collection = chroma_client.get_or_create_collection(name="chatbot_documentacao")
            doc_id = f"flux-agent-{abs(hash(conhecimento['pergunta']))}"
            
            # 3. Adicionamos o embedding diretamente ao ChromaDB.
            collection.add(
                ids=[doc_id],
                embeddings=[embedding_do_documento], # <-- Passamos o vetor numérico
                documents=[conhecimento['resposta']],
                metadatas=[{
                    "pergunta": conhecimento['pergunta'],
                    "tags": ", ".join(conhecimento['tags']),
                    "fonte": "Agente FLUX",
                    "visitante": "Aprendizado Automático"
                }]
            )
            # --- FIM DA CORREÇÃO ---
            
            print(f"✅ Conhecimento sobre '{objetivo}' salvo com sucesso no ChromaDB!")
    except Exception as e:
            print(f"❌ Erro durante a reflexão e salvamento: {e}")

EMBEDDING_MODEL_NAME_AGENT = 'text-embedding-004'


# --- ORQUESTRADOR PRINCIPAL ---
async def main():
    decision_model, chroma_client = setup_apis()
    objetivo_inicial = input("\n🎯 Qual é o seu objetivo para esta sessão? ")
    playwright = await async_playwright().start()
    browser = None
    try:
        browser, page = await iniciar_navegador_e_logar(playwright, "https://beta.supplyerp.com.br/login/", "GUILHERMER", "2122", "001")
        historico_de_acoes = []
        feedback_humano = ""
        passo_num = 0
        for _ in range(15):
            passo_num += 1
            estado_atual = await perceber_estado_visual_da_tela(page, f"passo_{passo_num}")
            if not estado_atual['elementos']: print("‼️ Nenhum elemento interativo visível encontrado."); break
            objetivo_com_feedback = f"{objetivo_inicial}\nFeedback: {feedback_humano}"
            opcoes_sugeridas = await decidir_proxima_acao_visual(decision_model, chroma_client, estado_atual, objetivo_com_feedback)
            if not opcoes_sugeridas: print("‼️ IA não conseguiu decidir."); feedback_humano = input("💬 Dica: "); continue
            print("----------------------------------------------------")
            print("🤔 A IA sugere as seguintes ações:")
            for idx, opcao in enumerate(opcoes_sugeridas):
                elemento_correspondente = next((e for e in estado_atual['elementos'] if e['label'] == opcao['label']), None)
                texto_elemento = f"'{elemento_correspondente['text']}'" if elemento_correspondente and elemento_correspondente['text'] else "(elemento sem texto)"
                print(f"  {idx + 1}. Clicar em [{opcao['label']}] {texto_elemento} (Razão: {opcao['action_reasoning']})")
            escolha = input("Escolha uma ação (1-4), 'n' para dica, 's' para sucesso, ou 'exit': ").lower().strip()
            if escolha == 'exit': raise SystemExit("Sessão encerrada.")
            if escolha == 's': print("✅ Missão concluída!"); await refletir_e_salvar_conhecimento_missao(decision_model, chroma_client, objetivo_inicial, historico_de_acoes); break
            if escolha == 'n': feedback_humano = input("💬 Dica: "); continue
            try:
                indice_escolhido = int(escolha) - 1
                if not (0 <= indice_escolhido < len(opcoes_sugeridas)): print("❌ Número fora do intervalo."); continue
                acao_escolhida_pela_ia = opcoes_sugeridas[indice_escolhido]
                elemento_para_executar = next((e for e in estado_atual['elementos'] if e['label'] == acao_escolhida_pela_ia['label']), None)
                if not elemento_para_executar: print(f"❌ Erro: Não encontrou o elemento {acao_escolhida_pela_ia['label']}."); continue
                await salvar_micro_conhecimento(chroma_client, estado_atual, elemento_para_executar, objetivo_inicial)
                feedback_humano = ""
                historico_de_acoes.append({"estado": estado_atual['url'], "acao": elemento_para_executar['text']})
                print(f"🏃 Executando clique no elemento [{elemento_para_executar['label']}]...")
                await elemento_para_executar['elemento_playwright'].click(timeout=7000)
                await page.wait_for_load_state('networkidle', timeout=5000)
                print("✅ Ação executada.")
            except (ValueError, IndexError): print("❌ Entrada inválida."); continue
            except Exception as e: print(f"⚠️  Ação não causou navegação. Erro: {e}")
        else: print("⚠️ Limite de passos atingido.")
    except Exception as e: print(f"\n❌ Ocorreu um erro fatal: {e}")
    finally:
        if browser: await browser.close(); print("\nNavegador fechado.")

if __name__ == '__main__':
    asyncio.run(main())