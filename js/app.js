import { createRouter } from "./core/router.js";
import { loadDB, exportDB, importDB, estimateStorageBytes } from "./core/storage.js";
import { bytesToHuman } from "./core/utils.js";
import { toast as toastFn } from "./ui/toast.js";
import { getContentSnapshot, loadCoreRegistry, loadBundledPack, installPackObject, setActivePacks } from "./core/dlcManager.js";
import { renderDashboard } from "./views/dashboard.js";
import { renderEvents } from "./views/events.js";
import { renderVendors } from "./views/vendors.js";
import { renderTickets } from "./views/tickets.js";
import { renderAttendance } from "./views/attendance.js";
import { renderContent } from "./views/content.js";
import { renderSettings } from "./views/settings.js";

const main=document.getElementById("main");
const drawer=document.getElementById("drawer");
const modalRoot=document.getElementById("modalRoot");
const toasts=document.getElementById("toasts");
const storageStat=document.getElementById("storageStat");
const toast=(t,m)=>toastFn(toasts,t,m);

const openDrawer=()=>drawer.setAttribute("aria-hidden","false");
const closeDrawer=()=>drawer.setAttribute("aria-hidden","true");
document.getElementById("btnMenu").addEventListener("click",openDrawer);
document.getElementById("btnCloseDrawer").addEventListener("click",closeDrawer);
drawer.addEventListener("click",(e)=>{if(e.target===drawer)closeDrawer()});

function updateStorageStat(){storageStat.textContent=`Storage: ${bytesToHuman(estimateStorageBytes())}`;}

document.getElementById("btnQuickAdd").addEventListener("click",()=>{location.hash="#/events";toast("Dica","Abra 'Eventos' e toque em 'Novo evento'.")});
document.getElementById("btnExport").addEventListener("click",()=>{downloadText("eventosAAA_export.json",exportDB());toast("Exportado","JSON gerado.")});
document.getElementById("fileImport").addEventListener("change",async(e)=>{const file=e.target.files?.[0];if(!file)return;const text=await file.text();
try{importDB(text);toast("Importado","Dados carregados.");updateStorageStat();router.render()}catch(err){toast("Erro",err.message||"Falha ao importar.")}finally{e.target.value=""}});

function downloadText(filename,text){const blob=new Blob([text],{type:"application/json"});const url=URL.createObjectURL(blob);
const a=document.createElement("a");a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),4000);}

async function ensureBundledPacksInstalledOnce(){
const db=loadDB();if((db.content?.installed||[]).length>0)return;
try{const reg=await loadCoreRegistry();for(const p of (reg.packs||[])){const pack=await loadBundledPack(p.path);installPackObject(pack)}setActivePacks((reg.packs||[]).map(p=>p.id))}catch{}
}

const router=createRouter({
routes:{
"/dashboard":async()=>{renderDashboard(main,{contentSnap:getContentSnapshot()});closeDrawer();},
"/events":async()=>{renderEvents(main,modalRoot,{contentSnap:getContentSnapshot(),toast,router});closeDrawer();},
"/vendors":async()=>{renderVendors(main,modalRoot,{toast});closeDrawer();},
"/tickets":async()=>{renderTickets(main,modalRoot,{toast});closeDrawer();},
"/attendance":async()=>{renderAttendance(main,modalRoot,{toast});closeDrawer();},
"/content":async()=>{await renderContent(main,{toast});closeDrawer();},
"/settings":async()=>{renderSettings(main,{toast});closeDrawer();},
},
onNotFound:async()=>{location.hash="#/dashboard";}
});

(async function boot(){loadDB();await ensureBundledPacksInstalledOnce();updateStorageStat();router.render();setInterval(updateStorageStat,2500);})();
