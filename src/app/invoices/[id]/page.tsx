import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { prisma } from "@/lib/prisma";
import { decimalToNumber, euro, toInputDate } from "@/lib/utils";

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { customer: true, project: true, items: true }
  });

  if (!invoice) notFound();

  return (
    <div>
      <PageHeader
        title={invoice.title}
        description="Factuurdetail met materiaalregels, btw-bedrag en totaal."
        action={
          <Link href="/invoices" className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50">
            Terug naar facturen
          </Link>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_20rem]">
        <div className="rounded-3xl bg-white p-6 shadow-soft">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-slate-500">Datum</p>
              <p className="mt-1 font-medium">{toInputDate(invoice.invoiceDate)}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Klant</p>
              <p className="mt-1 font-medium">{invoice.customer?.name ?? "-"}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Project</p>
              <p className="mt-1 font-medium">{invoice.project?.name ?? "-"}</p>
            </div>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="py-3 pr-4">Omschrijving</th>
                  <th className="py-3 pr-4">Aantal</th>
                  <th className="py-3 pr-4">Prijs p/st</th>
                  <th className="py-3 pr-4">BTW %</th>
                  <th className="py-3 pr-4">BTW bedrag</th>
                  <th className="py-3 pr-4">Subtotaal</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100 last:border-0">
                    <td className="py-3 pr-4 font-medium">{item.description}</td>
                    <td className="py-3 pr-4">{decimalToNumber(item.quantity)}</td>
                    <td className="py-3 pr-4">{euro(decimalToNumber(item.unitPrice))}</td>
                    <td className="py-3 pr-4">{decimalToNumber(item.vatRate)}%</td>
                    <td className="py-3 pr-4">{euro(decimalToNumber(item.vatAmount))}</td>
                    <td className="py-3 pr-4">{euro(decimalToNumber(item.lineTotal))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {invoice.notes ? (
            <div className="mt-6 rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Notities</p>
              <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{invoice.notes}</p>
            </div>
          ) : null}
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl bg-white p-6 shadow-soft">
            <p className="text-sm text-slate-500">Subtotaal excl. btw</p>
            <p className="mt-2 text-2xl font-semibold">{euro(decimalToNumber(invoice.subtotal))}</p>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-soft">
            <p className="text-sm text-slate-500">BTW totaal</p>
            <p className="mt-2 text-2xl font-semibold">{euro(decimalToNumber(invoice.vatTotal))}</p>
          </div>
          <div className="rounded-3xl bg-slate-950 p-6 text-white shadow-soft">
            <p className="text-sm text-slate-400">Totaal incl. btw</p>
            <p className="mt-2 text-3xl font-semibold">{euro(decimalToNumber(invoice.total))}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
