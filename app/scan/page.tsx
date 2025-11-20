import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, ArrowLeft, FileText, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { formatDateTime } from "@/lib/utils/format";
import Link from "next/link";

export default async function ScanPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  // Récupérer tous les scans de l'utilisateur
  const scans = await prisma.scanResult.findMany({
    where: {
      file: {
        userId: session.user.id,
      },
    },
    include: {
      file: {
        select: {
          id: true,
          originalName: true,
          extension: true,
        },
      },
    },
    orderBy: {
      scanDate: "desc",
    },
    take: 50,
  });

  const threatLevelColors = {
    SAFE: "success",
    LOW: "secondary",
    MEDIUM: "warning",
    HIGH: "destructive",
    CRITICAL: "destructive",
  } as const;

  const threatLevelIcons = {
    SAFE: CheckCircle,
    LOW: AlertTriangle,
    MEDIUM: AlertTriangle,
    HIGH: XCircle,
    CRITICAL: XCircle,
  };

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
                  <h1 className="text-2xl font-bold text-gray-900">Scans de Sécurité</h1>
                  <p className="text-sm text-gray-600">
                    {scans.length} scan{scans.length > 1 ? "s" : ""} effectué{scans.length > 1 ? "s" : ""}
                  </p>
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
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Historique des scans
          </h2>
          <p className="text-gray-600">
            Consultez tous les résultats des analyses de sécurité
          </p>
        </div>

        {scans.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Shield className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucun scan effectué
              </h3>
              <p className="text-gray-600 mb-6">
                Uploadez des fichiers et lancez des scans pour voir les résultats ici
              </p>
              <Link href="/files">
                <Button>Aller aux fichiers</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {scans.map((scan) => {
              const ThreatIcon = threatLevelIcons[scan.threatLevel];
              
              return (
                <Card key={scan.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="flex-shrink-0">
                          <FileText className="h-10 w-10 text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base">
                            <Link 
                              href={`/files/${scan.file.id}`}
                              className="hover:text-blue-600 transition-colors"
                            >
                              {scan.file.originalName}
                            </Link>
                          </CardTitle>
                          <CardDescription>
                            {formatDateTime(scan.scanDate)}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant={threatLevelColors[scan.threatLevel]}>
                        <ThreatIcon className="h-3 w-3 mr-1" />
                        {scan.threatLevel}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Statut</p>
                        <p className="font-medium">
                          {scan.isMalware ? "🦠 Malware" : "✓ Sûr"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Score de risque</p>
                        <p className="font-medium">{scan.riskScore}/100</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Confiance</p>
                        <p className="font-medium">
                          {(scan.confidence * 100).toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Temps de traitement</p>
                        <p className="font-medium">{scan.processingTime}ms</p>
                      </div>
                    </div>

                    {scan.threatType && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm font-medium text-red-900">
                          Type de menace : {scan.threatType}
                        </p>
                        {scan.threatFamily && (
                          <p className="text-xs text-red-700 mt-1">
                            Famille : {scan.threatFamily}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="mt-4 flex justify-end">
                      <Link href={`/files/${scan.file.id}`}>
                        <Button size="sm" variant="outline">
                          Voir le fichier
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}


