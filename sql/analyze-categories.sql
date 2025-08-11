-- Category Cleanup and Analysis Script
-- This script helps identify and remove redundant categories

-- 1. Find duplicate category names
SELECT 
  name, 
  COUNT(*) as count,
  array_agg(id) as duplicate_ids,
  array_agg(parent_id) as parent_ids
FROM categories 
GROUP BY name 
HAVING COUNT(*) > 1
ORDER BY count DESC;

-- 2. Find categories with similar names (potential duplicates)
WITH category_similarities AS (
  SELECT 
    c1.id as id1,
    c1.name as name1,
    c1.level as level1,
    c2.id as id2,
    c2.name as name2,
    c2.level as level2,
    similarity(c1.name, c2.name) as similarity_score
  FROM categories c1
  CROSS JOIN categories c2
  WHERE c1.id != c2.id
    AND c1.level = c2.level
    AND similarity(c1.name, c2.name) > 0.7
)
SELECT * FROM category_similarities
ORDER BY similarity_score DESC;

-- 3. Find orphaned categories (parent_id references non-existent category)
SELECT c.*
FROM categories c
LEFT JOIN categories p ON c.parent_id = p.id
WHERE c.parent_id IS NOT NULL AND p.id IS NULL;

-- 4. Find categories with no products assigned
SELECT 
  c.id,
  c.name,
  c.level,
  cp.path
FROM categories c
LEFT JOIN products p ON c.id = p.category_id
LEFT JOIN category_hierarchy cp ON c.id = cp.id
WHERE p.id IS NULL
ORDER BY c.level, c.name;

-- 5. Show current category distribution by level
SELECT 
  level,
  COUNT(*) as category_count,
  array_agg(name ORDER BY name) as category_names
FROM categories
GROUP BY level
ORDER BY level;

-- 6. Show products per category with hierarchy
SELECT 
  ch.path,
  ch.level,
  c.name as category_name,
  COUNT(p.id) as product_count,
  array_agg(p.name ORDER BY p.name) as products
FROM category_hierarchy ch
JOIN categories c ON ch.id = c.id
LEFT JOIN products p ON c.id = p.category_id
GROUP BY ch.path, ch.level, c.name
HAVING COUNT(p.id) > 0
ORDER BY ch.level, ch.path;

-- 7. Clean up script - UNCOMMENT AND RUN CAREFULLY
/*
-- Remove duplicate categories (keep the first one by ID)
DELETE FROM categories 
WHERE id NOT IN (
  SELECT MIN(id) 
  FROM categories 
  GROUP BY name, COALESCE(parent_id, '00000000-0000-0000-0000-000000000000')
);

-- Update products to use the remaining category after dedup
-- (This would need manual review of which categories to merge)
*/

-- 8. Recommended 4-level B2B Category Structure Template
/*
Level 1 (Divisions): Main business areas
- Construction & Building
- Industrial Equipment  
- Electrical & Electronics
- Safety & PPE
- Maintenance & Repair
- Office & Commercial

Level 2 (Departments): Product groups within divisions
- Lumber & Wood Products (under Construction)
- Hand Tools (under Maintenance)
- Wiring & Cables (under Electrical)
- etc.

Level 3 (Categories): Specific product families
- Dimensional Lumber (under Lumber & Wood)
- Wrenches & Spanners (under Hand Tools) 
- Building Wire (under Wiring & Cables)
- etc.

Level 4 (Subcategories): Exact product types
- 2x4 Lumber (under Dimensional Lumber)
- Combination Wrenches (under Wrenches & Spanners)
- Romex Cable (under Building Wire)
- etc.
*/
