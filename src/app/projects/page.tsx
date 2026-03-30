"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { dateNl } from "@/lib/format";

type Customer = { id: string; name: string };
type Project = { id: string; name: string; createdAt: string; customer: Customer };

export default function ProjectsPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [form, setForm] = useState({ name: "", customerId: "" });
  const [message, setMessage] = useState("");

  const load = async () => {
    const [customersRes, projectsRes] = await Promise.all([
      fetch("/api/customers", { cache: "no-store" }),
      fetch("/api/projects", { cache: "no-store" }),
    ]);

    const [customersData, projectsData] = await Promise.all([
      customersRes.json(),
      projectsRes.json(),
    ]);

    setCustomers(customersData);
    setProjects(projectsData);
    if (!form.customerId && customersData[0]) {
      setForm((old) => ({ ...old, customerId: customersData[0].id }));
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage("");
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      setMessage("Project opslaan is niet gelukt.");
      return;
    }
    setForm({ ...form, name: "" });
    setMessage("Project opgeslagen.");
    await load();
  };

  return (
    <div className="stack">
      <div className="page-header">
        <div>
          <div className="kicker">Beheer</div>
          <h2>Projecten</h2>
          <div className="note">Koppel elk project aan een klant.</div>
        </div>
      </div>

      <div className="card">
        <form className="stack" onSubmit={submit}>
          <div className="form-grid">
            <div className="field">
              <label>Projectnaam</label>
              <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="field">
              <label>Klant</label>
              <select className="select" value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })} required>
                <option value="">Kies klant</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>{customer.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="row">
            <button className="button" type="submit">Project opslaan</button>
            {message ? <div className="note">{message}</div> : null}
          </div>
        </form>
      </div>

      <div className="card table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Project</th>
              <th>Klant</th>
              <th>Aangemaakt</th>
              <th>Openen</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.id}>
                <td>{project.name}</td>
                <td>{project.customer.name}</td>
                <td>{dateNl(project.createdAt)}</td>
                <td><Link className="link-pill" href={`/projects/${project.id}`}>Open project</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
