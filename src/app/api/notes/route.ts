import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const candidateId = searchParams.get('candidateId');

  if (!candidateId) {
    return NextResponse.json({ message: 'Missing candidateId' }, { status: 400 });
  }

  const notes = await prisma.note.findMany({
    where: { candidateId },
    include: {
      sender: true,
      taggedUserRefs: {
        include: {
          user: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json(notes);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { message, senderId, candidateId, tags, taggedUserIds } = body;

  if (!message || !senderId || !candidateId) {
    return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
  }

  // Create note first
  const newNote = await prisma.note.create({
    data: {
      message,
      senderId,
      candidateId,
      tags,
    },
  });

  // Attach tagged users
  if (taggedUserIds && taggedUserIds.length) {
    await prisma.taggedUser.createMany({
      data: taggedUserIds.map((userId: string) => ({
        noteId: newNote.id,
        userId,
      })),
    });
  }

  // Fetch note with includes (so no type conflict now)
  const fullNote = await prisma.note.findUnique({
    where: { id: newNote.id },
    include: {
      sender: true,
      taggedUserRefs: {
        include: {
          user: true,
        },
      },
    },
  });

  return NextResponse.json(fullNote, { status: 201 });
}
