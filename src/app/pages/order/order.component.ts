import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';
import { OrderService } from '../../services/order.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.css']
})
export class OrderComponent implements OnInit, OnDestroy {
  cartItems: any[] = [];
  totalAmount: number = 0;
  retryPayment = false;
  private sub = new Subscription();
  orderId: string = '';

  constructor(
    private router: Router,
    private cartService: CartService,
    private productService: ProductService,
    private orderService: OrderService
  ) {}

ngOnInit(): void {

  const retry = window.history.state?.retry || false;

  const state = window.history.state || {};
  this.retryPayment = state.retry || false;
  this.orderId = state.orderId || '';



  // ⛔️ HACK: force reload
  if (Object.keys(this.cartService.getCart()).length === 0) {
    console.log('🔁 Forcing cart reload...');
    this.cartService['loadCart'](); // use with caution
  }

  this.sub.add(
    this.cartService.cartObservable().subscribe((cartMap: { [id: string]: number }) => {
      console.log('🛒 CartMap in Order:', cartMap);

      const ids = Object.keys(cartMap);
      console.log(ids.length);
      if (ids.length === 0) {
        this.router.navigate(['/products']);
        return;
      }

      this.productService.getProducts().subscribe(products => {
        this.cartItems = ids.map(id => {
          const product = products.find(p => String(p.id) === id);
          const quantity = cartMap[id];
          return {
            ...product,
            quantity,
            subtotal: quantity * product.price
          };
        });

        this.totalAmount = this.cartItems.reduce((sum, item) => sum + item.subtotal, 0);
      });
    })
  );
}


  goBack() {
    this.router.navigate(['/products']);
  }

  proceedToPayment() {
  const payload = {
    products: this.cartItems.map(item => ({
      productId: item.id,
      quantity: item.quantity,
      price: item.price
    })),
    paymentMethod: 'CREDIT_CARD' // ✅ Added here
  };

      if (this.retryPayment && this.orderId) {
        // 🔁 Retry: PUT
        this.orderService.retryOrder(this.orderId, payload).subscribe(
          () => {
            console.log('Order ID before payment page:', this.orderId);
            this.router.navigate(['/payment'], { state: { orderId: this.orderId } });

          },
          err => {
            console.error('Retry Order Failed:', err);
          }
        );
      } else {
        // 🆕 New: POST
        this.orderService.placeOrder(payload).subscribe(
          (response: any) => {
            const newOrderId = response?.id;
            this.router.navigate(['/payment'], { state: { orderId: newOrderId } });
          },
          err => {
            console.error('Order Placement Failed:', err);
          }
        );
      }
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
