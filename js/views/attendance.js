import { Repo } from "../core/repo.js";
import { newAttendanceList, newAttendancePerson } from "../core/models.js";
import { pageShell, emptyState } from "./templates.js";
import { openModal, closeModal } from "../ui/modal.js";
import { esc, attr } from "../core/utils.js";
export function renderAttendance(main,modalRoot,{toast}){
const params=new URLSearchParams(location.hash.split("?")[1]||"");const eventId=params.get("event");
const events=Repo.listEvents();const evt=eventId?events.find(e=>e.id===eventId):null;
let lists=Repo.listAttendance();
if(evt && !lists.find(l=>l.eventId===evt.id)){Repo.upsertAttendance(newAttendanceList(evt.id));lists=Repo.listAttendance()}
const right=`<button class="pill" id="btnNewList"><span class="i i-plus"></span> Lista</button>`;
main.innerHTML=`${pageShell({title:"Lista de presença",subtitle:"Check-in rápido (MVP)",right})}
${lists.length?`<section class="card" style="margin-top:12px;"><div class="card-head"><h2>Listas</h2><span class="chip subtle">${lists.length} itens</span></div><div class="list" id="attList"></div></section>`:
emptyState({title:"Nenhuma lista criada",hint:"Crie uma lista por evento e faça check-in no dia.",cta:`<button class="pill" id="btnNewList2"><span class="i i-plus"></span> Criar lista</button>`})}`;
["btnNewList","btnNewList2"].forEach(id=>{const b=document.getElementById(id);if(b)b.addEventListener("click",()=>openEditor(null))});
const listEl=document.getElementById("attList");
if(listEl){listEl.innerHTML=lists.map(l=>{const e=events.find(x=>x.id===l.eventId);const checked=(l.items||[]).filter(p=>p.checkedInAt).length;const total=(l.items||[]).length;
return `<div class="item"><div class="item-row">
<div style="flex:1;"><div class="title">${esc(l.name)}</div><div class="meta">${esc(e?.title||"—")} • ${checked}/${total} presentes</div></div>
<div class="actions"><button class="pill ghost" data-open="${l.id}">Abrir</button><button class="pill ghost" data-del="${l.id}"><span class="i i-trash"></span></button></div>
</div></div>`}).join("");
listEl.querySelectorAll("[data-open]").forEach(b=>b.addEventListener("click",()=>openEditor(b.getAttribute("data-open"))));
listEl.querySelectorAll("[data-del]").forEach(b=>b.addEventListener("click",()=>{Repo.deleteAttendance(b.getAttribute("data-del"));toast("Excluído","Lista removida.");renderAttendance(main,modalRoot,{toast})}))}
function openEditor(id){
const isNew=!id;const list=isNew?newAttendanceList(eventId||""):structuredClone(Repo.getAttendance(id));if(!list)return;
const body=`<div class="field"><label>Evento</label><select id="aEvent"><option value="">— selecione —</option>${events.map(e=>`<option value="${esc(e.id)}">${esc(e.title)}</option>`).join("")}</select></div>
<div class="field" style="margin-top:10px;"><label>Nome da lista</label><input id="aName" value="${attr(list.name)}"/></div>
<hr class="sep">
<div class="row" style="justify-content:space-between;align-items:center;"><div class="title">Pessoas</div>
<button class="pill ghost" id="btnAddPerson"><span class="i i-plus"></span> Adicionar</button></div>
<div class="stack" style="padding:0;margin-top:10px;" id="peopleWrap"></div>`;
openModal(modalRoot,{title:isNew?"Nova lista":"Editar lista",body,actions:[
{label:"Fechar",className:"pill ghost",onClick:()=>closeModal(modalRoot)},
{label:"Salvar",className:"pill",onClick:()=>save()},
]});
document.getElementById("aEvent").value=list.eventId||"";
document.getElementById("btnAddPerson").addEventListener("click",()=>{list.items=list.items||[];list.items.push(newAttendancePerson());renderPeople()});
renderPeople();
function renderPeople(){
const wrap=document.getElementById("peopleWrap");const items=list.items||[];
if(!items.length){wrap.innerHTML=`<div class="muted">Nenhuma pessoa na lista.</div>`;return}
wrap.innerHTML=items.map(p=>`<div class="item"><div class="item-row">
<div style="flex:1;">
<div class="row" style="align-items:center;">
<label class="chip subtle" style="cursor:pointer;flex:0 0 auto;"><input type="checkbox" data-check="${p.id}" ${p.checkedInAt?"checked":""} style="accent-color:#22c55e;"><span style="margin-left:8px;">presente</span></label>
<input data-name="${p.id}" value="${attr(p.name)}" placeholder="Nome completo"/></div>
<div class="grid two" style="gap:10px;margin-top:8px;">
<div class="field"><label>Documento</label><input data-doc="${p.id}" value="${attr(p.doc||"")}"/></div>
<div class="field"><label>Telefone</label><input data-phone="${p.id}" value="${attr(p.phone||"")}"/></div>
</div>
<div class="field" style="margin-top:8px;"><label>E-mail</label><input data-email="${p.id}" value="${attr(p.email||"")}"/></div>
</div><div class="actions"><button class="pill ghost" data-del="${p.id}"><span class="i i-trash"></span></button></div>
</div></div>`).join("");
wrap.querySelectorAll("[data-check]").forEach(x=>x.addEventListener("change",()=>{const id=x.getAttribute("data-check");const pp=items.find(z=>z.id===id);if(pp)pp.checkedInAt=x.checked?new Date().toISOString():null}));
["name","doc","phone","email"].forEach(k=>wrap.querySelectorAll(`[data-${k}]`).forEach(x=>x.addEventListener("input",()=>{const id=x.getAttribute(`data-${k}`);const pp=items.find(z=>z.id===id);if(pp)pp[k]=x.value})));
wrap.querySelectorAll("[data-del]").forEach(b=>b.addEventListener("click",()=>{const id=b.getAttribute("data-del");list.items=items.filter(p=>p.id!==id);renderPeople()}));
}
function save(){list.eventId=document.getElementById("aEvent").value||"";list.name=document.getElementById("aName").value.trim()||"Lista";
Repo.upsertAttendance(list);closeModal(modalRoot);toast("Salvo","Lista atualizada.");renderAttendance(main,modalRoot,{toast})}
}
}
