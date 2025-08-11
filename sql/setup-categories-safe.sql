-- B2B Commerce Category Setup Script (SAFE VERSION)
-- This creates a 4-level hierarchy WITHOUT deleting existing data
-- Only adds new categories if they don't already exist

-- First, ensure the categories table exists with proper structure (without level column)
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  parent_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);

-- Ensure products table has proper category reference (without updated_at)
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  sku VARCHAR(100) UNIQUE NOT NULL,
  image_url TEXT,
  stock INTEGER DEFAULT 0,
  tags TEXT[],
  search_vector tsvector,
  popularity_score INTEGER DEFAULT 0,
  personalization_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SAFE INSERTION: Only insert if categories don't already exist

-- Level 1: Main Divisions (Industries) - Insert only if not exists
INSERT INTO categories (id, name, description) 
SELECT 'div-construction', 'Construction & Building', 'Materials and tools for construction projects'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE id = 'div-construction');

INSERT INTO categories (id, name, description)
SELECT 'div-industrial', 'Industrial Equipment', 'Heavy machinery and industrial supplies'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE id = 'div-industrial');

INSERT INTO categories (id, name, description)
SELECT 'div-electrical', 'Electrical & Electronics', 'Electrical components and electronic systems'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE id = 'div-electrical');

INSERT INTO categories (id, name, description)
SELECT 'div-safety', 'Safety & PPE', 'Personal protective equipment and safety systems'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE id = 'div-safety');

INSERT INTO categories (id, name, description)
SELECT 'div-maintenance', 'Maintenance & Repair', 'Tools and supplies for maintenance work'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE id = 'div-maintenance');

INSERT INTO categories (id, name, description)
SELECT 'div-office', 'Office & Commercial', 'Office supplies and commercial equipment'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE id = 'div-office');

-- Level 2: Departments within each Division
-- Construction & Building Departments
INSERT INTO categories (id, name, parent_id, description)
SELECT 'dept-lumber', 'Lumber & Wood Products', 'div-construction', 'All types of wood materials'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE id = 'dept-lumber');

INSERT INTO categories (id, name, parent_id, description)
SELECT 'dept-concrete', 'Concrete & Masonry', 'div-construction', 'Concrete, cement, and masonry supplies'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE id = 'dept-concrete');

INSERT INTO categories (id, name, parent_id, description)
SELECT 'dept-handtools', 'Hand Tools', 'div-maintenance', 'Manual tools and hand instruments'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE id = 'dept-handtools');

INSERT INTO categories (id, name, parent_id, description)
SELECT 'dept-powertools', 'Power Tools', 'div-maintenance', 'Electric and pneumatic power tools'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE id = 'dept-powertools');

INSERT INTO categories (id, name, parent_id, description)
SELECT 'dept-wiring', 'Wiring & Cables', 'div-electrical', 'Electrical wiring and cable systems'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE id = 'dept-wiring');

INSERT INTO categories (id, name, parent_id, description)
SELECT 'dept-headprotection', 'Head & Eye Protection', 'div-safety', 'Hard hats, safety glasses, and helmets'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE id = 'dept-headprotection');

-- Level 3: Categories within each Department
-- Lumber & Wood Products Categories
INSERT INTO categories (id, name, parent_id, description)
SELECT 'cat-lumber-dimensional', 'Dimensional Lumber', 'dept-lumber', 'Standard construction lumber'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE id = 'cat-lumber-dimensional');

INSERT INTO categories (id, name, parent_id, description)
SELECT 'cat-lumber-treated', 'Pressure Treated', 'dept-lumber', 'Pressure treated lumber for outdoor use'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE id = 'cat-lumber-treated');

INSERT INTO categories (id, name, parent_id, description)
SELECT 'cat-concrete-blocks', 'Concrete Blocks', 'dept-concrete', 'CMU blocks and masonry units'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE id = 'cat-concrete-blocks');

INSERT INTO categories (id, name, parent_id, description)
SELECT 'cat-power-drills', 'Drills & Drivers', 'dept-powertools', 'Electric and cordless drills'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE id = 'cat-power-drills');

INSERT INTO categories (id, name, parent_id, description)
SELECT 'cat-wire-building', 'Building Wire', 'dept-wiring', 'Romex, THHN, and building wiring'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE id = 'cat-wire-building');

INSERT INTO categories (id, name, parent_id, description)
SELECT 'cat-safety-hardhats', 'Hard Hats', 'dept-headprotection', 'Safety helmets and hard hats'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE id = 'cat-safety-hardhats');

INSERT INTO categories (id, name, parent_id, description)
SELECT 'cat-safety-glasses', 'Safety Glasses', 'dept-headprotection', 'Safety eyewear and protective glasses'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE id = 'cat-safety-glasses');

-- Level 4: Subcategories (specific product types)
-- Dimensional Lumber Subcategories
INSERT INTO categories (id, name, parent_id, description)
SELECT 'sub-lumber-2x4', '2x4 Lumber', 'cat-lumber-dimensional', '2x4 dimensional lumber in various lengths'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE id = 'sub-lumber-2x4');

INSERT INTO categories (id, name, parent_id, description)
SELECT 'sub-lumber-2x6', '2x6 Lumber', 'cat-lumber-dimensional', '2x6 dimensional lumber in various lengths'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE id = 'sub-lumber-2x6');

-- Pressure Treated Subcategories
INSERT INTO categories (id, name, parent_id, description)
SELECT 'sub-treated-deck', 'Deck Boards', 'cat-lumber-treated', 'Pressure treated decking materials'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE id = 'sub-treated-deck');

INSERT INTO categories (id, name, parent_id, description)
SELECT 'sub-treated-posts', 'Fence Posts', 'cat-lumber-treated', 'Treated fence posts and structural posts'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE id = 'sub-treated-posts');

-- Concrete Blocks Subcategories
INSERT INTO categories (id, name, parent_id, description)
SELECT 'sub-blocks-standard', 'Standard CMU', 'cat-concrete-blocks', '8x8x16 standard concrete blocks'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE id = 'sub-blocks-standard');

-- Drills & Drivers Subcategories
INSERT INTO categories (id, name, parent_id, description)
SELECT 'sub-drills-cordless', 'Cordless Drills', 'cat-power-drills', 'Battery-powered drill/drivers'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE id = 'sub-drills-cordless');

INSERT INTO categories (id, name, parent_id, description)
SELECT 'sub-drills-impact', 'Impact Drivers', 'cat-power-drills', 'High-torque impact drivers'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE id = 'sub-drills-impact');

-- Building Wire Subcategories
INSERT INTO categories (id, name, parent_id, description)
SELECT 'sub-wire-romex', 'Romex Cable', 'cat-wire-building', 'Non-metallic sheathed cable'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE id = 'sub-wire-romex');

-- Hard Hats Subcategories
INSERT INTO categories (id, name, parent_id, description)
SELECT 'sub-hats-type1', 'Type I Hard Hats', 'cat-safety-hardhats', 'Top impact protection hard hats'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE id = 'sub-hats-type1');

-- Safety Glasses Subcategories
INSERT INTO categories (id, name, parent_id, description)
SELECT 'sub-glasses-clear', 'Clear Safety Glasses', 'cat-safety-glasses', 'Clear lens safety glasses'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE id = 'sub-glasses-clear');

-- Sample Products for each subcategory (only if they don't exist)
-- Check if we should add sample products
DO $$
BEGIN
  -- Only add sample products if there are very few existing products
  IF (SELECT COUNT(*) FROM products) < 5 THEN
    -- 2x4 Lumber Products
    INSERT INTO products (category_id, name, description, price, sku, stock, tags) VALUES
      ('sub-lumber-2x4', 'Premium Grade 2x4x8 SPF Stud', 'High-quality construction grade lumber for framing', 6.50, 'LBR-2X4-8-SPF-SAFE', 500, ARRAY['construction', 'framing', 'stud']),
      ('sub-lumber-2x4', 'Utility Grade 2x4x10 Pine', 'Utility grade pine lumber for general construction', 8.75, 'LBR-2X4-10-PINE-SAFE', 300, ARRAY['construction', 'pine', 'utility']);
    
    -- Pressure Treated Deck Boards
    INSERT INTO products (category_id, name, description, price, sku, stock, tags) VALUES
      ('sub-treated-deck', 'Pressure Treated 5/4x6x12 Deck Board', 'Premium treated decking with 15-year warranty', 18.50, 'DCK-PT-5X6-12-SAFE', 150, ARRAY['decking', 'treated', 'outdoor']);
    
    -- Cordless Drills
    INSERT INTO products (category_id, name, description, price, sku, stock, tags) VALUES
      ('sub-drills-cordless', 'DeWalt 20V MAX Cordless Drill Kit', 'Professional cordless drill with 2 batteries', 179.99, 'DRL-DW-20V-KIT-SAFE', 50, ARRAY['DeWalt', 'cordless', 'professional', 'kit']);
    
    -- Safety Equipment
    INSERT INTO products (category_id, name, description, price, sku, stock, tags) VALUES
      ('sub-hats-type1', 'MSA V-Gard Type I Hard Hat White', 'ANSI Type I impact protection hard hat', 28.95, 'PPE-MSA-VG-WHT-SAFE', 100, ARRAY['MSA', 'Type-I', 'ANSI', 'white']),
      ('sub-glasses-clear', 'Uvex Genesis Safety Glasses Clear', 'Wraparound safety glasses with anti-scratch coating', 12.75, 'PPE-UVEX-GEN-CLR-SAFE', 200, ARRAY['Uvex', 'wraparound', 'anti-scratch', 'clear']);
      
    RAISE NOTICE 'Added sample products to new categories';
  ELSE
    RAISE NOTICE 'Existing products found, skipping sample product insertion';
  END IF;
END $$;

-- Create a view for easy category hierarchy browsing (calculates level dynamically)
CREATE OR REPLACE VIEW category_hierarchy AS
WITH RECURSIVE category_tree AS (
  -- Base case: top-level categories (level 1)
  SELECT 
    id,
    name,
    parent_id,
    1 as level,
    description,
    CAST(name AS TEXT) as path,
    ARRAY[name] as breadcrumb
  FROM categories 
  WHERE parent_id IS NULL
  
  UNION ALL
  
  -- Recursive case: child categories
  SELECT 
    c.id,
    c.name,
    c.parent_id,
    ct.level + 1 as level,
    c.description,
    ct.path || ' > ' || c.name as path,
    ct.breadcrumb || c.name as breadcrumb
  FROM categories c
  JOIN category_tree ct ON c.parent_id = ct.id
)
SELECT * FROM category_tree ORDER BY path;

-- Display summary of categories
SELECT 
  'Categories Summary:' as summary,
  COUNT(*) as total_categories,
  COUNT(CASE WHEN parent_id IS NULL THEN 1 END) as divisions,
  COUNT(CASE WHEN parent_id IS NOT NULL AND parent_id IN (SELECT id FROM categories WHERE parent_id IS NULL) THEN 1 END) as departments
FROM categories;

SELECT 'Products Summary:' as summary, COUNT(*) as total_products FROM products;
