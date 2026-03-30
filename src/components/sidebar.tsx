import Link from "next/link";
import { FileText, FolderKanban, Home, PlusCircle, Users } from "lucide-react";

const links = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/customers", label: "Klanten", icon: Users },
  { href: "/projects", label: "Projecten", icon: FolderKanban },
  { href: "/invoices", label: "Facturen", icon: FileText },
  { href: "/invoices/new", label: "Nieuwe factuur", icon: PlusCircle }
];

export function Sidebar() {
  return (
    <aside className="sticky top-0 h-screen w-full border-r border-slate-200 bg-slate-950 text-white lg:w-72">
      <div className="border-b border-slate-800 px-6 py-6">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">D Kuiper Techniek</p>
        <h1 className="mt-2 text-2xl font-semibold">Projecten App</h1>
        <p className="mt-2 text-sm text-slate-400">Strakke navigatie voor klanten, projecten en materiaalfacturen.</p>
      </div>

      <nav className="space-y-1 p-4">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-slate-200 hover:bg-slate-800"
          >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
