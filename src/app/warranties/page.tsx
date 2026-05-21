"use client";
import {useState,useEffect} from "react";
import {useRouter} from "next/navigation";
import {useAuth} from "@/context/AuthContext";

export const dynamic = "force-dynamic";

export default function WarrantiesPage(){
const router=useRouter();
const authContext = useAuth();
const token = authContext?.token;

const [warranties,setWarranties]=useState([]);
const [me,setMe]=useState(null);
const [filter,setFilter]=useState("ALL");
const [search,setSearch]=useState("");
const [actionModal,setActionModal]=useState(null);
const [reason,setReason]=useState("");
const [maxUsageCount,setMaxUsageCount]=useState("1");
const [loading,setLoading]=useState(false);

const BASE = process.env.NEXT_PUBLIC_API_URL;

useEffect(()=>{
if(!token) return;
const hdr={Authorization:`Bearer ${token}`};
fetch(`${BASE}/auth/me`,{headers:hdr}).then(r=>r.json()).then(d=>setMe(d)).catch(console.error);
loadWarranties();
},[token]);

const loadWarranties=()=>{
if(!token) return;
const hdr={Authorization:`Bearer ${token}`};
fetch(`${BASE}/warranties`,{headers:hdr}).then(r=>r.json()).then(d=>setWarranties(Array.isArray(d)?d:[])).catch(console.error);
};

const performAction=async(id,action)=>{
if(!token) return;
setLoading(true);
const hdr={Authorization:`Bearer ${token}`,"Content-Type":"application/json"};
const body={status:action==="APPROVE"?"APPROVED":action==="REJECT"?"REJECTED":"REVISION_REQUESTED"};
if(action==="REJECT"&&reason)body.rejectionReason=reason;
if(action==="REVISION"&&reason)body.revisionNotes=reason;
if(action==="USE"&&maxUsageCount)body.maxUsageCount=parseInt(maxUsageCount);
await fetch(`${BASE}/warranties/${id}`,{method:"PUT",headers:hdr,body:JSON.stringify(body)});
setActionModal(null);
setReason("");
setMaxUsageCount("1");
loadWarranties();
setLoading(false);
};

const deleteWarranty=async(id)=>{
if(!token) return;
if(!confirm("هل أنت متأكد من حذف الضمان؟"))return;
const hdr={Authorization:`Bearer ${token}`};
await fetch(`${BASE}/warranties/${id}`,{method:"DELETE",headers:hdr});
loadWarranties();
};

const filtered=warranties.filter(w=>{
const matchFilter=filter==="ALL"||w.status===filter;
const matchSearch=!search||w.xondaId.toLowerCase().includes(search.toLowerCase())||w.customerName.toLowerCase().includes(search.toLowerCase());
return matchFilter&&matchSearch;
});

const statusLabel={PENDING:"قيد الانتظار",APPROVED:"موافق عليه",REJECTED:"مرفوض",REVISION_REQUESTED:"يحتاج تعديل",USED:"تم الاستخدام"};
const statusColor={PENDING:"#f59e0b",APPROVED:"#10b981",REJECTED:"#ef4444",REVISION_REQUESTED:"#8b5cf6",USED:"#6366f1"};
const statusBg={PENDING:"#fef3c7",APPROVED:"#d1fae5",REJECTED:"#fee2e2",REVISION_REQUESTED:"#ede9fe",USED:"#e0e7ff"};

return(
<div style={{padding:"2rem"}}>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"2rem"}}>
<h1 style={{fontSize:"1.75rem",fontWeight:"bold",color:"#0f172a"}}>إدارة الضمانات</h1>
<button onClick={()=>router.push("/warranties/new")} style={{background:"#2563eb",color:"#fff",border:"none",borderRadius:"8px",padding:"0.625rem 1.25rem",cursor:"pointer",fontSize:"0.875rem",fontWeight:"600"}}>+ إنشاء ضمان جديد</button>
</div>

<div style={{background:"#fff",borderRadius:"12px",padding:"1.5rem",marginBottom:"1.5rem",boxShadow:"0 1px 3px rgba(0,0,0,0.06)"}}>
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1rem"}}>
<input type="text" placeholder="بحث (معرف زوندا أو اسم العميل)..." value={search} onChange={e=>setSearch(e.target.value)} style={{width:"100%",padding:"0.625rem 1rem",border:"1px solid #e2e8f0",borderRadius:"8px",fontSize:"0.875rem"}}/>
<select value={filter} onChange={e=>setFilter(e.target.value)} style={{padding:"0.625rem 1rem",border:"1px solid #e2e8f0",borderRadius:"8px",fontSize:"0.875rem"}}>
<option value="ALL">جميع الحالات</option>
<option value="PENDING">قيد الانتظار</option>
<option value="APPROVED">موافق عليه</option>
<option value="REJECTED">مرفوض</option>
<option value="REVISION_REQUESTED">يحتاج تعديل</option>
<option value="USED">تم الاستخدام</option>
</select>
</div>
</div>

<div style={{background:"#fff",borderRadius:"12px",boxShadow:"0 1px 3px rgba(0,0,0,0.06)",overflow:"hidden"}}>
<table style={{width:"100%",borderCollapse:"collapse"}}>
<thead style={{background:"#f8fafc"}}>
<tr>
{["معرف زوندا","العميل","نوع الجهاز","باقة الضمان","الحالة","التاريخ","الإجراءات"].map(h=>(
<th key={h} style={{padding:"0.875rem 1rem",textAlign:"right",fontSize:"0.75rem",fontWeight:"600",color:"#64748b",textTransform:"uppercase",borderBottom:"1px solid #e2e8f0"}}>{h}</th>
))}
</tr>
</thead>
<tbody>
{filtered.map(w=>(
<tr key={w.id} style={{borderBottom:"1px solid #f1f5f9"}} onMouseEnter={e=>e.currentTarget.style.background="#f8fafc"} onMouseLeave={e=>e.currentTarget.style.background=""}>
<td style={{padding:"0.875rem 1rem",fontWeight:"600",fontFamily:"monospace",fontSize:"0.875rem"}}>{w.xondaId}</td>
<td style={{padding:"0.875rem 1rem",fontSize:"0.875rem"}}>{w.customerName}</td>
<td style={{padding:"0.875rem 1rem",fontSize:"0.875rem",color:"#64748b"}}>{w.deviceType?.name||"-"}</td>
<td style={{padding:"0.875rem 1rem",fontSize:"0.875rem"}}>{w.warrantyPackage?.name||"-"}</td>
<td style={{padding:"0.875rem 1rem"}}>
<span style={{background:statusBg[w.status],color:statusColor[w.status],padding:"0.25rem 0.75rem",borderRadius:"999px",fontSize:"0.75rem",fontWeight:"600"}}>{statusLabel[w.status]||w.status}</span>
</td>
<td style={{padding:"0.875rem 1rem",fontSize:"0.8rem",color:"#94a3b8"}}>{new Date(w.createdAt).toLocaleDateString("ar-SA")}</td>
<td style={{padding:"0.875rem 1rem"}}>
<div style={{display:"flex",gap:"0.5rem"}}>
<button onClick={()=>router.push(`/warranties/${w.id}`)} style={{background:"#eff6ff",color:"#2563eb",border:"none",borderRadius:"6px",padding:"0.375rem 0.75rem",cursor:"pointer",fontSize:"0.75rem",fontWeight:"600"}}>عرض</button>
{me?.role==="ADMIN"&&w.status==="PENDING"&&(
<>
<button onClick={()=>setActionModal({id:w.id,action:"APPROVE"})} style={{background:"#f0fdf4",color:"#16a34a",border:"none",borderRadius:"6px",padding:"0.375rem 0.75rem",cursor:"pointer",fontSize:"0.75rem",fontWeight:"600"}}>موافق</button>
<button onClick={()=>setActionModal({id:w.id,action:"REJECT"})} style={{background:"#fef2f2",color:"#dc2626",border:"none",borderRadius:"6px",padding:"0.375rem 0.75rem",cursor:"pointer",fontSize:"0.75rem",fontWeight:"600"}}>رفض</button>
<button onClick={()=>setActionModal({id:w.id,action:"REVISION"})} style={{background:"#fdf4ff",color:"#7e22ce",border:"none",borderRadius:"6px",padding:"0.375rem 0.75rem",cursor:"pointer",fontSize:"0.75rem",fontWeight:"600"}}>تعديل</button>
</>
)}
{me?.role==="ADMIN"&&w.status==="APPROVED"&&w.usageCount<w.maxUsageCount&&(
<button onClick={()=>setActionModal({id:w.id,action:"USE"})} style={{background:"#eef2ff",color:"#4f46e5",border:"none",borderRadius:"6px",padding:"0.375rem 0.75rem",cursor:"pointer",fontSize:"0.75rem",fontWeight:"600"}}>استخدام</button>
)}
{me?.role==="ADMIN"&&(
<button onClick={()=>deleteWarranty(w.id)} style={{background:"#fef2f2",color:"#dc2626",border:"none",borderRadius:"6px",padding:"0.375rem 0.75rem",cursor:"pointer",fontSize:"0.75rem",fontWeight:"600"}}>حذف</button>
)}
</div>
</td>
</tr>
))}
</tbody>
</table>
{filtered.length===0&&(
<div style={{padding:"3rem",textAlign:"center",color:"#94a3b8"}}>لا توجد ضمانات</div>
)}
</div>

{actionModal&&(
<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:50}} onClick={()=>setActionModal(null)}>
<div style={{background:"#fff",borderRadius:"12px",padding:"2rem",width:"90%",maxWidth:"400px",boxShadow:"0 20px 25px rgba(0,0,0,0.1)"}} onClick={e=>e.stopPropagation()}>
<h3 style={{fontSize:"1.25rem",fontWeight:"bold",marginBottom:"1rem"}}>
{actionModal.action==="APPROVE"?"الموافقة على الضمان":actionModal.action==="REJECT"?"رفض الضمان":actionModal.action==="REVISION"?"طلب تعديل":"تأكيد الاستخدام"}
</h3>
{(actionModal.action==="REJECT"||actionModal.action==="REVISION")&&(
<textarea placeholder={actionModal.action==="REJECT"?"سبب الرفض...":"ملاحظات التعديل..."} value={reason} onChange={e=>setReason(e.target.value)} style={{width:"100%",padding:"0.75rem",border:"1px solid #e2e8f0",borderRadius:"8px",marginBottom:"1rem",minHeight:"100px",fontSize:"0.875rem"}}/>
)}
{actionModal.action==="USE"&&(
<input type="number" min="1" value={maxUsageCount} onChange={e=>setMaxUsageCount(e.target.value)} placeholder="عدد مرات الاستخدام المسموحة" style={{width:"100%",padding:"0.75rem",border:"1px solid #e2e8f0",borderRadius:"8px",marginBottom:"1rem",fontSize:"0.875rem"}}/>
)}
<div style={{display:"flex",gap:"0.75rem",justifyContent:"flex-end"}}>
<button onClick={()=>setActionModal(null)} disabled={loading} style={{background:"#f1f5f9",color:"#64748b",border:"none",borderRadius:"8px",padding:"0.625rem 1.25rem",cursor:"pointer",fontSize:"0.875rem",fontWeight:"600"}}>إلغاء</button>
<button onClick={()=>performAction(actionModal.id,actionModal.action)} disabled={loading} style={{background:"#2563eb",color:"#fff",border:"none",borderRadius:"8px",padding:"0.625rem 1.25rem",cursor:"pointer",fontSize:"0.875rem",fontWeight:"600"}}>
{loading?"جاري التنفيذ...":"تأكيد"}
</button>
</div>
</div>
</div>
)}
</div>
);
}
