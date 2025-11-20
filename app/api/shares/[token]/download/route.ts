import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    // Récupérer le partage
    const share = await prisma.share.findUnique({
      where: { linkToken: token },
    });

    if (!share) {
      return NextResponse.json(
        { error: "Lien de partage invalide" },
        { status: 404 }
      );
    }

    // Incrémenter le compteur de téléchargements
    await prisma.share.update({
      where: { id: share.id },
      data: {
        downloadCount: { increment: 1 },
      },
    });

    // Enregistrer le téléchargement dans l'historique
    const userAgent = request.headers.get("user-agent") || "Unknown";
    const ipAddress = request.headers.get("x-forwarded-for") || 
                      request.headers.get("x-real-ip") || 
                      "Unknown";

    if (share.fileId) {
      await prisma.download.create({
        data: {
          shareId: share.id,
          fileId: share.fileId,
          ipAddress,
          userAgent,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Téléchargement enregistré",
    });

  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}






