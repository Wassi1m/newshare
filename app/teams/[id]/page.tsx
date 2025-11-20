import { auth } from "@/lib/auth/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Shield, ArrowLeft, Users, Crown, Settings, UserPlus, FileText, HardDrive } from "lucide-react";
import { formatFileSize, formatRelativeTime } from "@/lib/utils/format";
import Link from "next/link";
import { FileUploadTeam } from "@/components/files/file-upload-team";

interface TeamDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function TeamDetailsPage({ params }: TeamDetailsPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  const { id } = await params;

  // Récupérer l'équipe
  const team = await prisma.team.findUnique({
    where: { id },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
        orderBy: {
          joinedAt: "asc",
        },
      },
      files: {
        where: {
          status: { not: "DELETED" },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      },
    },
  });

  if (!team) {
    notFound();
  }

  // Vérifier si l'utilisateur est membre de cette équipe
  const isMember = team.members.some((m) => m.userId === session.user.id);
  const isOwner = team.ownerId === session.user.id;

  if (!isMember && !isOwner) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Accès refusé</CardTitle>
            <CardDescription>
              Vous n'êtes pas membre de cette équipe
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/teams">
              <Button variant="outline" className="w-full">
                Retour aux équipes
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentMember = team.members.find((m) => m.userId === session.user.id);
  const storagePercent = team.storageLimit > 0 
    ? (team.storageUsed / team.storageLimit) * 100 
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/teams">
                <Button variant="outline" size="icon" className="border-gray-300">
                  <ArrowLeft className="h-5 w-5 text-gray-700" />
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <Shield className="h-8 w-8 text-blue-600" />
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold text-gray-900">{team.name}</h1>
                    {isOwner && <Crown className="h-5 w-5 text-yellow-600" />}
                  </div>
                  <p className="text-sm text-gray-600">
                    {team.members.length} membre{team.members.length > 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </div>
            {isOwner && (
              <Button variant="outline" disabled>
                <Settings className="mr-2 h-4 w-4" />
                Paramètres
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
            {/* Statistiques de l'équipe */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Fichiers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{team.filesCount}</div>
                  <p className="text-xs text-gray-600 mt-1">
                    Fichiers de l'équipe
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Stockage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {formatFileSize(team.storageUsed)}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    sur {formatFileSize(team.storageLimit)}
                  </p>
                  <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 transition-all"
                      style={{ width: `${Math.min(storagePercent, 100)}%` }}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Membres
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{team.members.length}</div>
                  <p className="text-xs text-gray-600 mt-1">
                    Membres actifs
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Description */}
            {team.description && (
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{team.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Upload pour l'équipe */}
            <Card>
              <CardHeader>
                <CardTitle>Uploader des fichiers pour l'équipe</CardTitle>
                <CardDescription>
                  Ces fichiers seront accessibles à tous les membres
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileUploadTeam teamId={team.id} />
              </CardContent>
            </Card>

            {/* Fichiers de l'équipe */}
            <Card>
              <CardHeader>
                <CardTitle>Fichiers de l'équipe ({team.files.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {team.files.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p>Aucun fichier dans l'équipe</p>
                    <p className="text-sm">Uploadez des fichiers ci-dessus</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {team.files.map((file) => (
                      <Link key={file.id} href={`/files/${file.id}`}>
                        <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors border">
                          <FileText className="h-10 w-10 text-gray-600" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{file.originalName}</p>
                            <p className="text-xs text-gray-500">
                              {file.extension.toUpperCase()} • {formatFileSize(file.size)} • {formatRelativeTime(file.createdAt)}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Colonne latérale - Membres */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Membres ({team.members.length})</CardTitle>
                  {isOwner && (
                    <Button size="sm" variant="outline" disabled>
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {team.members.map((member) => (
                    <div key={member.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                      <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm truncate">
                            {member.user.name || member.user.email}
                          </p>
                          {member.userId === team.ownerId && (
                            <Crown className="h-3 w-3 text-yellow-600" />
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-gray-500 truncate">
                            {member.user.email}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {member.role}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Informations */}
            <Card>
              <CardHeader>
                <CardTitle>Informations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>Propriétaire</span>
                  </div>
                  <p className="text-sm font-medium">{team.owner.name}</p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <HardDrive className="h-4 w-4" />
                    <span>Stockage</span>
                  </div>
                  <p className="text-sm font-medium">
                    {formatFileSize(team.storageUsed)} / {formatFileSize(team.storageLimit)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {storagePercent.toFixed(1)}% utilisé
                  </p>
                </div>

                {currentMember && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Shield className="h-4 w-4" />
                        <span>Mon rôle</span>
                      </div>
                      <Badge>{currentMember.role}</Badge>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}


