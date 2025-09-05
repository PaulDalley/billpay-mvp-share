"use client";
import { ReactNode } from "react";
import Toaster from "./Toaster";

function LogoutButton(){
  const onClick=async()=>{
    try{ await fetch("/api/auth/logout",{method:"POST"}); }catch{}
    location.href="/login";
  };
  return <button onClick={onClick} className="text-sm underline">Log out</button>;
}

export default function Shell({ children, kind="user" as any }:{ children:ReactNode; kind?: "user"|"admin" }){
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
          <a href={kind==="admin" ? "/admin" : "/u"} className="font-semibold tracking-tight">Property Bill Concierge</a>
          <nav className="flex items-center gap-5 text-sm">
            {kind==="admin" ? (
              <>
                <a className="hover:underline" href="/admin/leads">Leads</a>
                <a className="hover:underline" href="/admin/loas">LOAs</a>
                <a className="hover:underline" href="/admin/new-bill">New Bill</a>
                <a className="hover:underline" href="/admin/bills">Bills</a>
                <a className="hover:underline" href="/admin/tools/pay">Pay</a>
                <a className="hover:underline" href="/admin/tools/doctor">Doctor</a>
                <LogoutButton/>
              </>
            ) : (
              <>
                <a className="hover:underline" href="/u">Dashboard</a>
                <a className="hover:underline" href="/start">Start</a>
                <LogoutButton/>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      <Toaster/>
    </div>
  );
}
