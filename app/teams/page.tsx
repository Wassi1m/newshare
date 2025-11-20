import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, ArrowLeft, Users, Plus, Crown, UserCheck } from "lucide-react";
import Link from "next/link";

export default async function TeamsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  // Récupérer les équipes de l'utilisateur
  const ownedTeams = await prisma.team.findMany({
    where: { ownerId: session.user.id },
    include: {
      members: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  const memberTeams = await prisma.teamMember.findMany({
    where: {
      userId: session.user.id,
      team: {
        ownerId: { not: session.user.id },
      },
    },
    include: {
      team: {
        include: {
          owner: {
            select: {
              name: true,
              email: true,
            },
          },
          members: true,
        },
      },
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="outline" size="icon" className="border-gray-300">
                  <ArrowLeft className="h-5 w-5 text-gray-700" />
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <Shield className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Mes Équipes</h1>
                  <p className="text-sm text-gray-600">
                    {ownedTeams.length + memberTeams.length} équipe{ownedTeams.length + memberTeams.length > 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </div>
            <Link href="/teams/create">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle équipe
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Équipes que je possède */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Mes équipes ({ownedTeams.length})
          </h2>

          {ownedTeams.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucune équipe créée
                </h3>
                <p className="text-gray-600 mb-6">
                  Créez votre première équipe pour collaborer avec d'autres
                </p>
                <Link href="/teams/create">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Créer une équipe
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ownedTeams.map((team) => (
                <Card key={team.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          {team.name}
                          <Crown className="h-4 w-4 text-yellow-600" />
                        </CardTitle>
                        <CardDescription>
                          {team.description || "Aucune description"}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Membres</span>
                        <Badge variant="outline">{team.members.length}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Fichiers</span>
                        <Badge variant="outline">{team.filesCount}</Badge>
                      </div>
                      <Link href={`/teams/${team.id}`}>
                        <Button variant="outline" size="sm" className="w-full mt-2">
                          Gérer l'équipe
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Équipes dont je suis membre */}
        {memberTeams.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Équipes dont je suis membre ({memberTeams.length})
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {memberTeams.map(({ team, role }) => (
                <Card key={team.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          {team.name}
                          <UserCheck className="h-4 w-4 text-blue-600" />
                        </CardTitle>
                        <CardDescription>
                          Créée par {team.owner.name}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Mon rôle</span>
                        <Badge>{role}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Membres</span>
                        <Badge variant="outline">{team.members.length}</Badge>
                      </div>
                      <Link href={`/teams/${team.id}`}>
                        <Button variant="outline" size="sm" className="w-full mt-2">
                          Voir l'équipe
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}


