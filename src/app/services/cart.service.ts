import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CartService {
  private cartKey = 'cart';
  private cart = new Map<string, number>();
  private cartCount$ = new BehaviorSubject<number>(0);
  private cartMap$ = new BehaviorSubject<Map<string, number>>(new Map());
private cartState$ = new BehaviorSubject<{ [id: string]: number }>({});

  constructor() {
    this.loadCart();
  }

  private loadCart() {
    const data = localStorage.getItem(this.cartKey);
    if (data) {
      const obj = JSON.parse(data);
      Object.keys(obj).forEach(id => this.cart.set(id.toString(), obj[id]));
    }
    this.updateCartCount();
    this.updateCartState();
    //this.cartMap$.next(new Map(this.cart));
  }

  private saveCart() {
    const cartObj: { [id: string]: number } = {};
    this.cart.forEach((qty, id) => {
      if (qty > 0) cartObj[id] = qty;
    });
     localStorage.setItem('cart', JSON.stringify(cartObj));
    this.updateCartCount();
    this.updateCartState();
    this.cartMap$.next(new Map(this.cart));
  }

  updateQuantity(productId: string, quantity: number) {
    const id = productId.toString();
    if (quantity <= 0) {
      this.cart.delete(id);
    } else {
      this.cart.set(id, quantity);
    }
    this.saveCart();
  }

  getQuantity(productId: string): number {
    return this.cart.get(productId.toString()) || 0;
  }

  getCart(): Map<string, number> {
    return new Map(this.cart);
  }

  getCartMapObservable() {
    return this.cartMap$.asObservable();
  }

  clearCart() {
    this.cart.clear();
    this.saveCart();
  }

  cartCountObservable() {
    return this.cartCount$.asObservable();
  }
cartObservable() {
  return this.cartState$.asObservable();
}
private updateCartState() {
  const state: { [id: string]: number } = {};
  this.cart.forEach((qty, id) => {
    if (qty > 0) state[id] = qty;
  });
  this.cartState$.next(state);
}
  private updateCartCount() {
    let total = 0;
    this.cart.forEach(qty => total += qty);
    this.cartCount$.next(total);
  }
resetCart() {
  this.cart.clear();
  this.cartCount$.next(0);
  this.cartMap$.next(new Map());
  this.cartState$.next({});
}
}
