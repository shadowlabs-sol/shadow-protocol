import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('shadow-session')?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'No session' },
        { status: 401 }
      );
    }

    const session = await prisma.session.findUnique({
      where: { token: sessionToken },
      include: {
        user: {
          select: {
            id: true,
            walletAddress: true,
            username: true,
            avatar: true,
            verified: true,
            email: true,
            bio: true,
            totalBids: true,
            auctionsWon: true,
            auctionsCreated: true,
            totalVolume: true,
          },
        },
      },
    });

    if (!session || session.expiresAt < new Date()) {
      // Delete expired session
      if (session) {
        await prisma.session.delete({
          where: { id: session.id },
        });
      }
      
      return NextResponse.json(
        { error: 'Session expired' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      user: session.user,
      session: {
        expiresAt: session.expiresAt,
      },
    });
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json(
      { error: 'Failed to check session' },
      { status: 500 }
    );
  }
}