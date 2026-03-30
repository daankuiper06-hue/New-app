import { revalidatePath } from "next/cache";
import { PageHeader } from "@/components/page-header";
import { prisma } from "@/lib/prisma";
import { customerSchema } from "@/lib/validation";

async function createCustomer(formData: FormData) {
  "use server";

  const parsed = customerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    address: formData.get("address")
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Ongeldige invoer");
  }

  await prisma.customer.create({ data: parsed.data });
  revalidatePath("/customers");
  revalidatePath("/");
}

export default async function CustomersPage() {
  const customers = await prisma.customer.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <PageHeader title="Klanten" description="Voeg klanten toe met de juiste contactgegevens voor projecten en facturen." />

      <div className="grid gap-6 xl:grid-cols-[24rem_1fr]">
        <div className="rounded-3xl bg-white p-6 shadow-soft">
          <h3 className="text-lg font-semibold">Nieuwe klant</h3>
          <form action={createCustomer} className="mt-4 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Naam</label>
              <input name="name" placeholder="Bijv. Jansen Tuinen" required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">E-mail</label>
              <input name="email" type="email" placeholder="info@bedrijf.nl" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Telefoon</label>
              <input name="phone" placeholder="06..." />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Adres</label>
              <textarea name="address" rows={4} placeholder="Straat + plaats" />
            </div>
            <button className="w-full rounded-2xl bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark">
              Klant opslaan
            </button>
          </form>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-soft">
          <h3 className="text-lg font-semibold">Klantenlijst</h3>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="py-3 pr-4">Naam</th>
                  <th className="py-3 pr-4">E-mail</th>
                  <th className="py-3 pr-4">Telefoon</th>
                  <th className="py-3 pr-4">Adres</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id} className="border-b border-slate-100 last:border-0">
                    <td className="py-3 pr-4 font-medium">{customer.name}</td>
                    <td className="py-3 pr-4">{customer.email || "-"}</td>
                    <td className="py-3 pr-4">{customer.phone || "-"}</td>
                    <td className="py-3 pr-4 whitespace-pre-wrap">{customer.address || "-"}</td>
                  </tr>
                ))}
                {customers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-slate-500">
                      Nog geen klanten toegevoegd.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
