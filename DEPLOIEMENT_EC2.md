# 🚀 Guide de Déploiement sur EC2

## ⚠️ Problème Actuel : Site Non Accessible

Si votre site n'est pas accessible depuis l'extérieur, vérifiez ces points :

### 1️⃣ Configuration des Groupes de Sécurité AWS

**Étape 1 : Accéder à la Console AWS**
1. Connectez-vous à la [Console AWS EC2](https://console.aws.amazon.com/ec2/)
2. Cliquez sur "Instances" dans le menu de gauche
3. Sélectionnez votre instance EC2

**Étape 2 : Modifier les Groupes de Sécurité**
1. Cliquez sur l'onglet "Sécurité" en bas
2. Cliquez sur le nom du groupe de sécurité (ex: `sg-xxxxx`)
3. Cliquez sur "Modifier les règles entrantes"
4. Cliquez sur "Ajouter une règle"
5. Configurez :
   - **Type** : Personnalisé TCP
   - **Port** : 3000
   - **Source** : 0.0.0.0/0 (pour tout le monde) OU votre IP uniquement
   - **Description** : Next.js Application
6. Cliquez sur "Enregistrer les règles"

### 2️⃣ Vérifier le Pare-feu Local

Sur votre instance EC2, exécutez :

```bash
# Vérifier si le port 3000 est ouvert
sudo firewall-cmd --list-ports

# Si le port n'est pas listé, l'ajouter
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --reload
```

### 3️⃣ Vérifier que l'Application Tourne

```bash
# Vérifier avec PM2
pm2 status

# Voir les logs
pm2 logs newshare

# Si l'application n'est pas démarrée
cd ~/newshare
pm2 start npm --name "newshare" -- start
pm2 save
```

### 4️⃣ Tester la Connexion

```bash
# Depuis votre machine locale
curl http://VOTRE_IP_PUBLIQUE:3000

# Ou depuis l'instance EC2 elle-même
curl http://localhost:3000
```

## 📋 Script de Déploiement Complet

Le script `deploy.sh` a été mis à jour pour :
- ✅ Installer Node.js 20 (requis par Next.js 16)
- ✅ Configurer le pare-feu local
- ✅ Utiliser PM2 pour gérer le processus
- ✅ Démarrer l'application en mode production
- ✅ Configurer les variables d'environnement

### Utilisation

```bash
cd ~/newshare
chmod +x deploy.sh
./deploy.sh
```

## 🔧 Commandes Utiles PM2

```bash
# Voir le statut
pm2 status

# Voir les logs en temps réel
pm2 logs newshare

# Redémarrer l'application
pm2 restart newshare

# Arrêter l'application
pm2 stop newshare

# Supprimer l'application de PM2
pm2 delete newshare

# Sauvegarder la configuration PM2
pm2 save
```

## 🌐 Accéder à l'Application

Une fois tout configuré, votre application sera accessible sur :
```
http://VOTRE_IP_PUBLIQUE_EC2:3000
```

Pour trouver votre IP publique :
```bash
curl http://169.254.169.254/latest/meta-data/public-ipv4
```

## ⚙️ Configuration des Variables d'Environnement

Le script crée automatiquement un fichier `.env` avec :
- `DATABASE_URL` : Base de données SQLite locale
- `NEXTAUTH_URL` : URL publique de l'application
- `NEXTAUTH_SECRET` : Secret généré aléatoirement
- `NODE_ENV` : production
- `PORT` : 3000
- `HOSTNAME` : 0.0.0.0 (pour accepter les connexions externes)

## 🔒 Sécurité

**Important** : Pour la production, modifiez le fichier `.env` avec :
- Un secret `NEXTAUTH_SECRET` fort et unique
- Une base de données PostgreSQL au lieu de SQLite
- Des variables d'environnement sécurisées

## 🐛 Dépannage

### L'application ne démarre pas
```bash
# Vérifier les logs
pm2 logs newshare --lines 50

# Vérifier les erreurs de build
cd ~/newshare
npm run build
```

### Le port 3000 est déjà utilisé
```bash
# Trouver le processus qui utilise le port
sudo lsof -i :3000

# Arrêter PM2 et redémarrer
pm2 stop all
pm2 delete all
pm2 start npm --name "newshare" -- start
```

### Erreur de base de données
```bash
cd ~/newshare
npx prisma generate
npx prisma migrate deploy
```

## 📞 Support

Si le problème persiste :
1. Vérifiez les logs PM2 : `pm2 logs newshare`
2. Vérifiez les groupes de sécurité AWS
3. Vérifiez que le pare-feu local autorise le port 3000
4. Vérifiez que l'application écoute sur 0.0.0.0 et non localhost

