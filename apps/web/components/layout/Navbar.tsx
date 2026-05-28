"use client";

import Link from "next/link";
import { AccountMenu } from "@/components/auth/AccountMenu";
import { APP_NAME } from "@/lib/constants";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-surface/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-black tracking-tight text-primary">
              {APP_NAME}
            </span>
            <span className="rounded bg-accent-gold/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent-gold">
              GenLayer
            </span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            <NavLink href="/create">Create</NavLink>
            <NavLink href="/join">Join</NavLink>
            <NavLink href="/leaderboard">Leaderboard</NavLink>
            <NavLink href="/history">History</NavLink>
          </div>
        </div>

        <AccountMenu />
      </div>
    </nav>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-md px-3 py-1.5 text-sm font-medium text-text-muted transition-colors hover:bg-surface-soft hover:text-primary"
    >
      {children}
    </Link>
  );
}
