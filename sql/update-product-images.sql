-- Update existing products to use actual product images
-- This script assigns real product images to existing products
-- Note: The actual database uses 'imgUrl' field, not 'image_url'

-- Update products that currently have placeholder images
UPDATE products
SET imgUrl = CASE
  WHEN title ILIKE '%drill%' OR title ILIKE '%tool%' THEN '/images/products/BC846b558a.jpg'
  WHEN title ILIKE '%lumber%' OR title ILIKE '%wood%' THEN '/images/products/DSc8616a19.jpg'
  WHEN title ILIKE '%light%' OR title ILIKE '%led%' THEN '/images/products/FJe8d3c07c.jpg'
  WHEN title ILIKE '%hat%' OR title ILIKE '%safety%' THEN '/images/products/IDe962939a.jpg'
  WHEN title ILIKE '%pipe%' OR title ILIKE '%pvc%' THEN '/images/products/JVc218e8ed.jpg'
  WHEN title ILIKE '%saw%' OR title ILIKE '%circular%' THEN '/images/products/SF3191c99b.jpg'
  WHEN title ILIKE '%glove%' OR title ILIKE '%work%' THEN '/images/products/SR702d5984.jpg'
  ELSE '/images/products/OTd00670d8.jpg' -- Default for other products
END
WHERE imgUrl IS NULL
   OR imgUrl = '/placeholder-product.jpg'
   OR imgUrl = '/placeholder-product.svg'
   OR imgUrl = '';

-- Verify the updates
SELECT asin, title, imgUrl FROM products LIMIT 10;
