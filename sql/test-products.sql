-- Quick test to add some basic products for testing
-- This assumes categories table exists

-- First, let's create a simple category if none exists
INSERT INTO categories (id, name, description) 
VALUES (gen_random_uuid(), 'Test Category', 'For testing purposes')
ON CONFLICT DO NOTHING;

-- Get a category ID to use
WITH category_data AS (
  SELECT id FROM categories LIMIT 1
)
-- Insert some test products
INSERT INTO products (category_id, name, description, price, sku, image_url, stock, tags)
SELECT 
  cd.id,
  name,
  description,
  price,
  sku,
  image_url,
  stock,
  tags
FROM category_data cd,
(VALUES
  ('Premium 2x4 Pressure Treated Lumber', 'High-quality pressure treated lumber perfect for outdoor construction projects', 8.99, 'LUM-2X4-PT-8', '/images/products/pressure-treated-lumber.jpg', 150, ARRAY['lumber', 'wood', 'construction', 'outdoor']),
  ('DeWalt 20V MAX Cordless Drill', 'Professional grade cordless drill with lithium-ion battery', 129.99, 'TOOL-DRILL-DW20V', '/placeholder-product.jpg', 25, ARRAY['tools', 'drill', 'cordless', 'dewalt']),
  ('Safety Hard Hat - White', 'ANSI/ISEA Z89.1 compliant hard hat for construction safety', 24.99, 'SAFE-HAT-WHT', '/placeholder-product.jpg', 100, ARRAY['safety', 'ppe', 'hardhat', 'construction']),
  ('LED High Bay Light 150W', 'Energy efficient LED high bay lighting for warehouses', 89.99, 'LIGHT-LED-HB150', '/placeholder-product.jpg', 50, ARRAY['lighting', 'led', 'warehouse', 'commercial']),
  ('PVC Pipe 4 inch x 10 ft', 'Schedule 40 PVC pipe for plumbing and drainage', 15.49, 'PIPE-PVC-4X10', '/placeholder-product.jpg', 200, ARRAY['plumbing', 'pvc', 'pipe', 'drainage'])
) AS product_data(name, description, price, sku, image_url, stock, tags)
ON CONFLICT (sku) DO NOTHING;

-- Verify insertion
SELECT COUNT(*) as product_count FROM products;
SELECT name, price, stock FROM products LIMIT 5;
