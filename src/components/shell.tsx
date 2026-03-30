import { ReactNode } from "react";
import { Sidebar } from "@/components/sidebar";

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[18rem_1fr]">
      <Sidebar />
      <main className="p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
