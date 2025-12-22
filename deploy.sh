#!/bin/bash
set -e

echo "🚀 Déploiement NewShare sur EC2"

### VARIABLES
APP_DIR="$HOME/newshare"
REPO_URL="https://github.com/Wassi1m/newshare.git"
PORT=3000

### 1️⃣ Mise à jour système
echo "📦 Mise à jour du système..."
sudo dnf update -y

### 2️⃣ Installer Git et curl
echo "🔧 Installation de git et curl..."
sudo dnf install -y git curl

### 3️⃣ Installer Node.js 20 (via NodeSource)
echo "⬇️ Installation de Node.js 20..."
if ! command -v node &> /dev/null || [ "$(node -v | cut -d'v' -f2 | cut -d'.' -f1)" -lt 20 ]; then
  echo "🔁 Remplacement curl-minimal → curl"
  sudo dnf swap -y curl-minimal curl --allowerasing 2>/dev/null || true
  
  curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
  sudo dnf install -y nodejs
fi

echo "✅ Node.js version: $(node -v)"
echo "✅ npm version: $(npm -v)"

### 4️⃣ Installer PM2 (gestionnaire de processus)
echo "📦 Installation de PM2..."
sudo npm install -g pm2

### 5️⃣ Configurer le pare-feu
echo "🔥 Configuration du pare-feu..."
sudo firewall-cmd --permanent --add-port=$PORT/tcp 2>/dev/null || true
sudo firewall-cmd --reload 2>/dev/null || true

### 6️⃣ Cloner ou mettre à jour le projet
if [ -d "$APP_DIR" ]; then
  echo "🔄 Projet existant, pull du dernier commit..."
  cd $APP_DIR
  git pull origin main || git pull origin master
else
  echo "📥 Clonage du projet..."
  git clone $REPO_URL $APP_DIR
  cd $APP_DIR
fi

### 7️⃣ Installer les dépendances
echo "📦 Installation des dépendances npm..."
npm install

### 8️⃣ Configurer les variables d'environnement
if [ ! -f "$APP_DIR/.env" ]; then
  echo "⚙️ Création du fichier .env..."
  cat > "$APP_DIR/.env" << EOF
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_URL="http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo 'localhost'):$PORT"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
NODE_ENV=production
PORT=$PORT
HOSTNAME=0.0.0.0
EOF
fi

### 9️⃣ Générer le client Prisma
echo "🔧 Génération du client Prisma..."
npx prisma generate || echo "⚠️ Prisma generate a échoué, continuons..."

### 🔟 Build du projet
echo "🏗️ Build de l'application..."
npm run build

### 1️⃣1️⃣ Arrêter l'ancienne instance PM2 si elle existe
echo "🛑 Arrêt de l'ancienne instance..."
pm2 stop newshare 2>/dev/null || true
pm2 delete newshare 2>/dev/null || true

### 1️⃣2️⃣ Lancer l'application avec PM2
echo "▶️ Démarrage de l'application avec PM2..."
pm2 start npm --name "newshare" -- start
pm2 save
pm2 startup | grep -v PM2 | bash || true

echo ""
echo "✅ Déploiement terminé avec succès !"
echo ""
echo "📊 Statut de l'application:"
pm2 status
echo ""
echo "🌐 Votre application devrait être accessible sur:"
echo "   http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo 'VOTRE_IP_PUBLIQUE'):$PORT"
echo ""
echo "📝 Commandes utiles:"
echo "   pm2 logs newshare    # Voir les logs"
echo "   pm2 restart newshare # Redémarrer l'application"
echo "   pm2 stop newshare   # Arrêter l'application"
echo ""
echo "⚠️ IMPORTANT: Configurez les groupes de sécurité AWS pour autoriser le trafic sur le port $PORT"
