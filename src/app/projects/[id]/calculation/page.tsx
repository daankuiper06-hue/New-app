import { prisma } from "@/lib/prisma";

export default async function CalculationPage({ params }: any) {
  const items = await prisma.calculationItem.findMany({
    where: { projectId: params.id },
  });

  return (
    <div>
      <h1>Calculatie</h1>

      {items.map((item) => (
        <div key={item.id}>
          {item.name} - {item.quantity}x - €{item.sellPrice}
        </div>
      ))}
    </div>
  );
}
