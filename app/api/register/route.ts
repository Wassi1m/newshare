import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { isValidEmail, isValidPassword } from "@/lib/utils/validation";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Tous les champs sont requis" },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Adresse email invalide" },
        { status: 400 }
      );
    }

    if (!isValidPassword(password)) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre" },
        { status: 400 }
      );
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Un compte avec cet email existe déjà" },
        { status: 409 }
      );
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "USER",
      }
    });

    // Créer le profil utilisateur
    await prisma.userProfile.create({
      data: {
        userId: user.id,
        preferences: JSON.stringify({
          language: "fr",
          theme: "light",
          notifications: {
            email: true,
            push: false,
            sms: false,
            types: {
              FILE_UPLOADED: true,
              FILE_SHARED: true,
              SCAN_COMPLETED: true,
              THREAT_DETECTED: true,
              COMMENT_ADDED: true,
              TEAM_INVITATION: true,
              STORAGE_WARNING: true,
              SYSTEM_ALERT: true,
            }
          },
          privacy: {
            profileVisibility: "PRIVATE",
            showEmail: false,
            showActivity: false,
          }
        })
      }
    });

    // Créer l'abonnement gratuit par défaut
    await prisma.subscription.create({
      data: {
        userId: user.id,
        plan: "FREE",
        status: "ACTIVE",
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 an
      }
    });

    // Créer une notification de bienvenue
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: "SYSTEM_ALERT",
        title: "Bienvenue sur SecureShare !",
        message: "Votre compte a été créé avec succès. Commencez à partager vos fichiers en toute sécurité.",
        isRead: false,
        data: null, // Pas de données supplémentaires
      }
    });

    return NextResponse.json(
      {
        success: true,
        message: "Compte créé avec succès",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        }
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Erreur lors de l'inscription:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la création du compte" },
      { status: 500 }
    );
  }
}

