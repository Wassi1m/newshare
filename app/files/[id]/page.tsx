import { auth } from "@/lib/auth/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Shield, ArrowLeft, File, Image, Video, FileText, Clock, HardDrive, Hash, AlertCircle } from "lucide-react";
import { formatFileSize, formatDateTime } from "@/lib/utils/format";
import Link from "next/link";
import { FileActions } from "@/components/files/file-actions";
import { ScanButton } from "@/components/files/scan-button";

interface FileDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function FileDetailsPage({ params }: FileDetailsPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  const { id } = await params;

  // Récupérer le fichier
  const file = await prisma.file.findUnique({
    where: { id },
    include: {
      scanResults: {
        orderBy: { scanDate: "desc" },
        take: 1,
      },
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  // Vérifier que le fichier existe et appartient à l'utilisateur
  if (!file || file.userId !== session.user.id) {
    notFound();
  }

  const getFileIcon = (extension: string) => {
    const imageExts = ["jpg", "jpeg", "png", "gif", "webp", "svg"];
    const videoExts = ["mp4", "avi", "mov", "wmv"];
    const docExts = ["pdf", "doc", "docx", "txt"];

    if (imageExts.includes(extension.toLowerCase())) {
      return <Image className="h-16 w-16 text-blue-600" />;
    }
    if (videoExts.includes(extension.toLowerCase())) {
      return <Video className="h-16 w-16 text-purple-600" />;
    }
    if (docExts.includes(extension.toLowerCase())) {
      return <FileText className="h-16 w-16 text-green-600" />;
    }
    return <File className="h-16 w-16 text-gray-600" />;
  };

  const latestScan = file.scanResults[0];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/files">
                <Button variant="outline" size="icon" className="border-gray-300">
                  <ArrowLeft className="h-5 w-5 text-gray-700" />
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <Shield className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Détails du fichier</h1>
                  <p className="text-sm text-gray-600">{file.originalName}</p>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
            {/* Aperçu du fichier */}
            <Card>
              <CardHeader>
                <CardTitle>Aperçu</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-12">
                  {getFileIcon(file.extension)}
                  <h2 className="text-2xl font-semibold text-gray-900 mt-4 text-center">
                    {file.originalName}
                  </h2>
                  <p className="text-gray-600 mt-2">
                    {file.extension.toUpperCase()} • {formatFileSize(file.size)}
                  </p>
                  <div className="mt-6">
                    <FileActions fileId={file.id} fileName={file.originalName} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Statut de sécurité */}
            <Card>
              <CardHeader>
                <CardTitle>Statut de sécurité</CardTitle>
                <CardDescription>
                  Résultat du scan de sécurité
                </CardDescription>
              </CardHeader>
              <CardContent>
                {latestScan ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Statut :</span>
                      <Badge variant={latestScan.isMalware ? "destructive" : "success"}>
                        {latestScan.isMalware ? "⚠️ Malware détecté" : "✓ Sûr"}
                      </Badge>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Score de risque :</span>
                      <span className="font-semibold">{latestScan.riskScore}/100</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Confiance :</span>
                      <span className="font-semibold">{(latestScan.confidence * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Niveau de menace :</span>
                      <Badge>{latestScan.threatLevel}</Badge>
                    </div>
                    <Separator />
                    <div className="text-sm text-gray-600">
                      Scanné le {formatDateTime(latestScan.scanDate)}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 mb-4">Ce fichier n'a pas encore été scanné</p>
                    <ScanButton fileId={file.id} fileName={file.originalName} />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Colonne latérale - Informations */}
          <div className="space-y-6">
            {/* Informations générales */}
            <Card>
              <CardHeader>
                <CardTitle>Informations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <File className="h-4 w-4" />
                    <span>Nom</span>
                  </div>
                  <p className="text-sm font-medium break-all">{file.name}</p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <HardDrive className="h-4 w-4" />
                    <span>Taille</span>
                  </div>
                  <p className="text-sm font-medium">{formatFileSize(file.size)}</p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>Uploadé le</span>
                  </div>
                  <p className="text-sm font-medium">{formatDateTime(file.createdAt)}</p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Hash className="h-4 w-4" />
                    <span>Hash (SHA-256)</span>
                  </div>
                  <p className="text-xs font-mono break-all text-gray-600">{file.hash}</p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FileText className="h-4 w-4" />
                    <span>Type MIME</span>
                  </div>
                  <p className="text-sm font-medium">{file.mimeType || "Non défini"}</p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Shield className="h-4 w-4" />
                    <span>Statut</span>
                  </div>
                  <Badge variant={file.status === "READY" ? "default" : "secondary"}>
                    {file.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            {file.tags && JSON.parse(file.tags).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {JSON.parse(file.tags).map((tag: string, index: number) => (
                      <Badge key={index} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

