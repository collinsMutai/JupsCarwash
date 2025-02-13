import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service'; // ✅ Import ApiService

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  invoices: any[] = [];
  isAdmin = false;
  private apiService = inject(ApiService); // ✅ Use ApiService
  private router = inject(Router);

  ngOnInit() {
    const token = localStorage.getItem('token');

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1])); // ✅ Decode JWT payload
        this.isAdmin = payload.role === 'admin';
      } catch (error) {
        console.error('Invalid token:', error);
      }
    }

    // ✅ Fetch invoices via ApiService
    this.apiService.getInvoices().subscribe({
      next: (data) => (this.invoices = data),
      error: (err) => console.error(err),
    });
  }

  downloadInvoice(invoiceId: string) {
    this.apiService.downloadInvoice(invoiceId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice_${invoiceId}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      },
      error: (err) => console.error('Download error:', err),
    });
  }

  printInvoice(invoiceId: string) {
    this.apiService.downloadInvoice(invoiceId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const newWindow = window.open(url);
        if (newWindow) {
          newWindow.onload = () => newWindow.print();
        } else {
          console.error('Popup blocked. Allow popups to print the invoice.');
        }
      },
      error: (err) => console.error('Print error:', err),
    });
  }

  goToGenerateInvoice() {
    this.router.navigate(['/generate-invoice']);
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}
