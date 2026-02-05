import { Repo } from "../core/repo.js";
import { newVendor, newQuote } from "../core/models.js";
import { pageShell, emptyState } from "./templates.js";
import { openModal, closeModal } from "../ui/modal.js";
import { formatBRL, esc, attr } from "../core/utils.js";
export function renderVendors(main,modalRoot,{toast}){
const vendors=Repo.listVendors();const right=`<button class="pill" id="btnCreateVendor"><span class="i i-plus"></span> Fornecedor</button>`;
main.innerHTML=`${pageShell({title:"Fornecedores & Cotações",subtitle:"Centralize contatos e propostas",right})}
${vendors.length?`<section class="card" style="margin-top:12px;"><div class="card-head"><h2>Fornecedores</h2><span class="chip subtle">${vendors.length} itens</span></div><div class="list" id="vendorList"></div></section>`:
emptyState({title:"Nenhum fornecedor cadastrado",hint:"Adicione fornecedores, registre cotações e associe a eventos.",cta:`<button class="pill" id="btnCreateVendor2"><span class="i i-plus"></span> Adicionar fornecedor</button>`})}`;
["btnCreateVendor","btnCreateVendor2"].forEach(id=>{const b=document.getElementById(id);if(b)b.addEventListener("click",()=>openEditor(null))});
const listEl=document.getElementById("vendorList");
if(listEl){listEl.innerHTML=vendors.map(v=>`<div class="item"><div class="item-row">
<div><div class="title">${esc(v.name)}</div><div class="meta">${esc(v.category)} • ${esc(v.contacts?.phone||"—")} • ${esc(v.contacts?.email||"—")}</div></div>
<div class="actions"><button class="pill ghost" data-open="${v.id}">Abrir</button><button class="pill ghost" data-del="${v.id}"><span class="i i-trash"></span></button></div>
</div></div>`).join("");
listEl.querySelectorAll("[data-open]").forEach(b=>b.addEventListener("click",()=>openEditor(b.getAttribute("data-open"))));
listEl.querySelectorAll("[data-del]").forEach(b=>b.addEventListener("click",()=>{Repo.deleteVendor(b.getAttribute("data-del"));toast("Excluído","Fornecedor removido.");renderVendors(main,modalRoot,{toast})}))}
function openEditor(id){
const isNew=!id;const vendor=isNew?newVendor():structuredClone(Repo.getVendor(id));if(!vendor)return;
const body=`<div class="grid two" style="gap:10px;">
<div class="field"><label>Nome</label><input id="vName" value="${attr(vendor.name)}"/></div>
<div class="field"><label>Categoria</label><input id="vCat" value="${attr(vendor.category)}" placeholder="Buffet, Foto, Som..."/></div>
</div>
<div class="grid two" style="gap:10px;margin-top:10px;">
<div class="field"><label>Telefone</label><input id="vPhone" value="${attr(vendor.contacts?.phone||"")}"/></div>
<div class="field"><label>E-mail</label><input id="vEmail" value="${attr(vendor.contacts?.email||"")}"/></div>
</div>
<div class="field" style="margin-top:10px;"><label>Notas</label><textarea id="vNotes">${esc(vendor.notes||"")}</textarea></div>
<hr class="sep">
<div class="row" style="justify-content:space-between;align-items:center;">
<div class="title">Cotações</div><button class="pill ghost" id="btnAddQuote"><span class="i i-plus"></span> Cotação</button></div>
<div class="stack" style="padding:0;margin-top:10px;" id="quoteList"></div>`;
openModal(modalRoot,{title:isNew?"Novo fornecedor":"Editar fornecedor",body,actions:[
{label:"Fechar",className:"pill ghost",onClick:()=>closeModal(modalRoot)},
{label:"Salvar",className:"pill",onClick:()=>save()},
]});
document.getElementById("btnAddQuote").addEventListener("click",()=>{vendor.quotes=vendor.quotes||[];vendor.quotes.push(newQuote(vendor.id));renderQuotes()});
renderQuotes();
function renderQuotes(){
const wrap=document.getElementById("quoteList");const quotes=vendor.quotes||[];
if(!quotes.length){wrap.innerHTML=`<div class="muted">Nenhuma cotação registrada.</div>`;return}
wrap.innerHTML=quotes.map(q=>`<div class="item"><div class="item-row">
<div style="flex:1;">
<input data-t="${q.id}" value="${attr(q.title)}"/>
<div class="row" style="margin-top:8px;">
<div class="field"><label>Valor</label><input data-a="${q.id}" type="number" value="${Number(q.amount||0)}"/></div>
<div class="field"><label>Status</label><select data-s="${q.id}"><option value="aberta">Aberta</option><option value="aprovada">Aprovada</option><option value="rejeitada">Rejeitada</option></select></div>
</div>
<div class="field" style="margin-top:8px;"><label>Detalhes</label><textarea data-d="${q.id}">${esc(q.details||"")}</textarea></div>
</div>
<div class="actions"><span class="badge info">${formatBRL(q.amount||0)}</span><button class="pill ghost" data-del="${q.id}"><span class="i i-trash"></span></button></div>
</div></div>`).join("");
wrap.querySelectorAll("[data-t]").forEach(x=>x.addEventListener("input",()=>{const qq=quotes.find(z=>z.id===x.getAttribute("data-t"));if(qq)qq.title=x.value}));
wrap.querySelectorAll("[data-a]").forEach(x=>x.addEventListener("input",()=>{const qq=quotes.find(z=>z.id===x.getAttribute("data-a"));if(qq)qq.amount=Number(x.value||0)}));
wrap.querySelectorAll("[data-s]").forEach(x=>{const qq=quotes.find(z=>z.id===x.getAttribute("data-s"));if(qq)x.value=qq.status||"aberta";x.addEventListener("change",()=>{const qq=quotes.find(z=>z.id===x.getAttribute("data-s"));if(qq)qq.status=x.value})});
wrap.querySelectorAll("[data-d]").forEach(x=>x.addEventListener("input",()=>{const qq=quotes.find(z=>z.id===x.getAttribute("data-d"));if(qq)qq.details=x.value}));
wrap.querySelectorAll("[data-del]").forEach(b=>b.addEventListener("click",()=>{const id=b.getAttribute("data-del");vendor.quotes=quotes.filter(q=>q.id!==id);renderQuotes()}));
}
function save(){
vendor.name=document.getElementById("vName").value.trim()||"Fornecedor";
vendor.category=document.getElementById("vCat").value.trim()||"Geral";
vendor.contacts=vendor.contacts||{};
vendor.contacts.phone=document.getElementById("vPhone").value.trim();
vendor.contacts.email=document.getElementById("vEmail").value.trim();
vendor.notes=document.getElementById("vNotes").value;
Repo.upsertVendor(vendor);closeModal(modalRoot);toast("Salvo",vendor.name);renderVendors(main,modalRoot,{toast})}
}
}
