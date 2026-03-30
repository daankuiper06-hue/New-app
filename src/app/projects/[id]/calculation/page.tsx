"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { euro } from "@/lib/format";

type Item = {
  id: string;
  name: string;
  quantity: number;
  buyPrice: number;
  sellPrice: number;
  vat: number;
};

export default function CalculationPage({ params }: { params: { id: string } }) {
  const [items, setItems] = useState<Item[]>([]);
  const [form, setForm] = useState({ name: "", quantity: "1", buyPrice: "", sellPrice: "", vat: "21" });
  const [message, setMessage] = useState("");

  const load = async () => {
    const res = await fetch(`/api/projects/${params.id}/calculation`, { cache: "no-store" });
    setItems(await res.json());
  };

  useEffect(() => {
    load();
  }, [params.id]);

  const totals = useMemo(() => {
    return items.reduce(
      (acc, item) => {
        const buy = item.quantity * item.buyPrice;
        const sell = item.quantity * item.sellPrice;
        acc.buy += buy;
        acc.sell += sell;
        acc.profit += sell - buy;
        return acc;
      },
      { buy: 0, sell: 0, profit: 0 }
    );
  }, [items]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage("");
    const res = await fetch(`/api/projects/${params.id}/calculation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        quantity: Number(form.quantity),
        buyPrice: Number(form.buyPrice),
        sellPrice: Number(form.sellPrice),
        vat: Number(form.vat),
      }),
    });
    if (!res.ok) {
      setMessage("Opslaan is niet gelukt.");
      return;
    }
    setForm({ name: "", quantity: "1", buyPrice: "", sellPrice: "", vat: "21" });
    setMessage("Calculatieregel opgeslagen.");
    await load();
  };

  return (
    <div className="stack">
      <div className="page-header">
        <div>
          <div className="kicker">Project</div>
          <h2>Calculatie</h2>
          <div className="note">Intern overzicht voor materiaal en marge.</div>
        </div>
      </div>

      <div className="grid-4">
        <div className="card"><div className="stat-label">Inkoop totaal</div><div className="stat-value">{euro(totals.buy)}</div></div>
        <div className="card"><div className="stat-label">Verkoop incl. btw</div><div className="stat-value">{euro(totals.sell)}</div></div>
        <div className="card"><div className="stat-label">Winst</div><div className="stat-value">{euro(totals.profit)}</div></div>
        <div className="card"><div className="stat-label">Aantal regels</div><div className="stat-value">{items.length}</div></div>
      </div>

      <div className="card">
        <form className="stack" onSubmit={submit}>
          <div className="form-grid">
            <div className="field"><label>Materiaal</label><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
            <div className="field"><label>Aantal</label><input className="input" type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required /></div>
            <div className="field"><label>Inkoop p.s.</label><input className="input" type="number" step="0.01" value={form.buyPrice} onChange={(e) => setForm({ ...form, buyPrice: e.target.value })} required /></div>
            <div className="field"><label>Verkoop p.s. incl. btw</label><input className="input" type="number" step="0.01" value={form.sellPrice} onChange={(e) => setForm({ ...form, sellPrice: e.target.value })} required /></div>
            <div className="field"><label>BTW %</label><input className="input" type="number" step="0.01" value={form.vat} onChange={(e) => setForm({ ...form, vat: e.target.value })} required /></div>
          </div>
          <div className="row"><button className="button" type="submit">Regel opslaan</button>{message ? <div className="note">{message}</div> : null}</div>
        </form>
      </div>

      <div className="card table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Materiaal</th>
              <th>Aantal</th>
              <th>Inkoop p.s.</th>
              <th>Verkoop p.s. incl. btw</th>
              <th>BTW %</th>
              <th>Winst regel</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.quantity}</td>
                <td>{euro(item.buyPrice)}</td>
                <td>{euro(item.sellPrice)}</td>
                <td>{item.vat}%</td>
                <td>{euro(item.quantity * (item.sellPrice - item.buyPrice))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
