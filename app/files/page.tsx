import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/files/file-upload";
import { Shield, ArrowLeft, File as FileIcon, Image, Video, FileText } from "lucide-react";
import { formatFileSize, formatRelativeTime } from "@/lib/utils/format";
import Link from "next/link";

export default async function FilesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  // Récupérer les fichiers de l'utilisateur
  const files = await prisma.file.findMany({
    where: {
      userId: session.user.id,
      status: { not: "DELETED" },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 50, // Limiter à 50 fichiers pour l'instant
  });

  const getFileIcon = (extension: string) => {
    const imageExts = ["jpg", "jpeg", "png", "gif", "webp", "svg"];
    const videoExts = ["mp4", "avi", "mov", "wmv"];
    const docExts = ["pdf", "doc", "docx", "txt"];

    if (imageExts.includes(extension.toLowerCase())) {
      return <Image className="h-10 w-10 text-blue-600" />;
    }
    if (videoExts.includes(extension.toLowerCase())) {
      return <Video className="h-10 w-10 text-purple-600" />;
    }
    if (docExts.includes(extension.toLowerCase())) {
      return <FileText className="h-10 w-10 text-green-600" />;
    }
    return <FileIcon className="h-10 w-10 text-gray-600" />;
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
                  <h1 className="text-2xl font-bold text-gray-900">Mes Fichiers</h1>
                  <p className="text-sm text-gray-600">
                    {files.length} fichier{files.length > 1 ? "s" : ""}
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
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Upload Section */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Uploader des fichiers
          </h2>
          <FileUpload />
        </div>

        {/* Files List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Fichiers récents
            </h2>
          </div>

          {files.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <FileIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucun fichier
                </h3>
                <p className="text-gray-600">
                  Uploadez votre premier fichier pour commencer
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {files.map((file) => (
                <Card key={file.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        {getFileIcon(file.extension)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base truncate">
                          {file.originalName}
                        </CardTitle>
                        <CardDescription>
                          {formatFileSize(file.size)} • {formatRelativeTime(file.createdAt)}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        {file.extension.toUpperCase()}
                      </div>
                      <div className="flex items-center gap-2">
                        <Link href={`/files/${file.id}`}>
                          <Button size="sm" variant="outline">
                            Détails
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

