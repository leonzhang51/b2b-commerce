// Server-side API route for importing products
// This uses a workaround to bypass RLS by using raw SQL

import { supabase } from '@/lib/supabase'

export async function POST({ request }: { request: Request }) {
  try {
    const { products } = await request.json()

    if (!products || !Array.isArray(products)) {
      return new Response(JSON.stringify({ error: 'Invalid products data' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    let imported = 0
    const errors: Array<string> = []

    for (const product of products) {
      try {
        // Use raw SQL to bypass RLS temporarily
        const { data: insertedProduct, error: productError } =
          await supabase.rpc('insert_product_bypass_rls', {
            p_category_id: product.category_id,
            p_sku: product.sku,
            p_name: product.name,
            p_description: product.description,
            p_price: product.price,
            p_brand: product.brand,
            p_stock_quantity: product.stock_quantity,
            p_is_active: product.is_active,
            p_is_featured: product.is_featured,
            p_warranty_years: product.warranty_years,
            p_tags: product.tags,
          })

        if (productError) {
          console.error('Error inserting product:', productError)
          errors.push(
            `Failed to insert ${product.name}: ${productError.message}`,
          )
          continue
        }

        if (insertedProduct) {
          imported++
          console.log(
            `Successfully inserted: ${product.name} (ID: ${insertedProduct})`,
          )
        }
      } catch (error) {
        console.error('Exception inserting product:', error)
        errors.push(
          `Exception inserting ${product.name}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        )
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        imported,
        total: products.length,
        errors: errors.length > 0 ? errors : undefined,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('Import API error:', error)
    return new Response(
      JSON.stringify({
        error: 'Import failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }
}
