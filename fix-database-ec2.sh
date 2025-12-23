#!/bin/bash

echo "🔧 RÉPARATION COMPLÈTE DE LA BASE DE DONNÉES EC2"
echo "================================================"

cd ~/newshare || exit 1

echo ""
echo "1️⃣ ARRÊT COMPLET DE PM2..."
pm2 delete all 2>/dev/null || true
pm2 kill

echo ""
echo "2️⃣ ARRÊT DE TOUS LES PROCESSUS NODE..."
pkill -9 node 2>/dev/null || true
sleep 2

echo ""
echo "3️⃣ NETTOYAGE DES FICHIERS DE LOCK..."
rm -rf .next/dev/lock
rm -rf .next

echo ""
echo "4️⃣ SUPPRESSION DE LA BASE DE DONNÉES CORROMPUE..."
rm -f prisma/*.db*
ls -lh prisma/

echo ""
echo "5️⃣ CRÉATION D'UNE NOUVELLE BASE DE DONNÉES..."
npx prisma db push --force-reset --accept-data-loss

echo ""
echo "6️⃣ GÉNÉRATION DU CLIENT PRISMA..."
npx prisma generate

echo ""
echo "7️⃣ NETTOYAGE DES CACHES..."
rm -rf node_modules/.cache
npm cache clean --force 2>/dev/null || true

echo ""
echo "8️⃣ VÉRIFICATION DE LA BASE DE DONNÉES..."
ls -lh prisma/*.db*
echo ""
echo "Tables créées :"
npx prisma db execute --stdin <<< "SELECT name FROM sqlite_master WHERE type='table';" 2>/dev/null || echo "Erreur de vérification"

echo ""
echo "9️⃣ DÉMARRAGE DE L'APPLICATION..."
pm2 start npm --name "newshare" -- run dev
pm2 save

echo ""
echo "🔟 VÉRIFICATION DES LOGS..."
sleep 3
pm2 logs newshare --lines 30 --nostream

echo ""
echo "✅ RÉPARATION TERMINÉE !"
echo ""
echo "📊 Statut PM2 :"
pm2 status

echo ""
echo "🌐 Votre application devrait être accessible sur : http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):3000"

