export function createRouter({routes,onNotFound}){
const getPath=()=> (location.hash||"#/dashboard").replace(/^#/,"");
const render=async()=>{const path=getPath();const view=routes[path.split("?")[0]]||onNotFound;await view(path)};
window.addEventListener("hashchange",render);window.addEventListener("popstate",render);
const navigate=(path)=>{location.hash=`#${path.startsWith("/")?path:"/"+path}`};return{navigate,render,getPath}}
