import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const id = context.params.id;

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        customer: true,
        project: true,
        items: true,
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: "Factuur niet gevonden" },
        { status: 404 }
      );
    }

    return NextResponse.json(invoice);
  } catch (error) {
    return NextResponse.json(
      { error: "Server fout" },
      { status: 500 }
    );
  }
}
