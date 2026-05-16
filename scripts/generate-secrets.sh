#!/bin/bash

# ============================================================================
# Security Secrets Generator
# Generates strong secrets for production deployment
# ============================================================================

set -e

echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║                    PRODUCTION SECRETS GENERATOR                            ║"
echo "╚════════════════════════════════════════════════════════════════════════════╝"
echo ""

# Check if openssl is available
if ! command -v openssl &> /dev/null; then
    echo "❌ Error: openssl is not installed"
    echo "   Install: sudo apt-get install openssl (Ubuntu/Debian)"
    echo "           brew install openssl (macOS)"
    exit 1
fi

echo "🔐 Generating strong secrets..."
echo ""

# Generate secrets
JWT_ACCESS_SECRET=$(openssl rand -base64 48)
JWT_REFRESH_SECRET=$(openssl rand -base64 48)
REDIS_PASSWORD=$(openssl rand -base64 32)

echo "✅ Secrets generated successfully!"
echo ""
echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║                         GENERATED SECRETS                                  ║"
echo "╚════════════════════════════════════════════════════════════════════════════╝"
echo ""
echo "JWT_ACCESS_SECRET:"
echo "$JWT_ACCESS_SECRET"
echo ""
echo "JWT_REFRESH_SECRET:"
echo "$JWT_REFRESH_SECRET"
echo ""
echo "REDIS_PASSWORD:"
echo "$REDIS_PASSWORD"
echo ""
echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║                         NEXT STEPS                                         ║"
echo "╚════════════════════════════════════════════════════════════════════════════╝"
echo ""
echo "1. Copy these secrets to backend/.env.production.v2"
echo "2. Copy REDIS_PASSWORD to backend/judge-service/.env.production"
echo "3. Update REDIS_URL in both files:"
echo "   REDIS_URL=\"redis://:\${REDIS_PASSWORD}@redis:6379\""
echo ""
echo "4. Rotate other secrets:"
echo "   - Database password (Neon console)"
echo "   - S3 credentials (Cloudflare R2)"
echo "   - Google OAuth secret (Google Cloud Console)"
echo "   - GitHub OAuth secret (GitHub Settings)"
echo "   - Gemini API key (Google AI Studio)"
echo ""
echo "5. Verify .env files are in .gitignore"
echo ""
echo "⚠️  IMPORTANT: Never commit these secrets to version control!"
echo ""
