import { prisma } from "@/lib/prisma";

export default async function InvoicePage({ params }: any) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: params.id },
    include: {
      customer: true,
      project: true,
      items: true,
    },
  });

  if (!invoice) {
    return <div>Factuur niet gevonden</div>;
  }

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow">
      <h1 className="text-2xl font-semibold mb-4">Factuur</h1>

      {/* KLANT */}
      <div className="mb-6">
        <p className="font-medium">{invoice.customer.name}</p>
        <p className="text-sm text-gray-500">
          Datum: {new Date(invoice.createdAt).toLocaleDateString()}
        </p>
      </div>

      {/* TABEL */}
      <table className="w-full text-sm border">
        <thead className="bg-gray-100">
          <tr>
            <th className="text-left p-2">Omschrijving</th>
            <th className="text-left p-2">Aantal</th>
            <th className="text-left p-2">Prijs p.s. incl btw</th>
            <th className="text-left p-2">Subtotaal incl btw</th>
            <th className="text-left p-2">BTW bedrag</th>
          </tr>
        </thead>

        <tbody>
          {invoice.items.map((item) => {
            const subtotal = item.quantity * item.priceIncl;
            const vatAmount = subtotal - subtotal / (1 + item.vat / 100);

            return (
              <tr key={item.id} className="border-t">
                <td className="p-2">{item.name}</td>
                <td className="p-2">{item.quantity}</td>
                <td className="p-2">€{item.priceIncl.toFixed(2)}</td>
                <td className="p-2">€{subtotal.toFixed(2)}</td>
                <td className="p-2">€{vatAmount.toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* TOTALEN */}
      <div className="mt-6 text-right">
        {(() => {
          const totalIncl = invoice.items.reduce(
            (sum, item) => sum + item.quantity * item.priceIncl,
            0
          );

          const totalVat = invoice.items.reduce((sum, item) => {
            const subtotal = item.quantity * item.priceIncl;
            return sum + (subtotal - subtotal / (1 + item.vat / 100));
          }, 0);

          return (
            <>
              <p className="text-sm">BTW totaal: €{totalVat.toFixed(2)}</p>
              <p className="text-lg font-semibold">
                Totaal incl btw: €{totalIncl.toFixed(2)}
              </p>
            </>
          );
        })()}
      </div>
    </div>
  );
}
