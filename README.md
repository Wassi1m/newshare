# 🛡️ SecureShare - Plateforme d'Échange de Fichiers Sécurisés

Plateforme web développée avec **Next.js 16** permettant l'échange sécurisé de fichiers entre utilisateurs, intégrant un système de détection de malwares basé sur l'intelligence artificielle.

## 🎯 Objectif du Projet

Ce projet est développé dans le cadre de deux matières académiques :
- **Développement Next.js** : Démonstration d'une maîtrise avancée du framework
- **Machine Learning** : Intégration d'un système de détection de malwares par IA

## ✨ Fonctionnalités Principales

### 🔐 Authentification & Utilisateurs
- Inscription/Connexion (email + OAuth : Google, GitHub)
- Authentification à deux facteurs (2FA)
- Gestion complète du profil utilisateur
- Système de rôles et permissions

### 📁 Gestion des Fichiers
- Upload de fichiers (drag & drop, chunked upload pour fichiers volumineux)
- Organisation par dossiers et catégories
- Tags personnalisés et favoris
- Versioning complet des fichiers
- Prévisualisation intégrée (images, PDF, vidéos)

### 🔄 Partage Collaboratif
- Liens de partage (publics, privés, avec expiration)
- Protection par mot de passe
- Permissions granulaires
- Dossiers partagés collaboratifs
- Analytics de partage

### 🛡️ Détection IA de Malwares
- Scan automatique à l'upload
- 7+ modèles d'IA spécialisés
- Rapports d'analyse détaillés
- Système de quarantaine automatique
- Dashboard de visualisation des menaces

### 🔔 Notifications
- Notifications en temps réel
- Centre de notifications
- Notifications email
- Préférences personnalisables

### 👥 Collaboration (Équipes)
- Création d'équipes/organisations
- Espaces de travail partagés
- Gestion des membres et permissions
- Quotas par équipe

### 📊 Analytics & Rapports
- Graphiques interactifs
- Rapports personnalisables
- Export de données (CSV, Excel, PDF)
- Prédictions d'utilisation

### ⚙️ Administration
- Panel d'administration complet
- Gestion des utilisateurs
- Monitoring du système
- Audit logs

## 🏗️ Stack Technique

### Frontend
- **Next.js 16** (App Router, Server Components)
- **React 19**
- **TypeScript**
- **Tailwind CSS 4**
- **Radix UI** (Composants accessibles)
- **Zustand** (State Management)
- **React Hook Form + Zod** (Formulaires & Validation)
- **Recharts** (Graphiques)
- **Lucide React** (Icônes)

### Backend
- **Next.js API Routes**
- **Prisma** (ORM)
- **PostgreSQL** (Base de données)
- **NextAuth.js** (Authentification)
- **bcryptjs** (Hashing des mots de passe)

### Intégrations
- **API ML externe** (Détection de malwares)
- **Services de stockage cloud** (AWS S3, Cloudinary)
- **Stripe** (Paiements)
- **OAuth Providers** (Google, GitHub)

## 📦 Installation

### Prérequis
- Node.js >= 20.9.0
- PostgreSQL >= 14
- npm ou yarn

### Étapes

1. **Cloner le repository**
```bash
git clone <repository-url>
cd exchange_platform
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer les variables d'environnement**
```bash
# Copier le fichier .env.example
cp .env.example .env

# Éditer .env avec vos informations
DATABASE_URL="postgresql://user:password@localhost:5432/secureshare"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="votre-secret-ici"
# ... autres variables
```

4. **Initialiser la base de données**
```bash
# Créer la base de données PostgreSQL
createdb secureshare

# Exécuter les migrations Prisma
npx prisma migrate dev --name init

# Générer le client Prisma
npx prisma generate
```

5. **Lancer le serveur de développement**
```bash
npm run dev
```

L'application sera accessible sur **http://localhost:3000**

## 📂 Structure du Projet

```
exchange_platform/
├── app/                      # Pages Next.js (App Router)
│   ├── layout.tsx           # Layout racine
│   ├── page.tsx             # Page d'accueil
│   ├── auth/                # Pages d'authentification
│   ├── dashboard/           # Dashboard utilisateur
│   ├── files/               # Gestion des fichiers
│   ├── admin/               # Panel admin
│   └── api/                 # Routes API
├── components/              # Composants React
│   ├── ui/                  # Composants UI de base
│   ├── layout/              # Composants de layout
│   ├── files/               # Composants fichiers
│   ├── dashboard/           # Composants dashboard
│   └── auth/                # Composants auth
├── lib/                     # Bibliothèques et utilitaires
│   ├── db/                  # Configuration base de données
│   ├── auth/                # Configuration auth
│   ├── api/                 # Clients API
│   ├── utils/               # Utilitaires
│   └── constants.ts         # Constantes
├── types/                   # Types TypeScript
│   └── index.ts             # Types globaux
├── prisma/                  # Schéma et migrations Prisma
│   └── schema.prisma        # Schéma de base de données
└── public/                  # Assets statiques
```

## 🗄️ Modèles de Base de Données

Le schéma Prisma comprend 20+ modèles :
- **User, Account, Session** (Authentification)
- **UserProfile** (Profils utilisateurs)
- **File, Folder, FileVersion** (Gestion de fichiers)
- **ScanResult, Quarantine** (Sécurité)
- **Share, Download** (Partage)
- **Comment** (Collaboration)
- **Notification** (Notifications)
- **Team, TeamMember** (Équipes)
- **Subscription** (Abonnements)
- **ApiKey, Webhook** (Intégrations)
- **AuditLog** (Audit)

## 🚀 Scripts Disponibles

```bash
# Développement
npm run dev          # Lancer le serveur de développement

# Production
npm run build        # Build de production
npm run start        # Démarrer en mode production

# Base de données
npx prisma migrate dev     # Créer et appliquer une migration
npx prisma generate        # Générer le client Prisma
npx prisma studio          # Interface graphique de la BDD
npx prisma db push         # Push du schéma sans migration

# Linting
npm run lint         # Vérifier le code avec ESLint
```

## 📊 Interfaces de l'Application

L'application comprend **15 interfaces principales** :

1. **Page d'accueil** - Landing page avec fonctionnalités
2. **Authentification** - Login, Signup, 2FA
3. **Dashboard Utilisateur** - Vue d'ensemble
4. **Gestion des Fichiers** - Upload, liste, détails
5. **Page de Partage** - Créer et gérer les partages
6. **Page de Scan** - Résultats et rapports de sécurité
7. **Quarantaine** - Fichiers suspects
8. **Recherche** - Recherche avancée
9. **Notifications** - Centre de notifications
10. **Profil Utilisateur** - Paramètres de compte
11. **Équipes** - Collaboration
12. **Abonnements** - Plans et facturation
13. **Dashboard Admin** - Administration
14. **Analytics** - Rapports et statistiques
15. **Paramètres** - Configuration

## 🔒 Sécurité

- **Authentification robuste** avec NextAuth.js
- **Chiffrement des mots de passe** avec bcryptjs
- **Protection CSRF** et XSS
- **Validation des inputs** côté client et serveur
- **Rate limiting** sur les APIs
- **Audit logs** pour toutes les actions critiques
- **Détection de malwares** avec IA
- **Quarantaine automatique** des fichiers suspects

## 📝 Conformité

- **RGPD** : Consentement, droit à l'oubli, portabilité des données
- **Sécurité des données** : Chiffrement au repos et en transit
- **Politique de confidentialité** et CGU

## 🎨 Design

- Design moderne et minimaliste
- Palette de couleurs : Bleu (principal), Gris (neutre)
- **Responsive** : Compatible mobile, tablette, desktop
- **Accessibilité** : Composants Radix UI accessibles
- **Dark mode** : Support du thème sombre (à venir)

## 🤝 Contribution

Ce projet est développé dans un cadre académique. Les contributions ne sont pas acceptées pour le moment.

## 📄 Licence

Ce projet est à usage académique uniquement.

## 👤 Auteur

Développé dans le cadre des cours :
- Développement Next.js
- Machine Learning (ML)

## 📞 Support

Pour toute question sur le projet, consultez la documentation ou le fichier PROGRESS.md pour suivre l'avancement du développement.

---

**Version** : 0.1.0  
**Last Updated** : Octobre 2025
# app-sahre
# app-sahre
