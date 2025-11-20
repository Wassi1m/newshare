"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { Shield, AlertCircle } from "lucide-react";

interface ScanButtonProps {
  fileId: string;
  fileName: string;
}

export function ScanButton({ fileId, fileName }: ScanButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleScan = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fileId }),
      });

      const data = await response.json();

      if (response.ok) {
        // Rafraîchir la page pour afficher les résultats
        router.refresh();
      } else {
        setError(data.error || "Erreur lors du scan");
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

      <Button 
        onClick={handleScan} 
        disabled={loading}
        className="w-full"
      >
        {loading ? (
          <>
            <Spinner size="sm" className="mr-2" />
            Scan en cours...
          </>
        ) : (
          <>
            <Shield className="mr-2 h-4 w-4" />
            Lancer un scan
          </>
        )}
      </Button>

      {loading && (
        <div className="text-center text-sm text-gray-600">
          <p>Analyse du fichier avec 7 modèles d'IA...</p>
          <p className="text-xs text-gray-500 mt-1">Cela peut prendre quelques secondes</p>
        </div>
      )}
    </div>
  );
}







