import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";

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

    if (!file) {
      return NextResponse.json(
        { error: "Fichier non trouvé" },
        { status: 404 }
      );
    }

    if (file.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 403 }
      );
    }

    // Supprimer le fichier (soft delete)
    await prisma.file.update({
      where: { id: fileId },
      data: { status: "DELETED" },
    });

    // Mettre à jour les statistiques
    await prisma.userProfile.update({
      where: { userId: session.user.id },
      data: {
        totalFiles: { decrement: 1 },
        totalStorage: { decrement: file.size },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Fichier supprimé avec succès",
    });

  } catch (error) {
    console.error("Erreur lors de la suppression:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}







