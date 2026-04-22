import { useStoreContext } from "@/lib/store-context";
import { Drawer, DrawerHeader, DrawerContent, DrawerFooter } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { CartItem } from "@/components/cart/CartItem";
import { CartEmpty } from "@/components/cart/CartEmpty";
import { CartSummary } from "@/components/cart/CartSummary";
import { X, ShoppingBag } from "lucide-react";
import { Link } from "@tanstack/react-router";

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  const { cart, itemCount } = useStoreContext();

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerHeader>
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Your Cart</h2>
          {itemCount > 0 && (
            <span className="text-sm text-muted-foreground">({itemCount} items)</span>
          )}
        </div>
        <button
          onClick={() => onOpenChange(false)}
          className="flex items-center justify-center h-9 w-9 rounded-lg hover:bg-accent/10 transition-colors"
          aria-label="Close cart"
        >
          <X className="h-4 w-4" />
        </button>
      </DrawerHeader>

      <DrawerContent>
        {cart && cart.items && cart.items.length > 0 ? (
          <div className="flex flex-col gap-4">
            {cart.items.map((item) => (
              <CartItem key={item.id} item={item} currencyCode={cart.currencyCode} />
            ))}
          </div>
        ) : (
          <CartEmpty onClose={() => onOpenChange(false)} />
        )}
      </DrawerContent>

      {cart && cart.items && cart.items.length > 0 && (
        <DrawerFooter>
          <CartSummary cart={cart} />
          <Link to="/checkout" onClick={() => onOpenChange(false)}>
            <Button size="lg" className="w-full">
              Checkout
            </Button>
          </Link>
        </DrawerFooter>
      )}
    </Drawer>
  );
}
