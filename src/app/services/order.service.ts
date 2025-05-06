import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private baseUrl = 'http://localhost:8082/api/order';

  constructor(private http: HttpClient) {}

  placeOrder(payload: { productId: number, quantity: number }): Observable<any> {
    return this.http.post(`${this.baseUrl}`, payload);
  }

  retryPayment(orderId: string, payload: { productId: number, quantity: number }): Observable<any> {
    return this.http.put(`${this.baseUrl}/${orderId}`, payload);
  }
}
