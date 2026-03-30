"use client";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useEffect, useMemo, useState } from "react";
import { dateNl, euro } from "@/lib/format";

type InvoiceItem = {
  id: string;
  name: string;
  quantity: number;
  priceIncl: number;
  vat: number;
};

type Invoice = {
  id: string;
  createdAt: string;
  customer: { name: string; email?: string | null; phone?: string | null };
  project?: { name: string } | null;
  items: InvoiceItem[];
};

export default function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/invoices/${params.id}`, { cache: "no-store" })
      .then((r) => r.json())
      .then(setInvoice)
      .finally(() => setLoading(false));
  }, [params.id]);

  const totals = useMemo(() => {
    if (!invoice) return { totalIncl: 0, totalVat: 0 };

    return invoice.items.reduce(
      (acc, item) => {
        const subtotal = item.quantity * item.priceIncl;
        const vatAmount = subtotal - subtotal / (1 + item.vat / 100);
        acc.totalIncl += subtotal;
        acc.totalVat += vatAmount;
        return acc;
      },
      { totalIncl: 0, totalVat: 0 }
    );
  }, [invoice]);

  const downloadPdf = async () => {
    const element = document.getElementById("invoice-pdf");
    if (!element || !invoice) return;

    const canvas = await html2canvas(element, { scale: 2, backgroundColor: "#ffffff" });
    const image = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = 210;
    const margin = 8;
    const imageWidth = pageWidth - margin * 2;
    const imageHeight = (canvas.height * imageWidth) / canvas.width;
    pdf.addImage(image, "PNG", margin, margin, imageWidth, imageHeight);
    pdf.save(`factuur-${invoice.id}.pdf`);
  };

  if (loading) return <div className="card">Factuur laden...</div>;
  if (!invoice) return <div className="card error">Factuur niet gevonden.</div>;

  return (
    <div className="stack">
      <div className="page-header">
        <div>
          <div className="kicker">Factuur</div>
          <h2>Materiaalfactuur</h2>
          <div className="note">Alle prijzen op de factuur zijn incl. btw per stuk.</div>
        </div>
        <button className="button" onClick={downloadPdf}>Download PDF</button>
      </div>

      <div id="invoice-pdf" className="invoice-box stack">
        <div className="split">
          <div>
            <div className="brand-small" style={{ color: "#6b7280" }}>D Kuiper Techniek</div>
            <h3 style={{ marginTop: 0, marginBottom: 8 }}>Factuur</h3>
            <div className="note">Datum: {dateNl(invoice.createdAt)}</div>
            {invoice.project?.name ? <div className="note">Project: {invoice.project.name}</div> : null}
          </div>
          <div>
            <div className="kicker">Klant</div>
            <div>{invoice.customer.name}</div>
            {invoice.customer.email ? <div className="note">{invoice.customer.email}</div> : null}
            {invoice.customer.phone ? <div className="note">{invoice.customer.phone}</div> : null}
          </div>
        </div>

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Materiaal</th>
                <th>Aantal</th>
                <th>Prijs p.s. incl. btw</th>
                <th>Subtotaal incl. btw</th>
                <th>BTW bedrag</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item) => {
                const subtotal = item.quantity * item.priceIncl;
                const vatAmount = subtotal - subtotal / (1 + item.vat / 100);
                return (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.quantity}</td>
                    <td>{euro(item.priceIncl)}</td>
                    <td>{euro(subtotal)}</td>
                    <td>{euro(vatAmount)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="total-box">
          <div className="row" style={{ justifyContent: "space-between" }}>
            <span className="note">BTW totaal</span>
            <strong>{euro(totals.totalVat)}</strong>
          </div>
          <div className="row" style={{ justifyContent: "space-between" }}>
            <span>Totaal incl. btw</span>
            <strong>{euro(totals.totalIncl)}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
