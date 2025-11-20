"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Download, Share2, Trash2, AlertCircle } from "lucide-react";

interface FileActionsProps {
  fileId: string;
  fileName: string;
}

export function FileActions({ fileId, fileName }: FileActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDownload = async () => {
    setLoading(true);
    try {
      // Ouvrir le lien de téléchargement dans un nouvel onglet
      window.open(`/api/files/download?id=${fileId}`, '_blank');
    } catch (err) {
      setError("Erreur lors du téléchargement");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    // Rediriger vers la page de partage
    router.push(`/files/${fileId}/share`);
  };

  const handleDelete = async () => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${fileName}" ?`)) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/files/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fileId }),
      });

      const data = await response.json();

      if (response.ok) {
        // Rediriger vers la liste des fichiers
        router.push("/files");
        router.refresh();
      } else {
        setError(data.error || "Erreur lors de la suppression");
      }
    } catch (err) {
      setError("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center gap-4">
        <Button onClick={handleDownload} disabled={loading}>
          <Download className="mr-2 h-4 w-4" />
          Télécharger
        </Button>
        <Button variant="outline" onClick={handleShare} disabled={loading}>
          <Share2 className="mr-2 h-4 w-4" />
          Partager
        </Button>
        <Button variant="destructive" onClick={handleDelete} disabled={loading}>
          <Trash2 className="mr-2 h-4 w-4" />
          {loading ? "Suppression..." : "Supprimer"}
        </Button>
      </div>
    </div>
  );
}

