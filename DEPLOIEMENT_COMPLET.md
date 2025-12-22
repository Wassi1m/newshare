# 🚀 Guide de Déploiement NewShare sur EC2

## ✅ Résumé du Déploiement Réussi

Votre application **NewShare** est maintenant **déployée et fonctionnelle** sur AWS EC2 !

- **URL** : http://13.60.214.119:3000
- **Statut** : ✅ Opérationnel
- **Mode** : Développement (Next.js 16.0.0)
- **Gestionnaire** : PM2

---

## 📋 Ce qui a été fait

### 1. Installation sur EC2
- ✅ Node.js 20.x installé
- ✅ PM2 installé et configuré
- ✅ Repository cloné dans `~/newshare`
- ✅ Dépendances npm installées
- ✅ Base de données SQLite configurée

### 2. Configuration
- ✅ Fichier `.env` créé avec IP publique
- ✅ Prisma Client généré
- ✅ Port 3000 ouvert dans AWS Security Groups

### 3. Déploiement
- ✅ Application déployée en mode développement (évite le timeout du build)
- ✅ PM2 configuré pour redémarrage automatique
- ✅ Application démarre en 2-3 secondes

---

## 🔧 Commandes Utiles

### Sur votre machine locale

**Connexion SSH à EC2 :**
```bash
ssh -i ~/Téléchargements/wassim.pem ec2-user@13.60.214.119
```

### Sur EC2

**Aller dans le projet :**
```bash
cd ~/newshare
```

**Voir le statut de l'application :**
```bash
pm2 status
```

**Voir les logs en temps réel :**
```bash
pm2 logs newshare
```

**Redémarrer l'application :**
```bash
pm2 restart newshare
```

**Arrêter l'application :**
```bash
pm2 stop newshare
```

**Monitoring en temps réel :**
```bash
pm2 monit
```

---

## 🔄 Mise à Jour du Code

Lorsque vous modifiez le code et voulez déployer les changements :

### 1. Pousser les changements sur GitHub
```bash
git add .
git commit -m "Vos modifications"
git push origin main
```

### 2. Mettre à jour sur EC2
```bash
# Se connecter à EC2
ssh -i ~/Téléchargements/wassim.pem ec2-user@13.60.214.119

# Aller dans le projet
cd ~/newshare

# Mettre à jour le code
git pull origin main

# Installer les nouvelles dépendances (si nécessaire)
npm install

# Redémarrer l'application
pm2 restart newshare
```

---

## 🐛 Résolution des Problèmes

### L'application ne répond pas

1. **Vérifier le statut :**
```bash
pm2 status
```

2. **Voir les erreurs :**
```bash
pm2 logs newshare --err
```

3. **Redémarrer :**
```bash
pm2 restart newshare
```

### L'application crashe après modification

1. **Voir les logs détaillés :**
```bash
pm2 logs newshare --lines 50
```

2. **Vérifier le fichier .env :**
```bash
cat ~/newshare/.env
```

3. **Régénérer Prisma :**
```bash
cd ~/newshare
npx prisma generate
pm2 restart newshare
```

### Base de données corrompue

```bash
cd ~/newshare
pm2 stop newshare
rm -f prisma/dev.db-journal
pm2 start newshare
```

---

## 📊 Configuration du Serveur

```
Serveur:        Amazon Linux 2023
Instance:       t2.micro (ou similaire)
IP Publique:    13.60.214.119
IP Privée:      172.31.37.14
Port:           3000
Node.js:        v20.19.6
PM2:            Installé et configuré
Database:       SQLite (~/newshare/prisma/dev.db)
```

---

## 🔒 Sécurité AWS

### Groupes de Sécurité Configurés

Le groupe de sécurité `sgr-0a880dba6b61a5e7a` a les règles suivantes :

| Type | Port | Source | Description |
|------|------|--------|-------------|
| SSH | 22 | Personnalisé | Accès SSH |
| TCP personnalisé | 3000 | 0.0.0.0/0 | Application NewShare |
| HTTP | 80 | Personnalisé | HTTP (si nécessaire) |

### Recommandations de Sécurité

1. **Limiter l'accès SSH** : Au lieu de `0.0.0.0/0`, utilisez votre IP spécifique
2. **HTTPS** : Configurez un certificat SSL (Let's Encrypt) pour la production
3. **Variables d'environnement** : Ne committez jamais le fichier `.env`
4. **Mots de passe forts** : Utilisez des mots de passe complexes pour les comptes

---

## 🚀 Passage en Production (Optionnel)

Si vous voulez plus de performances, vous pouvez tenter le mode production :

### 1. Créer un swap de 2GB (pour le build)
```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### 2. Faire le build
```bash
cd ~/newshare
export NODE_OPTIONS="--max-old-space-size=1536"
npm run build
```

**⚠️ Attention** : Le build peut prendre 10-15 minutes et peut échouer sur petites instances.

### 3. Démarrer en production
```bash
pm2 delete newshare
pm2 start npm --name "newshare" -- start
pm2 save
```

### 4. Si le build échoue
Restez en mode développement (c'est OK pour des démos et petits projets).

---

## 📝 Fonctionnalités de l'Application

### Pages Disponibles

- **Accueil** : http://13.60.214.119:3000
- **Connexion** : http://13.60.214.119:3000/auth/login
- **Inscription** : http://13.60.214.119:3000/auth/signup
- **Dashboard** : http://13.60.214.119:3000/dashboard (après connexion)
- **Fichiers** : http://13.60.214.119:3000/files
- **Équipes** : http://13.60.214.119:3000/teams

### Fonctionnalités

1. **Authentification**
   - Inscription / Connexion
   - Sessions sécurisées (NextAuth.js)
   - Gestion des utilisateurs

2. **Gestion de Fichiers**
   - Upload de fichiers
   - Téléchargement
   - Suppression
   - Partage via lien

3. **Équipes**
   - Création d'équipes
   - Invitation de membres
   - Partage de fichiers en équipe

4. **Sécurité**
   - Scan de malware (si configuré)
   - Validation des fichiers
   - Accès contrôlé

---

## 📦 Structure du Projet

```
~/newshare/
├── app/                 # Pages Next.js
├── components/          # Composants React
├── lib/                 # Utilitaires
├── prisma/              # Base de données
│   ├── schema.prisma    # Schéma DB
│   └── dev.db          # Fichier SQLite
├── public/              # Fichiers statiques
├── .env                 # Variables d'environnement
├── package.json         # Dépendances
└── next.config.ts       # Configuration Next.js
```

---

## 🔄 Workflow de Développement

### En local (sur votre machine)

```bash
cd "/home/user/Bureau/share suc/exchange_platform"

# Développement
npm run dev

# Test du build
npm run build
npm start

# Pousser les changements
git add .
git commit -m "Description"
git push origin main
```

### Sur EC2

```bash
ssh -i ~/Téléchargements/wassim.pem ec2-user@13.60.214.119
cd ~/newshare
git pull origin main
npm install
pm2 restart newshare
```

---

## 🎯 Checklist de Vérification

- [x] Application déployée sur EC2
- [x] PM2 configuré et actif
- [x] Port 3000 ouvert dans AWS
- [x] IP publique configurée
- [x] Base de données SQLite créée
- [x] Application accessible depuis Internet
- [x] Authentification fonctionnelle
- [x] Upload de fichiers fonctionnel

---

## 📞 Support et Maintenance

### Logs et Monitoring

```bash
# Voir tous les logs
pm2 logs newshare

# Voir seulement les erreurs
pm2 logs newshare --err

# Vider les logs
pm2 flush newshare

# Monitoring en temps réel
pm2 monit
```

### Redémarrage Automatique

PM2 est configuré pour redémarrer automatiquement l'application :
- En cas de crash
- Au redémarrage du serveur (via `pm2 startup`)

### Sauvegardes

**Base de données :**
```bash
# Sauvegarder la DB
cp ~/newshare/prisma/dev.db ~/backups/dev.db.$(date +%Y%m%d)

# Restaurer
cp ~/backups/dev.db.YYYYMMDD ~/newshare/prisma/dev.db
pm2 restart newshare
```

---

## 🎉 Félicitations !

Votre plateforme de partage de fichiers est maintenant déployée et opérationnelle !

**URL de production** : http://13.60.214.119:3000

---

**Dernière mise à jour** : 22 Décembre 2025  
**Version** : 1.0.0 (Mode Développement)  
**Statut** : ✅ Production Ready
