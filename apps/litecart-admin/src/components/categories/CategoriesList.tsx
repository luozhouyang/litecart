import { useState } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, FolderTree, Trash2 } from "lucide-react";
import { useCategories, useDeleteCategory } from "@/hooks";
import type { CategoryResponse } from "@litecart/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CategoryWithChildren {
  id: string;
  name: string;
  handle: string;
  parentId: string | null;
  children: CategoryWithChildren[];
}

export function CategoriesList() {
  const [search, setSearch] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  const { data, isLoading } = useCategories();
  const deleteCategory = useDeleteCategory();

  // Build category tree
  const buildTree = (categories: CategoryResponse[] | undefined): CategoryWithChildren[] => {
    if (!categories) return [];

    const categoryMap = new Map<string, CategoryWithChildren>();
    const roots: CategoryWithChildren[] = [];

    // First pass: create nodes
    for (const cat of categories) {
      categoryMap.set(cat.id, {
        id: cat.id,
        name: cat.name,
        handle: cat.handle,
        parentId: cat.parentId,
        children: [],
      });
    }

    // Second pass: build tree
    for (const cat of categories) {
      const node = categoryMap.get(cat.id);
      if (node) {
        if (cat.parentId) {
          const parent = categoryMap.get(cat.parentId);
          if (parent) {
            parent.children.push(node);
          } else {
            roots.push(node);
          }
        } else {
          roots.push(node);
        }
      }
    }

    return roots;
  };

  const categoryTree = buildTree(data?.categories);

  // Filter by search
  const filterTree = (nodes: CategoryWithChildren[]): CategoryWithChildren[] => {
    if (!search) return nodes;
    return nodes
      .map((node) => {
        const filteredChildren = filterTree(node.children);
        if (node.name.toLowerCase().includes(search.toLowerCase()) || filteredChildren.length > 0) {
          return { ...node, children: filteredChildren };
        }
        return null;
      })
      .filter((node) => node !== null) as CategoryWithChildren[];
  };

  const filteredTree = filterTree(categoryTree);

  // Flatten tree for table display
  const flattenTree = (nodes: CategoryWithChildren[], level = 0): CategoryWithChildren[] => {
    return nodes.reduce<CategoryWithChildren[]>((acc, node) => {
      acc.push({ ...node, children: [] });
      acc.push(...flattenTree(node.children, level + 1));
      return acc;
    }, []);
  };

  const flattenedCategories = flattenTree(filteredTree);

  const handleDeleteClick = (categoryId: string) => {
    setCategoryToDelete(categoryId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (categoryToDelete) {
      await deleteCategory.mutateAsync(categoryToDelete);
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
    }
  };

  // Find category depth for indentation
  const getCategoryDepth = (categoryId: string): number => {
    const cat = data?.categories?.find((c) => c.id === categoryId);
    if (!cat || !cat.parentId) return 0;
    return 1 + getCategoryDepth(cat.parentId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">Organize your products into categories</p>
        </div>
        <Link to="/categories/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </Link>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <CardTitle>{isLoading ? "Loading..." : `${data?.count ?? 0} categories`}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : data?.categories.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No categories found. Create your first category!
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Handle</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {flattenedCategories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FolderTree className="h-4 w-4 text-muted-foreground" />
                        <span
                          className="font-medium"
                          style={{
                            paddingLeft: `${getCategoryDepth(category.id) * 20}px`,
                          }}
                        >
                          {category.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{category.handle}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(category.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this category? Products in this category will be
              uncategorized.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteCategory.isPending}
            >
              {deleteCategory.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
