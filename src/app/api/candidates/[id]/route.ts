import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const candidate = await prisma.candidate.findUnique({
    where: { id: params.id },
  });

  if (!candidate) {
    return NextResponse.json({ message: "Candidate not found" }, { status: 404 });
  }

  return NextResponse.json(candidate);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  await prisma.candidate.delete({
    where: { id: params.id },
  });

  return NextResponse.json({ message: "Candidate deleted successfully" });
}
