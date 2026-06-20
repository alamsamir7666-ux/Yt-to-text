"use client";

import { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import type { KindeUser } from "@kinde-oss/kinde-auth-nextjs/types";

interface Props {
  children: React.ReactNode;
  user: KindeUser | null;
}

export default function DashboardWrapper({ children, user }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg-primary">
      <Navbar
        user={user}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(p => !p)}
      />

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="pt-16">{children}</main>
    </div>
  );
}
