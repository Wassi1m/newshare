# 🔒 Système de Sécurité Automatique

## 🛡️ Protection Anti-Malware Automatique

Votre application dispose maintenant d'un **système de protection automatique** contre les malwares.

## ✨ Fonctionnalités

### 1. **Scan Automatique**
- ✅ Tous les fichiers sont automatiquement scannés lors de l'upload
- ✅ Utilise l'API de détection ML : `http://13.53.39.122:5000/predict`
- ✅ Analyse en temps réel avant sauvegarde

### 2. **Bannissement Automatique**
Si un malware est détecté :
- 🚨 **Confiance >= 50%** → Utilisateur banni immédiatement
- 🚫 Le fichier n'est **PAS sauvegardé**
- 📧 Notification envoyée à l'utilisateur
- 📊 Tentative enregistrée dans l'historique

### 3. **Niveaux de Menace**

| Confiance | Niveau | Action |
|-----------|---------|---------|
| >= 90% | CRITIQUE 🚨 | Bannissement immédiat |
| >= 70% | ÉLEVÉ ⚠️ | Bannissement immédiat |
| >= 50% | MOYEN ⚡ | Bannissement immédiat |
| < 50% | FAIBLE ℹ️ | Upload autorisé + surveillance |

## 📊 Suivi des Tentatives

Toutes les tentatives de malware sont enregistrées dans la table `malware_attempts` :
- Nom du fichier
- Hash du fichier
- Confiance de détection
- Niveau de menace
- Adresse IP
- User-Agent
- Action prise

## 🎯 Processus d'Upload

```
1. Utilisateur upload un fichier
   ↓
2. Vérification si utilisateur banni
   ↓
3. Scan automatique du fichier
   ↓
4. Malware détecté ?
   ├─ OUI (>= 50%) → 
   │  ├─ Enregistrer tentative
   │  ├─ Bannir l'utilisateur
   │  ├─ Envoyer notification
   │  └─ REFUSER l'upload (403)
   │
   └─ NON → 
      ├─ Sauvegarder le fichier
      └─ Notification succès (201)
```

## 💻 Installation sur EC2

### Étape 1 : Récupérer les dernières modifications
```bash
cd ~/newshare
git pull origin main
```

### Étape 2 : Appliquer les migrations
```bash
bash update-schema-malware.sh
```

OU manuellement :
```bash
pm2 stop newshare
npx prisma generate
npx prisma db push --accept-data-loss
pm2 restart newshare
```

## 🧪 Test

Pour tester le système, essayez d'uploader un fichier malveillant :
```bash
# Vos fichiers de test
malware_1.exe
malware_2.exe
malware_3.exe
```

### Résultat attendu :
- ❌ Upload refusé avec message "🚨 MALWARE DÉTECTÉ"
- 🔨 Compte automatiquement banni
- 📧 Notification de sécurité envoyée

## 📈 Statistiques

Les administrateurs peuvent consulter :
- Nombre total de tentatives de malware
- Utilisateurs bannis
- Niveau de confiance moyen
- Fichiers les plus détectés

## 🔓 Débannir un Utilisateur

En cas de faux positif, un admin peut débannir via Prisma Studio :
```bash
npx prisma studio
```

Ou via SQL :
```sql
UPDATE users 
SET isBanned = false, bannedAt = NULL, bannedReason = NULL 
WHERE email = 'user@example.com';
```

## 🎨 Messages Utilisateur

### Upload réussi (fichier sain)
```json
{
  "success": true,
  "message": "Fichier uploadé et scanné avec succès",
  "scanned": true,
  "file": { ... }
}
```

### Malware détecté
```json
{
  "error": "🚨 MALWARE DÉTECTÉ",
  "message": "Le fichier contient un malware. Votre compte a été automatiquement banni.",
  "details": {
    "fileName": "virus.exe",
    "threatLevel": "CRITICAL",
    "confidence": "95.67%",
    "action": "COMPTE BANNI"
  },
  "banned": true
}
```

### Utilisateur déjà banni
```json
{
  "error": "Compte banni",
  "reason": "Tentative d'upload de malware détecté: virus.exe (confiance: 95.67%)",
  "banned": true
}
```

## 🛠️ Configuration

L'URL de l'API de malware est définie dans :
```typescript
// app/api/files/upload/route.ts
const MALWARE_API_URL = 'http://13.53.39.122:5000/predict';
```

Pour changer l'API, modifiez cette constante.

## 📝 Logs

Les scans sont loggés dans la console PM2 :
```bash
pm2 logs newshare

# Exemples de logs :
# 🔍 Scan de malware pour: test.exe
# 📊 Résultat: 🚨 MALWARE (confidence: 95.67%)
# 🔨 Utilisateur user@example.com BANNI pour upload de malware
# ✅ Fichier document.pdf uploadé avec succès et scanné
```

## 🚀 Performance

- Scan moyen : < 1 seconde
- Impact sur l'upload : minimal
- Pas de stockage de fichiers malveillants
- Protection en temps réel

---

**⚠️ IMPORTANT** : Ce système protège votre plateforme en bannissant automatiquement les utilisateurs malveillants. Assurez-vous que l'API de malware est toujours accessible !

