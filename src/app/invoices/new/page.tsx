import { PageHeader } from "@/components/page-header";
import { InvoiceForm } from "@/components/invoices/invoice-form";
import { prisma } from "@/lib/prisma";

export default async function NewInvoicePage() {
  const [customers, projects] = await Promise.all([
    prisma.customer.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.project.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } })
  ]);

  return (
    <div>
      <PageHeader title="Nieuwe factuur" description="Maak een nette materiaalfactuur met prijs per stuk, subtotaal en btw-bedrag." />
      <InvoiceForm customers={customers} projects={projects} />
    </div>
  );
}
