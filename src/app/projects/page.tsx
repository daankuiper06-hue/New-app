import { revalidatePath } from "next/cache";
import { PageHeader } from "@/components/page-header";
import { prisma } from "@/lib/prisma";
import { projectSchema } from "@/lib/validation";

async function createProject(formData: FormData) {
  "use server";

  const parsed = projectSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    customerId: formData.get("customerId")
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Ongeldige invoer");
  }

  await prisma.project.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description || null,
      customerId: parsed.data.customerId || null
    }
  });

  revalidatePath("/projects");
  revalidatePath("/");
}

async function renameProject(formData: FormData) {
  "use server";

  const id = String(formData.get("id") || "");
  const name = String(formData.get("rename") || "").trim();

  if (!id || name.length < 2) {
    throw new Error("Geef een geldige projectnaam op.");
  }

  await prisma.project.update({ where: { id }, data: { name } });
  revalidatePath("/projects");
  revalidatePath("/");
}

export default async function ProjectsPage() {
  const [projects, customers] = await Promise.all([
    prisma.project.findMany({ include: { customer: true }, orderBy: { createdAt: "desc" } }),
    prisma.customer.findMany({ orderBy: { name: "asc" } })
  ]);

  return (
    <div>
      <PageHeader title="Projecten" description="De projectnavigatie is opnieuw opgebouwd. Projecten en namen kun je hier direct beheren." />

      <div className="grid gap-6 xl:grid-cols-[24rem_1fr]">
        <div className="rounded-3xl bg-white p-6 shadow-soft">
          <h3 className="text-lg font-semibold">Nieuw project</h3>
          <form action={createProject} className="mt-4 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Projectnaam</label>
              <input name="name" placeholder="Bijv. Buitenverlichting voortuin" required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Klant</label>
              <select name="customerId" defaultValue="">
                <option value="">Geen klant gekoppeld</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Omschrijving</label>
              <textarea name="description" rows={4} placeholder="Korte projectomschrijving" />
            </div>
            <button className="w-full rounded-2xl bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark">
              Project opslaan
            </button>
          </form>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-soft">
          <h3 className="text-lg font-semibold">Projectmap</h3>
          <div className="mt-4 space-y-4">
            {projects.map((project) => (
              <div key={project.id} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-lg font-semibold">{project.name}</p>
                    <p className="mt-1 text-sm text-slate-500">Klant: {project.customer?.name ?? "Niet gekoppeld"}</p>
                    {project.description ? <p className="mt-2 text-sm text-slate-600">{project.description}</p> : null}
                  </div>
                  <form action={renameProject} className="flex w-full gap-2 lg:w-auto">
                    <input type="hidden" name="id" value={project.id} />
                    <input name="rename" defaultValue={project.name} className="lg:min-w-64" />
                    <button className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50">
                      Hernoemen
                    </button>
                  </form>
                </div>
              </div>
            ))}
            {projects.length === 0 ? <p className="text-sm text-slate-500">Nog geen projecten aangemaakt.</p> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
