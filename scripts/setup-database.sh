#!/bin/bash
# Database Setup Script for Railway
# This runs inside Railway environment where DATABASE_URL is already set

echo "🔍 Checking DATABASE_URL..."
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL is not set!"
    echo "This script must run in Railway environment"
    exit 1
fi

echo "✅ DATABASE_URL is set"
echo "📊 Database host: $(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\).*/\1/p')"

echo ""
echo "🏗️  Pushing database schema..."
npm run db:push

if [ $? -eq 0 ]; then
    echo "✅ Schema pushed successfully!"
else
    echo "❌ Schema push failed!"
    exit 1
fi

echo ""
echo "🌱 Seeding database with test users..."
npx tsx server/seed.ts

if [ $? -eq 0 ]; then
    echo "✅ Database seeded successfully!"
    echo ""
    echo "🎉 Setup complete! You can now login with:"
    echo "   Email: vonnie@probuildpvc.com.au"
    echo "   Password: password123"
else
    echo "❌ Seeding failed!"
    exit 1
fi
