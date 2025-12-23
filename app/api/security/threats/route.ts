import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Récupérer les menaces récentes avec leurs détails
    const threats = await prisma.scanResult.findMany({
      where: {
        userId: session.user.id,
        isMalware: true,
      },
      include: {
        file: {
          select: {
            id: true,
            fileName: true,
            fileSize: true,
            mimeType: true,
          },
        },
        quarantine: {
          select: {
            id: true,
            createdAt: true,
            reason: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    // Formatter les menaces
    const formattedThreats = threats.map((threat) => ({
      id: threat.id,
      fileName: threat.file?.fileName || 'Fichier inconnu',
      fileSize: threat.file?.fileSize,
      threatLevel: threat.threatLevel || 'medium',
      confidence: threat.confidence,
      timestamp: threat.createdAt,
      status: threat.quarantine ? 'quarantined' : 'blocked',
      label: threat.label,
      details: threat.scanDetails ? JSON.parse(threat.scanDetails as string) : null,
    }));

    // Compter le total
    const total = await prisma.scanResult.count({
      where: {
        userId: session.user.id,
        isMalware: true,
      },
    });

    return NextResponse.json({
      success: true,
      threats: formattedThreats,
      pagination: {
        total,
        limit,
        offset,
        hasMore: total > offset + limit,
      },
    });

  } catch (error) {
    console.error('Threats API error:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

