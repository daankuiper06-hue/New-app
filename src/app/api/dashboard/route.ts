// @ts-nocheck
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [customers, projects, invoices, invoiceItems] = await Promise.all([
    prisma.customer.count(),
    prisma.project.count(),
    prisma.invoice.count(),
    prisma.invoiceItem.findMany({ select: { quantity: true, priceIncl: true } }),
  ]);

  const totalRevenue = invoiceItems.reduce((sum, item) => sum + item.quantity * item.priceIncl, 0);
  return NextResponse.json({ customers, projects, invoices, totalRevenue });
}
