import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { ProductsComponent } from './pages/products/products.component';
import { ProductDetailComponent } from './pages/product-detail/product-detail.component';
import { OrderComponent } from './pages/order/order.component';
import { PaymentComponent } from './pages/payment/payment.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },  // ✅ redirect root to /login

  { path: 'login', component: LoginComponent },          // ✅ explicitly define login page
  { path: 'products', component: ProductsComponent },
  { path: 'product/:id', component: ProductDetailComponent },
  { path: 'order', component: OrderComponent },
  { path: 'payment', component: PaymentComponent },

  { path: '**', redirectTo: 'login' },                   // optional: fallback for unknown URLs
];
