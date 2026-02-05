export const uid=(p="id")=>`${p}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
export const formatBRL=(n)=>Number(n||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
export const formatDate=(iso)=>{if(!iso)return"—";const d=new Date(iso);return d.toLocaleDateString("pt-BR",{year:"numeric",month:"short",day:"2-digit"})};
export const safeJsonParse=(s,f=null)=>{try{return JSON.parse(s)}catch{return f}};
export const bytesToHuman=(bytes)=>{if(!Number.isFinite(bytes))return"—";const u=["B","KB","MB","GB"];let i=0,b=bytes;while(b>=1024&&i<u.length-1){b/=1024;i++}return`${b.toFixed(i?1:0)} ${u[i]}`};
export const esc=(s)=>String(s??"").replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
export const attr=(s)=>esc(s).replace(/"/g,"&quot;");
