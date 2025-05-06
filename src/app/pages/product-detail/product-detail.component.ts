import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProductService } from '../../services/product.service'; // ✅ adjust path if needed
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, MatSnackBarModule],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {
  product: any;
  quantity = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    const productId = this.route.snapshot.paramMap.get('id')!;
    const fromBack = window.history.state?.fromBack;

this.productService.getProductById(productId).subscribe(product => {
  this.product = product;

      if (fromBack) {
        const savedCart = JSON.parse(localStorage.getItem('cart') || '{}');
        this.quantity = savedCart[this.product.id] || 0;
      } else {
        this.quantity = 0;
      }
    });
  }

  saveQuantity() {
    const cart = JSON.parse(localStorage.getItem('cart') || '{}');
    cart[this.product.id] = this.quantity;
    localStorage.setItem('cart', JSON.stringify(cart));
  }

  increaseQuantity() {
    if (this.quantity < this.product.stock) {
      this.quantity++;
      this.saveQuantity();
    } else {
      this.snackBar.open("Sorry, you can't add more of this item.", '', { duration: 2000 });
    }
  }

  decreaseQuantity() {
    if (this.quantity > 0) {
      this.quantity--;
      this.saveQuantity();
    }
  }

  orderNow() {
    if (this.quantity > 0) {
      this.router.navigate(['/order'], { state: { product: this.product, quantity: this.quantity } });
    } else {
      this.snackBar.open("Please select quantity before ordering.", '', { duration: 2000 });
    }
  }

  goBack() {
    this.router.navigate(['/product', this.product.id]);
  }
}
