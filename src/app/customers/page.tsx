"use client";

import { FormEvent, useEffect, useState } from "react";
import { dateNl } from "@/lib/format";

type Customer = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  createdAt: string;
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [message, setMessage] = useState("");

  const load = async () => {
    const res = await fetch("/api/customers", { cache: "no-store" });
    const data = await res.json();
    setCustomers(data);
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage("");
    const res = await fetch("/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      setMessage("Opslaan is niet gelukt.");
      return;
    }

    setForm({ name: "", email: "", phone: "" });
    setMessage("Klant opgeslagen.");
    await load();
  };

  return (
    <div className="stack">
      <div className="page-header">
        <div>
          <div className="kicker">Beheer</div>
          <h2>Klanten</h2>
          <div className="note">Voeg klanten toe voor projecten en facturen.</div>
        </div>
      </div>

      <div className="card">
        <form className="stack" onSubmit={submit}>
          <div className="form-grid">
            <div className="field">
              <label>Naam</label>
              <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="field">
              <label>E-mail</label>
              <input className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="field">
              <label>Telefoon</label>
              <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
          </div>
          <div className="row">
            <button className="button" type="submit">Klant opslaan</button>
            {message ? <div className="note">{message}</div> : null}
          </div>
        </form>
      </div>

      <div className="card table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Naam</th>
              <th>E-mail</th>
              <th>Telefoon</th>
              <th>Aangemaakt</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id}>
                <td>{customer.name}</td>
                <td>{customer.email || "-"}</td>
                <td>{customer.phone || "-"}</td>
                <td>{dateNl(customer.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
