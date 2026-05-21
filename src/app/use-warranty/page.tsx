"use client";
import {useState} from "react";
import {useAuth} from "@/context/AuthContext";

export const dynamic = "force-dynamic";

export default function UseWarrantyPage(){
const authContext = useAuth();
const token = authContext?.token;

const[serial,setSerial]=useState("");
const[warranty,setWarranty]=useState(null);
const[loading,setLoading]=useState(false);
const[using,setUsing]=useState(false);
const[error,setError]=useState("");
const[success,setSuccess]=useState("");

const BASE = process.env.NEXT_PUBLIC_API_URL;
const hdr=()=>({Authorization:`Bearer ${token}`,"Content-Type":"application/json"});

const lookup=async()=>{
if(!serial.trim()||!token)return;
setLoading(true);
setError("");
setWarranty(null);
setSuccess("");
try{
const r=await fetch(`${BASE}/warranties/lookup?serialNumber=${encodeURIComponent(serial.trim())}`,{headers:hdr()});
const d=await r.json();
if(!r.ok)throw new Error(d.message);
setWarranty(d);
}catch(e){
setError(e.message);
}finally{
setLoading(false);
}
};

const useIt=async()=>{
if(!token) return;
setUsing(true);
setError("");
setSuccess("");
try{
const r=await fetch(`${BASE}/warranties/use`,{method:"POST",headers:hdr(),body:JSON.stringify({serialNumber:serial.trim()})});
const d=await r.json();
if(!r.ok)throw new Error(d.message);
setWarranty(d.warranty);
setSuccess("✅ "+d.message+" | المتبقي: "+d.remaining+" مرة");
}catch(e){
setError(e.message);
}finally{
setUsing(false);
}
};

const statusColor=(w)=>{
if(!w)return{};
if(w.isBanned)return{bg:"#fef2f2",color:"#dc2626",label:"محظور 🚫"};
if(w.isExpired)return{bg:"#fef3c7",color:"#d97706",label:"منتهي الصلاحية ⚠️"};
if(w.status!=="APPROVED")return{bg:"#f1f5f9",color:"#64748b",label:w.status};
if(w.usageCount>=w.maxUsageCount)return{bg:"#fef3c7",color:"#d97706",label:"استُنفد الاستخدام"};
return{bg:"#f0fdf4",color:"#16a34a",label:"نشط ✓"};
};

const canUse=(w)=>w&&w.status==="APPROVED"&&!w.isBanned&&!w.isExpired&&w.usageCount<w.maxUsageCount;

const card={background:"#fff",borderRadius:"12px",padding:"1.25rem",boxShadow:"0 1px 3px rgba(0,0,0,0.06)",marginBottom:"1rem"};

const row=(label,value,bold)=>value!=null&&value!==""?(<div style={{display:"flex",justifyContent:"space-between",padding:"0.5rem 0",borderBottom:"1px solid #f1f5f9"}}><span style={{color:"#64748b",fontSize:"0.875rem"}}>{label}</span><span style={{fontWeight:bold?"600":"400",fontSize:"0.875rem"}}>{value}</span></div>):null;

return(<div style={{padding:"2rem",maxWidth:"600px"}}><h1 style={{fontSize:"1.5rem",fontWeight:"bold",color:"#0f172a",marginBottom:"1.5rem"}}>🔧 استخدام الضمان</h1><div style={{...card,display:"flex",gap:"0.75rem",alignItems:"flex-end"}}><div style={{flex:1}}><label style={{display:"block",fontSize:"0.875rem",fontWeight:"500",marginBottom:"0.375rem"}}>الرقم التسلسلي للجهاز</label><input value={serial} onChange={e=>setSerial(e.target.value)} onKeyDown={e=>e.key==="Enter"&&lookup()} placeholder="أدخل الرقم التسلسلي..." style={{width:"100%",padding:"0.625rem 0.875rem",border:"1px solid #d1d5db",borderRadius:"8px",fontSize:"0.875rem",boxSizing:"border-box"}}/></div><button onClick={lookup} disabled={loading||!serial.trim()} style={{background:"#3b82f6",color:"#fff",border:"none",borderRadius:"8px",padding:"0.625rem 1.25rem",cursor:"pointer",fontWeight:"600",whiteSpace:"nowrap"}}>{loading?"جاري...":"بحث"}</button></div>{error&&<div style={{background:"#fef2f2",color:"#dc2626",padding:"0.875rem",borderRadius:"8px",marginBottom:"1rem",fontSize:"0.875rem",fontWeight:"500"}}>{error}</div>}{success&&<div style={{background:"#f0fdf4",color:"#16a34a",padding:"0.875rem",borderRadius:"8px",marginBottom:"1rem",fontSize:"0.875rem",fontWeight:"500"}}>{success}</div>}{warranty&&(<><div style={card}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1rem"}}><h2 style={{fontWeight:"700",fontSize:"1rem"}}>تفاصيل الضمان</h2><span style={{background:statusColor(warranty).bg,color:statusColor(warranty).color,padding:"0.25rem 0.875rem",borderRadius:"999px",fontSize:"0.8rem",fontWeight:"600"}}>{statusColor(warranty).label}</span></div>{row("معرف زوندا",warranty.xondaId,true)}{row("الرقم التسلسلي",warranty.serialNumber,true)}{row("اسم العميل",warranty.customerName)}{row("جوال العميل",warranty.customerPhone)}{row("نوع الجهاز",warranty.deviceType?.name)}{row("باقة الضمان",warranty.warrantyPackage?.name)}{row("الوكيل",warranty.dealer?.name)}{row("تاريخ البيع",warranty.saleDate?new Date(warranty.saleDate).toLocaleDateString("ar-SA"):"-")}{row("تاريخ الانتهاء",warranty.expiresAt?new Date(warranty.expiresAt).toLocaleDateString("ar-SA"):"-")}</div><div style={{...card,background:statusColor(warranty).bg}}><h3 style={{fontWeight:"600",marginBottom:"0.875rem",color:"#0f172a"}}>حالة الاستخدام</h3><div style={{display:"flex",gap:"1rem",marginBottom:"1rem"}}>{[["عدد الاستخدامات",warranty.usageCount,"#3b82f6"],["الحد الأقصى",warranty.maxUsageCount,"#64748b"],["المتبقي",warranty.remaining,"#16a34a"]].map(([l,v,c])=>(<div key={l} style={{flex:1,textAlign:"center",background:"#fff",borderRadius:"8px",padding:"0.875rem"}}><div style={{fontSize:"1.75rem",fontWeight:"bold",color:c}}>{v}</div><div style={{fontSize:"0.75rem",color:"#64748b"}}>{l}</div></div>))}</div><div style={{display:"flex",gap:"0.5rem",marginBottom:"0.5rem"}}>{Array.from({length:warranty.maxUsageCount}).map((_,i)=>(<div key={i} style={{flex:1,height:"8px",borderRadius:"4px",background:i<warranty.usageCount?"#3b82f6":"#e2e8f0"}}/>))}</div></div>{canUse(warranty)&&<button onClick={useIt} disabled={using} style={{width:"100%",background:"#16a34a",color:"#fff",border:"none",borderRadius:"10px",padding:"0.875rem",fontSize:"1rem",fontWeight:"700",cursor:"pointer",marginTop:"0.5rem"}}>{using?"جاري الاستخدام...":"✅ استخدام الضمان"}</button>}{!canUse(warranty)&&<div style={{textAlign:"center",padding:"1rem",background:"#f1f5f9",borderRadius:"8px",color:"#64748b",fontSize:"0.875rem",marginTop:"0.5rem"}}>لا يمكن استخدام هذا الضمان</div>}</>)}</div>);}
