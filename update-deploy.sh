#!/bin/bash
set -e

echo "🔄 Mise à Jour et Déploiement NewShare"
echo "======================================"
echo ""

# Configuration
APP_DIR="$HOME/newshare"
BACKUP_DIR="$HOME/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Vérifier que le répertoire existe
if [ ! -d "$APP_DIR" ]; then
    echo "❌ Répertoire $APP_DIR non trouvé"
    exit 1
fi

cd "$APP_DIR"

# 1. Afficher la version actuelle
echo "📋 Version actuelle :"
git log -1 --oneline
echo ""

# 2. Sauvegarder la base de données
echo "💾 Sauvegarde de la base de données..."
mkdir -p "$BACKUP_DIR"
if [ -f "prisma/dev.db" ]; then
    cp prisma/dev.db "$BACKUP_DIR/dev.db.$DATE"
    echo "✅ Base de données sauvegardée : $BACKUP_DIR/dev.db.$DATE"
else
    echo "⚠️ Pas de base de données à sauvegarder"
fi
echo ""

# 3. Arrêter l'application
echo "🛑 Arrêt de l'application..."
pm2 stop newshare 2>/dev/null || echo "Application déjà arrêtée"
echo ""

# 4. Récupérer les dernières modifications
echo "📥 Récupération des dernières modifications..."
git fetch origin

# Afficher les nouveaux commits
echo ""
echo "📝 Nouveaux commits :"
git log HEAD..origin/main --oneline 2>/dev/null || echo "Aucun nouveau commit"
echo ""

# Confirmer la mise à jour
read -p "Voulez-vous continuer la mise à jour ? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Mise à jour annulée"
    pm2 start newshare
    exit 0
fi

# Pull des changements
echo ""
echo "⬇️ Téléchargement des changements..."
git pull origin main

echo ""
echo "📋 Version après mise à jour :"
git log -1 --oneline
echo ""

# 5. Vérifier si package.json a changé
if git diff HEAD@{1} HEAD --name-only | grep -q "package.json"; then
    echo "📦 package.json modifié - Installation des dépendances..."
    npm install
else
    echo "✅ Pas de nouvelles dépendances"
fi
echo ""

# 6. Vérifier si le schéma Prisma a changé
if git diff HEAD@{1} HEAD --name-only | grep -q "prisma/schema.prisma"; then
    echo "🔧 Schéma Prisma modifié - Régénération du client..."
    npx prisma generate
    
    echo ""
    read -p "⚠️ Voulez-vous appliquer les migrations ? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        npx prisma migrate deploy
    fi
else
    echo "✅ Schéma Prisma inchangé"
fi
echo ""

# 7. Nettoyage
echo "🧹 Nettoyage..."
rm -rf .next
rm -rf node_modules/.cache
echo "✅ Cache nettoyé"
echo ""

# 8. Vérifier le fichier .env
echo "⚙️ Vérification de la configuration..."
if [ ! -f ".env" ]; then
    echo "⚠️ Fichier .env manquant - Création..."
    PUBLIC_IP=$(curl -s --max-time 3 http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo "13.60.214.119")
    
    cat > .env << EOF
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_URL="http://${PUBLIC_IP}:3000"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
NODE_ENV=development
PORT=3000
HOSTNAME=0.0.0.0
EOF
    echo "✅ Fichier .env créé"
else
    echo "✅ Fichier .env présent"
fi
echo ""

# 9. Redémarrer l'application
echo "🚀 Redémarrage de l'application..."
pm2 start newshare 2>/dev/null || pm2 restart newshare
pm2 save
echo ""

# 10. Attendre le démarrage
echo "⏳ Attente du démarrage (10 secondes)..."
sleep 10

# 11. Vérifier le statut
echo ""
echo "📊 Statut de l'application :"
pm2 status

echo ""
echo "📋 Logs récents :"
pm2 logs newshare --lines 15 --nostream

# 12. Test de santé
echo ""
echo "🔍 Test de connexion..."
if curl -s -m 5 http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ L'application répond correctement !"
else
    echo "⚠️ L'application ne répond pas encore"
    echo "📋 Vérifiez les logs : pm2 logs newshare"
fi

# 13. Résumé
echo ""
echo "=================================="
echo "✅ MISE À JOUR TERMINÉE !"
echo "=================================="
echo ""
echo "📋 Résumé :"
echo "  - Version : $(git log -1 --oneline)"
echo "  - Backup DB : $BACKUP_DIR/dev.db.$DATE"
echo "  - Statut : $(pm2 jlist | jq -r '.[0].pm2_env.status' 2>/dev/null || echo 'Vérifiez avec pm2 status')"
echo ""
PUBLIC_IP=$(curl -s --max-time 3 http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo "13.60.214.119")
echo "🌐 Application accessible sur :"
echo "   http://${PUBLIC_IP}:3000"
echo ""
echo "📝 Commandes utiles :"
echo "   pm2 logs newshare       # Voir les logs"
echo "   pm2 restart newshare    # Redémarrer"
echo "   pm2 monit               # Monitoring"
echo ""

# Nettoyer les anciens backups (garder les 10 derniers)
echo "🧹 Nettoyage des anciens backups..."
ls -t "$BACKUP_DIR"/dev.db.* 2>/dev/null | tail -n +11 | xargs rm -f 2>/dev/null || true
echo "✅ Backups nettoyés (10 derniers conservés)"
echo ""


