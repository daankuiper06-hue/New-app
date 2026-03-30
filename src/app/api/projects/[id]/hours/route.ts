// @ts-nocheck
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_request, { params }) {
  const entries = await prisma.timeEntry.findMany({
    where: { projectId: params.id },
    orderBy: { date: "desc" },
  });
  return NextResponse.json(entries);
}

export async function POST(request, { params }) {
  const body = await request.json();
  const entry = await prisma.timeEntry.create({
    data: {
      projectId: params.id,
      date: new Date(body.date),
      hours: Number(body.hours),
      note: body.note || null,
    },
  });
  return NextResponse.json(entry, { status: 201 });
}
