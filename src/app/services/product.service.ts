import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';


@Injectable({ providedIn: 'root' })
export class ProductService {
  private apiUrl = 'http://localhost:8081/api/product';
  constructor(private http: HttpClient) {}

  getProducts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/all`);
  }
getProductById(id: string): Observable<any> {
  return this.getProducts().pipe(
    map(products => products.find((p: any) => p.id === id))
  );
}
}
