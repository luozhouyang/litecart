import { createFileRoute } from "@tanstack/react-router";
import { useProduct } from "@/hooks/useProducts";
import { ProductDetail } from "@/components/products/ProductDetail";
import { ProductGrid } from "@/components/products/ProductGrid";
import { useProducts } from "@/hooks/useProducts";

export const Route = createFileRoute("/products/$handle")({
  component: ProductDetailPage,
});

function ProductDetailPage() {
  const { handle } = Route.useParams();
  const { data: product, isLoading } = useProduct(handle);
  const { data: relatedProducts } = useProducts({ limit: 4 });

  // Extract product data from the unknown response
  const productData = product as unknown as {
    id: string;
    title: string;
    handle: string;
    description?: string;
    subtitle?: string;
    thumbnail?: string;
    variants?: Array<{
      id: string;
      title: string;
      prices?: Array<{ amount: number; currencyCode: string }>;
    }>;
  } | null;

  const relatedProductsList = relatedProducts?.products?.slice(0, 4) ?? [];

  return (
    <div className="flex flex-col gap-8 py-8">
      {/* Product Detail */}
      <ProductDetail product={productData as never} isLoading={isLoading} />

      {/* Related Products */}
      {relatedProductsList.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-4">You May Also Like</h2>
          <ProductGrid products={relatedProductsList} />
        </section>
      )}
    </div>
  );
}
