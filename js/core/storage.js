import { safeJsonParse } from "./utils.js";import { CORE_VERSION } from "./version.js";
const KEY="eventosAAA::db";
const defaultDB=()=>({meta:{coreVersion:CORE_VERSION,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()},
auth:{adminUser:"admin",adminPass:"admin",session:null},content:{installed:[],active:[]},
events:[],vendors:[],tickets:[],attendance:[],settings:{currency:"BRL"}});
export function loadDB(){const raw=localStorage.getItem(KEY);if(!raw){const db=defaultDB();saveDB(db);return db}
const p=safeJsonParse(raw,null);if(!p||typeof p!=="object"){const db=defaultDB();saveDB(db);return db}
p.meta=p.meta||{};p.meta.coreVersion=p.meta.coreVersion||CORE_VERSION;return p}
export function saveDB(db){db.meta=db.meta||{};db.meta.updatedAt=new Date().toISOString();localStorage.setItem(KEY,JSON.stringify(db))}
export function resetDB(){localStorage.removeItem(KEY)}
export const estimateStorageBytes=()=>new Blob([localStorage.getItem(KEY)||""]).size;
export const exportDB=()=>JSON.stringify(loadDB(),null,2);
export function importDB(text){const p=safeJsonParse(text,null);if(!p||typeof p!=="object")throw new Error("JSON inválido.");localStorage.setItem(KEY,JSON.stringify(p));return loadDB()}
