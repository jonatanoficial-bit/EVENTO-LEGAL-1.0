import { esc } from "../core/utils.js";
export function toast(root,title,message,timeout=3200){
const el=document.createElement("div");el.className="toast";
el.innerHTML=`<div class="t">${esc(title)}</div><div class="m">${esc(message||"")}</div>`;
root.appendChild(el);const t=setTimeout(()=>el.remove(),timeout);
el.addEventListener("click",()=>{clearTimeout(t);el.remove()})}
