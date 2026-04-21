import { Outlet } from "@tanstack/react-router";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { cn } from "@/lib/utils";

interface ShellProps {
  className?: string;
}

/**
 * App shell with sidebar and header
 * Used for authenticated routes
 */
export function Shell({ className }: ShellProps) {
  return (
    <div className={cn("flex h-screen", className)}>
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6 bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
