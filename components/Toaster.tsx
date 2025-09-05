"use client";
import { useEffect, useState } from "react";
type T = { id: number; msg: string; type?: "success" | "error" };
export default function Toaster(){
  const [items,setItems]=useState<T[]>([]);
  useEffect(()=>{
    const onToast=(e: any)=>{
      const { msg, type } = e.detail || {};
      const id = Date.now() + Math.random();
      setItems(prev => [...prev, { id, msg: String(msg||""), type }]);
      setTimeout(()=> setItems(prev => prev.filter(x=>x.id!==id)), 3200);
    };
    window.addEventListener("toast", onToast as any);
    return ()=> window.removeEventListener("toast", onToast as any);
  },[]);
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {items.map(t=>(
        <div key={t.id}
          className={
            "px-3 py-2 rounded shadow text-sm text-white " +
            (t.type==="error" ? "bg-red-600" : "bg-gray-900")
          }>
          {t.msg}
        </div>
      ))}
    </div>
  );
}
export function toast(msg:string, type?: "success"|"error"){
  if (typeof window!=="undefined") window.dispatchEvent(new CustomEvent("toast",{ detail:{ msg, type }}));
}
