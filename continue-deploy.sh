#!/bin/bash
set -e

echo "🔄 Continuation du déploiement..."

cd ~/newshare

### Résoudre le conflit Git avec deploy.sh
echo "🔧 Résolution du conflit Git..."
if [ -f "deploy.sh" ]; then
  git stash
  git pull origin main
  git stash pop || true
fi

### Continuer le déploiement depuis là où il s'est arrêté
echo "📦 Vérification de Node.js..."
if ! command -v node &> /dev/null || [ "$(node -v | cut -d'v' -f2 | cut -d'.' -f1)" -lt 20 ]; then
  echo "⬇️ Installation de Node.js 20..."
  curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
  sudo dnf install -y nodejs
fi

echo "✅ Node.js version: $(node -v)"
echo "✅ npm version: $(npm -v)"

### Installer PM2 si nécessaire
if ! command -v pm2 &> /dev/null; then
  echo "📦 Installation de PM2..."
  sudo npm install -g pm2
fi

### Configurer le pare-feu
echo "🔥 Configuration du pare-feu..."
sudo firewall-cmd --permanent --add-port=3000/tcp 2>/dev/null || true
sudo firewall-cmd --reload 2>/dev/null || true

### Installer les dépendances
echo "📦 Installation des dépendances npm..."
npm install

### Configurer les variables d'environnement
if [ ! -f ".env" ]; then
  echo "⚙️ Création du fichier .env..."
  PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo 'localhost')
  cat > ".env" << EOF
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_URL="http://${PUBLIC_IP}:3000"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
NODE_ENV=production
PORT=3000
HOSTNAME=0.0.0.0
EOF
fi

### Générer le client Prisma
echo "🔧 Génération du client Prisma..."
npx prisma generate || echo "⚠️ Prisma generate a échoué, continuons..."

### Build du projet
echo "🏗️ Build de l'application..."
npm run build

### Arrêter l'ancienne instance PM2 si elle existe
echo "🛑 Arrêt de l'ancienne instance..."
pm2 stop newshare 2>/dev/null || true
pm2 delete newshare 2>/dev/null || true

### Lancer l'application avec PM2
echo "▶️ Démarrage de l'application avec PM2..."
cd ~/newshare
pm2 start npm --name "newshare" -- start
pm2 save
pm2 startup | grep -v PM2 | bash || true

echo ""
echo "✅ Déploiement terminé avec succès !"
echo ""
echo "📊 Statut de l'application:"
pm2 status
echo ""
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo 'VOTRE_IP_PUBLIQUE')
echo "🌐 Votre application devrait être accessible sur:"
echo "   http://${PUBLIC_IP}:3000"
echo ""
echo "📝 Commandes utiles:"
echo "   pm2 logs newshare    # Voir les logs"
echo "   pm2 restart newshare # Redémarrer l'application"
echo "   pm2 stop newshare   # Arrêter l'application"
echo ""
echo "⚠️ IMPORTANT: Configurez les groupes de sécurité AWS pour autoriser le trafic sur le port 3000"

