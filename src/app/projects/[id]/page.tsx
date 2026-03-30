"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Project = {
  id: string;
  name: string;
  customer: { name: string };
};

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    fetch(`/api/projects/${params.id}`, { cache: "no-store" })
      .then((r) => r.json())
      .then(setProject)
      .catch(() => undefined);
  }, [params.id]);

  if (!project) return <div className="card">Project laden...</div>;

  return (
    <div className="stack">
      <div className="page-header">
        <div>
          <div className="kicker">Project</div>
          <h2>{project.name}</h2>
          <div className="note">Klant: {project.customer.name}</div>
        </div>
      </div>

      <div className="card">
        <div className="link-list">
          <Link className="link-pill" href={`/projects/${project.id}/hours`}>Urenregistratie</Link>
          <Link className="link-pill" href={`/projects/${project.id}/calculation`}>Calculatie</Link>
          <Link className="link-pill" href={`/invoices`}>Facturen</Link>
        </div>
      </div>
    </div>
  );
}
