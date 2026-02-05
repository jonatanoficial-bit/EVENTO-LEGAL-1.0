import { Repo } from "../core/repo.js";
import { newTicketBatch } from "../core/models.js";
import { pageShell, emptyState } from "./templates.js";
import { openModal, closeModal } from "../ui/modal.js";
import { formatBRL, esc, attr } from "../core/utils.js";
export function renderTickets(main,modalRoot,{toast}){
const events=Repo.listEvents();const tickets=Repo.listTickets();
const right=`<button class="pill" id="btnNewBatch"><span class="i i-plus"></span> Lote</button>`;
main.innerHTML=`${pageShell({title:"Ingressos",subtitle:"Controle por lotes (MVP)",right})}
${tickets.length?`<section class="card" style="margin-top:12px;"><div class="card-head"><h2>Lotes</h2><span class="chip subtle">${tickets.length} itens</span></div><div class="list" id="ticketList"></div></section>`:
emptyState({title:"Nenhum lote de ingresso",hint:"Crie lotes (VIP, Early Bird).",cta:`<button class="pill" id="btnNewBatch2"><span class="i i-plus"></span> Criar lote</button>`})}`;
["btnNewBatch","btnNewBatch2"].forEach(id=>{const b=document.getElementById(id);if(b)b.addEventListener("click",()=>openEditor(null))});
const listEl=document.getElementById("ticketList");
if(listEl){listEl.innerHTML=tickets.map(t=>{const evt=events.find(e=>e.id===t.eventId);
return `<div class="item"><div class="item-row">
<div style="flex:1;"><div class="title">${esc(t.name)}</div><div class="meta">${esc(evt?.title||"—")} • ${formatBRL(t.price||0)} • ${Number(t.sold||0)}/${Number(t.qty||0)}</div></div>
<div class="actions"><button class="pill ghost" data-open="${t.id}">Abrir</button><button class="pill ghost" data-del="${t.id}"><span class="i i-trash"></span></button></div>
</div></div>`}).join("");
listEl.querySelectorAll("[data-open]").forEach(b=>b.addEventListener("click",()=>openEditor(b.getAttribute("data-open"))));
listEl.querySelectorAll("[data-del]").forEach(b=>b.addEventListener("click",()=>{Repo.deleteTicket(b.getAttribute("data-del"));toast("Excluído","Lote removido.");renderTickets(main,modalRoot,{toast})}))}
function openEditor(id){
const isNew=!id;const batch=isNew?newTicketBatch(""):structuredClone(tickets.find(x=>x.id===id));if(!batch)return;
const body=`<div class="field"><label>Evento</label><select id="tEvent"><option value="">— selecione —</option>${events.map(e=>`<option value="${esc(e.id)}">${esc(e.title)}</option>`).join("")}</select></div>
<div class="grid two" style="gap:10px;margin-top:10px;">
<div class="field"><label>Nome do lote</label><input id="tName" value="${attr(batch.name)}"/></div>
<div class="field"><label>Preço</label><input id="tPrice" type="number" value="${Number(batch.price||0)}"/></div>
</div>
<div class="grid two" style="gap:10px;margin-top:10px;">
<div class="field"><label>Quantidade</label><input id="tQty" type="number" value="${Number(batch.qty||0)}"/></div>
<div class="field"><label>Vendidos</label><input id="tSold" type="number" value="${Number(batch.sold||0)}"/></div>
</div>`;
openModal(modalRoot,{title:isNew?"Novo lote":"Editar lote",body,actions:[
{label:"Cancelar",className:"pill ghost",onClick:()=>closeModal(modalRoot)},
{label:"Salvar",className:"pill",onClick:()=>save()},
]});
document.getElementById("tEvent").value=batch.eventId||"";
function save(){
batch.eventId=document.getElementById("tEvent").value||"";
batch.name=document.getElementById("tName").value.trim()||"Lote";
batch.price=Number(document.getElementById("tPrice").value||0);
batch.qty=Number(document.getElementById("tQty").value||0);
batch.sold=Number(document.getElementById("tSold").value||0);
Repo.upsertTicket(batch);closeModal(modalRoot);toast("Salvo","Lote atualizado.");renderTickets(main,modalRoot,{toast})}
}
}
