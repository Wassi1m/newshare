import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { MLClient } from "@/lib/api/ml-client";

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { fileId } = body;

    if (!fileId) {
      return NextResponse.json(
        { error: "ID du fichier requis" },
        { status: 400 }
      );
    }

    // Vérifier que le fichier appartient à l'utilisateur
    const file = await prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!file || file.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Fichier non trouvé ou non autorisé" },
        { status: 404 }
      );
    }

    // Créer un scan en attente
    const scan = await prisma.scanResult.create({
      data: {
        fileId: file.id,
        status: "SCANNING",
        modelVersion: "v1.0.0",
      },
    });

    try {
      // Appeler l'API ML
      const mlResult = await MLClient.scanFile({
        fileHash: file.hash,
        fileName: file.originalName,
        fileSize: file.size,
        mimeType: file.mimeType,
      });

      // Mettre à jour le résultat du scan
      const updatedScan = await prisma.scanResult.update({
        where: { id: scan.id },
        data: {
          status: "COMPLETED",
          isMalware: mlResult.isMalware,
          confidence: mlResult.confidence,
          riskScore: mlResult.riskScore,
          threatLevel: mlResult.threatLevel,
          threatType: mlResult.threatType,
          threatFamily: mlResult.threatFamily,
          modelVersion: mlResult.modelVersion,
          features: JSON.stringify(mlResult.features),
          explanation: mlResult.explanation ? JSON.stringify(mlResult.explanation) : null,
          processingTime: mlResult.processingTime,
        },
      });

      // Si c'est un malware, mettre le fichier en quarantaine
      if (mlResult.isMalware && mlResult.riskScore >= 60) {
        await prisma.file.update({
          where: { id: file.id },
          data: { status: "QUARANTINED" },
        });

        await prisma.quarantine.create({
          data: {
            fileId: file.id,
            reason: `Malware détecté : ${mlResult.threatType || "Inconnu"} (score: ${mlResult.riskScore}/100)`,
          },
        });
      }

      // Mettre à jour les statistiques
      await prisma.userProfile.upsert({
        where: { userId: session.user.id },
        update: {
          scansPerformed: { increment: 1 },
          threatsDetected: mlResult.isMalware ? { increment: 1 } : undefined,
        },
        create: {
          userId: session.user.id,
          preferences: "{}",
          scansPerformed: 1,
          threatsDetected: mlResult.isMalware ? 1 : 0,
        },
      });

      // Créer une notification
      await prisma.notification.create({
        data: {
          userId: session.user.id,
          type: mlResult.isMalware ? "THREAT_DETECTED" : "SCAN_COMPLETED",
          title: mlResult.isMalware ? "⚠️ Menace détectée !" : "✓ Scan terminé",
          message: mlResult.isMalware 
            ? `Le fichier ${file.originalName} contient un malware : ${mlResult.threatType}`
            : `Le fichier ${file.originalName} est sûr`,
          isRead: false,
          data: JSON.stringify({ fileId: file.id, scanId: updatedScan.id }),
        },
      });

      return NextResponse.json({
        success: true,
        message: "Scan terminé avec succès",
        scan: {
          id: updatedScan.id,
          isMalware: updatedScan.isMalware,
          riskScore: updatedScan.riskScore,
          threatLevel: updatedScan.threatLevel,
        },
      });

    } catch (mlError) {
      // En cas d'erreur de l'API ML, marquer le scan comme échoué
      await prisma.scanResult.update({
        where: { id: scan.id },
        data: { status: "FAILED" },
      });

      throw mlError;
    }

  } catch (error) {
    console.error("Erreur lors du scan:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors du scan" },
      { status: 500 }
    );
  }
}







