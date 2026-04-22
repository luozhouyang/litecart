import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

interface CartEmptyProps {
  onClose?: () => void;
}

export function CartEmpty({ onClose }: CartEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 gap-4">
      <ShoppingBag className="h-12 w-12 text-muted-foreground" />
      <p className="text-muted-foreground">Your cart is empty</p>
      <Link to="/products" onClick={onClose}>
        <Button variant="outline">Browse Products</Button>
      </Link>
    </div>
  );
}
