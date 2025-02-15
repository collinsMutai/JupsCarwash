import { Component, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '../../environments/environments';

@Component({
  selector: 'app-generate-invoice',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './generate-invoice.component.html',
  styleUrls: ['./generate-invoice.component.css'],
})
export class GenerateInvoiceComponent implements OnInit {
  invoiceNumber = '';
  clientName = '';
  date: string = new Date().toISOString().split('T')[0]; // Default to today's date
  items: {
    vehicleRegNumber: string;
    description: string;
    amount: number | null;
  }[] = [{ vehicleRegNumber: '', description: '', amount: null }];
  totalAmount: number = 0;

  private http = inject(HttpClient);
  private router = inject(Router);

  ngOnInit() {
    this.fetchNextInvoiceNumber();
  }

  fetchNextInvoiceNumber() {
    const token = localStorage.getItem('token');

    this.http
      .get<{ nextInvoiceNumber: string }>(
        `${environment.baseUrl}/invoices/next-invoice-number`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      )
      .subscribe({
        next: (data) => {
          this.invoiceNumber = data.nextInvoiceNumber;
        },
        error: (err) => {
          console.error('Error fetching invoice number:', err);
          alert('Failed to get the next invoice number.');
        },
      });
  }

  addItem() {
    this.items.push({ vehicleRegNumber: '', description: '', amount: null });
  }

  removeItem(index: number) {
    this.items.splice(index, 1);
    this.calculateTotal();
  }

  calculateTotal() {
    this.totalAmount = this.items.reduce(
      (sum, item) => sum + (item.amount || 0),
      0
    );
  }

  generateInvoice() {
    const token = localStorage.getItem('token');

    if (!token) {
      alert('Authentication required! Please login.');
      this.router.navigate(['/login']);
      return;
    }

    const invoiceData = {
      invoiceNumber: this.invoiceNumber,
      clientName: this.clientName,
      date: this.date,
      items: this.items,
      totalAmount: this.totalAmount,
    };

    this.http
      .post(`${environment.baseUrl}/invoices`, invoiceData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      })
      .subscribe({
        next: () => {
          alert('Invoice created successfully!');
          this.router.navigate(['/home']);
        },
        error: (err) => {
          console.error('Error creating invoice:', err);
          alert('Failed to create invoice.');
        },
      });
  }
}
