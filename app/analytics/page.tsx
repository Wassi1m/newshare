import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, ArrowLeft, TrendingUp, FileText, Share2, AlertTriangle } from "lucide-react";
import { formatFileSize } from "@/lib/utils/format";
import Link from "next/link";

export default async function AnalyticsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  // Récupérer les statistiques
  const profile = await prisma.userProfile.findUnique({
    where: { userId: session.user.id },
  });

  const filesCount = await prisma.file.count({
    where: {
      userId: session.user.id,
      status: { not: "DELETED" },
    },
  });

  const sharesCount = await prisma.share.count({
    where: { createdBy: session.user.id },
  });

  const scansCount = await prisma.scanResult.count({
    where: {
      file: {
        userId: session.user.id,
      },
    },
  });

  const threatsCount = await prisma.scanResult.count({
    where: {
      file: {
        userId: session.user.id,
      },
      isMalware: true,
    },
  });

  // Statistiques par type de fichier
  const files = await prisma.file.findMany({
    where: {
      userId: session.user.id,
      status: { not: "DELETED" },
    },
    select: {
      extension: true,
      size: true,
    },
  });

  const filesByType: Record<string, { count: number; size: number }> = {};
  files.forEach((file) => {
    const ext = file.extension.toLowerCase();
    if (!filesByType[ext]) {
      filesByType[ext] = { count: 0, size: 0 };
    }
    filesByType[ext].count += 1;
    filesByType[ext].size += file.size;
  });

  const topFileTypes = Object.entries(filesByType)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5);

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
                  <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
                  <p className="text-sm text-gray-600">Statistiques et rapports</p>
                </div>
              </div>
            </div>
            <form action={async () => {
              "use server";
              const { signOut } = await import("@/lib/auth/auth");
              await signOut({ redirectTo: "/" });
            }}>
              <Button type="submit" variant="outline" className="border-gray-600 bg-white hover:bg-red-50 hover:border-red-600 hover:text-red-600 text-gray-900 font-medium">
                Déconnexion
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Vue d'ensemble */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Vue d'ensemble
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Fichiers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{filesCount}</div>
                <p className="text-xs text-gray-600 mt-1">
                  Fichiers uploadés
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Stockage Utilisé
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">
                  {formatFileSize(profile?.totalStorage || 0)}
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  sur 5 GB disponibles
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Partages Actifs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{sharesCount}</div>
                <p className="text-xs text-gray-600 mt-1">
                  Liens de partage créés
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Menaces Détectées
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">{threatsCount}</div>
                <p className="text-xs text-gray-600 mt-1">
                  Sur {scansCount} scan{scansCount > 1 ? "s" : ""}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Répartition par type de fichier */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Répartition par type de fichier
          </h2>

          {topFileTypes.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-600">Aucune donnée disponible</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topFileTypes.map(([ext, stats]) => (
                <Card key={ext}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base uppercase">
                        .{ext}
                      </CardTitle>
                      <FileText className="h-5 w-5 text-gray-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Fichiers</span>
                        <span className="font-semibold">{stats.count}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Taille totale</span>
                        <span className="font-semibold">{formatFileSize(stats.size)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">% du total</span>
                        <span className="font-semibold">
                          {filesCount > 0 ? ((stats.count / filesCount) * 100).toFixed(1) : 0}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Sécurité */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Analyse de sécurité
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Taux de détection</CardTitle>
                <CardDescription>
                  Résultats des scans de sécurité
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Fichiers sûrs</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{
                            width: scansCount > 0
                              ? `${((scansCount - threatsCount) / scansCount) * 100}%`
                              : "0%",
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium">
                        {scansCount - threatsCount}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Menaces détectées</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-red-600 h-2 rounded-full"
                          style={{
                            width: scansCount > 0
                              ? `${(threatsCount / scansCount) * 100}%`
                              : "0%",
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium text-red-600">
                        {threatsCount}
                      </span>
                    </div>
                  </div>
                </div>

                <Link href="/scan" className="block mt-4">
                  <Button variant="outline" size="sm" className="w-full">
                    Voir tous les scans
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Activité de partage</CardTitle>
                <CardDescription>
                  Statistiques de partage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-4">
                    <div className="text-4xl font-bold text-blue-600">{sharesCount}</div>
                    <p className="text-sm text-gray-600 mt-2">
                      Lien{sharesCount > 1 ? "s" : ""} de partage créé{sharesCount > 1 ? "s" : ""}
                    </p>
                  </div>
                  {sharesCount > 0 && (
                    <div className="text-center text-sm text-gray-600">
                      <p>
                        {((sharesCount / Math.max(filesCount, 1)) * 100).toFixed(1)}% des fichiers partagés
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Actions rapides */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Actions rapides
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/files">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <FileText className="h-12 w-12 mx-auto mb-3 text-blue-600" />
                  <h3 className="font-semibold text-gray-900 mb-1">Gérer les fichiers</h3>
                  <p className="text-sm text-gray-600">Upload, voir, partager</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/scan">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Shield className="h-12 w-12 mx-auto mb-3 text-green-600" />
                  <h3 className="font-semibold text-gray-900 mb-1">Scans de sécurité</h3>
                  <p className="text-sm text-gray-600">Historique des analyses</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/teams">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Share2 className="h-12 w-12 mx-auto mb-3 text-purple-600" />
                  <h3 className="font-semibold text-gray-900 mb-1">Équipes</h3>
                  <p className="text-sm text-gray-600">Collaboration</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}


