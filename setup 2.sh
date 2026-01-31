#!/bin/bash

# FairWork Setup Script
# This script helps set up the development environment

set -e

echo "🚀 FairWork Setup Script"
echo "========================"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js $(node --version) detected"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi

echo "✅ npm $(npm --version) detected"

# Check Foundry
if ! command -v forge &> /dev/null; then
    echo "⚠️  Foundry is not installed."
    echo "Install it from: https://book.getfoundry.sh/getting-started/installation"
    echo "Run: curl -L https://foundry.paradigm.xyz | bash"
    echo "Then: foundryup"
    read -p "Continue without Foundry? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo "✅ Foundry detected"
fi

echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🔧 Installing Foundry dependencies..."
if command -v forge &> /dev/null; then
    cd contracts
    forge install OpenZeppelin/openzeppelin-contracts --no-commit
    cd ..
    echo "✅ OpenZeppelin contracts installed"
fi

echo ""
echo "📝 Setting up environment variables..."
if [ ! -f .env.local ]; then
    cp .env.example .env.local
    echo "✅ Created .env.local from .env.example"
    echo ""
    echo "⚠️  IMPORTANT: Edit .env.local and add your API keys:"
    echo "   - NEXT_PUBLIC_ALCHEMY_ID (get from alchemy.com)"
    echo "   - OPENAI_API_KEY (get from openai.com)"
    echo "   - PINATA_JWT (get from pinata.cloud)"
    echo "   - NEXT_PUBLIC_SUPABASE_URL (get from supabase.com)"
    echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY (get from supabase.com)"
    echo "   - PRIVATE_KEY (your wallet private key for deployment)"
else
    echo "✅ .env.local already exists"
fi

echo ""
echo "✨ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env.local with your API keys"
echo "2. Run Supabase migration (see README.md)"
echo "3. Deploy smart contract: forge script contracts/script/Deploy.s.sol --rpc-url mumbai --broadcast"
echo "4. Start dev server: npm run dev"
echo ""
echo "For full instructions, see README.md"
