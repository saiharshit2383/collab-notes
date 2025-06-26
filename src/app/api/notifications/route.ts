import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ message: 'Missing userId' }, { status: 400 });
    }

    const notes = await prisma.note.findMany({
      where: {
        taggedUserRefs: {
          some: { userId },
        },
      },
      include: {
        candidate: true,
        sender: true,
        taggedUserRefs: { include: { user: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(notes);
    
  } catch (error) {
    console.error('🔴 Notification fetch error:', error);
    return NextResponse.json({ message: 'Server Error', error }, { status: 500 });
  }
}
