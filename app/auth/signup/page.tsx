"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Shield, Github, Mail, AlertCircle, CheckCircle, X } from "lucide-react";
import { isValidEmail, isValidPassword, getPasswordStrength } from "@/lib/utils/validation";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordStrength = getPasswordStrength(password);

  const passwordRequirements = [
    { met: password.length >= 8, text: "Au moins 8 caractères" },
    { met: /[A-Z]/.test(password), text: "Une majuscule" },
    { met: /[a-z]/.test(password), text: "Une minuscule" },
    { met: /\d/.test(password), text: "Un chiffre" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!isValidEmail(email)) {
      setError("Adresse email invalide");
      return;
    }

    if (!isValidPassword(password)) {
      setError("Le mot de passe ne respecte pas les critères de sécurité");
      return;
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Inscription réussie, connecter l'utilisateur automatiquement
        const { signIn } = await import("next-auth/react");
        
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (result?.ok) {
          // Rediriger vers le dashboard
          window.location.href = "/dashboard";
        } else {
          // Rediriger vers la page de connexion
          window.location.href = "/auth/login?success=true";
        }
      } else {
        setError(data.error || "Une erreur est survenue lors de l'inscription");
      }
    } catch (err) {
      setError("Une erreur est survenue lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignup = async (provider: string) => {
    setLoading(true);
    try {
      // Rediriger vers l'authentification OAuth
      window.location.href = `/api/auth/signin/${provider}?callbackUrl=/dashboard`;
    } catch (err) {
      setError("Erreur lors de l'inscription");
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 40) return "bg-red-600";
    if (passwordStrength < 70) return "bg-yellow-600";
    return "bg-green-600";
  };

  const getPasswordStrengthLabel = () => {
    if (passwordStrength < 40) return "Faible";
    if (passwordStrength < 70) return "Moyen";
    return "Fort";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <Shield className="h-10 w-10 text-blue-600" />
            <span className="text-3xl font-bold text-gray-900">SecureShare</span>
          </Link>
          <p className="text-gray-600">Créez votre compte</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Inscription</CardTitle>
            <CardDescription>
              Commencez à partager vos fichiers en toute sécurité
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom complet</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Jean Dupont"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nom@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
                
                {password && (
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Force du mot de passe:</span>
                      <span className={`font-medium ${
                        passwordStrength < 40 ? "text-red-600" :
                        passwordStrength < 70 ? "text-yellow-600" :
                        "text-green-600"
                      }`}>
                        {getPasswordStrengthLabel()}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${getPasswordStrengthColor()}`}
                        style={{ width: `${passwordStrength}%` }}
                      />
                    </div>
                    
                    <div className="space-y-1 pt-2">
                      {passwordRequirements.map((req, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          {req.met ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <X className="h-4 w-4 text-gray-400" />
                          )}
                          <span className={req.met ? "text-green-600" : "text-gray-600"}>
                            {req.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Création du compte..." : "Créer mon compte"}
              </Button>
            </form>

            <div className="relative my-6">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-sm text-gray-500">
                Ou continuer avec
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={() => handleOAuthSignup("google")}
                disabled={loading}
              >
                <Mail className="mr-2 h-4 w-4" />
                Google
              </Button>
              <Button
                variant="outline"
                onClick={() => handleOAuthSignup("github")}
                disabled={loading}
              >
                <Github className="mr-2 h-4 w-4" />
                GitHub
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-2">
            <Separator />
            <p className="text-sm text-center text-gray-600 mt-4">
              Vous avez déjà un compte ?{" "}
              <Link href="/auth/login" className="text-blue-600 hover:underline font-medium">
                Se connecter
              </Link>
            </p>
          </CardFooter>
        </Card>

        <p className="text-center text-sm text-gray-600 mt-8">
          En vous inscrivant, vous acceptez nos{" "}
          <Link href="/terms" className="text-blue-600 hover:underline">
            conditions d'utilisation
          </Link>{" "}
          et notre{" "}
          <Link href="/privacy" className="text-blue-600 hover:underline">
            politique de confidentialité
          </Link>
          .
        </p>
      </div>
    </div>
  );
}

