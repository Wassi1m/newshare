# ⚠️ ERREUR : "Authentication failed against database server"

## 🔴 Problème

Le serveur Next.js utilise encore l'ancienne configuration PostgreSQL en cache.

## ✅ SOLUTION RAPIDE

### **Étape 1 : Arrêter le serveur**

Dans le terminal où tourne `npm run dev`, appuyez sur :
```
Ctrl + C
```

### **Étape 2 : Supprimer le cache Next.js**

```bash
cd "/home/user/Bureau/ml + nexte/exchange_platform"
rm -rf .next
```

### **Étape 3 : Régénérer Prisma**

```bash
npx prisma generate
```

### **Étape 4 : Relancer le serveur**

```bash
npm run dev
```

---

## 🎯 Commandes Complètes (Copier-Coller)

```bash
# Supprimer le cache et régénérer
cd "/home/user/Bureau/ml + nexte/exchange_platform"
rm -rf .next
npx prisma generate
npm run dev
```

---

## ✅ Vérification

Après avoir relancé le serveur :

1. Aller sur http://localhost:3000
2. Cliquer sur "Commencer"
3. Remplir le formulaire d'inscription
4. ✅ **Ça devrait fonctionner maintenant !**

---

## 📊 Pourquoi Cette Erreur ?

Le serveur Next.js était en cours d'exécution avec :
- ❌ Ancienne configuration PostgreSQL en cache
- ❌ Ancien client Prisma

Après redémarrage avec :
- ✅ Nouvelle configuration SQLite
- ✅ Nouveau client Prisma
- ✅ Cache supprimé

---

## 🔧 Alternative : Script Automatique

Créez un fichier `restart.sh` :

```bash
#!/bin/bash
echo "🔄 Redémarrage de l'application..."
rm -rf .next
npx prisma generate
echo "✅ Prêt ! Lancez: npm run dev"
```

Rendez-le exécutable :
```bash
chmod +x restart.sh
./restart.sh
npm run dev
```

---

## 💡 Si l'erreur persiste

Vérifiez le fichier `.env` :

```bash
cat .env
```

Devrait contenir :
```
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="development-secret-change-in-production-please"
```

Si ce n'est pas le cas, recréez le fichier :

```bash
cat > .env << 'EOF'
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="development-secret-change-in-production-please"

GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
EOF
```

Puis :
```bash
rm -rf .next
npx prisma generate
npm run dev
```

---

**LA SOLUTION : Arrêter le serveur (Ctrl+C), supprimer `.next/`, régénérer Prisma, et relancer !** 🚀

