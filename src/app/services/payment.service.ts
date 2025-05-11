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
  return this.http.post(`${this.baseUrl}/payment-orders/create`, { orderId }, { responseType: 'text' });
}


cancelOrder(orderId: string, payload: any): Observable<any> {
  return this.http.put(`http://localhost:8082/api/order/${orderId}`, payload);
}
}
