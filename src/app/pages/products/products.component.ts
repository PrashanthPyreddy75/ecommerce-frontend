import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { filter } from 'rxjs/operators';

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
  limitMessage: { [productId: string]: boolean } = {};

  constructor(
    private router: Router,
    private productService: ProductService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    const reset = localStorage.getItem('resetCart');
    if (reset === 'true') {
      localStorage.removeItem('resetCart');
      this.initializeQuantities();  // This should zero out quantities in UI
    }
    this.loadProducts();

    // Re-load quantities when navigating back from product detail
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        if (event.url === '/products') {
          this.initializeQuantities(); // ✅ Re-apply latest quantities
        }
      });
  }

  loadProducts() {
    this.productService.getProducts().subscribe((data: any[]) => {
      this.products = data;
      localStorage.setItem('productList', JSON.stringify(data));
      this.categories = [...new Set(this.products.map(p => p.category))];
      this.initializeQuantities(); // 👈 set initial quantities from localStorage
    });
  }

  initializeQuantities() {
    const storedQuantities = JSON.parse(localStorage.getItem('productQuantities') || '{}');
    this.products.forEach(product => {
      product.quantity = storedQuantities[product.id] || 0;
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

  goToDetail(product: any) {
    this.router.navigate(['/product', product.id]);
  }

  updateQuantity(product: any, change: number) {
    const newQty = product.quantity + change;
    if (change > 0 && newQty > product.stock) {
      // Show stock limit warning
      this.showLimitMessage(product.id);
      return;
    }
    const finalQty = newQty < 0 ? 0 : newQty;
    product.quantity = finalQty;
    this.cartService.updateQuantity(product.id, finalQty);

    // Persist quantities in local storage
    this.persistQuantities();
  }

  persistQuantities() {
    const quantities = this.products.reduce((acc, product) => {
      acc[product.id] = product.quantity;
      return acc;
    }, {});
    localStorage.setItem('productQuantities', JSON.stringify(quantities));
  }

  showLimitMessage(productId: string) {
    this.limitMessage[productId] = true;
    setTimeout(() => {
      this.limitMessage[productId] = false;
    }, 2000);
  }
}
