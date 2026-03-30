// @ts-nocheck
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_request, { params }) {
  const items = await prisma.calculationItem.findMany({
    where: { projectId: params.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(items);
}

export async function POST(request, { params }) {
  const body = await request.json();
  const item = await prisma.calculationItem.create({
    data: {
      projectId: params.id,
      name: body.name,
      quantity: Number(body.quantity),
      buyPrice: Number(body.buyPrice),
      sellPrice: Number(body.sellPrice),
      vat: Number(body.vat),
    },
  });
  return NextResponse.json(item, { status: 201 });
}
