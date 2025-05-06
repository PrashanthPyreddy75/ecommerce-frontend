import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private baseUrl = 'http://localhost:8083/api/payment-orders';

  constructor(private http: HttpClient) {}

  createPayment(orderId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/create/${orderId}`);
  }
}
