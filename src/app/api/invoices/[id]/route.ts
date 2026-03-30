// @ts-nocheck
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_request, { params }) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: params.id },
    include: {
      customer: true,
      project: true,
      items: true,
    },
  });

  if (!invoice) {
    return NextResponse.json({ error: "Factuur niet gevonden" }, { status: 404 });
  }

  return NextResponse.json(invoice);
}
