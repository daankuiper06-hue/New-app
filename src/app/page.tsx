import Link from "next/link";
import { Euro, FileText, FolderKanban, Users } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { prisma } from "@/lib/prisma";
import { decimalToNumber, euro } from "@/lib/utils";

export default async function DashboardPage() {
  const [customers, projects, invoices, revenue] = await Promise.all([
    prisma.customer.count(),
    prisma.project.count(),
    prisma.invoice.count(),
    prisma.invoice.aggregate({ _sum: { total: true } })
  ]);

  const recentInvoices = await prisma.invoice.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { customer: true, project: true }
  });

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Overzicht van je klanten, projecten en materiaalfacturen. De navigatie en pagina's zijn opnieuw strak opgebouwd."
        action={
          <Link href="/invoices/new" className="rounded-2xl bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark">
            Nieuwe factuur
          </Link>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Klanten" value={String(customers)} icon={<Users className="h-6 w-6" />} />
        <StatCard label="Projecten" value={String(projects)} icon={<FolderKanban className="h-6 w-6" />} />
        <StatCard label="Facturen" value={String(invoices)} icon={<FileText className="h-6 w-6" />} />
        <StatCard label="Totaal omzet" value={euro(decimalToNumber(revenue._sum.total))} icon={<Euro className="h-6 w-6" />} />
      </div>

      <div className="mt-6 rounded-3xl bg-white p-6 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Recente facturen</h3>
          <Link href="/invoices" className="text-sm font-medium text-brand">Alles bekijken</Link>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500">
              <tr>
                <th className="py-3 pr-4">Titel</th>
                <th className="py-3 pr-4">Klant</th>
                <th className="py-3 pr-4">Project</th>
                <th className="py-3 pr-4">Totaal</th>
              </tr>
            </thead>
            <tbody>
              {recentInvoices.map((invoice) => (
                <tr key={invoice.id} className="border-b border-slate-100 last:border-0">
                  <td className="py-3 pr-4">
                    <Link href={`/invoices/${invoice.id}`} className="font-medium text-slate-900 hover:text-brand">
                      {invoice.title}
                    </Link>
                  </td>
                  <td className="py-3 pr-4">{invoice.customer?.name ?? "-"}</td>
                  <td className="py-3 pr-4">{invoice.project?.name ?? "-"}</td>
                  <td className="py-3 pr-4">{euro(decimalToNumber(invoice.total))}</td>
                </tr>
              ))}
              {recentInvoices.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-slate-500">
                    Nog geen facturen aangemaakt.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
