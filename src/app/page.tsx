"use client";

import { useEffect, useState } from "react";
import { euro } from "@/lib/format";

type DashboardData = {
  customers: number;
  projects: number;
  invoices: number;
  totalRevenue: number;
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>({
    customers: 0,
    projects: 0,
    invoices: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    fetch("/api/dashboard", { cache: "no-store" })
      .then((r) => r.json())
      .then(setData)
      .catch(() => undefined);
  }, []);

  return (
    <div className="stack">
      <div className="page-header">
        <div>
          <div className="kicker">Overzicht</div>
          <h2>Dashboard</h2>
          <div className="note">Alles gekoppeld aan klanten en projecten.</div>
        </div>
      </div>

      <div className="grid-4">
        <div className="card">
          <div className="stat-label">Klanten</div>
          <div className="stat-value">{data.customers}</div>
        </div>
        <div className="card">
          <div className="stat-label">Projecten</div>
          <div className="stat-value">{data.projects}</div>
        </div>
        <div className="card">
          <div className="stat-label">Facturen</div>
          <div className="stat-value">{data.invoices}</div>
        </div>
        <div className="card">
          <div className="stat-label">Omzet incl. btw</div>
          <div className="stat-value">{euro(data.totalRevenue)}</div>
        </div>
      </div>

      <div className="card stack">
        <h3 style={{ margin: 0 }}>Wat zit erin</h3>
        <div className="note">
          Klanten, projecten, urenregistratie, calculatie en materiaalfacturen met PDF export.
        </div>
        <div className="link-list">
          <a className="link-pill" href="/customers">Klanten beheren</a>
          <a className="link-pill" href="/projects">Projecten beheren</a>
          <a className="link-pill" href="/invoices">Facturen maken</a>
        </div>
      </div>
    </div>
  );
}
