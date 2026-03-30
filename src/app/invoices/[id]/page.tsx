"use client";

import { useEffect, useMemo, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

type InvoiceItem = {
  id: string;
  name: string;
  quantity: number;
  priceIncl: number;
  vat: number;
};

type Customer = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
};

type Project = {
  id: string;
  name: string;
};

type Invoice = {
  id: string;
  createdAt: string;
  customer: Customer;
  project?: Project | null;
  items: InvoiceItem[];
};

export default function InvoicePage({
  params,
}: {
  params: { id: string };
}) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadInvoice() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(`/api/invoices/${params.id}`, {
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error("Factuur kon niet geladen worden");
        }

        const data = await res.json();
        setInvoice(data);
      } catch (err) {
        setError("Factuur kon niet geladen worden");
      } finally {
        setLoading(false);
      }
    }

    loadInvoice();
  }, [params.id]);

  const totals = useMemo(() => {
    if (!invoice) {
      return { totalIncl: 0, totalVat: 0 };
    }

    const totalIncl = invoice.items.reduce(
      (sum, item) => sum + item.quantity * item.priceIncl,
      0
    );

    const totalVat = invoice.items.reduce((sum, item) => {
      const subtotal = item.quantity * item.priceIncl;
      const vatAmount = subtotal - subtotal / (1 + item.vat / 100);
      return sum + vatAmount;
    }, 0);

    return { totalIncl, totalVat };
  }, [invoice]);

  async function exportPDF() {
    const element = document.getElementById("invoice-pdf");
    if (!element) return;

    try {
      setDownloading(true);

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 10;

      const contentWidth = pageWidth - margin * 2;
      const contentHeight = (canvas.height * contentWidth) / canvas.width;

      if (contentHeight <= pageHeight - margin * 2) {
        pdf.addImage(imgData, "PNG", margin, margin, contentWidth, contentHeight);
      } else {
        let remainingHeight = contentHeight;
        let position = 0;

        while (remainingHeight > 0) {
          pdf.addImage(
            imgData,
            "PNG",
            margin,
            margin - position,
            contentWidth,
            contentHeight
          );

          remainingHeight -= pageHeight - margin * 2;
          position += pageHeight - margin * 2;

          if (remainingHeight > 0) {
            pdf.addPage();
          }
        }
      }

      pdf.save(`factuur-${invoice?.id ?? "download"}.pdf`);
    } finally {
      setDownloading(false);
    }
  }

  if (loading) {
    return <div className="p-6">Factuur laden...</div>;
  }

  if (error || !invoice) {
    return <div className="p-6 text-red-600">{error || "Factuur niet gevonden"}</div>;
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Factuur</h1>
          <p className="text-sm text-gray-500">
            Gekoppeld aan klant en project
          </p>
        </div>

        <button
          onClick={exportPDF}
          disabled={downloading}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {downloading ? "PDF maken..." : "Download PDF"}
        </button>
      </div>

      <div
        id="invoice-pdf"
        className="rounded-2xl border bg-white p-8 shadow-sm"
      >
        <div className="mb-8 flex items-start justify-between gap-6">
          <div>
            <h2 className="text-3xl font-bold">D Kuiper Techniek</h2>
            <p className="mt-1 text-sm text-gray-500">Materiaalfactuur</p>
          </div>

          <div className="text-right text-sm">
            <p>
              <span className="font-medium">Factuur ID:</span> {invoice.id}
            </p>
            <p>
              <span className="font-medium">Datum:</span>{" "}
              {new Date(invoice.createdAt).toLocaleDateString("nl-NL")}
            </p>
            {invoice.project?.name ? (
              <p>
                <span className="font-medium">Project:</span> {invoice.project.name}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mb-8 grid gap-6 md:grid-cols-2">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
              Klant
            </p>
            <p className="font-medium">{invoice.customer.name}</p>
            {invoice.customer.email ? (
              <p className="text-sm text-gray-600">{invoice.customer.email}</p>
            ) : null}
            {invoice.customer.phone ? (
              <p className="text-sm text-gray-600">{invoice.customer.phone}</p>
            ) : null}
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
              Omschrijving
            </p>
            <p className="text-sm text-gray-600">
              Factuur met materiaalregels inclusief btw per stuk.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-y bg-gray-50 text-left">
                <th className="p-3">Omschrijving</th>
                <th className="p-3">Aantal</th>
                <th className="p-3">Prijs p.s. incl btw</th>
                <th className="p-3">Subtotaal incl btw</th>
                <th className="p-3">BTW bedrag</th>
              </tr>
            </thead>

            <tbody>
              {invoice.items.map((item) => {
                const subtotal = item.quantity * item.priceIncl;
                const vatAmount = subtotal - subtotal / (1 + item.vat / 100);

                return (
                  <tr key={item.id} className="border-b">
                    <td className="p-3">{item.name}</td>
                    <td className="p-3">{item.quantity}</td>
                    <td className="p-3">€ {item.priceIncl.toFixed(2)}</td>
                    <td className="p-3">€ {subtotal.toFixed(2)}</td>
                    <td className="p-3">€ {vatAmount.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-8 ml-auto max-w-sm space-y-2 rounded-xl border bg-gray-50 p-4">
          <div className="flex items-center justify-between text-sm">
            <span>BTW totaal</span>
            <span>€ {totals.totalVat.toFixed(2)}</span>
          </div>

          <div className="flex items-center justify-between border-t pt-2 text-lg font-semibold">
            <span>Totaal incl btw</span>
            <span>€ {totals.totalIncl.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
