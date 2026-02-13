import { uid } from "./utils.js";
export const newEvent=()=>({id:uid("evt"),title:"Novo evento",typeId:"generic",status:"planejamento",startAt:"",endAt:"",location:"",notes:"",
budget:{planned:0,spent:0},phases:{pre:{tasks:[]},exec:{tasks:[]},post:{tasks:[]}},
tickets:{enabled:false,capacity:0},attendance:{enabled:false,listId:null},createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()});
export const newTask=(title="Nova tarefa")=>({id:uid("tsk"),title,done:false,dueAt:"",assignee:"",priority:"normal",dependsOn:[]});
export const newVendor=()=>({id:uid("vnd"),name:"Fornecedor",category:"Geral",contacts:{phone:"",email:""},notes:"",quotes:[],createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()});
export const newQuote=(vendorId)=>({id:uid("qte"),vendorId,title:"Cotação",amount:0,status:"aberta",details:"",createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()});
export const newTicketBatch=(eventId)=>({id:uid("tkt"),eventId,name:"Lote 1",price:0,qty:100,sold:0,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()});
export const newAttendanceList=(eventId)=>({id:uid("att"),eventId,name:"Lista",items:[],createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()});
export const newAttendancePerson=()=>({id:uid("p"),name:"",doc:"",email:"",phone:"",checkedInAt:null});
