import { createFileRoute, useParams } from '@tanstack/react-router'
import { ProductDetails } from '@/components/ProductDetails'

function ProductDetailRoute() {
  const { id = '' } = useParams({ strict: false })
  return <ProductDetails productId={id} />
}

export const Route = createFileRoute('/product/$id')({
  component: ProductDetailRoute,
})
