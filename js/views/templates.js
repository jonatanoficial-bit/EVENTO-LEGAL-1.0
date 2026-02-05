import { esc } from "../core/utils.js";
export const pageShell=({title,subtitle,right=""})=>`
<section class="card hero"><div class="hero-bg"></div><div class="hero-content">
<div class="kicker">${esc(subtitle||"")}</div>
<div style="display:flex;align-items:flex-end;justify-content:space-between;gap:12px;margin-top:10px;">
<h1 style="margin:0;font-size:22px;">${esc(title||"")}</h1><div>${right}</div></div></div></section>`;
export const emptyState=({title="Sem dados",hint="Crie seu primeiro item.",cta=""})=>`
<div class="card" style="margin-top:12px;"><div class="content">
<div class="title">${esc(title)}</div><div class="muted" style="margin-top:6px;">${esc(hint)}</div>
<div style="margin-top:12px;">${cta}</div></div></div>`;
