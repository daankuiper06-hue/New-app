import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id },
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
    console.error("Fout bij ophalen factuur:", error);

    return NextResponse.json(
      { error: "Er is iets misgegaan bij het ophalen van de factuur" },
      { status: 500 }
    );
  }
}
