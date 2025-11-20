import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Shield, 
  Upload, 
  Share2, 
  Lock, 
  Zap, 
  Users, 
  BarChart3, 
  FileSearch,
  CheckCircle,
  ArrowRight
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header / Navigation */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">SecureShare</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-gray-600 hover:text-gray-900">
              Fonctionnalités
            </Link>
            <Link href="#security" className="text-gray-600 hover:text-gray-900">
              Sécurité
            </Link>
            <Link href="#pricing" className="text-gray-600 hover:text-gray-900">
              Tarifs
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/auth/login">
              <Button variant="ghost">Connexion</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>Commencer</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
            <Shield className="h-4 w-4" />
            Détection IA de malwares
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
            Partagez vos fichiers en toute{" "}
            <span className="text-blue-600">sécurité</span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Plateforme d'échange de fichiers avec détection automatique de malwares par 
            intelligence artificielle. Protégez vos données et celles de votre équipe.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/signup">
              <Button size="lg" className="w-full sm:w-auto">
                Essai gratuit <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
         
          </div>

          <div className="flex items-center justify-center gap-8 pt-8 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Aucune carte requise
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Annulation à tout moment
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Tout ce dont vous avez besoin
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Une solution complète pour le partage sécurisé de fichiers avec des 
            fonctionnalités avancées
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>Scan IA de malwares</CardTitle>
              <CardDescription>
                Détection automatique des menaces avec 7 modèles d'IA spécialisés
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Upload className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Upload rapide</CardTitle>
              <CardDescription>
                Uploadez vos fichiers par glisser-déposer jusqu'à 10 GB
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Share2 className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>Partage sécurisé</CardTitle>
              <CardDescription>
                Partagez avec liens sécurisés, mots de passe et dates d'expiration
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                <Lock className="h-6 w-6 text-yellow-600" />
              </div>
              <CardTitle>Chiffrement total</CardTitle>
              <CardDescription>
                Vos fichiers sont chiffrés au repos et en transit
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle>Collaboration</CardTitle>
              <CardDescription>
                Travaillez en équipe avec des espaces partagés
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-indigo-600" />
              </div>
              <CardTitle>Analytics avancés</CardTitle>
              <CardDescription>
                Suivez l'utilisation avec des rapports détaillés
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Sécurité de niveau entreprise
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Notre plateforme utilise les technologies de sécurité les plus avancées 
                pour protéger vos données contre toutes les menaces.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Détection multi-modèles
                    </h3>
                    <p className="text-gray-600">
                      7 modèles d'IA analysent chaque fichier pour une protection maximale
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Quarantaine automatique
                    </h3>
                    <p className="text-gray-600">
                      Les fichiers suspects sont isolés immédiatement
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Conformité RGPD
                    </h3>
                    <p className="text-gray-600">
                      100% conforme aux réglementations européennes
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-xl">
              <div className="flex items-center justify-center mb-6">
                <div className="h-24 w-24 bg-blue-100 rounded-full flex items-center justify-center">
                  <FileSearch className="h-12 w-12 text-blue-600" />
                </div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-gray-900 mb-2">99.9%</div>
                <p className="text-gray-600">Taux de détection des menaces</p>
              </div>
              <div className="mt-8 pt-8 border-t border-gray-200 grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-gray-900">7+</div>
                  <p className="text-sm text-gray-600">Modèles IA</p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">24/7</div>
                  <p className="text-sm text-gray-600">Protection</p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">AES-256</div>
                  <p className="text-sm text-gray-600">Chiffrement</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">
            Prêt à sécuriser vos fichiers ?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Rejoignez des milliers d'utilisateurs qui font confiance à SecureShare
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/signup">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Commencer gratuitement
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent text-white border-white hover:bg-white/10">
                Contacter les ventes
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-6 w-6 text-blue-600" />
                <span className="text-xl font-bold">SecureShare</span>
              </div>
              <p className="text-gray-600 text-sm">
                Plateforme de partage de fichiers sécurisée avec détection IA.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Produit</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="#features">Fonctionnalités</Link></li>
                <li><Link href="#security">Sécurité</Link></li>
                <li><Link href="#pricing">Tarifs</Link></li>
                <li><Link href="/api">API</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Entreprise</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/about">À propos</Link></li>
                <li><Link href="/contact">Contact</Link></li>
                <li><Link href="/careers">Carrières</Link></li>
                <li><Link href="/blog">Blog</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Légal</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/privacy">Confidentialité</Link></li>
                <li><Link href="/terms">CGU</Link></li>
                <li><Link href="/cookies">Cookies</Link></li>
                <li><Link href="/security">Sécurité</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t mt-12 pt-8 text-center text-sm text-gray-600">
            <p>&copy; {new Date().getFullYear()} SecureShare. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
