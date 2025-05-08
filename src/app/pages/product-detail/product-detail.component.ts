import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {
  product: any;
  limitReached = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    const state = window.history.state;

    if (state && state.product) {
      this.product = { ...state.product };
    } else {
      const id = this.route.snapshot.paramMap.get('id');
      const allProducts = JSON.parse(localStorage.getItem('productList') || '[]');
      this.product = allProducts.find((p: any) => p.id === id);
    }

    if (this.product) {
      const savedQty = this.cartService.getQuantity(this.product.id);
      this.product.quantity = savedQty || 0;
    }
  }

  updateQuantity(change: number) {
    const current = this.product.quantity || 0;
    const newQty = current + change;

    if (change > 0 && newQty > this.product.stock) {
      this.showLimitMessage();
      return;
    }

    const finalQty = newQty < 0 ? 0 : newQty;
    this.product.quantity = finalQty;
    this.cartService.updateQuantity(this.product.id, finalQty);
    this.persistQuantity();
  }

  persistQuantity() {
    const saved = JSON.parse(localStorage.getItem('productQuantities') || '{}');
    saved[this.product.id] = this.product.quantity;
    localStorage.setItem('productQuantities', JSON.stringify(saved));
  }

  showLimitMessage() {
    this.limitReached = true;
    setTimeout(() => this.limitReached = false, 2000);
  }

  goBack() {
    this.router.navigate(['/products']);
  }
}
