import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private baseUrl = 'http://localhost:8083/api';

  constructor(private http: HttpClient) {}

createPayment(orderId: string): Observable<any> {
  return this.http.post(`${this.baseUrl}/payment-orders/create`, JSON.stringify(orderId), {
    headers: { 'Content-Type': 'application/json' },
    responseType: 'json'
  });
}

  cancelOrder(orderId: string): Observable<any> {
    return this.http.delete(`http://localhost:8082/api/order/${orderId}`, { responseType: 'text' });
  }
}
