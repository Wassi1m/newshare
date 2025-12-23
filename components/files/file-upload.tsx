"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, File, X, Check, AlertCircle } from "lucide-react";
import { formatFileSize } from "@/lib/utils/format";

interface UploadingFile {
  file: File;
  progress: number;
  status: "uploading" | "success" | "error";
  error?: string;
}

export function FileUpload() {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [error, setError] = useState("");

  const uploadFile = async (file: File) => {
    // Ajouter le fichier à la liste
    const uploadingFile: UploadingFile = {
      file,
      progress: 0,
      status: "uploading",
    };

    setUploadingFiles((prev) => [...prev, uploadingFile]);

    try {
      // Créer FormData
      const formData = new FormData();
      formData.append("file", file);

      // Simuler la progression (dans un vrai cas, utiliser XMLHttpRequest ou axios)
      const interval = setInterval(() => {
        setUploadingFiles((prev) =>
          prev.map((f) =>
            f.file === file && f.progress < 90
              ? { ...f, progress: f.progress + 10 }
              : f
          )
        );
      }, 200);

      // Envoyer le fichier
      const response = await fetch("/api/files/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(interval);

      if (response.ok) {
        setUploadingFiles((prev) =>
          prev.map((f) =>
            f.file === file
              ? { ...f, progress: 100, status: "success" }
              : f
          )
        );

        // Retirer le fichier et rafraîchir la page après 2 secondes
        setTimeout(() => {
          setUploadingFiles((prev) => prev.filter((f) => f.file !== file));
          // Rafraîchir la page pour afficher le nouveau fichier
          window.location.reload();
        }, 2000);
      } else {
        const data = await response.json();
        setUploadingFiles((prev) =>
          prev.map((f) =>
            f.file === file
              ? { ...f, status: "error", error: data.error || "Erreur lors de l'upload" }
              : f
          )
        );
      }
    } catch (err) {
      setUploadingFiles((prev) =>
        prev.map((f) =>
          f.file === file
            ? { ...f, status: "error", error: "Erreur réseau" }
            : f
        )
      );
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError("");
    
    // Vérifier la taille des fichiers
    const maxSize = 100 * 1024 * 1024; // 100 MB
    const invalidFiles = acceptedFiles.filter((file) => file.size > maxSize);
    
    if (invalidFiles.length > 0) {
      setError(`Certains fichiers dépassent la limite de ${formatFileSize(maxSize)}`);
      return;
    }

    // Uploader chaque fichier
    acceptedFiles.forEach((file) => uploadFile(file));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'],
      'video/*': ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.mkv'],
      'audio/*': ['.mp3', '.wav', '.ogg', '.flac', '.aac'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/*': ['.txt', '.csv', '.md'],
      'application/zip': ['.zip'],
      'application/x-rar-compressed': ['.rar'],
      // Fichiers exécutables (pour scan de malware)
      'application/x-msdownload': ['.exe', '.dll', '.bat', '.cmd'],
      'application/x-executable': ['.exe'],
      // Et accepter tous les autres types
      '*/*': [],
    },
    maxSize: 100 * 1024 * 1024, // 100 MB
  });

  const removeFile = (file: File) => {
    setUploadingFiles((prev) => prev.filter((f) => f.file !== file));
  };

  return (
    <div className="space-y-4">
      {/* Zone de drop */}
      <Card>
        <CardContent className="p-8">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-blue-600 bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            {isDragActive ? (
              <p className="text-lg text-blue-600">Déposez les fichiers ici...</p>
            ) : (
              <>
                <p className="text-lg text-gray-700 mb-2">
                  Glissez-déposez vos fichiers ici
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  ou cliquez pour sélectionner des fichiers
                </p>
                <Button variant="outline">
                  Sélectionner des fichiers
                </Button>
                <p className="text-xs text-gray-400 mt-4">
                  Taille maximale : 100 MB par fichier
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Erreur globale */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Liste des fichiers en cours d'upload */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700">
            Fichiers en cours d'upload ({uploadingFiles.length})
          </h3>
          {uploadingFiles.map((item, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    {item.status === "uploading" && (
                      <Upload className="h-5 w-5 text-blue-600 animate-pulse" />
                    )}
                    {item.status === "success" && (
                      <Check className="h-5 w-5 text-green-600" />
                    )}
                    {item.status === "error" && (
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.file.name}
                      </p>
                      <span className="text-xs text-gray-500">
                        {formatFileSize(item.file.size)}
                      </span>
                    </div>

                    {item.status === "uploading" && (
                      <div className="space-y-1">
                        <Progress value={item.progress} />
                        <p className="text-xs text-gray-500">{item.progress}%</p>
                      </div>
                    )}

                    {item.status === "success" && (
                      <p className="text-xs text-green-600">✓ Uploadé avec succès</p>
                    )}

                    {item.status === "error" && (
                      <p className="text-xs text-red-600">{item.error}</p>
                    )}
                  </div>

                  {item.status === "error" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFile(item.file)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

