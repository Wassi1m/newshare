import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { getFileExtension, getFileType } from "@/lib/utils/format";
import crypto from "crypto";

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

    // Vérifier la taille du fichier (100 MB max pour l'utilisateur gratuit)
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
    // Pour l'instant, on simule juste l'URL
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
        teamId: teamId || null, // Associer à l'équipe si fourni
        tags: JSON.stringify([fileType]),
        metadata: JSON.stringify({
          uploadedAt: new Date().toISOString(),
          fileType,
          uploadedForTeam: !!teamId,
        }),
      },
    });

    // Mettre à jour les statistiques
    if (teamId) {
      // Mettre à jour les statistiques de l'équipe
      await prisma.team.update({
        where: { id: teamId },
        data: {
          filesCount: { increment: 1 },
          storageUsed: { increment: file.size },
        },
      });
    } else {
      // Mettre à jour les statistiques de l'utilisateur
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
        title: "Fichier uploadé",
        message: `${file.name} a été uploadé avec succès`,
        isRead: false,
        data: JSON.stringify({ fileId: createdFile.id }),
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Fichier uploadé avec succès",
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

