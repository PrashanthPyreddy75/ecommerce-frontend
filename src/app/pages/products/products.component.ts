import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {
  products: any[] = [];
  categories: string[] = [];
  selectedCategory = '';
  searchTerm = '';

  constructor(
    private router: Router,
    private productService: ProductService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.productService.getProducts().subscribe((data: any[]) => {
      this.products = data;
      localStorage.setItem('productList', JSON.stringify(data));
      this.categories = [...new Set(this.products.map(p => p.category))];

      this.cartService.getCartMapObservable().subscribe(cartMap => {
        this.products.forEach(product => {
          product.quantity = cartMap.get(product.id) || 0;
        });
      });
    });
  }

  filterProducts() {
    return this.products.filter(p => {
      const matchesCategory = !this.selectedCategory || p.category === this.selectedCategory;
      const matchesSearch = !this.searchTerm || p.name.toLowerCase().includes(this.searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }

  buyProduct(product: any) {
    this.router.navigate(['/product', product.id]);
  }

  updateQuantity(product: any, change: number) {
    const newQty = product.quantity + change;
    const finalQty = Math.max(0, newQty);
    this.cartService.updateQuantity(product.id, finalQty);
  }
}
