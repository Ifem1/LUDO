import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "LudoProof — Provably Fair Ludo on GenLayer",
  description:
    "A backendless, provably fair Ludo game. All game logic, dice verification, and state live on a GenLayer Intelligent Contract.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
