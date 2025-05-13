import { Component } from '@angular/core';
import { Router, RouterModule, RouterOutlet, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { CartService } from './services/cart.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  showNav = false;
  showSearch = false;
  currentUrl = '';
  cartCount: number = 0;
  isHomePage = false;

  constructor(private router: Router, private cartService: CartService) {
    this.cartService.cartCountObservable().subscribe(count => {
      this.cartCount = count;
    });

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.currentUrl = event.urlAfterRedirects;
        this.showNav = !this.currentUrl.includes('/login');
        this.showSearch = this.currentUrl === '/products';
        this.isHomePage = this.currentUrl === '/home';
      });
  }

goToOrder() {
  console.log('🛒 Navigating to order...');
  this.router.navigate(['/order']);
}

  logout() {
    localStorage.clear();
    this.cartService.resetCart();
    this.router.navigate(['/login']);
  }

  goHome() {
    this.router.navigate(['/home']);
  }
}
