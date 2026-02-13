import { Repo } from "../core/repo.js";
import { newEvent, newTask, newAttendanceList } from "../core/models.js";
import { formatDate, formatBRL, esc, attr } from "../core/utils.js";
import { pageShell, emptyState } from "./templates.js";
import { openModal, closeModal } from "../ui/modal.js";

export function renderEvents(main, modalRoot,{contentSnap,toast,router}){
const params=new URLSearchParams((location.hash.split("?")[1]||""));const openId=params.get("open");
const events=Repo.listEvents();const typeMap=new Map((contentSnap.eventTypes||[]).map(t=>[t.typeId,t]));
const right=`<button class="pill" id="btnCreateEvent"><span class="i i-plus"></span> Novo evento</button>`;
main.innerHTML=`${pageShell({title:"Eventos",subtitle:"Pré • Execução • Pós",right})}
${events.length?`<section class="card" style="margin-top:12px;"><div class="card-head"><h2>Lista</h2><span class="chip subtle">${events.length} itens</span></div><div class="list" id="eventList"></div></section>`:
emptyState({title:"Nenhum evento criado",hint:"Crie um evento e use templates DLC.",cta:`<button class="pill" id="btnCreateEvent2"><span class="i i-plus"></span> Criar evento</button>`})}`;
["btnCreateEvent","btnCreateEvent2"].forEach(id=>{const b=document.getElementById(id);if(b)b.addEventListener("click",()=>openEditor(null))});
const listEl=document.getElementById("eventList");
if(listEl){
listEl.innerHTML=events.map(e=>{const t=typeMap.get(e.typeId);
const badge=e.status==="finalizado"?"ok":(e.status==="em_andamento"?"warn":"info");
return `<div class="item"><div class="item-row">
<div><div class="title">${esc(e.title)}</div>
<div class="meta"><span class="badge ${badge}">${esc(e.status)}</span> <span class="badge">${esc(t?.name||"Genérico")}</span>
<span class="badge">Início: ${formatDate(e.startAt)}</span> <span class="badge">Budget: ${formatBRL(e.budget?.planned||0)}</span></div></div>
<div class="actions"><button class="pill ghost" data-open="${e.id}">Abrir</button><button class="pill ghost" data-del="${e.id}"><span class="i i-trash"></span></button></div>
</div></div>`}).join("");
listEl.querySelectorAll("[data-open]").forEach(b=>b.addEventListener("click",()=>openEditor(b.getAttribute("data-open"))));
listEl.querySelectorAll("[data-del]").forEach(b=>b.addEventListener("click",()=>{Repo.deleteEvent(b.getAttribute("data-del"));toast("Excluído","Evento removido.");renderEvents(main,modalRoot,{contentSnap,toast,router});}));
}
if(openId)openEditor(openId);

function openEditor(id){
const isNew=!id;const evt=isNew?newEvent():structuredClone(Repo.getEvent(id));if(!evt)return;
if(isNew){
const preferred=(contentSnap.eventTypes||[]).find(x=>x.typeId==="generic")||(contentSnap.eventTypes||[])[0];
if(preferred?.defaultTasks){evt.typeId=preferred.typeId||evt.typeId;
evt.phases.pre.tasks=preferred.defaultTasks.filter(x=>x.phase==="pre").map(x=>({...newTask(x.title)}));
evt.phases.exec.tasks=preferred.defaultTasks.filter(x=>x.phase==="exec").map(x=>({...newTask(x.title)}));
evt.phases.post.tasks=preferred.defaultTasks.filter(x=>x.phase==="post").map(x=>({...newTask(x.title)}));}
}
const typeOptions=(contentSnap.eventTypes||[]).map(t=>`<option value="${esc(t.typeId)}">${esc(t.name)}</option>`).join("");
const body=`<div class="grid two" style="gap:10px;">
<div class="field"><label>Nome</label><input id="evtTitle" value="${attr(evt.title)}"/></div>
<div class="field"><label>Tipo (template)</label><select id="evtType"><option value="generic">Genérico</option>${typeOptions}</select></div>
</div>
<div class="grid two" style="gap:10px;margin-top:10px;">
<div class="field"><label>Início</label><input id="evtStart" type="datetime-local" value="${attr(evt.startAt)}"/></div>
<div class="field"><label>Fim</label><input id="evtEnd" type="datetime-local" value="${attr(evt.endAt)}"/></div>
</div>
<div class="field" style="margin-top:10px;"><label>Local</label><input id="evtLoc" value="${attr(evt.location)}"/></div>
<div class="grid two" style="gap:10px;margin-top:10px;">
<div class="field"><label>Budget planejado</label><input id="evtPlanned" type="number" value="${Number(evt.budget?.planned||0)}"/></div>
<div class="field"><label>Gasto</label><input id="evtSpent" type="number" value="${Number(evt.budget?.spent||0)}"/></div>
</div>
<div class="field" style="margin-top:10px;"><label>Notas</label><textarea id="evtNotes">${esc(evt.notes||"")}</textarea></div>
<hr class="sep">
${tasksUI("Pré-produção","pre")}${tasksUI("Execução","exec")}${tasksUI("Pós-produção","post")}
<hr class="sep">
<div class="grid two" style="gap:10px;">
<div class="card" style="box-shadow:none;"><div class="card-head"><h2>Ingressos</h2><span class="badge info">MVP</span></div>
<div class="content"><div class="row"><label class="chip subtle" style="cursor:pointer;flex:0 0 auto;"><input type="checkbox" id="tktEnabled" ${evt.tickets?.enabled?"checked":""} style="accent-color:#06b6d4;"><span style="margin-left:8px;">Ativar</span></label>
<div class="field" style="flex:1;"><label>Capacidade</label><input id="tktCap" type="number" value="${Number(evt.tickets?.capacity||0)}"/></div></div></div></div>
<div class="card" style="box-shadow:none;"><div class="card-head"><h2>Presença</h2><span class="badge info">MVP</span></div>
<div class="content"><div class="row"><label class="chip subtle" style="cursor:pointer;flex:0 0 auto;"><input type="checkbox" id="attEnabled" ${evt.attendance?.enabled?"checked":""} style="accent-color:#22c55e;"><span style="margin-left:8px;">Ativar</span></label>
<button class="pill ghost" id="btnOpenAttendance">Abrir lista</button></div></div></div>
</div>`;
openModal(modalRoot,{title:isNew?"Criar evento":"Editar evento",body,actions:[
{label:"Cancelar",className:"pill ghost",onClick:()=>closeModal(modalRoot)},
{label:"Salvar",className:"pill",onClick:()=>save()},
]});
document.getElementById("evtType").value=evt.typeId||"generic";
["pre","exec","post"].forEach(ph=>{document.getElementById(`add_${ph}`).addEventListener("click",()=>{evt.phases[ph].tasks.push(newTask("Nova tarefa"));renderTasks(ph)});renderTasks(ph)});
document.getElementById("btnOpenAttendance").addEventListener("click",()=>{
if(!evt.attendance?.listId){const list=newAttendanceList(evt.id);evt.attendance=evt.attendance||{};evt.attendance.listId=list.id}
closeModal(modalRoot);router.navigate(`/attendance?event=${encodeURIComponent(evt.id)}`)});
function tasksUI(label,ph){
  return `<div class="card" style="box-shadow:none;margin-top:10px;">
    <div class="card-head">
      <h2>${esc(label)}</h2>
      <div class="tabs" role="tablist" aria-label="Modo de visualização">
        <button class="tab" data-tab="${ph}:list" aria-selected="true">Lista</button>
        <button class="tab" data-tab="${ph}:kanban" aria-selected="false">Kanban</button>
        <button class="pill ghost tiny" id="add_${ph}"><span class="i i-plus"></span> Tarefa</button>
      </div>
    </div>
    <div class="content" id="tasks_${ph}"></div>
  </div>`;
}

function depsSatisfied(task, allTasks){
  const deps = Array.isArray(task.dependsOn) ? task.dependsOn : [];
  if(!deps.length) return true;
  return deps.every(id => allTasks.find(t => t.id===id)?.done);
}

function renderTasks(ph){
  const wrap=document.getElementById(`tasks_${ph}`);
  const tasks=evt.phases?.[ph]?.tasks||[];
  const mode = (evt._ui?.[ph]) || "list";

  const doneCount = tasks.filter(t=>t.done).length;
  const pct = tasks.length? Math.round((doneCount/tasks.length)*100):0;

  const header = `<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px;">
    <div class="badge info">${doneCount}/${tasks.length} concluídas • ${pct}%</div>
    <div class="progress" style="flex:1;max-width:340px;"><div style="width:${pct}%;"></div></div>
  </div>`;

  const setTab=(next)=>{
    evt._ui = evt._ui || {};
    evt._ui[ph]=next;
    wrap.querySelectorAll(`[data-tab^="${ph}:"]`).forEach(b=>b.setAttribute("aria-selected", b.getAttribute("data-tab")===`${ph}:${next}` ? "true":"false"));
    renderTasks(ph);
  };

  if(!tasks.length){
    wrap.innerHTML = header + `<div class="muted">Nenhuma tarefa.</div>`;
    return;
  }

  wrap.innerHTML = header + `<div id="modeWrap"></div>`;
  const modeWrap=wrap.querySelector("#modeWrap");
  // tabs (re-rendered each time)
  const tabs=wrap.closest(".card").querySelectorAll(`[data-tab^="${ph}:"]`);
  tabs.forEach(b=>{
    b.onclick=()=>setTab(b.getAttribute("data-tab").split(":")[1]);
    b.setAttribute("aria-selected", b.getAttribute("data-tab")===`${ph}:${mode}` ? "true":"false");
  });

  if(mode==="kanban"){
    const todo=tasks.filter(t=>!t.done);
    const done=tasks.filter(t=>t.done);

    const renderCard=(t)=>{
      const blocked=!depsSatisfied(t,tasks);
      const depLabel = (t.dependsOn?.length? `• deps: ${t.dependsOn.length}`:"");
      const pr = t.priority==="alta" ? "warn" : (t.priority==="baixa" ? "" : "info");
      return `<div class="cardlet" draggable="true" data-drag="${t.id}">
        <div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start;">
          <div style="flex:1;">
            <div style="font-weight:900;">${esc(t.title||"Tarefa")}</div>
            <div class="meta">${esc(t.assignee||"")} ${t.dueAt?("• "+formatDate(t.dueAt)):""} ${depLabel}</div>
          </div>
          <div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end;">
            <span class="badge ${pr}">${esc(t.priority||"normal")}</span>
            ${blocked?`<span class="badge warn">bloqueada</span>`:""}
          </div>
        </div>
      </div>`;
    };

    modeWrap.innerHTML = `
      <div class="kanban">
        <div class="kcol" data-drop="${ph}:todo">
          <div class="khead"><div class="kttl">A fazer</div><span class="badge">${todo.length}</span></div>
          <div class="stack" style="padding:0;" id="k_${ph}_todo">${todo.map(renderCard).join("")}</div>
        </div>
        <div class="kcol" data-drop="${ph}:done">
          <div class="khead"><div class="kttl">Feito</div><span class="badge ok">${done.length}</span></div>
          <div class="stack" style="padding:0;" id="k_${ph}_done">${done.map(renderCard).join("")}</div>
        </div>
      </div>
      <div class="muted tiny" style="margin-top:10px;">Arraste cards entre colunas. Duplo clique alterna (respeita dependências).</div>
    `;

    wrap.querySelectorAll("[data-drag]").forEach(el=>{
      el.addEventListener("dragstart",(e)=>e.dataTransfer.setData("text/plain", el.getAttribute("data-drag")));
      el.addEventListener("dblclick",()=>{
        const id=el.getAttribute("data-drag"); const tt=tasks.find(z=>z.id===id);
        if(tt){ if(!tt.done && !depsSatisfied(tt,tasks)) return; tt.done=!tt.done; renderTasks(ph); }
      });
    });
    wrap.querySelectorAll("[data-drop]").forEach(col=>{
      col.addEventListener("dragover",(e)=>{e.preventDefault();});
      col.addEventListener("drop",(e)=>{
        e.preventDefault();
        const id=e.dataTransfer.getData("text/plain"); const tt=tasks.find(z=>z.id===id); if(!tt) return;
        const target=col.getAttribute("data-drop").split(":")[1];
        if(target==="done" && !depsSatisfied(tt,tasks)) return;
        tt.done = (target==="done");
        renderTasks(ph);
      });
    });

    return;
  }

  // LIST MODE
  modeWrap.innerHTML = `<div class="stack" style="padding:0;">
    ${tasks.map(t=>{
      const blocked = !depsSatisfied(t,tasks);
      const pr = t.priority==="alta" ? "warn" : (t.priority==="baixa" ? "" : "info");
      return `<div class="item"><div class="item-row">
        <div style="flex:1;">
          <div class="row" style="align-items:center;">
            <label class="chip subtle" style="cursor:pointer;flex:0 0 auto;">
              <input type="checkbox" data-done="${t.id}" ${t.done?"checked":""} style="accent-color:#06b6d4;" ${(!t.done && blocked)?"disabled":""}>
              <span style="margin-left:8px;">feito</span>
            </label>
            <input data-title="${t.id}" value="${attr(t.title)}" placeholder="Tarefa..."/>
          </div>
          <div class="row" style="margin-top:8px;">
            <div class="field"><label>Prazo</label><input data-due="${t.id}" type="datetime-local" value="${attr(t.dueAt||"")}"/></div>
            <div class="field"><label>Responsável</label><input data-asg="${t.id}" value="${attr(t.assignee||"")}" placeholder="Nome"/></div>
          </div>
          <div class="row" style="margin-top:8px;">
            <div class="field">
              <label>Prioridade</label>
              <select data-pri="${t.id}">
                <option value="baixa">baixa</option>
                <option value="normal">normal</option>
                <option value="alta">alta</option>
              </select>
            </div>
            <div class="field">
              <label>Depende de</label>
              <select data-dep="${t.id}">
                <option value="">—</option>
                ${tasks.filter(o=>o.id!==t.id).map(o=>`<option value="${esc(o.id)}">${esc(o.title||o.id)}</option>`).join("")}
              </select>
            </div>
            <div style="display:flex;align-items:flex-end;gap:8px;justify-content:flex-end;">
              <span class="badge ${pr}">${esc(t.priority||"normal")}</span>
              ${blocked?`<span class="badge warn">bloqueada</span>`:""}
            </div>
          </div>
        </div>
        <div class="actions"><button class="pill ghost" data-del-task="${t.id}"><span class="i i-trash"></span></button></div>
      </div></div>`;
    }).join("")}
  </div>`;

  modeWrap.querySelectorAll("[data-done]").forEach(x=>x.addEventListener("change",()=>{
    const id=x.getAttribute("data-done");const tt=tasks.find(z=>z.id===id);
    if(tt) tt.done=x.checked;
    renderTasks(ph);
  }));
  modeWrap.querySelectorAll("[data-title]").forEach(x=>x.addEventListener("input",()=>{
    const id=x.getAttribute("data-title");const tt=tasks.find(z=>z.id===id);
    if(tt) tt.title=x.value;
  }));
  modeWrap.querySelectorAll("[data-due]").forEach(x=>x.addEventListener("input",()=>{
    const id=x.getAttribute("data-due");const tt=tasks.find(z=>z.id===id);
    if(tt) tt.dueAt=x.value;
  }));
  modeWrap.querySelectorAll("[data-asg]").forEach(x=>x.addEventListener("input",()=>{
    const id=x.getAttribute("data-asg");const tt=tasks.find(z=>z.id===id);
    if(tt) tt.assignee=x.value;
  }));
  modeWrap.querySelectorAll("[data-pri]").forEach(x=>{
    const id=x.getAttribute("data-pri");const tt=tasks.find(z=>z.id===id);
    if(tt) x.value=tt.priority||"normal";
    x.addEventListener("change",()=>{const tt=tasks.find(z=>z.id===id); if(tt) tt.priority=x.value; renderTasks(ph);});
  });
  modeWrap.querySelectorAll("[data-dep]").forEach(x=>{
    const id=x.getAttribute("data-dep");const tt=tasks.find(z=>z.id===id);
    const current = (tt?.dependsOn?.[0])||"";
    x.value=current;
    x.addEventListener("change",()=>{
      const tt=tasks.find(z=>z.id===id);
      if(tt){ tt.dependsOn = x.value ? [x.value] : []; renderTasks(ph); }
    });
  });
  modeWrap.querySelectorAll("[data-del-task]").forEach(b=>b.addEventListener("click",()=>{
    const id=b.getAttribute("data-del-task");evt.phases[ph].tasks=tasks.filter(t=>t.id!==id);renderTasks(ph)
  }));
}

function save(){
evt.title=document.getElementById("evtTitle").value.trim()||"Evento";
evt.typeId=document.getElementById("evtType").value;
evt.startAt=document.getElementById("evtStart").value;evt.endAt=document.getElementById("evtEnd").value;
evt.location=document.getElementById("evtLoc").value.trim();evt.notes=document.getElementById("evtNotes").value;
evt.budget.planned=Number(document.getElementById("evtPlanned").value||0);evt.budget.spent=Number(document.getElementById("evtSpent").value||0);
evt.tickets.enabled=document.getElementById("tktEnabled").checked;evt.tickets.capacity=Number(document.getElementById("tktCap").value||0);
evt.attendance.enabled=document.getElementById("attEnabled").checked;
Repo.upsertEvent(evt);closeModal(modalRoot);toast("Salvo",`Evento: ${evt.title}`);renderEvents(main,modalRoot,{contentSnap,toast,router})}
}
}
