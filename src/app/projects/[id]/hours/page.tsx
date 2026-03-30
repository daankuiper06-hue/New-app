import { prisma } from "@/lib/prisma";

export default async function HoursPage({ params }: any) {
  const hours = await prisma.timeEntry.findMany({
    where: { projectId: params.id },
  });

  return (
    <div>
      <h1>Uren</h1>

      {hours.map((h) => (
        <div key={h.id}>
          {new Date(h.date).toLocaleDateString()} - {h.hours} uur - {h.note}
        </div>
      ))}
    </div>
  );
}
