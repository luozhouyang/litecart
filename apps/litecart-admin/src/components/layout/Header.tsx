import { ChevronDown, LogOut, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useStore } from "@/hooks/useStore";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "@tanstack/react-router";

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const { user, isAuthenticated } = useAuth();
  const { currentStore, stores, setStore, isLoading: storesLoading } = useStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    // Navigate to login after sign out
    setDropdownOpen(false);
  };

  if (!isAuthenticated) {
    return (
      <header className={cn("h-14 border-b bg-card flex items-center justify-end px-4", className)}>
        <Link to="/auth/login" className="text-sm font-medium text-primary hover:underline">
          Sign in
        </Link>
      </header>
    );
  }

  return (
    <header
      className={cn("h-14 border-b bg-card flex items-center justify-between px-4", className)}
    >
      {/* Store Selector */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Store:</span>
        {storesLoading ? (
          <span className="text-sm">Loading...</span>
        ) : stores.length === 0 ? (
          <Link to="/stores/new" className="text-sm font-medium text-primary hover:underline">
            Create store
          </Link>
        ) : (
          <select
            value={currentStore?.id || ""}
            onChange={(e) => {
              const store = stores.find((s) => s.id === e.target.value);
              setStore(store ?? null);
            }}
            className="text-sm bg-background border rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {stores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* User Menu */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-accent"
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback>
              {user?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">{user?.name || user?.email}</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 top-full mt-1 w-48 rounded-md border bg-popover shadow-lg z-50">
            <Link
              to="/settings"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent"
              onClick={() => setDropdownOpen(false)}
            >
              <User className="h-4 w-4" />
              Settings
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent w-full text-left"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
