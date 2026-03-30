"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { dateNl } from "@/lib/format";

type Customer = { id: string; name: string };
type Project = { id: string; name: string; customerId: string; customer: Customer };
type Invoice = { id: string; createdAt: string; customer: Customer; project?: { name: string } | null; items: { id: string }[] };

export default function InvoicesPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [form, setForm] = useState({ customerId: "", projectId: "" });
  const [message, setMessage] = useState("");

  const load = async () => {
    const [customersRes, projectsRes, invoicesRes] = await Promise.all([
      fetch("/api/customers", { cache: "no-store" }),
      fetch("/api/projects", { cache: "no-store" }),
      fetch("/api/invoices", { cache: "no-store" }),
    ]);

    const [customersData, projectsData, invoicesData] = await Promise.all([
      customersRes.json(),
      projectsRes.json(),
      invoicesRes.json(),
    ]);

    setCustomers(customersData);
    setProjects(projectsData);
    setInvoices(invoicesData);
    if (!form.customerId && customersData[0]) {
      setForm({ customerId: customersData[0].id, projectId: "" });
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filteredProjects = projects.filter((project) => project.customerId === form.customerId);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage("");
    const res = await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: "Factuur maken is niet gelukt." }));
      setMessage(error.error || "Factuur maken is niet gelukt.");
      return;
    }
    setMessage("Factuur aangemaakt vanuit calculatie.");
    await load();
  };

  return (
    <div className="stack">
      <div className="page-header">
        <div>
          <div className="kicker">Facturen</div>
          <h2>Materiaalfacturen</h2>
          <div className="note">Per project wordt de calculatie omgezet naar factuurregels.</div>
        </div>
      </div>

      <div className="card">
        <form className="stack" onSubmit={submit}>
          <div className="form-grid">
            <div className="field">
              <label>Klant</label>
              <select className="select" value={form.customerId} onChange={(e) => setForm({ customerId: e.target.value, projectId: "" })} required>
                <option value="">Kies klant</option>
                {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Project</label>
              <select className="select" value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })} required>
                <option value="">Kies project</option>
                {filteredProjects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
              </select>
            </div>
          </div>
          <div className="row">
            <button className="button" type="submit">Nieuwe factuur maken</button>
            {message ? <div className="note">{message}</div> : null}
          </div>
          <div className="note">Alle calculatieregels van het project worden als materiaalregels op de factuur gezet.</div>
        </form>
      </div>

      <div className="card table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Datum</th>
              <th>Klant</th>
              <th>Project</th>
              <th>Regels</th>
              <th>Openen</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice.id}>
                <td>{dateNl(invoice.createdAt)}</td>
                <td>{invoice.customer.name}</td>
                <td>{invoice.project?.name || "-"}</td>
                <td>{invoice.items.length}</td>
                <td><Link className="link-pill" href={`/invoices/${invoice.id}`}>Open factuur</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
