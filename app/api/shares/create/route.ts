import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { generateToken } from "@/lib/utils/format";
import bcrypt from "bcryptjs";

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
    const { fileId, password, expiresAt, maxDownloads, isPublic } = body;

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

    // Générer un token unique pour le lien
    const linkToken = generateToken(32);

    // Hasher le mot de passe si fourni
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    // Créer le partage
    const share = await prisma.share.create({
      data: {
        fileId,
        createdBy: session.user.id,
        linkToken,
        password: hashedPassword,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        maxDownloads: maxDownloads || null,
        isPublic: isPublic ?? true,
        permissions: JSON.stringify(["VIEW", "DOWNLOAD"]),
        sharedWith: JSON.stringify([]),
      },
    });

    // Créer une notification
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: "FILE_SHARED",
        title: "Fichier partagé",
        message: `Un lien de partage a été créé pour ${file.originalName}`,
        isRead: false,
        data: JSON.stringify({ shareId: share.id, fileId: file.id }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Lien de partage créé avec succès",
      share: {
        id: share.id,
        linkToken: share.linkToken,
        expiresAt: share.expiresAt,
        maxDownloads: share.maxDownloads,
      },
    });

  } catch (error) {
    console.error("Erreur lors de la création du partage:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}







