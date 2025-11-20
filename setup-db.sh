#!/bin/bash

# Script pour configurer la base de données PostgreSQL

echo "Configuration de PostgreSQL pour SecureShare..."

# Créer l'utilisateur PostgreSQL s'il n'existe pas
sudo -u postgres psql -c "SELECT 1 FROM pg_user WHERE usename = 'user'" | grep -q 1 || \
sudo -u postgres psql -c "CREATE USER \"user\" WITH PASSWORD 'user' CREATEDB;"

# Donner les privilèges
sudo -u postgres psql -c "ALTER USER \"user\" CREATEDB;"

# Créer la base de données si elle n'existe pas
sudo -u postgres psql -c "SELECT 1 FROM pg_database WHERE datname = 'secureshare'" | grep -q 1 || \
sudo -u postgres psql -c "CREATE DATABASE secureshare OWNER \"user\";"

# Donner tous les privilèges
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE secureshare TO \"user\";"

echo "✅ Base de données configurée avec succès!"
echo ""
echo "Utilisateur PostgreSQL: user"
echo "Mot de passe: user"
echo "Base de données: secureshare"
echo ""
echo "Prochaines étapes:"
echo "1. npx prisma migrate dev --name init"
echo "2. npm run dev"

