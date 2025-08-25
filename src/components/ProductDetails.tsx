import { ProductDetailsView } from '@/views/ProductDetailsView'
import { useProductDetailsPresenter } from '@/presenters/useProductDetailsPresenter'

interface ProductDetailsProps {
  productId: string
}

/**
 * MVP-compliant ProductDetails component
 *
 * This component follows the MVP pattern:
 * - Uses a Presenter (useProductDetailsPresenter) to handle business logic
 * - Uses a View (ProductDetailsView) for pure presentation
 * - Acts as a thin container that connects presenter and view
 */
export function ProductDetails({ productId }: ProductDetailsProps) {
  const presenter = useProductDetailsPresenter(productId)

  return (
    <ProductDetailsView
      product={presenter.product}
      loading={presenter.loading}
      error={presenter.error}
      pricing={presenter.pricing}
      canAddToCart={presenter.canAddToCart}
      isInCart={presenter.isInCart}
      itemCount={presenter.itemCount}
      onAddToCart={presenter.handleAddToCart}
      onImageError={presenter.handleImageError}
    />
  )
}
