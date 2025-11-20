import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import bcrypt from "bcryptjs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    // Récupérer le partage
    const share = await prisma.share.findUnique({
      where: { linkToken: token },
      include: {
        file: {
          select: {
            id: true,
            name: true,
            originalName: true,
            size: true,
            extension: true,
            mimeType: true,
            createdAt: true,
          },
        },
      },
    });

    if (!share || !share.file) {
      return NextResponse.json(
        { error: "Lien de partage invalide ou expiré" },
        { status: 404 }
      );
    }

    // Vérifier l'expiration
    if (share.expiresAt && new Date(share.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: "Ce lien de partage a expiré" },
        { status: 410 }
      );
    }

    // Vérifier la limite de téléchargements
    if (share.maxDownloads && share.downloadCount >= share.maxDownloads) {
      return NextResponse.json(
        { error: "Limite de téléchargements atteinte" },
        { status: 403 }
      );
    }

    // Vérifier le mot de passe si nécessaire
    if (share.password) {
      const providedPassword = request.nextUrl.searchParams.get("password");

      if (!providedPassword) {
        return NextResponse.json(
          { error: "Mot de passe requis", needsPassword: true },
          { status: 403 }
        );
      }

      const isPasswordValid = await bcrypt.compare(providedPassword, share.password);

      if (!isPasswordValid) {
        return NextResponse.json(
          { error: "Mot de passe incorrect", needsPassword: true },
          { status: 403 }
        );
      }
    }

    // Retourner les informations
    return NextResponse.json({
      share: {
        id: share.id,
        expiresAt: share.expiresAt,
        maxDownloads: share.maxDownloads,
        downloadCount: share.downloadCount,
      },
      file: share.file,
    });

  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}






