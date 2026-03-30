// @ts-nocheck
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const customers = await prisma.customer.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(customers);
}

export async function POST(request) {
  const body = await request.json();
  const customer = await prisma.customer.create({
    data: {
      name: body.name,
      email: body.email || null,
      phone: body.phone || null,
    },
  });
  return NextResponse.json(customer, { status: 201 });
}
