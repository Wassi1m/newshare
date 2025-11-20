"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Shield, Download, Lock, FileText, HardDrive, Calendar, User, AlertCircle, CheckCircle } from "lucide-react";
import { formatFileSize, formatDateTime } from "@/lib/utils/format";
import Link from "next/link";

interface SharePageProps {
  params: Promise<{
    token: string;
  }>;
}

export default function SharePage({ params }: SharePageProps) {
  const [token, setToken] = useState<string>("");
  const [share, setShare] = useState<any>(null);
  const [file, setFile] = useState<any>(null);
  const [password, setPassword] = useState("");
  const [needsPassword, setNeedsPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    params.then(({ token }) => {
      setToken(token);
      loadShare(token);
    });
  }, [params]);

  const loadShare = async (shareToken: string, pwd?: string) => {
    setLoading(true);
    setError("");

    try {
      const url = pwd 
        ? `/api/shares/${shareToken}?password=${encodeURIComponent(pwd)}`
        : `/api/shares/${shareToken}`;

      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        setShare(data.share);
        setFile(data.file);
        setNeedsPassword(false);
      } else if (response.status === 403 && data.needsPassword) {
        setNeedsPassword(true);
      } else {
        setError(data.error || "Lien de partage invalide");
      }
    } catch (err) {
      setError("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadShare(token, password);
  };

  const handleDownload = async () => {
    if (!file) return;

    setDownloading(true);
    try {
      // Enregistrer le téléchargement
      await fetch(`/api/shares/${token}/download`, {
        method: "POST",
      });

      // Télécharger le fichier
      window.open(`/api/files/download?id=${file.id}`, '_blank');
    } catch (err) {
      setError("Erreur lors du téléchargement");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-12 text-center">
            <Shield className="h-16 w-16 mx-auto mb-4 text-blue-600 animate-pulse" />
            <p className="text-gray-600">Chargement du partage...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Demander le mot de passe
  if (needsPassword && !share) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Lock className="h-6 w-6 text-blue-600" />
              <CardTitle>Fichier Protégé</CardTitle>
            </div>
            <CardDescription>
              Ce fichier est protégé par un mot de passe
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Entrez le mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                Accéder au fichier
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Erreur
  if (error && !share) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-6 w-6 text-red-600" />
              <CardTitle>Erreur</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Link href="/" className="block mt-4">
              <Button variant="outline" className="w-full">
                Retour à l'accueil
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Afficher le fichier partagé
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <Shield className="h-10 w-10 text-blue-600" />
            <span className="text-3xl font-bold text-gray-900">SecureShare</span>
          </Link>
          <p className="text-gray-600">Fichier partagé de manière sécurisée</p>
        </div>

        {/* Fichier */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-xl">{file?.originalName}</CardTitle>
                <CardDescription>
                  {file?.extension?.toUpperCase()} • {formatFileSize(file?.size || 0)}
                </CardDescription>
              </div>
              <Badge variant="success">
                <CheckCircle className="h-3 w-3 mr-1" />
                Sécurisé
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Informations du partage */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <HardDrive className="h-4 w-4" />
                  <span>Taille</span>
                </div>
                <p className="font-medium">{formatFileSize(file?.size || 0)}</p>
              </div>

              {share?.expiresAt && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>Expire le</span>
                  </div>
                  <p className="font-medium text-sm">{formatDateTime(share.expiresAt)}</p>
                </div>
              )}

              {share?.maxDownloads && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Download className="h-4 w-4" />
                    <span>Téléchargements</span>
                  </div>
                  <p className="font-medium">
                    {share.downloadCount || 0} / {share.maxDownloads}
                  </p>
                </div>
              )}
            </div>

            <Separator />

            {/* Actions */}
            <div className="space-y-3">
              <Button 
                onClick={handleDownload} 
                disabled={downloading}
                className="w-full"
                size="lg"
              >
                <Download className="mr-2 h-5 w-5" />
                {downloading ? "Téléchargement..." : "Télécharger le fichier"}
              </Button>

              <p className="text-xs text-center text-gray-500">
                Ce fichier a été partagé via SecureShare
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <Link href="/" className="text-sm text-blue-600 hover:underline">
            Créer votre compte SecureShare
          </Link>
        </div>
      </div>
    </div>
  );
}






