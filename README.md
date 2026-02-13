# Evento Legal (vanilla) — Mobile-first • Premium • Expansível

App leve (HTML + CSS + JS puro) para **criar e gerenciar eventos** do início ao fim:
**pré-produção → execução → pós-produção**, com módulos de **fornecedores/cotações**, **ingressos** e **lista de presença**.

Versão: **0.2.1-alpha** • Build: **20260213-135511** • Atualizado: **2026-02-13 13:55:11**

## Rodar local (recomendado)
Use servidor local para `fetch()` funcionar.

### Python
```bash
python -m http.server 5173
```
Acesse: `http://localhost:5173`

### Node
```bash
npx serve .
```

## GitHub Pages
1. Suba para um repositório
2. Settings → Pages → Deploy from a branch (main / root)
3. Abra a URL do Pages

## Admin
Abra `admin.html`  
Login demo: **admin / admin**

## DLC / Conteúdo modular
- `content/registry.json` lista packs embutidos
- packs embutidos: `content/core/*.json`
- packs importados via Admin ficam no navegador (localStorage)

## Regras (importante)
Este projeto é entregue sempre como **ZIP completo** em cada etapa.


## Builds e atualizações
- **v0.1.0-alpha** — build inicial (entrega 1)
- **v0.2.0-alpha** — build **20260205-153516** — atualizado em **2026-02-05** (entrega 2: Kanban + dependências)


## Progresso
- **Conclusão estimada do projeto (visão "simulador premium mundial"): 42%**
