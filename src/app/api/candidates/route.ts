import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const candidates = await prisma.candidate.findMany();
  return NextResponse.json(candidates);
}

export async function POST(req: Request) {
  const { name, email } = await req.json();

  if (!name || !email) {
    return NextResponse.json({ message: "Name and email are required" }, { status: 400 });
  }

  const existingCandidate = await prisma.candidate.findUnique({
    where: { email },
  });

  if (existingCandidate) {
    return NextResponse.json({ message: "Candidate with this email already exists" }, { status: 409 });
  }

  const candidate = await prisma.candidate.create({
    data: { name, email },
  });

  return NextResponse.json(candidate, { status: 201 });
}
