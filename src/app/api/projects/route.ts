// @ts-nocheck
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const projects = await prisma.project.findMany({
    include: { customer: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(projects);
}

export async function POST(request) {
  const body = await request.json();
  const project = await prisma.project.create({
    data: {
      name: body.name,
      customerId: body.customerId,
    },
  });
  return NextResponse.json(project, { status: 201 });
}
