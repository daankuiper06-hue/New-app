"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";

type Option = {
  id: string;
  name: string;
};

type ItemRow = {
  description: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
};

const emptyRow = (): ItemRow => ({
  description: "",
  quantity: 1,
  unitPrice: 0,
  vatRate: 21
});

export function InvoiceForm({
  customers,
  projects
}: {
  customers: Option[];
  projects: Option[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().slice(0, 10));
  const [customerId, setCustomerId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<ItemRow[]>([emptyRow()]);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const vatTotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice * (item.vatRate / 100), 0);
    return { subtotal, vatTotal, total: subtotal + vatTotal };
  }, [items]);

  const updateItem = (index: number, key: keyof ItemRow, value: string) => {
    setItems((current) =>
      current.map((item, i) => {
        if (i !== index) return item;
        if (key === "description") return { ...item, description: value };
        return { ...item, [key]: Number(value) };
      })
    );
  };

  const addRow = () => setItems((current) => [...current, emptyRow()]);
  const removeRow = (index: number) => setItems((current) => current.filter((_, i) => i !== index));

  const submit = async () => {
    setError("");
    setIsSaving(true);

    try {
      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, invoiceDate, customerId, projectId, notes, items })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Opslaan mislukt");
      }

      router.push(`/invoices/${result.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Onbekende fout");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-6 shadow-soft">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="xl:col-span-2">
            <label className="mb-1 block text-sm font-medium">Factuurtitel</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Bijv. Materiaal buitenverlichting" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Datum</label>
            <input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Klant</label>
            <select value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
              <option value="">Geen klant</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </div>
          <div className="xl:col-span-2">
            <label className="mb-1 block text-sm font-medium">Project</label>
            <select value={projectId} onChange={(e) => setProjectId(e.target.value)}>
              <option value="">Geen project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
          <div className="xl:col-span-2">
            <label className="mb-1 block text-sm font-medium">Notities</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} placeholder="Optionele notities" />
          </div>
        </div>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Materiaalregels</h3>
          <button onClick={addRow} className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50">
            <Plus className="h-4 w-4" /> Regel toevoegen
          </button>
        </div>

        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={index} className="grid gap-3 rounded-2xl border border-slate-200 p-4 md:grid-cols-12">
              <div className="md:col-span-5">
                <label className="mb-1 block text-sm font-medium">Omschrijving</label>
                <input value={item.description} onChange={(e) => updateItem(index, "description", e.target.value)} placeholder="Bijv. Grondspot zwart" />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium">Aantal</label>
                <input type="number" min="0" step="0.01" value={item.quantity} onChange={(e) => updateItem(index, "quantity", e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium">Prijs p/st</label>
                <input type="number" min="0" step="0.01" value={item.unitPrice} onChange={(e) => updateItem(index, "unitPrice", e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium">BTW %</label>
                <input type="number" min="0" step="0.01" value={item.vatRate} onChange={(e) => updateItem(index, "vatRate", e.target.value)} />
              </div>
              <div className="md:col-span-1 flex items-end">
                <button
                  onClick={() => removeRow(index)}
                  disabled={items.length === 1}
                  className="inline-flex h-10 w-full items-center justify-center rounded-2xl border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-soft">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Subtotaal excl. btw</p>
            <p className="mt-2 text-2xl font-semibold">€ {totals.subtotal.toFixed(2)}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">BTW bedrag</p>
            <p className="mt-2 text-2xl font-semibold">€ {totals.vatTotal.toFixed(2)}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Totaal incl. btw</p>
            <p className="mt-2 text-2xl font-semibold">€ {totals.total.toFixed(2)}</p>
          </div>
        </div>

        {error ? <p className="mt-4 text-sm font-medium text-red-600">{error}</p> : null}

        <div className="mt-6 flex justify-end">
          <button onClick={submit} disabled={isSaving} className="rounded-2xl bg-brand px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-50">
            {isSaving ? "Bezig met opslaan..." : "Factuur opslaan"}
          </button>
        </div>
      </div>
    </div>
  );
}
