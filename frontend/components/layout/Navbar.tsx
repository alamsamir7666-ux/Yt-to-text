"use client";

import Link from "next/link";
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { History } from "lucide-react";
import HamburgerButton from "./HamburgerButton";
import type { KindeUser } from "@kinde-oss/kinde-auth-nextjs/types";

interface Props {
  user: KindeUser | null;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export default function Navbar({ user, sidebarOpen, onToggleSidebar }: Props) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-40 h-16 bg-bg-primary/80 backdrop-blur-md border-b border-border">
      <div className="max-w-5xl mx-auto h-full px-4 flex items-center justify-between">
        {/* Left: Hamburger + Logo */}
        <div className="flex items-center gap-3">
          <HamburgerButton isOpen={sidebarOpen} onClick={onToggleSidebar} />
          <Link href="/" className="font-display text-xl font-bold text-white">
            Transcript<span className="text-accent">AI</span>
          </Link>
        </div>

        {/* Right: History + User */}
        <div className="flex items-center gap-3">
          <Link
            href="/history"
            className="hidden sm:flex items-center gap-1.5 text-sm text-text-muted hover:text-white transition-colors"
          >
            <History size={15} />
            History
          </Link>

          {user && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-text-muted hidden sm:block">
                {user.given_name || user.email}
              </span>
              <LogoutLink className="text-xs text-text-muted hover:text-error transition-colors px-2 py-1 border border-border rounded-lg hover:border-error/30">
                Sign out
              </LogoutLink>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
