import { CORE_VERSION } from "./core/version.js";
import { BUILD_ID, BUILD_DATE, BUILD_DATETIME } from "./core/build.js";
import { loadDB, exportDB, importDB, resetDB, estimateStorageBytes } from "./core/storage.js";
import { isAdminLogged, loginAdmin, logoutAdmin } from "./core/auth.js";
import { bytesToHuman, esc } from "./core/utils.js";
import { toast as toastFn } from "./ui/toast.js";
import { installPackObject, uninstallPack, listInstalledPacks, listActivePackIds, setActivePacks, parsePackFromJsonText, loadCoreRegistry, loadBundledPack } from "./core/dlcManager.js";

const toasts=document.getElementById("toasts");
const toast=(t,m)=>toastFn(toasts,t,m);
const loginArea=document.getElementById("loginArea");
const dlcArea=document.getElementById("dlcArea");
document.getElementById("coreVersion").textContent=`${CORE_VERSION} • build ${BUILD_ID} • ${BUILD_DATETIME}`;

document.getElementById("btnLogout").addEventListener("click",()=>{logoutAdmin();toast("Ok","Sessão encerrada.");render()});
document.getElementById("btnExportAll").addEventListener("click",()=>{downloadText("evento_legal_admin_export.json",exportDB());toast("Exportado","Arquivo gerado.")});
document.getElementById("fileImportAll").addEventListener("change",async(e)=>{const f=e.target.files?.[0];if(!f)return;const text=await f.text();
try{importDB(text);toast("Importado","Dados carregados.");render()}catch(err){toast("Erro",err.message||"Falha ao importar.")}finally{e.target.value=""}});
document.getElementById("btnReset").addEventListener("click",()=>{resetDB();toast("Reset","Dados locais apagados.");render()});

function downloadText(filename,text){const blob=new Blob([text],{type:"application/json"});const url=URL.createObjectURL(blob);
const a=document.createElement("a");a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),4000);}

async function render(){
const db=loadDB();
document.getElementById("eventCount").textContent=(db.events||[]).length;
document.getElementById("storageUsage").textContent=bytesToHuman(estimateStorageBytes());
if(!isAdminLogged()){
loginArea.innerHTML=`<div class="stack" style="padding:14px;">
<div class="muted">Login padrão (demo): <b>admin / admin</b></div>
<div class="field"><label>Usuário</label><input id="u" placeholder="admin"/></div>
<div class="field"><label>Senha</label><input id="p" type="password" placeholder="admin"/></div>
<button class="pill" id="btnLogin"><span class="i i-shield"></span> Entrar</button>
<p class="muted tiny">⚠️ Em produção: trocar por autenticação real via backend.</p>
</div>`;
document.getElementById("btnLogin").addEventListener("click",()=>{const ok=loginAdmin(document.getElementById("u").value,document.getElementById("p").value);
if(ok){toast("Bem-vindo","Admin autenticado.");render()}else toast("Negado","Credenciais inválidas.")});
dlcArea.innerHTML=`<div class="muted">Faça login para gerenciar DLCs.</div>`;
document.getElementById("dlcCount").textContent=(db.content?.installed||[]).length;
return;
}
loginArea.innerHTML=`<div class="stack" style="padding:14px;"><div class="chip subtle"><span class="dot live"></span> Logado como admin</div>
<div class="muted tiny">Gerencie packs via import/export JSON e ativação.</div></div>`;
await renderDLC();
}

async function renderDLC(){
const installed=listInstalledPacks();const active=new Set(listActivePackIds());
let registry={packs:[]};try{registry=await loadCoreRegistry()}catch{}
document.getElementById("dlcCount").textContent=installed.length;

dlcArea.innerHTML=`<div class="stack" style="padding:0;">
<div class="row">
<label class="pill ghost file" style="flex:1;"><span class="i i-upload"></span> Instalar pack (JSON)<input type="file" id="filePack" accept="application/json"/></label>
<button class="pill ghost" id="btnInstallBundled"><span class="i i-box"></span> Reinstalar embutidos</button>
</div>
<div class="muted tiny">Packs ficam no navegador. Para distribuir, exporte o JSON.</div>
<div class="list" id="packs"></div></div>`;

document.getElementById("btnInstallBundled").addEventListener("click",async()=>{
try{for(const p of (registry.packs||[])){const pack=await loadBundledPack(p.path);installPackObject(pack)}setActivePacks((registry.packs||[]).map(p=>p.id));
toast("Ok","Packs embutidos reinstalados.");render()}catch(err){toast("Erro",err.message||"Falha ao reinstalar.")}});
document.getElementById("filePack").addEventListener("change",async(e)=>{const f=e.target.files?.[0];if(!f)return;const text=await f.text();
try{const pack=parsePackFromJsonText(text);installPackObject(pack);toast("Instalado",pack.name||pack.id);render()}catch(err){toast("Erro",err.message||"Falha ao instalar.")}finally{e.target.value=""}});

const packList=document.getElementById("packs");
packList.innerHTML=installed.map(p=>`<div class="item"><div class="item-row">
<div style="flex:1;"><div class="title">${esc(p.name||p.id)}</div>
<div class="meta">id ${esc(p.id)} • v${esc(p.version)} • ${esc(p.description||"—")}</div></div>
<div class="actions">
<label class="chip subtle" style="cursor:pointer;"><input type="checkbox" data-active="${esc(p.id)}" ${active.has(p.id)?"checked":""} style="accent-color:#22c55e;"><span style="margin-left:8px;">ativo</span></label>
<button class="pill ghost" data-export="${esc(p.id)}"><span class="i i-download"></span></button>
<button class="pill ghost" data-uninstall="${esc(p.id)}"><span class="i i-trash"></span></button>
</div></div></div>`).join("")||`<div class="muted">Nenhum pack instalado.</div>`;

packList.querySelectorAll("[data-active]").forEach(inp=>inp.addEventListener("change",()=>{const id=inp.getAttribute("data-active");if(inp.checked)active.add(id);else active.delete(id);setActivePacks([...active]);toast("Ok","Ativação atualizada.")}));
packList.querySelectorAll("[data-uninstall]").forEach(btn=>btn.addEventListener("click",()=>{const id=btn.getAttribute("data-uninstall");uninstallPack(id);toast("Removido",id);render()}));
packList.querySelectorAll("[data-export]").forEach(btn=>btn.addEventListener("click",()=>{const id=btn.getAttribute("data-export");const p=installed.find(x=>x.id===id);if(!p)return;
downloadText(`dlc_${id}_v${p.version}.json`,JSON.stringify(p,null,2));toast("Exportado","Pack JSON gerado.")}));
}

render();
