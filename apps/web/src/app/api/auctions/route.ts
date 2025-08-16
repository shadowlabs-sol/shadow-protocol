import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const creator = searchParams.get('creator');

    const where: any = {};
    
    if (status) {
      where.status = status.toUpperCase();
    }
    
    if (type) {
      where.type = type.toUpperCase();
    }
    
    if (creator) {
      where.creator = creator;
    }

    const auctions = await prisma.auction.findMany({
      where,
      include: {
        bids: {
          select: {
            id: true,
            bidder: true,
            timestamp: true,
            isWinner: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(auctions);
  } catch (error) {
    console.error('Failed to fetch auctions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch auctions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const auction = await prisma.auction.create({
      data: {
        auctionId: BigInt(body.auctionId),
        creator: body.creator,
        assetMint: body.assetMint,
        assetVault: body.assetVault,
        type: body.type.toUpperCase(),
        status: 'CREATED',
        startTime: new Date(body.startTime * 1000),
        endTime: new Date(body.endTime * 1000),
        minimumBid: BigInt(body.minimumBid),
        reservePriceEncrypted: body.reservePriceEncrypted ? Buffer.from(body.reservePriceEncrypted) : null,
        reservePriceNonce: body.reservePriceNonce?.toString(),
        currentPrice: body.currentPrice ? BigInt(body.currentPrice) : null,
        priceDecreaseRate: body.priceDecreaseRate ? BigInt(body.priceDecreaseRate) : null,
        startingPrice: body.startingPrice ? BigInt(body.startingPrice) : null,
        transactionHash: body.transactionHash
      }
    });

    // Update user stats
    await prisma.user.upsert({
      where: { walletAddress: body.creator },
      update: {},
      create: { walletAddress: body.creator }
    });

    return NextResponse.json({
      ...auction,
      auctionId: auction.auctionId.toString(),
      minimumBid: auction.minimumBid.toString(),
      currentPrice: auction.currentPrice?.toString(),
      priceDecreaseRate: auction.priceDecreaseRate?.toString(),
      startingPrice: auction.startingPrice?.toString()
    });
  } catch (error) {
    console.error('Failed to create auction:', error);
    return NextResponse.json(
      { error: 'Failed to create auction' },
      { status: 500 }
    );
  }
}