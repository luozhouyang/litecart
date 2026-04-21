import { useParams, Link } from "@tanstack/react-router";
import { useProduct, useDeleteProduct } from "@/hooks";
import { ProductForm } from "./ProductForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";

export function ProductDetail() {
  const { productId } = useParams({ from: "/products/$productId" });
  const { data, isLoading } = useProduct(productId);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const deleteProduct = useDeleteProduct();

  const handleDelete = async () => {
    await deleteProduct.mutateAsync(productId);
    setDeleteDialogOpen(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const product = data?.product;

  if (!product) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/products">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Product not found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/products">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">{product.title}</h1>
        </div>
        <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Product</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductForm mode="edit" product={product} productId={productId} />
        </CardContent>
      </Card>

      {/* Variants Section */}
      {product.variants && product.variants.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Variants ({product.variants.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {product.variants.map((variant) => (
                <div
                  key={variant.id}
                  className="flex items-center justify-between p-2 border rounded"
                >
                  <div>
                    <span className="font-medium">{variant.title}</span>
                    {variant.sku && (
                      <span className="text-sm text-muted-foreground ml-2">SKU: {variant.sku}</span>
                    )}
                  </div>
                  <div className="text-sm">
                    {variant.prices?.map((price) => (
                      <span key={price.id} className="mr-2">
                        {price.currencyCode}: ${(price.amount / 100).toFixed(2)}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{product.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteProduct.isPending}>
              {deleteProduct.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
