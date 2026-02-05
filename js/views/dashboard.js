import { Repo } from "../core/repo.js";
import { formatDate, formatBRL, esc } from "../core/utils.js";
import { pageShell } from "./templates.js";
export function renderDashboard(main,{contentSnap}){
const events=Repo.listEvents();
const planned=events.reduce((s,e)=>s+Number(e.budget?.planned||0),0);
const spent=events.reduce((s,e)=>s+Number(e.budget?.spent||0),0);
main.innerHTML=`${pageShell({title:"Dashboard",subtitle:"Visão geral • pronto para produção"})}
<section class="grid two">
<div class="card"><div class="card-head"><h2>Resumo financeiro</h2><span class="badge info">Beta</span></div>
<div class="stack">
<div class="stat"><div class="stat-label">Planejado</div><div class="stat-value">${formatBRL(planned)}</div></div>
<div class="stat"><div class="stat-label">Gasto</div><div class="stat-value">${formatBRL(spent)}</div></div>
<div class="stat"><div class="stat-label">Saldo</div><div class="stat-value">${formatBRL(planned-spent)}</div></div>
</div></div>
<div class="card"><div class="card-head"><h2>Conteúdo ativo (DLC)</h2><span class="chip subtle"><span class="dot live"></span> ativo</span></div>
<div class="stack"><div class="muted">Tipos de evento:</div>
<div style="display:flex;flex-wrap:wrap;gap:8px;">${(contentSnap.eventTypes||[]).slice(0,10).map(t=>`<span class="badge">${esc(t.name)}</span>`).join("")||`<span class="muted">—</span>`}</div>
<div class="muted tiny">Instale novos packs em <b>Admin</b>.</div></div></div>
</section>
<section class="card" style="margin-top:12px;"><div class="card-head"><h2>Últimos eventos</h2><a class="pill ghost" href="#/events">Abrir</a></div>
<div class="list">${events.slice(0,5).map(e=>`<div class="item"><div class="item-row">
<div><div class="title">${esc(e.title)}</div><div class="meta">${esc(e.status)} • ${formatDate(e.startAt)} • ${esc(e.location||"—")}</div></div>
<div class="actions"><a class="pill ghost" href="#/events?open=${encodeURIComponent(e.id)}">Ver</a></div>
</div></div>`).join("")||`<div class="muted">Nenhum evento ainda.</div>`}</div></section>`;
}
