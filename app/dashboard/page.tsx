import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Upload, FileText, Users, BarChart3, Bell } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  // Récupérer les statistiques de l'utilisateur
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

  const recentFiles = await prisma.file.findMany({
    where: {
      userId: session.user.id,
      status: { not: "DELETED" },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Shield className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-600">Bienvenue, {session.user.name} !</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/scan">
              <Button variant="outline" size="icon" className="border-gray-300 bg-white hover:bg-gray-100" title="Scans de sécurité">
                <Shield className="h-5 w-5 text-gray-700" />
              </Button>
            </Link>
            <Link href="/files">
              <Button variant="outline" size="icon" className="border-gray-300 bg-white hover:bg-gray-100" title="Mes fichiers">
                <FileText className="h-5 w-5 text-gray-700" />
              </Button>
            </Link>
            <Link href="/analytics">
              <Button variant="outline" size="icon" className="border-gray-300 bg-white hover:bg-gray-100" title="Analytics">
                <BarChart3 className="h-5 w-5 text-gray-700" />
              </Button>
            </Link>
            <Button variant="outline" size="icon" className="border-gray-300 bg-white hover:bg-gray-100" title="Notifications (Bientôt)" disabled>
              <Bell className="h-5 w-5 text-gray-700" />
            </Button>
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
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Statistiques */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Fichiers Uploadés
              </CardTitle>
              <FileText className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filesCount}</div>
              <p className="text-xs text-gray-600">
                {filesCount === 0 ? "Aucun fichier" : `fichier${filesCount > 1 ? "s" : ""} uploadé${filesCount > 1 ? "s" : ""}`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Scans Effectués
              </CardTitle>
              <Shield className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profile?.scansPerformed || 0}</div>
              <p className="text-xs text-gray-600">
                {profile?.scansPerformed === 0 ? "Aucun scan" : `scan${(profile?.scansPerformed || 0) > 1 ? "s" : ""} effectué${(profile?.scansPerformed || 0) > 1 ? "s" : ""}`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Fichiers Partagés
              </CardTitle>
              <Users className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sharesCount}</div>
              <p className="text-xs text-gray-600">
                {sharesCount === 0 ? "Aucun partage" : `partage${sharesCount > 1 ? "s" : ""} actif${sharesCount > 1 ? "s" : ""}`}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Actions Rapides */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Démarrage Rapide</CardTitle>
              <CardDescription>
                Commencez à utiliser SecureShare
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/files" className="block">
                <Button className="w-full justify-start" variant="outline">
                  <Upload className="mr-2 h-5 w-5" />
                  Uploader un fichier
                </Button>
              </Link>
              <Link href="/teams/create" className="block">
                <Button className="w-full justify-start" variant="outline">
                  <Users className="mr-2 h-5 w-5" />
                  Créer une équipe
                </Button>
              </Link>
              <Link href="/analytics" className="block">
                <Button className="w-full justify-start" variant="outline">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Voir les analytics
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fichiers Récents</CardTitle>
              <CardDescription>
                Vos derniers fichiers uploadés
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentFiles.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>Aucun fichier</p>
                  <p className="text-sm">Uploadez votre premier fichier pour commencer</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentFiles.map((file) => (
                    <Link key={file.id} href={`/files/${file.id}`}>
                      <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                        <FileText className="h-8 w-8 text-gray-600" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{file.originalName}</p>
                          <p className="text-xs text-gray-500">{file.extension.toUpperCase()}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                  <Link href="/files">
                    <Button variant="outline" size="sm" className="w-full mt-2">
                      Voir tous les fichiers
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

