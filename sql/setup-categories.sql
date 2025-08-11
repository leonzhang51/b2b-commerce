-- B2B Commerce Category Setup Script
-- This creates a 4-level hierarchy: Division -> Department -> Category -> Subcategory

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

-- Clear existing data to avoid duplicates (handle all foreign key constraints safely)
-- We'll disable foreign key checks temporarily, or handle dependencies in correct order

-- Option 1: Handle known dependencies
DO $$
BEGIN
  -- Delete from dependent tables first
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'shopping_list_items') THEN
    DELETE FROM shopping_list_items;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'cart_items') THEN
    DELETE FROM cart_items;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'order_items') THEN
    DELETE FROM order_items;
  END IF;
  
  -- Now safe to delete products and categories
  DELETE FROM products;
  DELETE FROM categories;
  
EXCEPTION
  WHEN OTHERS THEN
    -- If there are other constraints we didn't handle, show a helpful message
    RAISE NOTICE 'Some foreign key constraints prevented deletion. You may need to manually clear dependent tables first.';
    RAISE NOTICE 'Error: %', SQLERRM;
END $$;

-- Level 1: Main Divisions (Industries)
WITH inserted_divisions AS (
  INSERT INTO categories (id, name, description)
  VALUES
    (gen_random_uuid(), 'Construction & Building', 'Materials and tools for construction projects'),
    (gen_random_uuid(), 'Industrial Equipment', 'Heavy machinery and industrial supplies'),
    (gen_random_uuid(), 'Electrical & Electronics', 'Electrical components and electronic systems'),
    (gen_random_uuid(), 'Safety & PPE', 'Personal protective equipment and safety systems'),
    (gen_random_uuid(), 'Maintenance & Repair', 'Tools and supplies for maintenance work'),
    (gen_random_uuid(), 'Office & Commercial', 'Office supplies and commercial equipment')
  RETURNING id, name
)
-- Level 2: Departments within each Division
, inserted_departments AS (
  INSERT INTO categories (id, name, parent_id, description)
  VALUES
    (gen_random_uuid(), 'Lumber & Wood Products', (SELECT id FROM inserted_divisions WHERE name = 'Construction & Building'), 'All types of wood materials'),
    (gen_random_uuid(), 'Concrete & Masonry', (SELECT id FROM inserted_divisions WHERE name = 'Construction & Building'), 'Concrete, cement, and masonry supplies'),
    (gen_random_uuid(), 'Roofing & Siding', (SELECT id FROM inserted_divisions WHERE name = 'Construction & Building'), 'Roofing materials and exterior siding'),
    (gen_random_uuid(), 'Plumbing & HVAC', (SELECT id FROM inserted_divisions WHERE name = 'Construction & Building'), 'Plumbing pipes, fixtures, and HVAC systems'),
    (gen_random_uuid(), 'Heavy Machinery', (SELECT id FROM inserted_divisions WHERE name = 'Industrial Equipment'), 'Large industrial machines and equipment'),
    (gen_random_uuid(), 'Pumps & Compressors', (SELECT id FROM inserted_divisions WHERE name = 'Industrial Equipment'), 'Industrial pumps and compression equipment'),
    (gen_random_uuid(), 'Material Handling', (SELECT id FROM inserted_divisions WHERE name = 'Industrial Equipment'), 'Conveyor systems and material handling'),
    (gen_random_uuid(), 'Automation & Controls', (SELECT id FROM inserted_divisions WHERE name = 'Industrial Equipment'), 'Industrial automation and control systems'),
    (gen_random_uuid(), 'Wiring & Cables', (SELECT id FROM inserted_divisions WHERE name = 'Electrical & Electronics'), 'Electrical wiring and cable systems'),
    (gen_random_uuid(), 'Lighting Systems', (SELECT id FROM inserted_divisions WHERE name = 'Electrical & Electronics'), 'Industrial and commercial lighting'),
    (gen_random_uuid(), 'Electronic Components', (SELECT id FROM inserted_divisions WHERE name = 'Electrical & Electronics'), 'Electronic parts and components'),
    (gen_random_uuid(), 'Power Distribution', (SELECT id FROM inserted_divisions WHERE name = 'Electrical & Electronics'), 'Power distribution and electrical panels'),
    (gen_random_uuid(), 'Head & Eye Protection', (SELECT id FROM inserted_divisions WHERE name = 'Safety & PPE'), 'Hard hats, safety glasses, and helmets'),
    (gen_random_uuid(), 'Body Protection', (SELECT id FROM inserted_divisions WHERE name = 'Safety & PPE'), 'Safety vests, suits, and body protection'),
    (gen_random_uuid(), 'Fall Protection', (SELECT id FROM inserted_divisions WHERE name = 'Safety & PPE'), 'Harnesses, lanyards, and fall arrest systems'),
    (gen_random_uuid(), 'Respiratory Protection', (SELECT id FROM inserted_divisions WHERE name = 'Safety & PPE'), 'Masks, respirators, and breathing apparatus'),
    (gen_random_uuid(), 'Hand Tools', (SELECT id FROM inserted_divisions WHERE name = 'Maintenance & Repair'), 'Manual tools and hand instruments'),
    (gen_random_uuid(), 'Power Tools', (SELECT id FROM inserted_divisions WHERE name = 'Maintenance & Repair'), 'Electric and pneumatic power tools'),
    (gen_random_uuid(), 'Lubricants & Fluids', (SELECT id FROM inserted_divisions WHERE name = 'Maintenance & Repair'), 'Industrial lubricants and maintenance fluids'),
    (gen_random_uuid(), 'Fasteners & Hardware', (SELECT id FROM inserted_divisions WHERE name = 'Maintenance & Repair'), 'Bolts, screws, nuts, and hardware'),
    (gen_random_uuid(), 'Office Furniture', (SELECT id FROM inserted_divisions WHERE name = 'Office & Commercial'), 'Desks, chairs, and office furniture'),
    (gen_random_uuid(), 'Office Supplies', (SELECT id FROM inserted_divisions WHERE name = 'Office & Commercial'), 'Paper, pens, and general office supplies'),
    (gen_random_uuid(), 'Office Technology', (SELECT id FROM inserted_divisions WHERE name = 'Office & Commercial'), 'Computers, printers, and office tech'),
    (gen_random_uuid(), 'Cleaning Supplies', (SELECT id FROM inserted_divisions WHERE name = 'Office & Commercial'), 'Commercial cleaning products and equipment')
  RETURNING id, name, parent_id
)
-- Level 3: Categories within each Department
, inserted_categories AS (
  INSERT INTO categories (id, name, parent_id, description)
  VALUES
    -- Lumber & Wood Products Categories
    (gen_random_uuid(), 'Dimensional Lumber', (SELECT id FROM categories WHERE name = 'Lumber & Wood Products' LIMIT 1), 'Standard construction lumber'),
    (gen_random_uuid(), 'Engineered Wood', (SELECT id FROM categories WHERE name = 'Lumber & Wood Products' LIMIT 1), 'LVL, I-joists, and engineered products'),
    (gen_random_uuid(), 'Pressure Treated', (SELECT id FROM categories WHERE name = 'Lumber & Wood Products' LIMIT 1), 'Pressure treated lumber for outdoor use'),
    (gen_random_uuid(), 'Sheet Goods & Panels', (SELECT id FROM categories WHERE name = 'Lumber & Wood Products' LIMIT 1), 'Plywood, OSB, and sheet materials'),
    
    -- Concrete & Masonry Categories
    (gen_random_uuid(), 'Ready Mix Concrete', (SELECT id FROM categories WHERE name = 'Concrete & Masonry' LIMIT 1), 'Pre-mixed concrete products'),
    (gen_random_uuid(), 'Cement & Additives', (SELECT id FROM categories WHERE name = 'Concrete & Masonry' LIMIT 1), 'Portland cement and concrete additives'),
    (gen_random_uuid(), 'Concrete Blocks', (SELECT id FROM categories WHERE name = 'Concrete & Masonry' LIMIT 1), 'CMU blocks and masonry units'),
    (gen_random_uuid(), 'Reinforcement', (SELECT id FROM categories WHERE name = 'Concrete & Masonry' LIMIT 1), 'Rebar, mesh, and reinforcement materials'),
    
    -- Hand Tools Categories
    (gen_random_uuid(), 'Wrenches & Spanners', (SELECT id FROM categories WHERE name = 'Hand Tools' LIMIT 1), 'All types of wrenches and spanners'),
    (gen_random_uuid(), 'Screwdrivers', (SELECT id FROM categories WHERE name = 'Hand Tools' LIMIT 1), 'Manual and precision screwdrivers'),
    (gen_random_uuid(), 'Measuring Tools', (SELECT id FROM categories WHERE name = 'Hand Tools' LIMIT 1), 'Rulers, calipers, and measuring instruments'),
    (gen_random_uuid(), 'Cutting Tools', (SELECT id FROM categories WHERE name = 'Hand Tools' LIMIT 1), 'Knives, saws, and cutting implements'),
    
    -- Power Tools Categories
    (gen_random_uuid(), 'Drills & Drivers', (SELECT id FROM categories WHERE name = 'Power Tools' LIMIT 1), 'Electric and cordless drills'),
    (gen_random_uuid(), 'Saws & Cutting', (SELECT id FROM categories WHERE name = 'Power Tools' LIMIT 1), 'Circular saws, jigsaws, and cutting tools'),
    (gen_random_uuid(), 'Grinders & Sanders', (SELECT id FROM categories WHERE name = 'Power Tools' LIMIT 1), 'Angle grinders and sanding equipment'),
    (gen_random_uuid(), 'Pneumatic Tools', (SELECT id FROM categories WHERE name = 'Power Tools' LIMIT 1), 'Air-powered tools and equipment'),
    
    -- Wiring & Cables Categories
    (gen_random_uuid(), 'Building Wire', (SELECT id FROM categories WHERE name = 'Wiring & Cables' LIMIT 1), 'Romex, THHN, and building wiring'),
    (gen_random_uuid(), 'Power Cables', (SELECT id FROM categories WHERE name = 'Wiring & Cables' LIMIT 1), 'High voltage and power transmission cables'),
    (gen_random_uuid(), 'Data & Communication', (SELECT id FROM categories WHERE name = 'Wiring & Cables' LIMIT 1), 'Ethernet, fiber optic, and data cables'),
    (gen_random_uuid(), 'Specialty Cables', (SELECT id FROM categories WHERE name = 'Wiring & Cables' LIMIT 1), 'Control, instrumentation, and specialty wiring'),
    
    -- Head & Eye Protection Categories
    (gen_random_uuid(), 'Hard Hats', (SELECT id FROM categories WHERE name = 'Head & Eye Protection' LIMIT 1), 'Safety helmets and hard hats'),
    (gen_random_uuid(), 'Safety Glasses', (SELECT id FROM categories WHERE name = 'Head & Eye Protection' LIMIT 1), 'Safety eyewear and protective glasses'),
    (gen_random_uuid(), 'Safety Goggles', (SELECT id FROM categories WHERE name = 'Head & Eye Protection' LIMIT 1), 'Chemical and impact resistant goggles'),
    (gen_random_uuid(), 'Face Shields', (SELECT id FROM categories WHERE name = 'Head & Eye Protection' LIMIT 1), 'Full face protection shields')
  RETURNING id, name, parent_id
)
-- Level 4: Subcategories (specific product types)
, inserted_subcategories AS (
  INSERT INTO categories (id, name, parent_id, description)
  VALUES
    -- Dimensional Lumber Subcategories
    (gen_random_uuid(), '2x4 Lumber', (SELECT id FROM categories WHERE name = 'Dimensional Lumber' LIMIT 1), '2x4 dimensional lumber in various lengths'),
    (gen_random_uuid(), '2x6 Lumber', (SELECT id FROM categories WHERE name = 'Dimensional Lumber' LIMIT 1), '2x6 dimensional lumber in various lengths'),
    (gen_random_uuid(), '2x8 Lumber', (SELECT id FROM categories WHERE name = 'Dimensional Lumber' LIMIT 1), '2x8 dimensional lumber in various lengths'),
    (gen_random_uuid(), '2x10 Lumber', (SELECT id FROM categories WHERE name = 'Dimensional Lumber' LIMIT 1), '2x10 dimensional lumber in various lengths'),
    (gen_random_uuid(), '4x4 Posts', (SELECT id FROM categories WHERE name = 'Dimensional Lumber' LIMIT 1), '4x4 posts and structural lumber'),
    
    -- Pressure Treated Subcategories
    (gen_random_uuid(), 'Deck Boards', (SELECT id FROM categories WHERE name = 'Pressure Treated' LIMIT 1), 'Pressure treated decking materials'),
    (gen_random_uuid(), 'Fence Posts', (SELECT id FROM categories WHERE name = 'Pressure Treated' LIMIT 1), 'Treated fence posts and structural posts'),
    (gen_random_uuid(), 'Landscape Timbers', (SELECT id FROM categories WHERE name = 'Pressure Treated' LIMIT 1), 'Landscape and retaining wall timbers'),
    
    -- Concrete Blocks Subcategories
    (gen_random_uuid(), 'Standard CMU', (SELECT id FROM categories WHERE name = 'Concrete Blocks' LIMIT 1), '8x8x16 standard concrete blocks'),
    (gen_random_uuid(), 'Decorative Blocks', (SELECT id FROM categories WHERE name = 'Concrete Blocks' LIMIT 1), 'Split face and decorative concrete blocks'),
    (gen_random_uuid(), 'Specialty Blocks', (SELECT id FROM categories WHERE name = 'Concrete Blocks' LIMIT 1), 'Lintel, bond beam, and specialty blocks'),
    
    -- Drills & Drivers Subcategories
    (gen_random_uuid(), 'Cordless Drills', (SELECT id FROM categories WHERE name = 'Drills & Drivers' LIMIT 1), 'Battery-powered drill/drivers'),
    (gen_random_uuid(), 'Corded Drills', (SELECT id FROM categories WHERE name = 'Drills & Drivers' LIMIT 1), 'Electric corded drills'),
    (gen_random_uuid(), 'Hammer Drills', (SELECT id FROM categories WHERE name = 'Drills & Drivers' LIMIT 1), 'Hammer drills for masonry'),
    (gen_random_uuid(), 'Impact Drivers', (SELECT id FROM categories WHERE name = 'Drills & Drivers' LIMIT 1), 'High-torque impact drivers'),
    
    -- Building Wire Subcategories
    (gen_random_uuid(), 'Romex Cable', (SELECT id FROM categories WHERE name = 'Building Wire' LIMIT 1), 'Non-metallic sheathed cable'),
    (gen_random_uuid(), 'THHN Wire', (SELECT id FROM categories WHERE name = 'Building Wire' LIMIT 1), 'Thermoplastic high heat nylon wire'),
    (gen_random_uuid(), 'MC Cable', (SELECT id FROM categories WHERE name = 'Building Wire' LIMIT 1), 'Metal clad armored cable'),
    
    -- Hard Hats Subcategories
    (gen_random_uuid(), 'Type I Hard Hats', (SELECT id FROM categories WHERE name = 'Hard Hats' LIMIT 1), 'Top impact protection hard hats'),
    (gen_random_uuid(), 'Type II Hard Hats', (SELECT id FROM categories WHERE name = 'Hard Hats' LIMIT 1), 'Top and side impact protection'),
    (gen_random_uuid(), 'Electrical Hard Hats', (SELECT id FROM categories WHERE name = 'Hard Hats' LIMIT 1), 'Class E electrical protection hard hats'),
    
    -- Safety Glasses Subcategories
    (gen_random_uuid(), 'Clear Safety Glasses', (SELECT id FROM categories WHERE name = 'Safety Glasses' LIMIT 1), 'Clear lens safety glasses'),
    (gen_random_uuid(), 'Tinted Safety Glasses', (SELECT id FROM categories WHERE name = 'Safety Glasses' LIMIT 1), 'Tinted and sun protection glasses'),
    (gen_random_uuid(), 'Anti-Fog Glasses', (SELECT id FROM categories WHERE name = 'Safety Glasses' LIMIT 1), 'Anti-fog coated safety glasses')
  RETURNING id, name, parent_id
)
SELECT 'Hierarchy and Sample Data Created' as summary, 
  (SELECT COUNT(*) FROM categories) as total_categories, 
  (SELECT COUNT(*) FROM products) as total_products;

-- Sample Products for each subcategory
INSERT INTO products (category_id, name, description, price, sku, stock, tags) VALUES
  -- 2x4 Lumber Products
  ((SELECT id FROM categories WHERE name = '2x4 Lumber' LIMIT 1), 'Premium Grade 2x4x8 SPF Stud', 'High-quality construction grade lumber for framing', 6.50, 'LBR-2X4-8-SPF', 500, ARRAY['construction', 'framing', 'stud']),
  ((SELECT id FROM categories WHERE name = '2x4 Lumber' LIMIT 1), 'Utility Grade 2x4x10 Pine', 'Utility grade pine lumber for general construction', 8.75, 'LBR-2X4-10-PINE', 300, ARRAY['construction', 'pine', 'utility']),
  ((SELECT id FROM categories WHERE name = '2x4 Lumber' LIMIT 1), 'Select Structural 2x4x12', 'Select structural grade for load-bearing applications', 12.25, 'LBR-2X4-12-SS', 200, ARRAY['structural', 'load-bearing']),
  
  -- Pressure Treated Deck Boards
  ((SELECT id FROM categories WHERE name = 'Deck Boards' LIMIT 1), 'Pressure Treated 5/4x6x12 Deck Board', 'Premium treated decking with 15-year warranty', 18.50, 'DCK-PT-5X6-12', 150, ARRAY['decking', 'treated', 'outdoor']),
  ((SELECT id FROM categories WHERE name = 'Deck Boards' LIMIT 1), 'Composite Deck Board 1x6x12', 'Low-maintenance composite decking material', 32.00, 'DCK-COMP-1X6-12', 100, ARRAY['composite', 'low-maintenance', 'decking']),
  
  -- Standard CMU Blocks
  ((SELECT id FROM categories WHERE name = 'Standard CMU' LIMIT 1), '8x8x16 Standard Concrete Block', 'Standard weight concrete masonry unit', 2.85, 'CMU-STD-8X8X16', 1000, ARRAY['concrete', 'block', 'masonry']),
  ((SELECT id FROM categories WHERE name = 'Standard CMU' LIMIT 1), '8x8x16 Lightweight Concrete Block', 'Lightweight concrete block for easier handling', 3.25, 'CMU-LW-8X8X16', 800, ARRAY['lightweight', 'concrete', 'block']),
  
  -- Cordless Drills
  ((SELECT id FROM categories WHERE name = 'Cordless Drills' LIMIT 1), 'DeWalt 20V MAX Cordless Drill Kit', 'Professional cordless drill with 2 batteries', 179.99, 'DRL-DW-20V-KIT', 50, ARRAY['DeWalt', 'cordless', 'professional', 'kit']),
  ((SELECT id FROM categories WHERE name = 'Cordless Drills' LIMIT 1), 'Milwaukee M18 FUEL Hammer Drill', 'Brushless motor hammer drill for concrete', 249.99, 'DRL-MIL-M18-HD', 35, ARRAY['Milwaukee', 'brushless', 'hammer', 'concrete']),
  
  -- Romex Cable
  ((SELECT id FROM categories WHERE name = 'Romex Cable' LIMIT 1), '12-2 Romex Cable 250ft Roll', 'Non-metallic sheathed cable for 20-amp circuits', 89.50, 'WIRE-12-2-250', 25, ARRAY['romex', '12-gauge', '20-amp', 'residential']),
  ((SELECT id FROM categories WHERE name = 'Romex Cable' LIMIT 1), '14-2 Romex Cable 250ft Roll', 'Non-metallic sheathed cable for 15-amp circuits', 72.25, 'WIRE-14-2-250', 30, ARRAY['romex', '14-gauge', '15-amp', 'residential']),
  
  -- Type I Hard Hats
  ((SELECT id FROM categories WHERE name = 'Type I Hard Hats' LIMIT 1), 'MSA V-Gard Type I Hard Hat White', 'ANSI Type I impact protection hard hat', 28.95, 'PPE-MSA-VG-WHT', 100, ARRAY['MSA', 'Type-I', 'ANSI', 'white']),
  ((SELECT id FROM categories WHERE name = 'Type I Hard Hats' LIMIT 1), '3M H-700 Series Hard Hat Yellow', 'Lightweight Type I hard hat with 4-point suspension', 24.50, 'PPE-3M-H700-YEL', 75, ARRAY['3M', 'lightweight', 'yellow', '4-point']),
  
  -- Clear Safety Glasses
  ((SELECT id FROM categories WHERE name = 'Clear Safety Glasses' LIMIT 1), 'Uvex Genesis Safety Glasses Clear', 'Wraparound safety glasses with anti-scratch coating', 12.75, 'PPE-UVEX-GEN-CLR', 200, ARRAY['Uvex', 'wraparound', 'anti-scratch', 'clear']),
  ((SELECT id FROM categories WHERE name = 'Clear Safety Glasses' LIMIT 1), '3M SecureFit 400 Series Clear', 'Self-adjusting safety glasses with pressure diffusion', 15.25, 'PPE-3M-SF400-CLR', 150, ARRAY['3M', 'self-adjusting', 'pressure-diffusion']),
  
  -- Impact Drivers
  ((SELECT id FROM categories WHERE name = 'Impact Drivers' LIMIT 1), 'Makita 18V LXT Impact Driver', 'Compact impact driver with variable speed trigger', 129.99, 'IMP-MAK-18V-LXT', 40, ARRAY['Makita', '18V', 'LXT', 'compact', 'variable-speed']),
  ((SELECT id FROM categories WHERE name = 'Impact Drivers' LIMIT 1), 'Ryobi ONE+ 18V Impact Driver', 'Budget-friendly impact driver for DIY projects', 79.99, 'IMP-RYO-ONE-18V', 60, ARRAY['Ryobi', 'ONE+', 'budget', 'DIY']);

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

-- Display summary of created hierarchy
SELECT 
  'Categories Created:' as summary,
  COUNT(*) as total_categories,
  COUNT(CASE WHEN parent_id IS NULL THEN 1 END) as divisions,
  COUNT(CASE WHEN parent_id IS NOT NULL AND parent_id IN (SELECT id FROM categories WHERE parent_id IS NULL) THEN 1 END) as departments
FROM categories;

-- Insert some additional sample products for variety
INSERT INTO products (category_id, name, description, price, sku, stock, tags) VALUES
  -- More 2x4 lumber varieties
  ((SELECT id FROM categories WHERE name = '2x4 Lumber' LIMIT 1), 'Kiln Dried 2x4x8 Douglas Fir', 'Premium kiln-dried Douglas Fir for precision work', 7.25, 'LBR-2X4-8-DF-KD', 400, ARRAY['douglas-fir', 'kiln-dried', 'premium']),
  ((SELECT id FROM categories WHERE name = '2x4 Lumber' LIMIT 1), 'Green 2x4x8 Hem-Fir', 'Green (not kiln dried) hem-fir construction lumber', 5.75, 'LBR-2X4-8-HF-GRN', 600, ARRAY['hem-fir', 'green', 'economy']),
  
  -- More 2x6 options
  ((SELECT id FROM categories WHERE name = '2x6 Lumber' LIMIT 1), 'Construction Grade 2x6x10 SPF', 'Standard construction grade 2x6 for floor joists', 12.50, 'LBR-2X6-10-SPF', 250, ARRAY['construction', 'floor-joist', 'SPF']),
  ((SELECT id FROM categories WHERE name = '2x6 Lumber' LIMIT 1), 'Select Structural 2x6x12 Douglas Fir', 'High-grade structural lumber for spans', 18.75, 'LBR-2X6-12-DF-SS', 180, ARRAY['select-structural', 'douglas-fir', 'span']),
  
  -- Treated fence posts
  ((SELECT id FROM categories WHERE name = 'Fence Posts' LIMIT 1), 'Pressure Treated 4x4x8 Fence Post', 'CCA treated fence post for residential fencing', 14.25, 'PST-PT-4X4-8', 120, ARRAY['fence-post', 'CCA-treated', 'residential']),
  ((SELECT id FROM categories WHERE name = 'Fence Posts' LIMIT 1), 'Pressure Treated 6x6x8 Heavy Duty Post', 'Heavy duty treated post for commercial applications', 28.50, 'PST-PT-6X6-8-HD', 80, ARRAY['heavy-duty', 'commercial', '6x6']),
  
  -- More concrete blocks
  ((SELECT id FROM categories WHERE name = 'Decorative Blocks' LIMIT 1), 'Split Face 8x8x16 Concrete Block', 'Decorative split face block for retaining walls', 4.25, 'CMU-SF-8X8X16', 600, ARRAY['split-face', 'decorative', 'retaining-wall']),
  ((SELECT id FROM categories WHERE name = 'Specialty Blocks' LIMIT 1), 'Lintel Block 8x8x16', 'Lintel block for window and door openings', 3.85, 'CMU-LNT-8X8X16', 200, ARRAY['lintel', 'window', 'door', 'opening']),
  
  -- More power tools
  ((SELECT id FROM categories WHERE name = 'Hammer Drills' LIMIT 1), 'Bosch Bulldog Xtreme Rotary Hammer', 'SDS-plus rotary hammer for concrete drilling', 189.99, 'HAM-BSH-BDOG-SDS', 25, ARRAY['Bosch', 'SDS-plus', 'rotary', 'concrete']),
  ((SELECT id FROM categories WHERE name = 'Corded Drills' LIMIT 1), 'Black+Decker 8A Corded Drill', 'Corded electric drill for continuous use', 69.99, 'DRL-BD-8A-CRD', 45, ARRAY['Black+Decker', 'corded', '8-amp', 'continuous']),
  
  -- More wire types
  ((SELECT id FROM categories WHERE name = 'THHN Wire' LIMIT 1), 'THHN 12 AWG Stranded 500ft Black', 'Stranded THHN wire for conduit installations', 125.50, 'WIRE-THHN-12-STR-BK', 20, ARRAY['THHN', '12-AWG', 'stranded', 'conduit']),
  ((SELECT id FROM categories WHERE name = 'MC Cable' LIMIT 1), 'MC Cable 12-2 w/Ground 250ft', 'Metal clad cable for commercial installations', 156.75, 'WIRE-MC-12-2-250', 15, ARRAY['MC-cable', 'metal-clad', 'commercial', 'ground']),
  
  -- More safety equipment
  ((SELECT id FROM categories WHERE name = 'Type II Hard Hats' LIMIT 1), 'Klein Type II Hard Hat with Chin Strap', 'Full brim Type II hard hat for electrical work', 45.50, 'PPE-KLEIN-T2-CHN', 60, ARRAY['Klein', 'Type-II', 'full-brim', 'electrical']),
  ((SELECT id FROM categories WHERE name = 'Tinted Safety Glasses' LIMIT 1), 'Crews Klondike Tinted Safety Glasses', 'Smoke tinted safety glasses for outdoor work', 8.95, 'PPE-CREW-KLON-SMK', 180, ARRAY['Crews', 'smoke-tinted', 'outdoor', 'UV-protection']);

SELECT 'Products Created:' as summary, COUNT(*) as total_products FROM products;

-- Add at least 10 products to each leaf category (subcategory) if it is empty
DO $$
DECLARE
  subcat RECORD;
  i INT;
BEGIN
  FOR subcat IN SELECT id, name FROM categories c WHERE NOT EXISTS (SELECT 1 FROM categories WHERE parent_id = c.id) LOOP
    IF (SELECT COUNT(*) FROM products WHERE category_id = subcat.id) < 10 THEN
      FOR i IN 1..10 LOOP
        INSERT INTO products (id, category_id, name, description, price, sku, stock, tags)
        VALUES (
          gen_random_uuid(),
          subcat.id,
          subcat.name || ' Product #' || i,
          'Auto-generated product for ' || subcat.name,
          (ROUND((10 + random()*90) * 100) / 100)::numeric(10,2),
          ('SKU-' || left(md5(random()::text), 8) || '-' || i)::text,
          100 + (i * 10),
          ARRAY[subcat.name]::text[]
        );
      END LOOP;
    END IF;
  END LOOP;
END $$;
