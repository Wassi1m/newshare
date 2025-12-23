import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/db/prisma';
import { scanFile, generateScanReport } from '@/lib/api/malware-detection';

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authConfig);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const fileId = formData.get('fileId') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      );
    }

    // Scanner le fichier
    const scanResponse = await scanFile(file);

    if (!scanResponse.success || !scanResponse.result) {
      return NextResponse.json(
        { error: 'Erreur lors du scan', details: scanResponse.error },
        { status: 500 }
      );
    }

    // Générer le rapport complet
    const report = generateScanReport(scanResponse, {
      name: file.name,
      size: file.size,
      type: file.type,
    });

    if (!report) {
      return NextResponse.json(
        { error: 'Impossible de générer le rapport' },
        { status: 500 }
      );
    }

    // Enregistrer le résultat dans la base de données
    const scanResult = await prisma.scanResult.create({
      data: {
        fileId: fileId || undefined,
        userId: session.user.id,
        isMalware: report.result.is_malware,
        confidence: report.result.confidence,
        threatLevel: report.threatLevel.level,
        label: report.result.label,
        scanDetails: JSON.stringify({
          probabilities: report.result.probabilities,
          prediction: report.result.prediction,
          scanTime: report.scanTime,
          recommendation: report.recommendation,
        }),
      },
    });

    // Si c'est un malware avec niveau de menace élevé, mettre en quarantaine automatiquement
    if (report.result.is_malware && report.threatLevel.action === 'block' && fileId) {
      await prisma.quarantine.create({
        data: {
          fileId,
          scanResultId: scanResult.id,
          reason: report.recommendation,
          threatLevel: report.threatLevel.level,
        },
      });

      // Notifier l'utilisateur
      await prisma.notification.create({
        data: {
          userId: session.user.id,
          type: 'SECURITY_ALERT',
          title: '🚨 Menace Critique Détectée',
          message: `Le fichier "${file.name}" a été identifié comme malware (${(report.result.confidence * 100).toFixed(1)}% de confiance) et mis en quarantaine automatiquement.`,
          severity: 'HIGH',
        },
      });
    }

    // Créer une notification pour les menaces moyennes/élevées
    if (report.result.is_malware && report.threatLevel.level !== 'low') {
      await prisma.notification.create({
        data: {
          userId: session.user.id,
          type: 'SECURITY_ALERT',
          title: `⚠️ Menace ${report.threatLevel.level.toUpperCase()} Détectée`,
          message: `Le fichier "${file.name}" présente un risque de sécurité. ${report.recommendation}`,
          severity: report.threatLevel.level === 'critical' ? 'HIGH' : 'MEDIUM',
        },
      });
    }

    return NextResponse.json({
      success: true,
      report,
      scanId: scanResult.id,
    });

  } catch (error) {
    console.error('Scan API error:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

