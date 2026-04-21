import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useCreateStore } from "@/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StoreFormProps {
  mode: "create";
}

export function StoreForm({ mode: _mode }: StoreFormProps) {
  const navigate = useNavigate();
  const createStore = useCreateStore();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [currencyCode, setCurrencyCode] = useState("USD");
  const [timezone, setTimezone] = useState("UTC");
  const [newToken, setNewToken] = useState<string | null>(null);

  // Auto-generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const handleNameChange = (value: string) => {
    setName(value);
    if (!slug) {
      setSlug(generateSlug(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const result = await createStore.mutateAsync({
        name,
        slug,
        currencyCode,
        timezone,
      });
      // Show the new token
      setNewToken(result.storefrontToken);
    } catch (error) {
      console.error("Failed to create store:", error);
    }
  };

  const handleDone = () => {
    void navigate({ to: "/stores" });
  };

  if (newToken) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Store Created!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Your store has been created. Here's your storefront token - keep it secure!
            </p>
            <Input value={newToken} disabled className="font-mono text-sm" />
            <Button onClick={handleDone}>Continue to Stores</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Store</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Store Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="slug">Slug (URL identifier)</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="my-store"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Must be lowercase alphanumeric with hyphens, 3-50 characters
              </p>
            </div>

            <div>
              <Label htmlFor="currency">Default Currency</Label>
              <Input
                id="currency"
                value={currencyCode}
                onChange={(e) => setCurrencyCode(e.target.value)}
                placeholder="USD"
              />
            </div>

            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <Input
                id="timezone"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                placeholder="UTC"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={createStore.isPending}>
                {createStore.isPending ? "Creating..." : "Create Store"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => void navigate({ to: "/stores" })}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
