import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments'; // ✅ Use environment variable

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) {}

  // 🔹 Authentication APIs
  login(credentials: { username: string; password: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/login`, credentials);
  }

  register(user: {
    username: string;
    password: string;
    role: string;
  }): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/register`, user);
  }

  // 🔹 Invoice APIs
  getInvoices(): Observable<any> {
    return this.http.get(`${this.baseUrl}/invoices`, this.getHeaders());
  }

  createInvoice(invoice: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/invoices`,
      invoice,
      this.getHeaders()
    );
  }

  downloadInvoice(invoiceId: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/invoices/${invoiceId}/pdf`, {
      headers: this.getAuthHeaders(),
      responseType: 'blob',
    });
  }

  // 🔹 Vehicle APIs
  getVehicles(): Observable<any> {
    return this.http.get(`${this.baseUrl}/vehicles`, this.getHeaders());
  }

  createVehicle(vehicle: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/vehicles`,
      vehicle,
      this.getHeaders()
    );
  }

  // 🔹 Utility Functions
  private getHeaders() {
    return { headers: this.getAuthHeaders() };
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }
}
