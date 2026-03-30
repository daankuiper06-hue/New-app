import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { invoiceSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = invoiceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Ongeldige invoer" },
        { status: 400 }
      );
    }

    const items = parsed.data.items.map((item) => {
      const subtotal = item.quantity * item.unitPrice;
      const vatAmount = subtotal * (item.vatRate / 100);
      const lineTotal = subtotal + vatAmount;

      return {
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        vatRate: item.vatRate,
        vatAmount,
        lineTotal
      };
    });

    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const vatTotal = items.reduce((sum, item) => sum + item.vatAmount, 0);
    const total = items.reduce((sum, item) => sum + item.lineTotal, 0);

    const invoice = await prisma.invoice.create({
      data: {
        title: parsed.data.title,
        invoiceDate: new Date(parsed.data.invoiceDate),
        customerId: parsed.data.customerId || null,
        projectId: parsed.data.projectId || null,
        notes: parsed.data.notes || null,
        subtotal,
        vatTotal,
        total,
        items: {
          create: items
        }
      }
    });

    revalidatePath("/");
    revalidatePath("/invoices");
    revalidatePath(`/invoices/${invoice.id}`);

    return NextResponse.json({ id: invoice.id });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Opslaan van factuur is mislukt." }, { status: 500 });
  }
}
