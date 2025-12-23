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

    const userId = session.user.id;
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || '7d'; // 7d, 30d, all

    // Calculer la date de début basée sur la période
    let startDate: Date | undefined;
    if (period !== 'all') {
      const days = parseInt(period.replace('d', ''));
      startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
    }

    // Statistiques globales
    const [
      totalScans,
      threatsDetected,
      quarantinedFiles,
      recentScans,
    ] = await Promise.all([
      // Total des scans
      prisma.scanResult.count({
        where: {
          userId,
          ...(startDate && { createdAt: { gte: startDate } }),
        },
      }),

      // Menaces détectées
      prisma.scanResult.count({
        where: {
          userId,
          isMalware: true,
          ...(startDate && { createdAt: { gte: startDate } }),
        },
      }),

      // Fichiers en quarantaine
      prisma.quarantine.count({
        where: {
          file: {
            userId,
          },
          ...(startDate && { createdAt: { gte: startDate } }),
        },
      }),

      // Scans récents pour calculer la tendance
      prisma.scanResult.findMany({
        where: {
          userId,
          isMalware: true,
          ...(startDate && { createdAt: { gte: startDate } }),
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    // Calculer les fichiers sûrs
    const cleanFiles = totalScans - threatsDetected;

    // Calculer le taux de menaces
    const threatRate = totalScans > 0 ? (threatsDetected / totalScans) * 100 : 0;

    // Calculer la tendance (comparer les 5 derniers avec les 5 précédents)
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (recentScans.length >= 10) {
      const recent5 = recentScans.slice(0, 5).length;
      const previous5 = recentScans.slice(5, 10).length;
      if (recent5 > previous5) trend = 'up';
      else if (recent5 < previous5) trend = 'down';
    }

    // Menaces bloquées (celles mises en quarantaine automatiquement)
    const threatsBlocked = quarantinedFiles;

    // Dernière heure de scan
    const lastScan = await prisma.scanResult.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    });

    // Statistiques par niveau de menace
    const threatsByLevel = await prisma.scanResult.groupBy({
      by: ['threatLevel'],
      where: {
        userId,
        isMalware: true,
        ...(startDate && { createdAt: { gte: startDate } }),
      },
      _count: true,
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalScans,
        threatsDetected,
        threatsBlocked,
        quarantinedFiles,
        cleanFiles,
        threatRate,
        trend,
        lastScanTime: lastScan?.createdAt,
        period,
      },
      threatsByLevel: threatsByLevel.reduce((acc, item) => {
        acc[item.threatLevel || 'unknown'] = item._count;
        return acc;
      }, {} as Record<string, number>),
    });

  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

