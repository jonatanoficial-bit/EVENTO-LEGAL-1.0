import { loadCoreRegistry, listInstalledPacks, listActivePackIds, setActivePacks } from "../core/dlcManager.js";
import { pageShell } from "./templates.js";import { esc } from "../core/utils.js";
export async function renderContent(main,{toast}){
main.innerHTML=`${pageShell({title:"Conteúdo (DLC)",subtitle:"Templates carregados dinamicamente"})}`;
const [registry,installed,active]=await Promise.all([loadCoreRegistry().catch(()=>({packs:[]})),Promise.resolve(listInstalledPacks()),Promise.resolve(listActivePackIds())]);
const activeSet=new Set(active||[]);
const cards=[];
for(const p of (registry.packs||[])){
cards.push(card(p,activeSet.has(p.id)));
}
for(const p of installed){if((registry.packs||[]).some(x=>x.id===p.id))continue;cards.push(card(p,activeSet.has(p.id),true));}
main.innerHTML+=`<section class="card" style="margin-top:12px;"><div class="card-head"><h2>Packs</h2><span class="chip subtle"><span class="dot live"></span> modular</span></div>
<div class="list" id="packList">${cards.join("")||`<div class="muted">Sem packs.</div>`}</div>
<div class="content" style="padding-top:0;"><div class="muted tiny">Para instalar packs (JSON), use o <b>Admin</b>.</div></div></section>`;
document.querySelectorAll("[data-toggle]").forEach(inp=>inp.addEventListener("change",()=>{
const id=inp.getAttribute("data-toggle");if(inp.checked)activeSet.add(id);else activeSet.delete(id);
setActivePacks([...activeSet]);toast("Atualizado","Conteúdo ativo alterado.");}));
}
function card(p,on,imported=false){return `<div class="item"><div class="item-row">
<div style="flex:1;"><div class="title">${esc(p.name||p.id)} ${imported?`<span class="badge info">importado</span>`:""}</div>
<div class="meta">v${esc(p.version)} • ${esc(p.description||"—")}</div></div>
<div class="actions"><label class="chip subtle" style="cursor:pointer;"><input type="checkbox" data-toggle="${esc(p.id)}" ${on?"checked":""} style="accent-color:#22c55e;"><span style="margin-left:8px;">ativo</span></label></div>
</div></div>`}
