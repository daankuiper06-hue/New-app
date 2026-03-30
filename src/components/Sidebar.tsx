"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/customers", label: "Klanten" },
  { href: "/projects", label: "Projecten" },
  { href: "/invoices", label: "Facturen" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="brand-small">D Kuiper Techniek</div>
      <h1 className="brand-title">Projecten App</h1>
      <p className="muted">Klanten, projecten, uren, calculatie en facturen.</p>

      <nav className="nav-list">
        {links.map((link) => {
          const active = pathname === link.href || pathname.startsWith(link.href + "/");
          return (
            <Link
              key={link.href}
              href={link.href}
              className={active ? "nav-link active" : "nav-link"}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
