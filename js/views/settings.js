import { loadDB, saveDB, estimateStorageBytes } from "../core/storage.js";
import { bytesToHuman, esc } from "../core/utils.js";
import { pageShell } from "./templates.js";
export function renderSettings(main,{toast}){
const db=loadDB();
main.innerHTML=`${pageShell({title:"Configurações",subtitle:"Preferências • saúde do app"})}
<section class="grid two">
<div class="card"><div class="card-head"><h2>Preferências</h2></div><div class="content">
<div class="field"><label>Moeda</label><select id="setCurrency"><option value="BRL">BRL</option><option value="USD">USD</option><option value="EUR">EUR</option></select></div>
<div style="margin-top:12px;"><button class="pill" id="btnSaveSettings">Salvar</button></div>
</div></div>
<div class="card"><div class="card-head"><h2>Diagnóstico</h2></div><div class="stack">
<div class="stat"><div class="stat-label">Core</div><div class="stat-value">${esc(db.meta?.coreVersion||"—")}</div></div>
<div class="stat"><div class="stat-label">Eventos</div><div class="stat-value">${(db.events||[]).length}</div></div>
<div class="stat"><div class="stat-label">Storage (estim.)</div><div class="stat-value">${bytesToHuman(estimateStorageBytes())}</div></div>
</div></div></section>`;
const sel=document.getElementById("setCurrency");sel.value=db.settings?.currency||"BRL";
document.getElementById("btnSaveSettings").addEventListener("click",()=>{const db=loadDB();db.settings=db.settings||{};db.settings.currency=sel.value;saveDB(db);toast("Ok","Configurações salvas.")});
}
