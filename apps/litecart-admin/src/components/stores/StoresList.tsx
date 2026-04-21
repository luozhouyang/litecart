import { Link } from "@tanstack/react-router";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Eye, RefreshCw, Store as StoreIcon } from "lucide-react";
import { useStores, useDeleteStore } from "@/hooks";
import type { StoreStatus } from "@litecart/types";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const statusColors: Record<StoreStatus, string> = {
  active: "success",
  suspended: "destructive",
  draft: "secondary",
};

export function StoresList() {
  const { data, isLoading } = useStores();
  const deleteStore = useDeleteStore();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [storeToDelete, setStoreToDelete] = useState<string | null>(null);

  const handleDeleteClick = (storeId: string) => {
    setStoreToDelete(storeId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (storeToDelete) {
      await deleteStore.mutateAsync(storeToDelete);
      setDeleteDialogOpen(false);
      setStoreToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Stores</h1>
          <p className="text-muted-foreground">Manage your e-commerce stores</p>
        </div>
        <Link to="/stores/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Store
          </Button>
        </Link>
      </div>

      {/* Stores Table */}
      <Card>
        <CardHeader>
          <CardTitle>{isLoading ? "Loading..." : `${data?.count ?? 0} stores`}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : data?.stores.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No stores found. Create your first store!
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Currency</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.stores.map((store) => (
                  <TableRow key={store.id}>
                    <TableCell>
                      <Link
                        to="/stores/$storeId"
                        params={{ storeId: store.id }}
                        className="flex items-center gap-2 font-medium hover:underline"
                      >
                        <StoreIcon className="h-4 w-4" />
                        {store.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{store.slug}</TableCell>
                    <TableCell>{store.currencyCode}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          statusColors[store.status] as "success" | "destructive" | "secondary"
                        }
                      >
                        {store.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(store.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link to="/stores/$storeId" params={{ storeId: store.id }}>
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        {store.status !== "suspended" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(store.id)}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspend Store</DialogTitle>
            <DialogDescription>
              Are you sure you want to suspend this store? This will disable all storefront
              operations.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteStore.isPending}
            >
              {deleteStore.isPending ? "Suspending..." : "Suspend"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
