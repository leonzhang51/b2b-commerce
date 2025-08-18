// Test script to check current categories table structure
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fnwbmkbqgrrtdnqthtru.supabase.co'
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZud2Jta2JxZ3JydGRucXRodHJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4NjE1MDEsImV4cCI6MjA3MDQzNzUwMX0.ASCgozpAobQWyTZA0hjrP2M9OfNQbgwg0sFOwjBPwx4'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkTableStructure() {
  console.log('Checking table structure...')

  // Try to get table structure by querying for a non-existent row
  // This will show us the column structure in the error or response
  const { data, error } = await supabase.from('categories').select('*').limit(1)

  console.log('Table query result:')
  console.log('Data:', data)
  console.log('Error:', error)

  // Also try to insert a test row to see what columns are expected
  const { data: insertData, error: insertError } = await supabase
    .from('categories')
    .insert({ category_name: 'Test Category' })
    .select()

  console.log('Insert test result:')
  console.log('Data:', insertData)
  console.log('Error:', insertError)

  // If that works, delete the test row
  if (insertData && insertData.length > 0) {
    const { error: deleteError } = await supabase
      .from('categories')
      .delete()
      .eq('id', insertData[0].id)
    console.log('Delete test result:', deleteError)
  }
}

checkTableStructure().catch(console.error)
