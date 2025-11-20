"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Shield, ArrowLeft, Link as LinkIcon, Copy, Check, AlertCircle, Calendar, Lock } from "lucide-react";
import Link from "next/link";

interface SharePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function SharePage({ params }: SharePageProps) {
  const router = useRouter();
  const [fileId, setFileId] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [password, setPassword] = useState("");
  const [expiresInDays, setExpiresInDays] = useState(7);
  const [maxDownloads, setMaxDownloads] = useState<number | undefined>(undefined);
  const [shareLink, setShareLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Récupérer les paramètres
    params.then(({ id }) => {
      setFileId(id);
      // Récupérer les infos du fichier
      fetch(`/api/files/${id}`)
        .then(res => res.json())
        .then(data => {
          if (data.file) {
            setFileName(data.file.originalName);
          }
        })
        .catch(err => console.error(err));
    });
  }, [params]);

  const handleCreateShare = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiresInDays);

      const response = await fetch("/api/shares/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileId,
          password: password || undefined,
          expiresAt: expiresAt.toISOString(),
          maxDownloads: maxDownloads || undefined,
          isPublic: true,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const link = `${window.location.origin}/share/${data.share.linkToken}`;
        setShareLink(link);
      } else {
        setError(data.error || "Erreur lors de la création du partage");
      }
    } catch (err) {
      setError("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href={`/files/${fileId}`}>
              <Button variant="outline" size="icon" className="border-gray-300">
                <ArrowLeft className="h-5 w-5 text-gray-700" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Partager un fichier</h1>
                <p className="text-sm text-gray-600">{fileName}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {shareLink ? (
          /* Lien de partage créé */
          <Card>
            <CardHeader>
              <CardTitle>✅ Lien de partage créé !</CardTitle>
              <CardDescription>
                Partagez ce lien avec les personnes de votre choix
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <Input
                    value={shareLink}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant={copied ? "default" : "outline"}
                    onClick={copyToClipboard}
                  >
                    {copied ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Copié !
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-4 w-4" />
                        Copier
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">Paramètres du partage</h3>
                <div className="space-y-2">
                  {password && (
                    <div className="flex items-center gap-2 text-sm">
                      <Lock className="h-4 w-4 text-gray-600" />
                      <span className="text-gray-600">Protégé par mot de passe</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-600" />
                    <span className="text-gray-600">
                      Expire dans {expiresInDays} jour{expiresInDays > 1 ? "s" : ""}
                    </span>
                  </div>
                  {maxDownloads && (
                    <div className="flex items-center gap-2 text-sm">
                      <LinkIcon className="h-4 w-4 text-gray-600" />
                      <span className="text-gray-600">
                        Maximum {maxDownloads} téléchargement{maxDownloads > 1 ? "s" : ""}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              <div className="flex gap-4">
                <Link href="/files" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Retour aux fichiers
                  </Button>
                </Link>
                <Button
                  onClick={() => {
                    setShareLink("");
                    setPassword("");
                    setMaxDownloads(undefined);
                  }}
                  className="flex-1"
                >
                  Créer un nouveau lien
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Formulaire de création de partage */
          <Card>
            <CardHeader>
              <CardTitle>Créer un lien de partage</CardTitle>
              <CardDescription>
                Configurez les options de partage pour votre fichier
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleCreateShare} className="space-y-6">
                {/* Type de partage */}
                <div className="space-y-2">
                  <Label>Type de partage</Label>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2">
                      <LinkIcon className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-blue-900">Lien public</p>
                        <p className="text-sm text-blue-700">
                          Toute personne avec le lien peut accéder au fichier
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mot de passe (optionnel) */}
                <div className="space-y-2">
                  <Label htmlFor="password">
                    Mot de passe (optionnel)
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Protéger par mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500">
                    Laissez vide pour un partage sans mot de passe
                  </p>
                </div>

                {/* Expiration */}
                <div className="space-y-2">
                  <Label htmlFor="expires">Expiration</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 7, 30, 365].map((days) => (
                      <Button
                        key={days}
                        type="button"
                        variant={expiresInDays === days ? "default" : "outline"}
                        onClick={() => setExpiresInDays(days)}
                        disabled={loading}
                      >
                        {days === 1 ? "1 jour" : days === 365 ? "1 an" : `${days}j`}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Limite de téléchargements */}
                <div className="space-y-2">
                  <Label htmlFor="maxDownloads">
                    Limite de téléchargements (optionnel)
                  </Label>
                  <Input
                    id="maxDownloads"
                    type="number"
                    min="1"
                    placeholder="Illimité"
                    value={maxDownloads || ""}
                    onChange={(e) => setMaxDownloads(e.target.value ? parseInt(e.target.value) : undefined)}
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500">
                    Laissez vide pour un nombre illimité de téléchargements
                  </p>
                </div>

                <Separator />

                <div className="flex gap-4">
                  <Link href={`/files/${fileId}`} className="flex-1">
                    <Button type="button" variant="outline" className="w-full" disabled={loading}>
                      Annuler
                    </Button>
                  </Link>
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? "Création..." : "Créer le lien de partage"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}


