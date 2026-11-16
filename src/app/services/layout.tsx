import type { ReactNode } from "react";
import Sidebar from "@/components/layout/Sidebar";

export default function ServicesLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background lg:flex-row">
      <Sidebar />

      <div className="min-w-0 flex-1">
        {children}
      </div>
    </div>
  );
}