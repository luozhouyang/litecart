import { Outlet } from "@tanstack/react-router";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { CartDrawer } from "./CartDrawer";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ShellProps {
  className?: string;
}

/**
 * Main app shell for storefront
 * Includes header, cart drawer, and footer
 */
export function Shell({ className }: ShellProps) {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <div className={cn("flex min-h-screen flex-col", className)}>
      <Header onCartClick={() => setCartOpen(true)} />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
    </div>
  );
}
