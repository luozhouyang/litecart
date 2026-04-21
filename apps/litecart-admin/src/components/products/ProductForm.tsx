import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useCreateProduct, useUpdateProduct, useCategories } from "@/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2 } from "lucide-react";
import type {
  ProductResponse,
  ProductStatus,
  CreateProductRequest,
  CreateVariantRequest,
} from "@litecart/types";

interface ProductFormProps {
  mode: "create" | "edit";
  product?: ProductResponse;
  productId?: string;
}

export function ProductForm({ mode, product, productId }: ProductFormProps) {
  const navigate = useNavigate();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct(productId || "");
  const { data: categoriesData } = useCategories();

  const [title, setTitle] = useState(product?.title || "");
  const [subtitle, setSubtitle] = useState(product?.subtitle || "");
  const [description, setDescription] = useState(product?.description || "");
  const [status, setStatus] = useState<ProductStatus>(product?.status || "draft");
  const [categoryId, setCategoryId] = useState(product?.categoryId || "");
  const [variants, setVariants] = useState<CreateVariantRequest[]>(
    product?.variants?.map((v) => ({
      title: v.title,
      sku: v.sku || "",
      prices: v.prices?.map((p) => ({
        currencyCode: p.currencyCode,
        amount: p.amount,
      })) || [{ currencyCode: "USD", amount: 0 }],
      inventoryQuantity: 0,
      manageInventory: true,
      allowBackorder: false,
    })) || [
      {
        title: "Default",
        sku: "",
        prices: [{ currencyCode: "USD", amount: 0 }],
        inventoryQuantity: 0,
        manageInventory: true,
        allowBackorder: false,
      },
    ],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data: CreateProductRequest = {
      title,
      subtitle,
      description,
      status,
      isDiscountable: true,
      categoryId: categoryId || undefined,
      variants,
    };

    try {
      if (mode === "create") {
        await createProduct.mutateAsync(data);
      } else if (productId) {
        await updateProduct.mutateAsync({
          title,
          subtitle,
          description,
          status,
          categoryId: categoryId || undefined,
        });
      }
      void navigate({ to: "/products" });
    } catch (error) {
      console.error("Failed to save product:", error);
    }
  };

  const addVariant = () => {
    setVariants([
      ...variants,
      {
        title: "",
        sku: "",
        prices: [{ currencyCode: "USD", amount: 0 }],
        inventoryQuantity: 0,
        manageInventory: true,
        allowBackorder: false,
      },
    ]);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const updateVariant = (
    index: number,
    field: keyof CreateVariantRequest,
    value: string | number,
  ) => {
    setVariants(variants.map((v, i) => (i === index ? { ...v, [field]: value } : v)));
  };

  const updateVariantPrice = (index: number, amount: number) => {
    setVariants(
      variants.map((v, i) =>
        i === index ? { ...v, prices: [{ currencyCode: "USD", amount }] } : v,
      ),
    );
  };

  const isPending = createProduct.isPending || updateProduct.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>

        <div>
          <Label htmlFor="subtitle">Subtitle</Label>
          <Input id="subtitle" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as ProductStatus)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="category">Category</Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categoriesData?.categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      {/* Variants */}
      {mode === "create" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Variants</Label>
            <Button type="button" variant="outline" size="sm" onClick={addVariant}>
              <Plus className="mr-2 h-4 w-4" />
              Add Variant
            </Button>
          </div>

          {variants.map((variant, index) => (
            <div key={index} className="space-y-2 p-4 border rounded-md">
              <div className="flex justify-between">
                <span className="font-medium">Variant {index + 1}</span>
                {variants.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeVariant(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={variant.title}
                    onChange={(e) => updateVariant(index, "title", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label>SKU</Label>
                  <Input
                    value={variant.sku}
                    onChange={(e) => updateVariant(index, "sku", e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label>Price (USD)</Label>
                <Input
                  type="number"
                  value={(variant.prices?.[0]?.amount || 0) / 100}
                  onChange={(e) =>
                    updateVariantPrice(index, Math.round(parseFloat(e.target.value) * 100))
                  }
                  step="0.01"
                  min="0"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <Separator />

      <div className="flex gap-4">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : mode === "create" ? "Create Product" : "Save Changes"}
        </Button>
        <Button type="button" variant="outline" onClick={() => navigate({ to: "/products" })}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
