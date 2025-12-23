import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { getFileExtension, getFileType } from "@/lib/utils/format";
import crypto from "crypto";

const MALWARE_API_URL = 'http://13.53.39.122:5000/predict';

interface MalwareScanResult {
  is_malware: boolean;
  label: 'malware' | 'benign';
  confidence: number;
  prediction: 0 | 1;
  probabilities: {
    benign: number;
    malware: number;
  };
}

// Scanner un fichier pour détecter les malwares
async function scanFileForMalware(file: File): Promise<{ success: boolean; result?: MalwareScanResult; error?: string }> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(MALWARE_API_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const result: MalwareScanResult = await response.json();
    
    return {
      success: true,
      result,
    };
  } catch (error) {
    console.error('Malware scan error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Scan failed',
    };
  }
}

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

    // Vérifier si l'utilisateur est banni
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isBanned: true, bannedReason: true },
    });

    if (user?.isBanned) {
      return NextResponse.json(
        { 
          error: "Compte banni",
          reason: user.bannedReason || "Votre compte a été banni pour violation des règles de sécurité",
          banned: true
        },
        { status: 403 }
      );
    }

    // Récupérer le fichier et l'équipe (optionnel)
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const teamId = formData.get("teamId") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "Aucun fichier fourni" },
        { status: 400 }
      );
    }

    // Si teamId est fourni, vérifier que l'utilisateur est membre de l'équipe
    if (teamId) {
      const teamMember = await prisma.teamMember.findFirst({
        where: {
          teamId,
          userId: session.user.id,
        },
      });

      if (!teamMember) {
        return NextResponse.json(
          { error: "Vous n'êtes pas membre de cette équipe" },
          { status: 403 }
        );
      }
    }

    // Vérifier la taille du fichier (100 MB max)
    const maxSize = 100 * 1024 * 1024; // 100 MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "Le fichier est trop volumineux (max 100 MB)" },
        { status: 400 }
      );
    }

    // Calculer le hash du fichier
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const hash = crypto.createHash("sha256").update(buffer).digest("hex");

    // 🔒 SCAN AUTOMATIQUE DE MALWARE 🔒
    console.log(`🔍 Scan de malware pour: ${file.name}`);
    const scanResult = await scanFileForMalware(file);

    // Obtenir les informations de requête
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    if (scanResult.success && scanResult.result) {
      const isMalware = scanResult.result.is_malware;
      const confidence = scanResult.result.confidence;

      console.log(`📊 Résultat: ${isMalware ? '🚨 MALWARE' : '✅ CLEAN'} (confidence: ${(confidence * 100).toFixed(2)}%)`);

      // Si un malware est détecté avec une confiance >= 50%
      if (isMalware && confidence >= 0.5) {
        const threatLevel = confidence >= 0.9 ? 'critical' : 
                           confidence >= 0.7 ? 'high' : 
                           confidence >= 0.5 ? 'medium' : 'low';

        // Enregistrer la tentative de malware
        await prisma.malwareAttempt.create({
          data: {
            userId: session.user.id,
            fileName: file.name,
            fileSize: file.size,
            fileHash: hash,
            mimeType: file.type,
            confidence,
            threatLevel,
            scanResult: JSON.stringify(scanResult.result),
            actionTaken: 'banned',
            ipAddress,
            userAgent,
          },
        });

        // 🔨 BANNIR L'UTILISATEUR AUTOMATIQUEMENT
        await prisma.user.update({
          where: { id: session.user.id },
          data: {
            isBanned: true,
            bannedAt: new Date(),
            bannedReason: `Tentative d'upload de malware détecté: ${file.name} (confiance: ${(confidence * 100).toFixed(2)}%)`,
          },
        });

        // Créer une notification de sécurité
        await prisma.notification.create({
          data: {
            userId: session.user.id,
            type: "SECURITY_ALERT",
            title: "🚨 Compte banni - Malware détecté",
            message: `Votre compte a été automatiquement banni suite à la détection d'un fichier malveillant: ${file.name}`,
            isRead: false,
            data: JSON.stringify({ 
              fileHash: hash,
              confidence,
              threatLevel,
            }),
          },
        });

        console.log(`🔨 Utilisateur ${session.user.email} BANNI pour upload de malware`);

        // NE PAS SAUVEGARDER LE FICHIER - Retourner une erreur
        return NextResponse.json(
          { 
            error: "🚨 MALWARE DÉTECTÉ",
            message: `Le fichier "${file.name}" contient un malware. Votre compte a été automatiquement banni.`,
            details: {
              fileName: file.name,
              threatLevel: threatLevel.toUpperCase(),
              confidence: `${(confidence * 100).toFixed(2)}%`,
              action: "COMPTE BANNI",
            },
            banned: true,
          },
          { status: 403 }
        );
      }
    } else {
      // Si le scan a échoué, enregistrer l'erreur mais continuer
      console.warn(`⚠️ Échec du scan de malware pour ${file.name}:`, scanResult.error);
    }

    // ✅ FICHIER SÉCURISÉ - Continuer avec l'upload normal

    // Vérifier si le fichier existe déjà
    const whereCondition = teamId
      ? { hash, teamId, status: { not: "DELETED" } }
      : { hash, userId: session.user.id, teamId: null, status: { not: "DELETED" } };

    const existingFile = await prisma.file.findFirst({
      where: whereCondition
    });

    if (existingFile) {
      return NextResponse.json(
        { error: teamId ? "Ce fichier existe déjà dans l'équipe" : "Ce fichier existe déjà dans votre bibliothèque" },
        { status: 409 }
      );
    }

    // Extraire les informations du fichier
    const extension = getFileExtension(file.name);
    const fileType = getFileType(file.name);

    // Dans un vrai système, on uploaderait le fichier sur S3/Cloudinary ici
    const fileUrl = `/uploads/${hash}.${extension}`;
    const thumbnailUrl = fileType === "image" ? fileUrl : null;

    // Créer l'enregistrement en base de données
    const createdFile = await prisma.file.create({
      data: {
        name: file.name.replace(`.${extension}`, ""),
        originalName: file.name,
        size: file.size,
        mimeType: file.type,
        extension,
        url: fileUrl,
        thumbnailUrl,
        hash,
        status: "READY",
        userId: session.user.id,
        teamId: teamId || null,
        tags: JSON.stringify([fileType]),
        metadata: JSON.stringify({
          uploadedAt: new Date().toISOString(),
          fileType,
          uploadedForTeam: !!teamId,
          scanned: scanResult.success,
          scanConfidence: scanResult.result?.confidence,
        }),
      },
    });

    // Mettre à jour les statistiques
    if (teamId) {
      await prisma.team.update({
        where: { id: teamId },
        data: {
          filesCount: { increment: 1 },
          storageUsed: { increment: file.size },
        },
      });
    } else {
      await prisma.userProfile.upsert({
        where: { userId: session.user.id },
        update: {
          totalFiles: { increment: 1 },
          totalStorage: { increment: file.size },
        },
        create: {
          userId: session.user.id,
          preferences: JSON.stringify({
            language: "fr",
            theme: "light",
            notifications: {
              email: true,
              push: false,
              sms: false,
            },
            privacy: {
              profileVisibility: "PRIVATE",
              showEmail: false,
              showActivity: false,
            }
          }),
          totalFiles: 1,
          totalStorage: file.size,
        },
      });
    }

    // Créer une notification
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: "FILE_UPLOADED",
        title: "✅ Fichier uploadé et scanné",
        message: `${file.name} a été uploadé avec succès et vérifié par notre système de sécurité`,
        isRead: false,
        data: JSON.stringify({ fileId: createdFile.id }),
      },
    });

    console.log(`✅ Fichier ${file.name} uploadé avec succès et scanné`);

    return NextResponse.json(
      {
        success: true,
        message: "Fichier uploadé et scanné avec succès",
        scanned: scanResult.success,
        file: {
          id: createdFile.id,
          name: createdFile.name,
          originalName: createdFile.originalName,
          size: createdFile.size,
          mimeType: createdFile.mimeType,
          extension: createdFile.extension,
          url: createdFile.url,
          thumbnailUrl: createdFile.thumbnailUrl,
          createdAt: createdFile.createdAt,
        },
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Erreur lors de l'upload:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de l'upload" },
      { status: 500 }
    );
  }
}
