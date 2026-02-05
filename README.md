# Eventos AAA (vanilla) — Mobile-first • Premium • Expansível

App leve (HTML + CSS + JS puro) para **criar e gerenciar eventos** do início ao fim:
**pré-produção → execução → pós-produção**, com módulos de **fornecedores/cotações**, **ingressos** e **lista de presença**.

Versão: **0.1.0-alpha** • Data: 2026-02-05

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
