import { loadDB, saveDB } from "./storage.js";
import { uid, safeJsonParse } from "./utils.js";
export async function loadCoreRegistry(){const r=await fetch("./content/registry.json",{cache:"no-store"});if(!r.ok)throw new Error("Falha registry.");return await r.json()}
export async function loadBundledPack(path){const r=await fetch(path,{cache:"no-store"});if(!r.ok)throw new Error("Falha pack.");return await r.json()}
export function listInstalledPacks(){return loadDB().content?.installed||[]}
export function listActivePackIds(){return loadDB().content?.active||[]}
export function setActivePacks(ids){const db=loadDB();db.content.active=Array.from(new Set(ids));saveDB(db)}
export function installPackObject(pack){if(!pack?.id||!pack?.version)throw new Error("Pack inválido (id/version).");
const db=loadDB();db.content.installed=db.content.installed||[];
const i=db.content.installed.findIndex(p=>p.id===pack.id);
const stored={...pack,installedAt:new Date().toISOString(),_localId:pack._localId||uid("pack")};
if(i>=0)db.content.installed[i]=stored;else db.content.installed.push(stored);
db.content.active=Array.from(new Set([...(db.content.active||[]),pack.id]));saveDB(db)}
export function uninstallPack(id){const db=loadDB();db.content.installed=(db.content.installed||[]).filter(p=>p.id!==id);db.content.active=(db.content.active||[]).filter(x=>x!==id);saveDB(db)}
export function parsePackFromJsonText(text){const p=safeJsonParse(text,null);if(!p||typeof p!=="object")throw new Error("JSON inválido.");return p}
export function getContentSnapshot(){const db=loadDB();const active=new Set(db.content?.active||[]);
const packs=(db.content?.installed||[]).filter(p=>active.has(p.id));
const snap={eventTypes:[],meta:{activePackIds:[...active]}};
for(const p of packs){if(Array.isArray(p.data?.eventTypes))snap.eventTypes.push(...p.data.eventTypes.map(x=>({...x,_packId:p.id})))}
return snap}
