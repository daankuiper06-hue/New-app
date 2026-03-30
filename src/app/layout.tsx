import "./globals.css";
import Sidebar from "@/components/Sidebar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "D Kuiper Techniek App",
  description: "Klanten, projecten, uren, calculatie en facturen",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body>
        <div className="app-shell">
          <Sidebar />
          <main className="main">{children}</main>
        </div>
      </body>
    </html>
  );
}
