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

  // 🔐 Authentication APIs
  login(credentials: { username: string; password: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/login`, credentials);
  }

  register(user: {
    username: string;
    password: string;
    role: string;
    email?: string;
  }): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/register`, user);
  }

  changePassword(
    currentPassword: string,
    newPassword: string
  ): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/auth/change-password`,
      { currentPassword, newPassword },
      this.getHeaders()
    );
  }

  requestPasswordReset(email: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/request-password-reset`, {
      email,
    });
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/reset-password`, {
      token,
      newPassword,
    });
  }

  // 🧾 Invoice APIs
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

  deleteInvoice(invoiceId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/invoices/${invoiceId}`, {
      headers: this.getAuthHeaders(),
    });
  }

  // 🚗 Vehicle APIs
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

  // 🔧 Utility
  private getHeaders() {
    return { headers: this.getAuthHeaders() };
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }
}
