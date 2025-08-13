import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { ClassValue } from 'clsx'

import type { Product } from './supabase'

export function cn(...inputs: Array<ClassValue>) {
  return twMerge(clsx(inputs))
}

// --- Product CSV/JSON Import/Export Utilities ---

// CSV to Product[]
export async function parseProductsCSVAsync(
  file: File,
): Promise<Array<Product>> {
  const text = await file.text()
  const lines = text.split(/\r?\n/).filter(Boolean)
  if (lines.length < 2) return []
  const headers = lines[0].split(',').map((h) => h.trim())
  return lines.slice(1).map((line) => {
    const values = line.split(',')
    const obj: any = {}
    headers.forEach((header, i) => {
      obj[header] = values[i]
    })
    // Convert types as needed
    return {
      ...obj,
      price: Number(obj.price),
      stock: Number(obj.stock),
      tags: obj.tags ? obj.tags.split('|') : [],
    } as Product
  })
}

// Product[] to CSV
export function productsToCSV(products: Array<Product>): string {
  if (!products.length) return ''
  const headers = Object.keys(products[0])
  const csv = [headers.join(',')]
  for (const product of products) {
    const row = headers.map((h) => {
      const val = (product as any)[h]
      if (Array.isArray(val)) return val.join('|')
      return val ?? ''
    })
    csv.push(row.join(','))
  }
  return csv.join('\n')
}

// JSON to Product[]
export async function parseProductsJSONAsync(
  file: File,
): Promise<Array<Product>> {
  const text = await file.text()
  return JSON.parse(text) as Array<Product>
}

// Product[] to JSON
export function productsToJSON(products: Array<Product>): string {
  return JSON.stringify(products, null, 2)
}
