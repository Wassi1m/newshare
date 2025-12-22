#!/bin/bash
set -e

echo "⚡ Déploiement Automatique NewShare"
echo "==================================="
echo ""

APP_DIR="$HOME/newshare"
cd "$APP_DIR" || exit 1

# 1. Version actuelle
echo "📋 Version actuelle : $(git log -1 --oneline)"
echo ""

# 2. Sauvegarde rapide de la DB
echo "💾 Sauvegarde..."
mkdir -p "$HOME/backups"
[ -f "prisma/dev.db" ] && cp prisma/dev.db "$HOME/backups/dev.db.$(date +%Y%m%d_%H%M%S)"

# 3. Arrêt
echo "🛑 Arrêt..."
pm2 stop newshare 2>/dev/null || true

# 4. Mise à jour du code
echo "📥 Récupération..."
git pull origin main

# 5. Installation des dépendances
echo "📦 Dépendances..."
npm install --no-audit

# 6. Prisma
echo "🔧 Prisma..."
npx prisma generate --no-engine

# 7. Nettoyage
echo "🧹 Nettoyage..."
rm -rf .next node_modules/.cache

# 8. Redémarrage
echo "🚀 Redémarrage..."
pm2 restart newshare 2>/dev/null || pm2 start newshare
pm2 save

# 9. Attente
sleep 10

# 10. Statut
echo ""
echo "✅ DÉPLOIEMENT TERMINÉ !"
echo "======================="
pm2 status
echo ""
PUBLIC_IP=$(curl -s --max-time 3 http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo "13.60.214.119")
echo "🌐 http://${PUBLIC_IP}:3000"
echo "📋 Logs : pm2 logs newshare"

