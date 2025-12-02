#!/bin/bash
# Bash script to set up environment files
# Run this from the project root: chmod +x setup-env.sh && ./setup-env.sh

echo "Setting up environment files..."

# Backend .env
if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env
    echo "✅ Created backend/.env"
else
    echo "⚠️  backend/.env already exists, skipping..."
fi

# Frontend .env
if [ ! -f "frontend/.env" ]; then
    cp frontend/.env.example frontend/.env
    echo "✅ Created frontend/.env"
else
    echo "⚠️  frontend/.env already exists, skipping..."
fi

echo ""
echo "📝 Next steps:"
echo "1. Edit backend/.env and add your MongoDB URI"
echo "2. Edit frontend/.env and update API URLs after deployment"
echo "3. Run 'npm install' in both backend and frontend folders"


