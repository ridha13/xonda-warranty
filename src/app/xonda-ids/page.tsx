"use client";
export const dynamic = "force-dynamic";
import {useState,useEffect,useRef} from "react";

export default function XondaIdsPage(){
const [ids,setIds]=useState([]);
const [search,setSearch]=useState("");
const [filter,setFilter]=useState("ALL");
const [manualId,setManualId]=useState("");
const [showAdd,setShowAdd]=useState(false);
const [uploading,setUploading]=useState(false);
const [adding,setAdding]=useState(false);
const [result,setResult]=useState(null);
const [deleting,setDeleting]=useState(null);
const fileRef=useRef(null);
const BASE="http://localhost:4000";
const getToken=()=>document.cookie.split(";").find(c=>c.trim().startsWith("token="))?.split("=")[1]||"";
const hdr=()=>({Authorization:"Bearer "+getToken()});

const load=()=>fetch(BASE+"/api/xonda-ids",{headers:hdr()}).then(r=>r.json()).then(d=>setIds(Array.isArray(d)?d:[]));
useEffect(()=>{load();},[]);

const uploadFile=async(e)=>{
const f=e.target.files?.[0];
if(!f)return;
setUploading(true);
setResult(null);
const fd=new FormData();
fd.append("file",f);
try{
const r=await fetch(BASE+"/api/xonda-ids/upload",{method:"POST",headers:hdr(),body:fd});
const d=await r.json();
setResult(d);
load();
}catch(ex){setResult({message:ex.message});}
finally{setUploading(false);e.target.value="";}
};

const addManual=async()=>{
if(!manualId.trim())return;
setAdding(true);
try{
const r=await fetch(BASE+"/api/xonda-ids/manual",{method:"POST",headers:{...hdr(),"Content-Type":"application/json"},body:JSON.stringify({id:manualId.trim()})});
const d=await r.json();
if(!r.ok)throw new Error(d.message||"خطأ");
setManualId("");
setShowAdd(false);
load();
}catch(ex){alert(ex.message);}
finally{setAdding(false);}
};

const del=async(id)=>{
if(!confirm("حذف المعرف " + id + " ؟"))return;
setDeleting(id);
try{
const r=await fetch(BASE+"/api/xonda-ids/"+encodeURIComponent(id),{method:"DELETE",headers:hdr()});
if(r.ok)load();
else{const d=await r.json();alert(d.message||"تعذر الحذف");}
}finally{setDeleting(null);}
};

const downloadTemplate=async()=>{
const r=await fetch(BASE+"/api/xonda-ids/template",{headers:hdr()});
const b=await r.blob();
const url=URL.createObjectURL(b);
const a=document.createElement("a");
a.href=url;
a.download="xonda_ids_template.xlsx";
a.click();
URL.revokeObjectURL(url);
};

const filtered=ids.filter(x=>{
const m1=filter==="ALL"||(filter==="USED"&&x.isUsed)||(filter==="FREE"&&!x.isUsed);
const m2=!search||x.id.toLowerCase().includes(search.toLowerCase());
return m1&&m2;
});

return (
<div style={{padding:"2rem"}}>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.25rem",flexWrap:"wrap",gap:"1rem"}}>
<h1 style={{fontSize:"1.5rem",fontWeight:"700"}}>معرفات زوندا</h1>
<div style={{display:"flex",gap:"0.5rem",flexWrap:"wrap"}}>
<button onClick={downloadTemplate} style={{padding:"0.55rem 1rem",border:"1px solid #d1d5db",borderRadius:"8px",background:"#fff",cursor:"pointer"}}>تحميل نموذج Excel</button>
<button onClick={()=>fileRef.current?.click()} style={{padding:"0.55rem 1rem",border:"1px solid #d1d5db",borderRadius:"8px",background:"#fff",cursor:"pointer"}}>{uploading?"جاري الرفع...":"رفع ملف"}</button>
<button onClick={()=>setShowAdd(v=>!v)} style={{padding:"0.55rem 1rem",border:"none",borderRadius:"8px",background:"#3b82f6",color:"#fff",cursor:"pointer"}}>إضافة يدوي</button>
</div>
</div>

<input ref={fileRef} type="file" accept=".txt,.csv,.xlsx,.xls" onChange={uploadFile} style={{display:"none"}}/>

{showAdd&&<div style={{background:"#fff",padding:"1rem",borderRadius:"12px",marginBottom:"1rem"}}>
<div style={{display:"flex",gap:"0.75rem",alignItems:"end"}}>
<div style={{flex:1}}>
<div style={{marginBottom:"0.35rem",fontWeight:"500"}}>المعرف</div>
<input value={manualId} onChange={e=>setManualId(e.target.value)} placeholder="مثال: XND-00001" style={{width:"100%",padding:"0.65rem",border:"1px solid #d1d5db",borderRadius:"8px"}} />
</div>
<button onClick={addManual} disabled={adding} style={{padding:"0.65rem 1rem",border:"none",borderRadius:"8px",background:"#16a34a",color:"#fff",cursor:"pointer"}}>{adding?"...":"حفظ"}</button>
<button onClick={()=>setShowAdd(false)} style={{padding:"0.65rem 1rem",border:"none",borderRadius:"8px",background:"#e5e7eb",cursor:"pointer"}}>إلغاء</button>
</div>
</div>}

{result&&<div style={{marginBottom:"1rem",padding:"0.75rem 1rem",borderRadius:"8px",background:"#f8fafc"}}>{result.message||"تم"}</div>}

<div style={{display:"flex",gap:"0.5rem",marginBottom:"1rem",flexWrap:"wrap"}}>
{[["ALL","الكل"],["FREE","متاح"],["USED","مستخدم"]].map(([k,v])=><button key={k} onClick={()=>setFilter(k)} style={{padding:"0.5rem 1rem",border:"none",borderRadius:"8px",background:filter===k?"#3b82f6":"#e5e7eb",color:filter===k?"#fff":"#111827",cursor:"pointer"}}>{v}</button>)}
<input value={search} onChange={e=>setSearch(e.target.value)} placeholder="بحث عن معرف..." style={{flex:1,minWidth:"220px",padding:"0.55rem 0.75rem",border:"1px solid #d1d5db",borderRadius:"8px"}} />
</div>

<div style={{background:"#fff",borderRadius:"12px",overflow:"hidden"}}>
<table style={{width:"100%",borderCollapse:"collapse"}}>
<thead>
<tr style={{background:"#f8fafc"}}>
<th style={{padding:"0.75rem",textAlign:"right"}}>المعرف</th>
<th style={{padding:"0.75rem",textAlign:"right"}}>الحالة</th>
<th style={{padding:"0.75rem",textAlign:"right"}}>تاريخ الإضافة</th>
<th style={{padding:"0.75rem",textAlign:"right"}}>إجراء</th>
</tr>
</thead>
<tbody>
{filtered.map(x=>(
<tr key={x.id} style={{borderTop:"1px solid #eee"}}>
<td style={{padding:"0.75rem",fontFamily:"monospace"}}>{x.id}</td>
<td style={{padding:"0.75rem"}}><span style={{padding:"0.25rem 0.6rem",borderRadius:"999px",background:x.isUsed?"#fef2f2":"#f0fdf4",color:x.isUsed?"#dc2626":"#16a34a"}}>{x.isUsed?"مستخدم":"متاح"}</span></td>
<td style={{padding:"0.75rem"}}>{new Date(x.createdAt).toLocaleDateString("ar-SA")}</td>
<td style={{padding:"0.75rem"}}>
{!x.isUsed&&<button onClick={()=>del(x.id)} disabled={deleting===x.id} style={{padding:"0.4rem 0.8rem",border:"none",borderRadius:"8px",background:"#ef4444",color:"#fff",cursor:"pointer"}}>{deleting===x.id?"...":"حذف"}</button>}
</td>
</tr>
))}
</tbody>
</table>
{filtered.length===0&&<div style={{padding:"2rem",textAlign:"center",color:"#64748b"}}>لا توجد نتائج</div>}
</div>
</div>
);
}
