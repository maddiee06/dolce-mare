import React from "react";
import { NavCajero } from "../../components/cajero/NavCajero";

export default function CajeroLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-50">
      <NavCajero userName="Bradley" userRole="Admin" />
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
