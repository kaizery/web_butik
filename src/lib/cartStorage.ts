import { CartItem } from "@/types/product";

export interface StoredUser {
  id: number;
  name: string;
  email: string;
  role: string;
  phone?: string;
}

// Get the currently logged-in user from localStorage
export function getCurrentUser(): StoredUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("aura_boutique_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// Get the specific storage key for the user
export function getCartStorageKey(user?: StoredUser | null): string {
  const activeUser = user !== undefined ? user : getCurrentUser();
  if (activeUser && activeUser.email) {
    return `aura_cart_user_${activeUser.email.toLowerCase().trim()}`;
  }
  return "aura_cart_guest";
}

// Load the appropriate cart for the current user
export function loadUserCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const key = getCartStorageKey();
    const raw = localStorage.getItem(key);
    if (raw) {
      return JSON.parse(raw);
    }
    // Fallback check legacy active cart if guest
    const legacy = localStorage.getItem("aura_cart");
    return legacy ? JSON.parse(legacy) : [];
  } catch {
    return [];
  }
}

// Save cart to both scoped user key and active aura_cart key
export function saveUserCart(items: CartItem[]): void {
  if (typeof window === "undefined") return;
  try {
    const key = getCartStorageKey();
    const data = JSON.stringify(items);
    localStorage.setItem(key, data);
    localStorage.setItem("aura_cart", data); // Active pointer for checkout

    // Broadcast update event across components
    window.dispatchEvent(new CustomEvent("aura_cart_updated", { detail: { items } }));
  } catch (err) {
    console.error("Failed to save cart:", err);
  }
}

// Restore saved cart when a user logs in
export function restoreUserCartOnLogin(user: StoredUser): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const userKey = getCartStorageKey(user);
    const guestKey = "aura_cart_guest";

    const savedUserCart = localStorage.getItem(userKey);
    const guestCart = localStorage.getItem(guestKey);

    let finalItems: CartItem[] = [];

    if (savedUserCart) {
      // User has a previously saved cart
      finalItems = JSON.parse(savedUserCart);

      // If guest had added items, merge them without duplicates
      if (guestCart) {
        const guestItems: CartItem[] = JSON.parse(guestCart);
        guestItems.forEach((gItem) => {
          const exists = finalItems.find(
            (item) =>
              item.product.id === gItem.product.id &&
              item.selectedVariant.id === gItem.selectedVariant.id
          );
          if (exists) {
            exists.quantity += gItem.quantity;
          } else {
            finalItems.push(gItem);
          }
        });
        localStorage.removeItem(guestKey);
      }
    } else if (guestCart) {
      // Migrate guest cart to the newly logged-in user
      finalItems = JSON.parse(guestCart);
      localStorage.removeItem(guestKey);
    }

    // Save under the user's private key & active cart
    localStorage.setItem(userKey, JSON.stringify(finalItems));
    localStorage.setItem("aura_cart", JSON.stringify(finalItems));

    window.dispatchEvent(new CustomEvent("aura_cart_updated", { detail: { items: finalItems } }));
    return finalItems;
  } catch (err) {
    console.error("Failed to restore user cart on login:", err);
    return [];
  }
}

// Wipe active session on Logout (Cart becomes 0, Search resets, Data safely kept in user's scoped key)
export function clearUserSessionOnLogout(): void {
  if (typeof window === "undefined") return;
  try {
    const user = getCurrentUser();
    if (user && user.email) {
      // Ensure current cart is backed up to user's private storage
      const activeCart = localStorage.getItem("aura_cart");
      if (activeCart) {
        localStorage.setItem(getCartStorageKey(user), activeCart);
      }
    }

    // Clear active user session
    localStorage.removeItem("aura_boutique_user");

    // Clear active shopping cart so guest sees 0 items
    localStorage.removeItem("aura_cart");
    localStorage.removeItem("aura_cart_guest");

    // Clear tracking session search
    localStorage.removeItem("aura_last_search_invoice");

    // Broadcast empty cart update
    window.dispatchEvent(new CustomEvent("aura_cart_updated", { detail: { items: [] } }));
  } catch (err) {
    console.error("Failed to clear session on logout:", err);
  }
}
