import React from "react";
import { DashboardSidebar } from "./dashboard-sidebar";
import { DashboardHeader } from "./dashboard-header";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full bg-background relative overflow-hidden">
      {/* Background subtle technical grid */}
      <div className="absolute inset-0 bg-tech-grid opacity-20 pointer-events-none mask-radial-hero" />
      <div className="fixed top-10 left-1/3 w-[600px] h-[300px] bg-amber-500/5 dark:bg-amber-500/8 blur-[120px] rounded-full pointer-events-none" />

      {/* Desktop Fixed Sidebar */}
      <DashboardSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden relative z-10">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 max-w-6xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
