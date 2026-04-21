import { useParams, Link } from "@tanstack/react-router";
import { useStoreById, useRegenerateStoreToken } from "@/hooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, RefreshCw, Copy, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { StoreStatus } from "@litecart/types";

export function StoreDetail() {
  const { storeId } = useParams({ from: "/stores/$storeId" });
  const { data, isLoading } = useStoreById(storeId);
  const regenerateToken = useRegenerateStoreToken(storeId);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [_status, _setStatus] = useState<StoreStatus | null>(null);
  const [tokenCopied, setTokenCopied] = useState(false);

  const store = data?.store;

  // Initialize form from store data
  if (store && !name) {
    setName(store.name);
    setSlug(store.slug);
  }

  const handleCopyToken = () => {
    if (store?.storefrontJwt) {
      void navigator.clipboard.writeText(store.storefrontJwt);
      setTokenCopied(true);
      setTimeout(() => setTokenCopied(false), 2000);
    }
  };

  const handleRegenerateToken = async () => {
    await regenerateToken.mutateAsync();
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

  if (!store) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/stores">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Store not found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/stores">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">{store.name}</h1>
        <Badge
          variant={
            store.status === "active"
              ? "success"
              : store.status === "suspended"
                ? "destructive"
                : "secondary"
          }
        >
          {store.status}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Store Info */}
        <Card>
          <CardHeader>
            <CardTitle>Store Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} disabled />
            </div>
            <div>
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" value={slug} disabled />
            </div>
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Input id="currency" value={store.currencyCode} disabled />
            </div>
            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <Input id="timezone" value={store.timezone} disabled />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Owner ID</span>
              <span className="text-sm">{store.ownerId}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Created</span>
              <span className="text-sm">{new Date(store.createdAt).toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        {/* Storefront Token */}
        <Card>
          <CardHeader>
            <CardTitle>Storefront Token</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Use this token to authenticate storefront API requests. Keep it secure!
            </p>
            {store.storefrontJwt ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Input value={store.storefrontJwt} disabled className="font-mono text-sm" />
                  <Button variant="outline" size="icon" onClick={handleCopyToken}>
                    {tokenCopied ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <Button
                  variant="outline"
                  onClick={handleRegenerateToken}
                  disabled={regenerateToken.isPending}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  {regenerateToken.isPending ? "Regenerating..." : "Regenerate Token"}
                </Button>
              </div>
            ) : (
              <p className="text-muted-foreground">No storefront token available</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
