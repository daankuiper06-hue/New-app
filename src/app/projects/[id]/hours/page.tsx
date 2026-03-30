"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { dateNl } from "@/lib/format";

type TimeEntry = {
  id: string;
  date: string;
  hours: number;
  note?: string | null;
};

export default function HoursPage({ params }: { params: { id: string } }) {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [form, setForm] = useState({ date: "", hours: "", note: "" });
  const [message, setMessage] = useState("");

  const load = async () => {
    const res = await fetch(`/api/projects/${params.id}/hours`, { cache: "no-store" });
    setEntries(await res.json());
  };

  useEffect(() => {
    load();
  }, [params.id]);

  const totalHours = useMemo(() => entries.reduce((sum, item) => sum + item.hours, 0), [entries]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage("");
    const res = await fetch(`/api/projects/${params.id}/hours`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, hours: Number(form.hours) }),
    });
    if (!res.ok) {
      setMessage("Opslaan is niet gelukt.");
      return;
    }
    setForm({ date: "", hours: "", note: "" });
    setMessage("Uren opgeslagen.");
    await load();
  };

  return (
    <div className="stack">
      <div className="page-header">
        <div>
          <div className="kicker">Project</div>
          <h2>Urenregistratie</h2>
          <div className="note">Totaal uren: {totalHours.toFixed(2)}</div>
        </div>
      </div>

      <div className="card">
        <form className="stack" onSubmit={submit}>
          <div className="form-grid">
            <div className="field">
              <label>Datum</label>
              <input className="input" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
            </div>
            <div className="field">
              <label>Uren</label>
              <input className="input" type="number" step="0.25" value={form.hours} onChange={(e) => setForm({ ...form, hours: e.target.value })} required />
            </div>
            <div className="field" style={{ gridColumn: "1 / -1" }}>
              <label>Omschrijving</label>
              <textarea className="textarea" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
            </div>
          </div>
          <div className="row">
            <button className="button" type="submit">Uren opslaan</button>
            {message ? <div className="note">{message}</div> : null}
          </div>
        </form>
      </div>

      <div className="card table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Datum</th>
              <th>Uren</th>
              <th>Omschrijving</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id}>
                <td>{dateNl(entry.date)}</td>
                <td>{entry.hours.toFixed(2)}</td>
                <td>{entry.note || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
