import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PaymentService } from '../../services/payment.service';
import { OrderService } from '../../services/order.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit, OnDestroy {
  cartItems: any[] = [];
  totalAmount = 0;

  cardNumber = '';
  expiry = '';
  cvv = '';

  cardNumberError = '';
  expiryError = '';
  cvvError = '';

  timer: any;
  timeLeft = 30;
  showMessage = '';
  orderId: string = '';

  constructor(private router: Router, private paymentService: PaymentService, private cartService: CartService) {}

  ngOnInit(): void {
    const state = window.history.state as { retry?: boolean, orderId?: string };
    this.orderId = state.orderId || '';
    console.log('🌐 STATE:', state);

    const cart = JSON.parse(localStorage.getItem('cart') || '{}');
    const products = JSON.parse(localStorage.getItem('productList') || '[]');

    const cartEntries = Object.entries(cart);
    if (!cartEntries.length || !products.length) {
      this.router.navigate(['/products']);
      return;
    }

this.cartItems = (Object.entries(cart) as [string, number][]).map(([id, quantity]) => {
  const product = products.find((p: any) => p.id == id);
  return {
    ...product,
    quantity,
    subtotal: quantity * product.price
  };
});
    this.totalAmount = this.cartItems.reduce((sum, item) => sum + item.subtotal, 0);

    this.startTimer();
  }

  startTimer() {
    this.timer = setInterval(() => {
      this.timeLeft--;
      if (this.timeLeft <= 0) {
        clearInterval(this.timer);
        this.showMessage = '⏳ Time expired! Redirecting to Order Page...';
        localStorage.setItem('retryPayment', 'true');
        setTimeout(() => {

          this.router.navigate(['/order'], { state: { retry: true, orderId: this.orderId } });
        }, 3000);

      }
    }, 1000);
  }

  formatCardNumber(event: any) {
    let input = event.target.value.replace(/\D/g, '').substring(0, 16);
    const numbers = input.match(/.{1,4}/g);
    this.cardNumber = numbers ? numbers.join(' ') : '';
  }

  formatExpiry(event: any) {
    let input = event.target.value.replace(/\D/g, '').substring(0, 4);
    if (input.length >= 2) {
      let month = input.substring(0, 2);
      let year = input.substring(2, 4);
      const m = parseInt(month);
      if (m < 1 || m > 12) month = '12';
      this.expiry = month + (year ? '/' + year : '');
    } else {
      this.expiry = input;
    }
  }

  get formValid(): boolean {
    return !this.cardNumberError && !this.expiryError && !this.cvvError &&
           this.cardNumber !== '' && this.expiry !== '' && this.cvv !== '';
  }

  onlyNumberInput(event: KeyboardEvent) {
    if (!/\d/.test(event.key)) {
      event.preventDefault();
    }
  }

  validateCardNumber() {
    const raw = this.cardNumber.replace(/\s/g, '');
    this.cardNumberError = raw.length !== 16 ? 'Enter a valid 16-digit card number.' : '';
  }

  validateExpiry() {
    this.expiryError = !/^(0[1-9]|1[0-2])\/\d{2}$/.test(this.expiry)
      ? 'Enter valid expiry in MM/YY format.'
      : '';
  }

  validateCVV() {
    this.cvvError = this.cvv.length !== 3 ? 'CVV must be 3 digits.' : '';
  }

payNow() {
  this.validateCardNumber();
  this.validateExpiry();
  this.validateCVV();

  if (!this.formValid) return;

  this.paymentService.createPayment(this.orderId).subscribe({
    next: (response) => {
      try {
        // Attempt to parse the response as JSON
        const jsonResponse = JSON.parse(response);
        this.showMessage = '✅ Payment Successful! Redirecting to Home page...';
        this.cartService.clearCart();
        localStorage.removeItem('cart');
        localStorage.removeItem('productQuantities');
        localStorage.setItem('resetCart', 'true');
        setTimeout(() => {
          this.router.navigate(['/products']);
        }, 4000);
      } catch (e) {
        // Handle plain text response
        this.showMessage = response;
        this.cartService.clearCart();
                localStorage.removeItem('cart');
                localStorage.removeItem('productQuantities');
                localStorage.setItem('resetCart', 'true');
        setTimeout(() => {
        this.router.navigate(['/products']);
        }, 4000);
      }
    },
    error: () => {
      this.showMessage = 'Payment failed. Try again.';
    }
  });
}


cancelPayment() {
  clearInterval(this.timer);

  const payload = {
    products: this.cartItems.map(item => ({
      productId: item.id,
      quantity: item.quantity,
      price: item.price
    })),
    paymentMethod: 'CREDIT_CARD'
  };

  this.paymentService.cancelOrder(this.orderId, payload).subscribe({
    next: () => {
      this.router.navigate(['/order'], { state: { retry: true, orderId: this.orderId } });
    },
    error: () => {
      this.router.navigate(['/order']);
    }
  });
}


  ngOnDestroy(): void {
    clearInterval(this.timer);
  }
}
