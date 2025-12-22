#!/bin/bash

echo "🔍 Vérification du déploiement..."
echo ""

### Vérifier Node.js
echo "📦 Node.js:"
if command -v node &> /dev/null; then
  echo "   ✅ Version: $(node -v)"
  NODE_MAJOR=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
  if [ "$NODE_MAJOR" -ge 20 ]; then
    echo "   ✅ Version >= 20 (requis)"
  else
    echo "   ❌ Version < 20 (requis: >= 20.9.0)"
  fi
else
  echo "   ❌ Node.js non installé"
fi

### Vérifier npm
echo ""
echo "📦 npm:"
if command -v npm &> /dev/null; then
  echo "   ✅ Version: $(npm -v)"
else
  echo "   ❌ npm non installé"
fi

### Vérifier PM2
echo ""
echo "📦 PM2:"
if command -v pm2 &> /dev/null; then
  echo "   ✅ PM2 installé"
  echo ""
  echo "   📊 Statut des processus:"
  pm2 status
else
  echo "   ❌ PM2 non installé"
fi

### Vérifier le pare-feu
echo ""
echo "🔥 Pare-feu:"
if command -v firewall-cmd &> /dev/null; then
  PORTS=$(sudo firewall-cmd --list-ports 2>/dev/null)
  if echo "$PORTS" | grep -q "3000/tcp"; then
    echo "   ✅ Port 3000 ouvert"
  else
    echo "   ❌ Port 3000 non ouvert"
    echo "   💡 Exécutez: sudo firewall-cmd --permanent --add-port=3000/tcp && sudo firewall-cmd --reload"
  fi
else
  echo "   ⚠️ firewall-cmd non disponible (peut être normal sur certaines instances)"
fi

### Vérifier l'application
echo ""
echo "🌐 Application:"
APP_DIR="$HOME/newshare"
if [ -d "$APP_DIR" ]; then
  echo "   ✅ Répertoire trouvé: $APP_DIR"
  cd "$APP_DIR"
  
  if [ -f "package.json" ]; then
    echo "   ✅ package.json trouvé"
  else
    echo "   ❌ package.json non trouvé"
  fi
  
  if [ -d ".next" ]; then
    echo "   ✅ Build Next.js trouvé (.next/)"
  else
    echo "   ⚠️ Build Next.js non trouvé (exécutez: npm run build)"
  fi
  
  if [ -f ".env" ]; then
    echo "   ✅ Fichier .env trouvé"
  else
    echo "   ⚠️ Fichier .env non trouvé"
  fi
else
  echo "   ❌ Répertoire non trouvé: $APP_DIR"
fi

### Vérifier le port 3000
echo ""
echo "🔌 Port 3000:"
if command -v lsof &> /dev/null; then
  if sudo lsof -i :3000 &> /dev/null; then
    echo "   ✅ Port 3000 en cours d'utilisation"
    echo "   📋 Processus:"
    sudo lsof -i :3000 | head -5
  else
    echo "   ❌ Aucun processus n'écoute sur le port 3000"
  fi
else
  echo "   ⚠️ lsof non disponible pour vérifier le port"
fi

### Vérifier l'IP publique
echo ""
echo "🌍 IP Publique:"
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null)
if [ -n "$PUBLIC_IP" ]; then
  echo "   ✅ IP Publique: $PUBLIC_IP"
  echo "   🌐 URL: http://$PUBLIC_IP:3000"
else
  echo "   ⚠️ Impossible de récupérer l'IP publique"
fi

### Test de connexion locale
echo ""
echo "🔗 Test de connexion locale:"
if curl -s http://localhost:3000 &> /dev/null; then
  echo "   ✅ L'application répond sur localhost:3000"
else
  echo "   ❌ L'application ne répond pas sur localhost:3000"
fi

echo ""
echo "✅ Vérification terminée"
echo ""
echo "📝 Prochaines étapes si le site n'est pas accessible:"
echo "   1. Vérifiez les groupes de sécurité AWS (port 3000)"
echo "   2. Vérifiez que PM2 a démarré l'application: pm2 status"
echo "   3. Vérifiez les logs: pm2 logs newshare"
echo "   4. Redémarrez l'application: pm2 restart newshare"

