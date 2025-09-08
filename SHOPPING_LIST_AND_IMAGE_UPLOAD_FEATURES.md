# Shopping List and Image Upload Features

This document describes the newly implemented shopping list and image upload features for the B2B Commerce platform.

## 🛒 Smart Shopping List Feature

### Overview

The Smart Shopping List feature analyzes user order history to generate personalized shopping suggestions based on purchasing patterns and frequency.

### Files Added/Modified

- `src/hooks/useShoppingList.ts` - Hook for generating shopping list suggestions
- `src/components/ShoppingListModal.tsx` - Modal component for displaying and managing shopping lists
- `src/components/Header.tsx` - Added "Smart List" button integration
- `src/__tests__/useShoppingList.test.tsx` - Unit tests for the shopping list hook
- `src/__tests__/ShoppingListModal.test.tsx` - Unit tests for the modal component

### How It Works

1. **Data Analysis**: Analyzes user's order history from the `order_items` table
2. **Frequency Calculation**: Identifies frequently ordered items and recent purchases
3. **Smart Suggestions**: Suggests items based on:
   - Items ordered multiple times (frequency ≥ 2)
   - Recent items that might need reordering (within 30 days, ≥ 7 days since last order)
4. **Quantity Estimation**: Calculates suggested quantities based on average order quantities
5. **Sorting**: Prioritizes suggestions by frequency and recency

### User Experience

1. **Access**: Click the "Smart List" button in the header (visible only to authenticated users)
2. **Review**: See personalized suggestions with product images, prices, and order history
3. **Customize**: Adjust quantities using +/- controls
4. **Add to Cart**: Bulk-add selected items to cart with one click

### Technical Features

- Real-time order history analysis
- Intelligent quantity suggestions (capped at 10 per item)
- Integration with existing cart system
- Role-based pricing support
- Comprehensive error handling and loading states
- Full test coverage

## 📸 Real Image Upload Feature

### Overview

Enhanced the ProductManager component with real image upload functionality using Supabase Storage for persistent, scalable image hosting.

### Files Modified

- `src/components/ProductManager.tsx` - Enhanced with real upload functionality
- `src/__tests__/imageUpload.integration.test.ts` - Integration tests for storage setup

### How It Works

1. **Product Selection**: Admin selects a product from dropdown
2. **Image Compression**: Automatically compresses images to 800x800 pixels at 80% quality
3. **Upload to Storage**: Uploads to Supabase Storage `product-images` bucket
4. **Database Update**: Updates product record with new image URL
5. **Preview**: Shows uploaded image preview

### Technical Implementation

- **Storage**: Uses Supabase Storage for reliable, CDN-backed image hosting
- **Compression**: Client-side image compression using Canvas API
- **Naming**: Unique filenames using product ID and timestamp
- **Error Handling**: Comprehensive error handling with user feedback
- **UI/UX**: Improved interface with status indicators and previews

### Setup Requirements

To use the image upload feature, ensure the Supabase Storage bucket is configured:

1. **Create Bucket**: Create a bucket named `product-images` in your Supabase dashboard
2. **Public Access**: Set the bucket to public for image accessibility
3. **RLS Policies**: Configure Row Level Security policies as needed
4. **CORS**: Ensure CORS is configured for your domain

### Storage Structure

```
product-images/
├── ASIN123-1640995200000.jpg
├── ASIN456-1640995300000.png
└── ...
```

## 🧪 Testing

### Unit Tests

- **Shopping List Hook**: Tests data fetching, analysis logic, and error handling
- **Shopping List Modal**: Tests UI interactions, state management, and cart integration
- **Image Upload**: Integration tests for storage bucket availability

### Running Tests

```bash
# Run all tests
npm test

# Run specific test files
npm test useShoppingList.test.tsx
npm test ShoppingListModal.test.tsx
npm test imageUpload.integration.test.ts
```

## 🚀 Usage Examples

### Shopping List Hook

```typescript
import { useShoppingList } from '@/hooks/useShoppingList'

function MyComponent() {
  const { suggestion, isLoading, error, hasData } = useShoppingList()

  if (isLoading) return <div>Loading suggestions...</div>
  if (error) return <div>Error: {error.message}</div>
  if (!hasData) return <div>No suggestions available</div>

  return (
    <div>
      <h3>Suggested Items: {suggestion.items.length}</h3>
      <p>Total Estimated: ${suggestion.estimatedTotal.toFixed(2)}</p>
    </div>
  )
}
```

### Shopping List Modal

```typescript
import { ShoppingListModal } from '@/components/ShoppingListModal'

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        Open Shopping List
      </button>
      <ShoppingListModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  )
}
```

## 📋 Future Enhancements

### Shopping List

- [ ] Role-based product templates (contractor vs. plumber suggestions)
- [ ] Seasonal/project-based suggestions
- [ ] Shared shopping lists for teams
- [ ] Integration with inventory management
- [ ] Machine learning for better predictions

### Image Upload

- [ ] Batch image upload for multiple products
- [ ] Image optimization with multiple sizes/formats
- [ ] Drag-and-drop interface
- [ ] Image editing capabilities
- [ ] Automatic alt-text generation

## 🔧 Configuration

### Environment Variables

Ensure these environment variables are set:

- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key

### Database Requirements

- `orders` table with user order data
- `order_items` table with product purchase history
- `products` table with product information
- Supabase Storage bucket named `product-images`

## 📞 Support

For questions or issues with these features:

1. Check the test files for usage examples
2. Review the TODO.md file for implementation details
3. Ensure all environment variables and database setup are correct
4. Verify Supabase Storage bucket configuration
