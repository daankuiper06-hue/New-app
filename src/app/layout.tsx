import type { Metadata } from "next";
import "./globals.css";
import { Shell } from "@/components/shell";

export const metadata: Metadata = {
  title: "D Kuiper Techniek App",
  description: "Klanten, projecten en materiaalfacturen in één app"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="nl">
      <body>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
