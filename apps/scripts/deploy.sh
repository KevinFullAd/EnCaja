#!/bin/bash
set -e

echo "Instalando dependencias raíz..."
cd "$(dirname "$0")/.."
npm install

echo "Instalando dependencias backend..."
cd backend
npm install

echo "Instalando dependencias frontend..."
cd ../frontend
npm install

echo "Build frontend..."
npm run build

echo "Build backend..."
cd ../backend
npm run build

echo "Migraciones Prisma..."
npx prisma migrate deploy

echo "Listo."