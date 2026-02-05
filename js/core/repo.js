import { loadDB, saveDB } from "./storage.js";
const touch=(o)=>({...o,updatedAt:new Date().toISOString()});
export const Repo={
listEvents(){return (loadDB().events||[]).slice().sort((a,b)=>(b.updatedAt||"").localeCompare(a.updatedAt||""))},
getEvent(id){return (loadDB().events||[]).find(e=>e.id===id)||null},
upsertEvent(evt){const db=loadDB();db.events=db.events||[];const i=db.events.findIndex(e=>e.id===evt.id);const r=touch(evt);if(i>=0)db.events[i]=r;else db.events.push(r);saveDB(db);return r},
deleteEvent(id){const db=loadDB();db.events=(db.events||[]).filter(e=>e.id!==id);saveDB(db)},
listVendors(){return (loadDB().vendors||[]).slice().sort((a,b)=>(b.updatedAt||"").localeCompare(a.updatedAt||""))},
getVendor(id){return (loadDB().vendors||[]).find(v=>v.id===id)||null},
upsertVendor(v){const db=loadDB();db.vendors=db.vendors||[];const i=db.vendors.findIndex(x=>x.id===v.id);const r=touch(v);if(i>=0)db.vendors[i]=r;else db.vendors.push(r);saveDB(db);return r},
deleteVendor(id){const db=loadDB();db.vendors=(db.vendors||[]).filter(v=>v.id!==id);saveDB(db)},
listTickets(){return (loadDB().tickets||[]).slice().sort((a,b)=>(b.updatedAt||"").localeCompare(a.updatedAt||""))},
upsertTicket(t){const db=loadDB();db.tickets=db.tickets||[];const i=db.tickets.findIndex(x=>x.id===t.id);const r=touch(t);if(i>=0)db.tickets[i]=r;else db.tickets.push(r);saveDB(db);return r},
deleteTicket(id){const db=loadDB();db.tickets=(db.tickets||[]).filter(t=>t.id!==id);saveDB(db)},
listAttendance(){return (loadDB().attendance||[]).slice().sort((a,b)=>(b.updatedAt||"").localeCompare(a.updatedAt||""))},
getAttendance(id){return (loadDB().attendance||[]).find(a=>a.id===id)||null},
upsertAttendance(a){const db=loadDB();db.attendance=db.attendance||[];const i=db.attendance.findIndex(x=>x.id===a.id);const r=touch(a);if(i>=0)db.attendance[i]=r;else db.attendance.push(r);saveDB(db);return r},
deleteAttendance(id){const db=loadDB();db.attendance=(db.attendance||[]).filter(a=>a.id!==id);saveDB(db)},
};
