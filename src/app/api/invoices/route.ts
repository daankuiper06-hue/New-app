// @ts-nocheck
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const invoices = await prisma.invoice.findMany({
    include: {
      customer: true,
      project: true,
      items: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(invoices);
}

export async function POST(request) {
  const body = await request.json();
  const { customerId, projectId } = body;

  const calcItems = await prisma.calculationItem.findMany({
    where: { projectId },
    orderBy: { createdAt: "asc" },
  });

  if (!calcItems.length) {
    return NextResponse.json(
      { error: "Dit project heeft nog geen calculatieregels." },
      { status: 400 }
    );
  }

  const invoice = await prisma.invoice.create({
    data: {
      customerId,
      projectId,
      items: {
        create: calcItems.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          priceIncl: item.sellPrice,
          vat: item.vat,
        })),
      },
    },
    include: {
      customer: true,
      project: true,
      items: true,
    },
  });

  return NextResponse.json(invoice, { status: 201 });
}
