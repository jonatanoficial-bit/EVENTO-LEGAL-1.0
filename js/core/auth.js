import { loadDB, saveDB } from "./storage.js";
export const isAdminLogged=()=>Boolean(loadDB().auth?.session?.isAdmin);
export function loginAdmin(user,pass){const db=loadDB();if((user||"").trim()===db.auth.adminUser&&(pass||"")===db.auth.adminPass){db.auth.session={isAdmin:true,at:new Date().toISOString()};saveDB(db);return true}return false}
export function logoutAdmin(){const db=loadDB();db.auth.session=null;saveDB(db)}
