import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, description, storageLimit } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Le nom de l'équipe est requis" },
        { status: 400 }
      );
    }

    // Créer l'équipe (stockage en MB pour SQLite)
    const team = await prisma.team.create({
      data: {
        name,
        description: description || null,
        ownerId: session.user.id,
        storageLimit: storageLimit ? storageLimit * 1024 : 50 * 1024, // Stockage en MB
        storageUsed: 0,
        filesCount: 0,
      },
    });

    // Ajouter le créateur comme membre OWNER
    await prisma.teamMember.create({
      data: {
        teamId: team.id,
        userId: session.user.id,
        role: "OWNER",
        permissions: JSON.stringify(["*"]), // Toutes les permissions
      },
    });

    // Créer une notification
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: "TEAM_INVITATION",
        title: "Équipe créée",
        message: `L'équipe "${name}" a été créée avec succès`,
        isRead: false,
        data: JSON.stringify({ teamId: team.id }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Équipe créée avec succès",
      team: {
        id: team.id,
        name: team.name,
        description: team.description,
      },
    });

  } catch (error) {
    console.error("Erreur lors de la création de l'équipe:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}

