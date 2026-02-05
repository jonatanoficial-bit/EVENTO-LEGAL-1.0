import { esc } from "../core/utils.js";
export function openModal(root,{title="Modal",body="",actions=[]}){
root.setAttribute("aria-hidden","false");
root.innerHTML=`<div class="modal-backdrop" data-close></div>
<div class="modal" role="dialog" aria-modal="true" aria-label="${esc(title)}">
  <div class="modal-head"><div class="modal-title">${esc(title)}</div>
    <button class="icon-btn" data-close aria-label="Fechar"><span class="i i-x"></span></button>
  </div>
  <div class="modal-body">${body}</div>
  <div class="modal-foot" id="modalFoot"></div>
</div>`;
const foot=root.querySelector("#modalFoot");
for(const a of actions){const b=document.createElement("button");b.className=a.className||"pill ghost";b.textContent=a.label||"Ok";b.addEventListener("click",()=>a.onClick?.());foot.appendChild(b)}
const close=()=>closeModal(root);root.querySelectorAll("[data-close]").forEach(x=>x.addEventListener("click",close));
document.addEventListener("keydown",(e)=>{if(e.key==="Escape")close()},{once:true});
return{close}}
export function closeModal(root){root.setAttribute("aria-hidden","true");root.innerHTML=""}
