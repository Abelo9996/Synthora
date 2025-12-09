#!/bin/bash

# Synthora Platform - Quick Setup Script
# This script helps you get started quickly with Synthora

set -e  # Exit on error

echo "╔═══════════════════════════════════════════════════════╗"
echo "║                                                       ║"
echo "║   🚀 Synthora Platform Setup                         ║"
echo "║                                                       ║"
echo "║   AI-Native App Builder + ML Copilot                 ║"
echo "║                                                       ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""

# Check Node.js
echo "📦 Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version must be 18 or higher. Current: $(node -v)"
    exit 1
fi
echo "✅ Node.js $(node -v) found"

# Check Python
echo "📦 Checking Python..."
if ! command -v python3 &> /dev/null; then
    echo "⚠️  Python 3 is not installed. ML features will be limited."
    echo "   Install Python 3.9+ from https://python.org/"
else
    PYTHON_VERSION=$(python3 --version | cut -d' ' -f2 | cut -d'.' -f1,2)
    echo "✅ Python $(python3 --version) found"
fi

# Check Docker (optional)
echo "📦 Checking Docker..."
if ! command -v docker &> /dev/null; then
    echo "⚠️  Docker is not installed. You'll need to run PostgreSQL and Redis manually."
    echo "   Install Docker from https://docker.com/"
    DOCKER_AVAILABLE=false
else
    echo "✅ Docker $(docker --version) found"
    DOCKER_AVAILABLE=true
fi

echo ""
echo "🔧 Installing dependencies..."
npm install

echo ""
echo "⚙️  Setting up environment..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created .env file"
    echo ""
    echo "⚠️  IMPORTANT: Edit .env and add your OpenAI API key!"
    echo "   Get one from: https://platform.openai.com/api-keys"
    echo ""
else
    echo "✅ .env file already exists"
fi

# Create directories
echo "📁 Creating directories..."
mkdir -p generated_apps
mkdir -p ml_models
mkdir -p feature_store
echo "✅ Directories created"

# Start services with Docker if available
if [ "$DOCKER_AVAILABLE" = true ]; then
    echo ""
    read -p "🐳 Would you like to start PostgreSQL and Redis with Docker? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🚀 Starting Docker services..."
        
        # Create docker-compose.yml for services only
        cat > docker-compose.services.yml << 'EOF'
version: '3.8'

services:
  postgres:
    image: postgres:15
    container_name: synthora-postgres
    environment:
      POSTGRES_DB: synthora
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    container_name: synthora-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
EOF

        docker-compose -f docker-compose.services.yml up -d
        echo "✅ PostgreSQL and Redis started"
        echo "   PostgreSQL: localhost:5432"
        echo "   Redis: localhost:6379"
    fi
fi

echo ""
echo "╔═══════════════════════════════════════════════════════╗"
echo "║                                                       ║"
echo "║   ✅ Setup Complete!                                 ║"
echo "║                                                       ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""
echo "📝 Next Steps:"
echo ""
echo "1. Edit .env and add your OpenAI API key:"
echo "   nano .env"
echo ""
echo "2. Start the platform:"
echo "   npm run dev"
echo ""
echo "3. Try the interactive demo:"
echo "   node demo.js"
echo ""
echo "4. Read the documentation:"
echo "   - GETTING_STARTED.md - Quick start guide"
echo "   - README.md - Overview and features"
echo "   - EXAMPLES.md - Sample apps you can build"
echo ""
echo "🌐 Once running, visit: http://localhost:3000"
echo ""
echo "Need help? Check the docs or visit https://github.com/synthora"
echo ""
