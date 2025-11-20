import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    // Récupérer l'ID du fichier depuis l'URL
    const searchParams = request.nextUrl.searchParams;
    const fileId = searchParams.get("id");

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

    // Dans un vrai système, on téléchargerait le fichier depuis S3/Cloudinary
    // Pour la démonstration, on crée un fichier texte avec les infos
    const fileContent = `==============================================
SecureShare - Informations du fichier
==============================================

Nom du fichier : ${file.originalName}
Taille : ${file.size} bytes
Type MIME : ${file.mimeType}
Extension : ${file.extension}
Hash (SHA-256) : ${file.hash}
Uploade le : ${file.createdAt}

Statut : ${file.status}

==============================================
Note : Dans un environnement de production,
ceci serait le fichier reel telecharge depuis
le stockage cloud (AWS S3, Cloudinary, etc.)
==============================================
`;

    // Retourner le fichier
    return new NextResponse(fileContent, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": `attachment; filename="${file.name.replace(/[^a-zA-Z0-9_-]/g, '_')}.txt"`,
      },
    });

  } catch (error) {
    console.error("Erreur lors du téléchargement:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}


