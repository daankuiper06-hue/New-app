import Link from "next/link";

export default function NotFound() {
  return (
    <div className="rounded-3xl bg-white p-10 text-center shadow-soft">
      <h2 className="text-2xl font-semibold">Pagina niet gevonden</h2>
      <p className="mt-2 text-sm text-slate-500">Deze pagina bestaat niet of is verwijderd.</p>
      <Link href="/" className="mt-6 inline-flex rounded-2xl bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark">
        Terug naar dashboard
      </Link>
    </div>
  );
}
