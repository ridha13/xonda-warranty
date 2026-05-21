"use client";
import {useState} from "react";
import {useRouter} from "next/navigation";

export default function LoginPage(){
const router = useRouter();
const [email,setEmail]=useState("");
const [password,setPassword]=useState("");
const [error,setError]=useState("");
const [loading,setLoading]=useState(false);

const submit=async(e:any)=>{
e.preventDefault();
setLoading(true);
setError("");

try{
const r=await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`,{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({email,password})
});

const d=await r.json();
if(!r.ok) throw new Error(d.message||"فشل تسجيل الدخول");

// Save token to localStorage
localStorage.setItem("token", d.token);
localStorage.setItem("user", JSON.stringify(d.user));

// Redirect to dashboard
router.push("/dashboard");
window.location.href = "/dashboard";

}catch(e:any){
setError(e.message||"حدث خطأ في الاتصال");
}finally{
setLoading(false);
}
};

return(
<div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(135deg,#1e3a8a 0%,#1e40af 50%,#2563eb 100%)"}}>
<div style={{background:"#fff",padding:"2.5rem",borderRadius:"20px",boxShadow:"0 20px 60px rgba(0,0,0,0.15)",width:"100%",maxWidth:"420px"}}>
<div style={{textAlign:"center",marginBottom:"2rem"}}>
<div style={{fontSize:"2.5rem",fontWeight:"bold",color:"#1e40af",letterSpacing:"0.1em",marginBottom:"0.5rem"}}>XONDA</div>
<div style={{color:"#6b7280",fontSize:"0.9rem"}}>نظام إدارة الضمانات</div>
</div>

{error&&(
<div style={{background:"#fef2f2",color:"#dc2626",padding:"0.75rem",borderRadius:"8px",marginBottom:"1rem",fontSize:"0.875rem",textAlign:"center",border:"1px solid #fecaca"}}>
{error}
</div>
)}

<form onSubmit={submit} style={{display:"flex",flexDirection:"column",gap:"1.25rem"}}>
<div>
<label style={{display:"block",fontSize:"0.875rem",fontWeight:"600",color:"#374151",marginBottom:"0.5rem"}}>
البريد الإلكتروني
</label>
<input 
type="email" 
value={email} 
onChange={e=>setEmail(e.target.value)} 
placeholder="admin@xonda.sa" 
required 
style={{width:"100%",padding:"0.75rem 1rem",border:"1px solid #d1d5db",borderRadius:"8px",fontSize:"1rem",outline:"none",boxSizing:"border-box"}}
/>
</div>

<div>
<label style={{display:"block",fontSize:"0.875rem",fontWeight:"600",color:"#374151",marginBottom:"0.5rem"}}>
كلمة المرور
</label>
<input 
type="password" 
value={password} 
onChange={e=>setPassword(e.target.value)} 
placeholder="••••••••" 
required 
style={{width:"100%",padding:"0.75rem 1rem",border:"1px solid #d1d5db",borderRadius:"8px",fontSize:"1rem",outline:"none",boxSizing:"border-box"}}
/>
</div>

<button 
type="submit" 
disabled={loading} 
style={{background:"#1e40af",color:"#fff",padding:"0.875rem",borderRadius:"8px",border:"none",fontSize:"1rem",fontWeight:"600",cursor:loading?"not-allowed":"pointer",opacity:loading?0.7:1,marginTop:"0.5rem"}}
>
{loading?"جاري تسجيل الدخول...":"تسجيل الدخول"}
</button>
</form>

<div style={{marginTop:"1.5rem",padding:"1rem",background:"#f8fafc",borderRadius:"8px",fontSize:"0.8rem",color:"#6b7280",textAlign:"center"}}>
<div style={{fontWeight:"600",marginBottom:"0.5rem"}}>حسابات تجريبية:</div>
<div>admin@xonda.sa / admin123</div>
</div>
</div>
</div>
);
}
