"use client";
import {useState,useEffect} from "react";
import {useRouter} from "next/navigation";

export default function WarrantiesPage(){
const router=useRouter();
const [warranties,setWarranties]=useState([]);
const [me,setMe]=useState(null);
const [filter,setFilter]=useState("ALL");
const [search,setSearch]=useState("");
const [actionModal,setActionModal]=useState(null);
const [reason,setReason]=useState("");
const [maxUsageCount,setMaxUsageCount]=useState("1");
const [loading,setLoading]=useState(false);

const BASE="http://localhost:4000";
const getToken=()=>document.cookie.split(";").find(c=>c.trim().startsWith("token="))?.split("=")[1]||"";
const hdr=()=>({Authorization:"Bearer "+getToken(),"Content-Type":"application/json"});

const load=()=>{
fetch(BASE+"/api/warranties",{headers:hdr()}).then(r=>r.json()).then(d=>setWarranties(Array.isArray(d)?d:[]));
};

useEffect(()=>{
fetch(BASE+"/api/auth/me",{headers:hdr()}).then(r=>r.json()).then(setMe);
load();
},[]);

const isAdmin=me?.role==="SUPER_ADMIN"||me?.role==="STAFF_ADMIN"||me?.role==="DEALER_ADMIN"&&me?.canApproveWarranties;
const canCreate=me?.role==="DEALER_ADMIN"||me?.role==="DEALER_USER";

const getState=(w)=>{
const now=new Date();
if(w.isBanned)return {label:"محظور",bg:"#fef2f2",color:"#dc2626"};
if(w.status==="CANCELLED")return {label:"ملغي",bg:"#f1f5f9",color:"#64748b"};
if(w.expiresAt&&now>new Date(w.expiresAt))return {label:"منتهي",bg:"#fef3c7",color:"#d97706"};
if(w.status==="APPROVED")return {label:"نشط",bg:"#f0fdf4",color:"#16a34a"};
if(w.status==="REJECTED")return {label:"مرفوض",bg:"#fef2f2",color:"#dc2626"};
if(w.status==="REVISION_REQUESTED")return {label:"يحتاج تعديل",bg:"#eff6ff",color:"#2563eb"};
return {label:"قيد المراجعة",bg:"#fffbeb",color:"#b45309"};
};

const filtered=warranties.filter(w=>{
const matchSearch=!search || [w.xondaId,w.serialNumber,w.customerName,w.customerPhone,w.dealer?.name,w.deviceType?.name].some(v=>String(v||"").toLowerCase().includes(search.toLowerCase()));
const st=getState(w).label;
const matchFilter=filter==="ALL" || st===filter;
return matchSearch && matchFilter;
});

const doAction=async()=>{
setLoading(true);
try{
const body={status:actionModal.action};
if(actionModal.action==="REJECTED")body.rejectionReason=reason;
if(actionModal.action==="REVISION_REQUESTED")body.revisionNotes=reason;
if(actionModal.action==="CANCELLED")body.cancelReason=reason;
if(actionModal.action==="BANNED")body.banReason=reason;
if(actionModal.action==="APPROVED")body.maxUsageCount=parseInt(maxUsageCount||"1");

let url=BASE+"/api/warranties/"+actionModal.id+"/status";
let method="PATCH";
if(actionModal.action==="UNBAN"){
url=BASE+"/api/warranties/"+actionModal.id+"/unban";
body.status="APPROVED";
}

const r=await fetch(url,{method,headers:hdr(),body:JSON.stringify(body)});
const d=await r.json();
if(!r.ok)throw new Error(d.message||"خطأ");
setActionModal(null);
setReason("");
load();
}catch(e){
alert(e.message);
}finally{
setLoading(false);
}
};

const statusButtons=[["ALL","الكل"],["قيد المراجعة","قيد المراجعة"],["نشط","نشط"],["منتهي","منتهي"],["محظور","محظور"],["ملغي","ملغي"],["مرفوض","مرفوض"],["يحتاج تعديل","يحتاج تعديل"]];

return(
<div style={{padding:"2rem"}}>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.5rem",gap:"1rem",flexWrap:"wrap"}}>
<h1 style={{fontSize:"1.5rem",fontWeight:"700",color:"#0f172a"}}>الضمانات ({filtered.length})</h1>
{canCreate&&<button onClick={()=>router.push("/warranties/new")} style={{background:"#3b82f6",color:"#fff",border:"none",borderRadius:"8px",padding:"0.625rem 1.25rem",cursor:"pointer",fontWeight:"600"}}>+ طلب جديد</button>}
</div>

<div style={{display:"flex",gap:"0.75rem",marginBottom:"1rem",flexWrap:"wrap"}}>
<input
placeholder="بحث بالرقم التسلسلي أو معرف زوندا أو اسم العميل..."
value={search}
onChange={e=>setSearch(e.target.value)}
style={{flex:1,minWidth:"260px",padding:"0.625rem 0.875rem",border:"1px solid #d1d5db",borderRadius:"8px",fontSize:"0.875rem"}}
/>
</div>

<div style={{display:"flex",gap:"0.5rem",marginBottom:"1.25rem",flexWrap:"wrap"}}>
{statusButtons.map(([k,v])=>(
<button key={k} onClick={()=>setFilter(k)} style={{padding:"0.45rem 0.9rem",border:"none",borderRadius:"8px",cursor:"pointer",fontSize:"0.8rem",fontWeight:"500",background:filter===k?"#3b82f6":"#f1f5f9",color:filter===k?"#fff":"#374151"}}>{v}</button>
))}
</div>

<div style={{background:"#fff",borderRadius:"12px",boxShadow:"0 1px 3px rgba(0,0,0,0.06)",overflow:"auto"}}>
<table style={{width:"100%",borderCollapse:"collapse",minWidth:"1100px"}}>
<thead>
<tr style={{background:"#f8fafc"}}>
{["معرف زوندا","الرقم التسلسلي","العميل","الجهاز","الباقة","الوكيل","الحالة","الانتهاء","الاستخدام","إجراءات"].map(h=>(
<th key={h} style={{padding:"0.875rem 1rem",textAlign:"right",fontSize:"0.8rem",fontWeight:"600",color:"#64748b",borderBottom:"1px solid #e2e8f0",whiteSpace:"nowrap"}}>{h}</th>
))}
</tr>
</thead>
<tbody>
{filtered.map(w=>{
const st=getState(w);
const isExpired=w.expiresAt&&new Date()>new Date(w.expiresAt);
return(
<tr key={w.id} style={{borderBottom:"1px solid #f1f5f9"}}>
<td style={{padding:"0.875rem 1rem",fontFamily:"monospace",fontWeight:"600"}}>{w.xondaId}</td>
<td style={{padding:"0.875rem 1rem",fontFamily:"monospace"}}>{w.serialNumber}</td>
<td style={{padding:"0.875rem 1rem"}}>
<div style={{fontWeight:"500"}}>{w.customerName}</div>
<div style={{fontSize:"0.75rem",color:"#94a3b8"}}>{w.customerPhone}</div>
</td>
<td style={{padding:"0.875rem 1rem"}}>{w.deviceType?.name||"-"}</td>
<td style={{padding:"0.875rem 1rem"}}>{w.warrantyPackage?.name||"-"}</td>
<td style={{padding:"0.875rem 1rem"}}>{w.dealer?.name||"-"}</td>
<td style={{padding:"0.875rem 1rem"}}>
<span style={{background:st.bg,color:st.color,padding:"0.25rem 0.75rem",borderRadius:"999px",fontSize:"0.75rem",fontWeight:"600",whiteSpace:"nowrap"}}>{st.label}</span>
</td>
<td style={{padding:"0.875rem 1rem",whiteSpace:"nowrap"}}>{w.expiresAt?new Date(w.expiresAt).toLocaleDateString("ar-SA"):"-"}</td>
<td style={{padding:"0.875rem 1rem",whiteSpace:"nowrap"}}>
{w.status==="APPROVED"?`${w.usageCount}/${w.maxUsageCount}`:"-"}
</td>
<td style={{padding:"0.875rem 1rem"}}>
<div style={{display:"flex",gap:"0.375rem",flexWrap:"wrap"}}>
<button onClick={()=>router.push("/warranties/"+w.id)} style={{background:"#f8fafc",color:"#374151",border:"1px solid #e2e8f0",borderRadius:"6px",padding:"0.3rem 0.6rem",cursor:"pointer",fontSize:"0.75rem"}}>عرض</button>
{isAdmin&&w.status==="PENDING"&&<>
<button onClick={()=>setActionModal({id:w.id,action:"APPROVED",label:"موافقة الضمان"})} style={{background:"#f0fdf4",color:"#16a34a",border:"none",borderRadius:"6px",padding:"0.3rem 0.6rem",cursor:"pointer",fontSize:"0.75rem"}}>موافقة</button>
<button onClick={()=>setActionModal({id:w.id,action:"REJECTED",label:"رفض الضمان"})} style={{background:"#fef2f2",color:"#dc2626",border:"none",borderRadius:"6px",padding:"0.3rem 0.6rem",cursor:"pointer",fontSize:"0.75rem"}}>رفض</button>
<button onClick={()=>setActionModal({id:w.id,action:"REVISION_REQUESTED",label:"طلب تعديل"})} style={{background:"#eff6ff",color:"#2563eb",border:"none",borderRadius:"6px",padding:"0.3rem 0.6rem",cursor:"pointer",fontSize:"0.75rem"}}>تعديل</button>
</>}
{isAdmin&&w.status==="APPROVED"&&!w.isBanned&&<>
<button onClick={()=>setActionModal({id:w.id,action:"CANCELLED",label:"إلغاء الضمان"})} style={{background:"#f1f5f9",color:"#475569",border:"none",borderRadius:"6px",padding:"0.3rem 0.6rem",cursor:"pointer",fontSize:"0.75rem"}}>إلغاء</button>
<button onClick={()=>setActionModal({id:w.id,action:"BANNED",label:"حظر الضمان"})} style={{background:"#fef2f2",color:"#dc2626",border:"none",borderRadius:"6px",padding:"0.3rem 0.6rem",cursor:"pointer",fontSize:"0.75rem"}}>حظر</button>
</>}
{isAdmin&&w.isBanned&&<button onClick={()=>setActionModal({id:w.id,action:"UNBAN",label:"فك الحظر"})} style={{background:"#f0fdf4",color:"#16a34a",border:"none",borderRadius:"6px",padding:"0.3rem 0.6rem",cursor:"pointer",fontSize:"0.75rem"}}>فك الحظر</button>}
</div>
</td>
</tr>
);
})}
</tbody>
</table>
{filtered.length===0&&<div style={{padding:"2rem",textAlign:"center",color:"#64748b"}}>لا توجد نتائج</div>}
</div>

{actionModal&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:50}}>
<div style={{background:"#fff",borderRadius:"12px",padding:"1.5rem",width:"420px",maxWidth:"92vw"}}>
<h3 style={{marginBottom:"1rem",fontWeight:"700"}}>{actionModal.label}</h3>

{actionModal.action==="APPROVED"&&<div style={{marginBottom:"1rem"}}>
<label style={{display:"block",fontSize:"0.875rem",fontWeight:"500",marginBottom:"0.35rem"}}>عدد مرات الاستخدام المسموحة</label>
<input value={maxUsageCount} onChange={e=>setMaxUsageCount(e.target.value)} type="number" min="1" style={{width:"100%",padding:"0.625rem",border:"1px solid #d1d5db",borderRadius:"8px"}} />
</div>}

{["REJECTED","REVISION_REQUESTED","CANCELLED","BANNED"].includes(actionModal.action)&&<div style={{marginBottom:"1rem"}}>
<label style={{display:"block",fontSize:"0.875rem",fontWeight:"500",marginBottom:"0.35rem"}}>
{actionModal.action==="REJECTED"?"سبب الرفض":actionModal.action==="REVISION_REQUESTED"?"ملاحظات التعديل":actionModal.action==="CANCELLED"?"سبب الإلغاء":"سبب الحظر"}
</label>
<textarea value={reason} onChange={e=>setReason(e.target.value)} rows={3} style={{width:"100%",padding:"0.625rem",border:"1px solid #d1d5db",borderRadius:"8px",boxSizing:"border-box",resize:"vertical"}} />
</div>}

<div style={{display:"flex",gap:"0.75rem"}}>
<button onClick={doAction} disabled={loading||(actionModal.action!=="APPROVED"&&!reason.trim()&&actionModal.action!=="UNBAN")} style={{flex:1,background:"#3b82f6",color:"#fff",border:"none",borderRadius:"8px",padding:"0.625rem",cursor:"pointer",fontWeight:"600"}}>{loading?"جاري...":"تأكيد"}</button>
<button onClick={()=>{setActionModal(null);setReason("");}} style={{flex:1,background:"#f1f5f9",border:"none",borderRadius:"8px",padding:"0.625rem",cursor:"pointer"}}>إلغاء</button>
</div>
</div>
</div>}
</div>
);
}
