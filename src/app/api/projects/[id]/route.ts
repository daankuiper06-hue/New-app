// @ts-nocheck
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_request, { params }) {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: { customer: true },
  });
  if (!project) return NextResponse.json({ error: "Project niet gevonden" }, { status: 404 });
  return NextResponse.json(project);
}
