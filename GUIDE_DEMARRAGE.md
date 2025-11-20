# 🚀 Guide de Démarrage Rapide - SecureShare

## ⚠️ Problème Actuel : Configuration PostgreSQL

L'erreur indique que les identifiants PostgreSQL ne sont pas corrects.

---

## 📝 Solution Étape par Étape

### **Étape 1 : Configurer PostgreSQL**

Ouvrez un terminal et exécutez ces commandes **une par une** :

```bash
# 1. Se connecter à PostgreSQL en tant que superutilisateur
sudo -u postgres psql
```

Une fois dans PostgreSQL (vous verrez `postgres=#`), exécutez :

```sql
-- 2. Créer l'utilisateur
CREATE USER "user" WITH PASSWORD 'user' CREATEDB;

-- 3. Créer la base de données
CREATE DATABASE secureshare OWNER "user";

-- 4. Donner tous les privilèges
GRANT ALL PRIVILEGES ON DATABASE secureshare TO "user";

-- 5. Quitter PostgreSQL
\q
```

---

### **Étape 2 : Vérifier la Configuration**

Testez la connexion :

```bash
psql -U user -d secureshare -h localhost
```

Si cela fonctionne, tapez `\q` pour quitter.

**Si vous avez une erreur** "authentication failed", éditez le fichier de configuration :

```bash
sudo nano /etc/postgresql/*/main/pg_hba.conf
```

Trouvez les lignes qui ressemblent à :
```
local   all             all                                     peer
host    all             all             127.0.0.1/32            scram-sha-256
```

Changez-les en :
```
local   all             all                                     md5
host    all             all             127.0.0.1/32            md5
```

Sauvegardez (Ctrl+O, Enter, Ctrl+X) et redémarrez PostgreSQL :

```bash
sudo systemctl restart postgresql
```

---

### **Étape 3 : Exécuter les Migrations Prisma**

```bash
cd "/home/user/Bureau/ml + nexte/exchange_platform"

# Appliquer les migrations
npx prisma migrate dev --name init
```

Si tout fonctionne, vous verrez :
```
✔ Your database is now in sync with your schema.
✔ Generated Prisma Client
```

---

### **Étape 4 : Lancer l'Application**

```bash
npm run dev
```

L'application sera sur : **http://localhost:3000**

---

## 🔧 Alternative : Utiliser SQLite (Plus Simple)

Si PostgreSQL pose trop de problèmes, vous pouvez utiliser SQLite :

### 1. Modifier le schema Prisma

Ouvrez `prisma/schema.prisma` et changez :

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

En :

```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

### 2. Modifier .env

```bash
DATABASE_URL="file:./dev.db"
```

### 3. Régénérer Prisma

```bash
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

**Avantage** : Pas besoin de serveur PostgreSQL, tout est dans un fichier.

---

## ✅ Vérification Finale

Après avoir configuré la base de données, testez l'inscription :

1. Allez sur http://localhost:3000
2. Cliquez sur "Commencer"
3. Remplissez le formulaire :
   - **Nom** : Test User
   - **Email** : test@example.com
   - **Mot de passe** : Test1234
   - **Confirmer** : Test1234
4. Cliquez sur "Créer mon compte"

Si tout fonctionne, vous serez redirigé vers le dashboard ! 🎉

---

## 🆘 Dépannage

### Erreur : "Authentication failed"
➡️ Vérifiez le fichier `pg_hba.conf` comme décrit ci-dessus

### Erreur : "database does not exist"
➡️ Créez la base de données manuellement (voir Étape 1)

### Erreur : "Prisma Client not initialized"
```bash
npx prisma generate
```

### L'application ne démarre pas
```bash
# Vérifier si le port 3000 est libre
lsof -i :3000

# Arrêter le processus si nécessaire
kill -9 <PID>

# Relancer
npm run dev
```

### Le serveur démarre mais "Cannot read properties of undefined"
➡️ Assurez-vous que les migrations Prisma sont appliquées :
```bash
npx prisma migrate dev
```

---

## 📊 État Actuel du Projet

✅ **Complété** :
- Configuration de base
- Dépendances installées
- Schéma Prisma défini
- Composants UI créés
- Landing page
- Pages Login/Signup
- API d'authentification
- Dashboard de base

⏳ **À faire** :
- Configuration PostgreSQL (EN COURS)
- Gestion des fichiers
- Système de partage
- Intégration ML

---

## 💡 Recommandation

**Pour démarrer rapidement** : Utilisez **SQLite** (alternative ci-dessus)

**Pour la production** : Utilisez PostgreSQL (suivez Étape 1)

---

## 📞 Besoin d'aide ?

Si vous êtes bloqué, consultez :
- `AUTHENTICATION_SETUP.md` - Guide d'authentification
- `PROGRESS.md` - État du projet
- `README.md` - Documentation complète

