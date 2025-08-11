#!/bin/bash

# B2B Commerce Category Setup Script
# This script helps you set up the category hierarchy in your Supabase database

echo "🏗️  B2B Commerce Category Setup"
echo "================================"
echo ""

echo "Choose setup mode:"
echo "1) SAFE MODE - Preserve existing data, only add new categories"
echo "2) FULL RESET - Delete all existing data and create fresh hierarchy"
echo ""
read -p "Enter choice (1 or 2): " setup_mode

case $setup_mode in
  1)
    sql_file="sql/setup-categories-safe.sql"
    echo "✅ Using SAFE MODE - existing data will be preserved"
    ;;
  2)
    sql_file="sql/setup-categories.sql"
    echo "⚠️  Using FULL RESET mode - all existing data will be deleted!"
    read -p "Are you sure? This will delete all products and categories (y/N): " confirm
    if [[ ! $confirm =~ ^[Yy]$ ]]; then
      echo "❌ Setup cancelled"
      exit 0
    fi
    ;;
  *)
    echo "❌ Invalid choice. Exiting."
    exit 1
    ;;
esac

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "   npm install -g supabase"
    echo "   or"
    echo "   brew install supabase/tap/supabase"
    exit 1
fi

echo "✅ Supabase CLI found"

# Check if we're in a Supabase project
if [ ! -f "supabase/config.toml" ]; then
    echo "⚠️  No Supabase configuration found."
    echo "   Run 'supabase init' first, or execute the SQL manually in your Supabase dashboard."
    echo ""
    echo "📋 Manual Setup Instructions:"
    echo "   1. Go to your Supabase dashboard"
    echo "   2. Navigate to SQL Editor"
    echo "   3. Copy and paste the contents of sql/setup-categories.sql"
    echo "   4. Run the script"
    echo ""
    read -p "Would you like to see the SQL file path? (y/N): " show_path
    if [[ $show_path =~ ^[Yy]$ ]]; then
        echo ""
        echo "📁 SQL file location: $(pwd)/sql/setup-categories.sql"
    fi
    exit 0
fi

echo "✅ Supabase project detected"

# Check if local development is running
if ! supabase status | grep -q "API URL"; then
    echo "⚠️  Local Supabase not running. Starting..."
    supabase start
fi

echo ""
echo "🔧 Setting up category hierarchy..."

# Run the setup script
if supabase db reset --debug; then
    echo ""
    echo "📊 Applying category schema..."
    if psql $(supabase status -o env | grep DATABASE_URL | cut -d'=' -f2-) -f $sql_file; then
        echo ""
        echo "✅ Category setup completed successfully!"
        echo ""
        echo "📈 Summary:"
        echo "   • 4-level category hierarchy created"
        if [[ $setup_mode == "2" ]]; then
          echo "   • Sample products added to each subcategory"
        else
          echo "   • Existing data preserved, new categories added"
        fi
        echo "   • Database constraints and indexes applied"
        echo ""
        echo "🌐 Next steps:"
        echo "   1. Start your dev server: npm run dev"
        echo "   2. Visit http://localhost:3000/categories"
        echo "   3. Review the category structure"
        echo ""
    else
        echo "❌ Failed to apply category setup"
        echo "💡 Try running the SQL manually in your Supabase dashboard"
        echo "📁 SQL file location: $(pwd)/$sql_file"
    fi
else
    echo "❌ Failed to reset database"
    echo "💡 Make sure Supabase is running locally"
    echo "   Or run the SQL manually in your Supabase dashboard:"
    echo "📁 SQL file location: $(pwd)/$sql_file"
fi

echo ""
echo "📚 For more information, see docs/CATEGORY_MANAGEMENT.md"
