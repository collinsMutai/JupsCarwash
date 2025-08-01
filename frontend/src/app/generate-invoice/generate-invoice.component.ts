import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environments';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-generate-invoice',
  templateUrl: './generate-invoice.component.html',
  styleUrls: ['./generate-invoice.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class GenerateInvoiceComponent implements OnInit {
  invoiceNumber: string = '';
  clientName: string = '';
  date: string = '';
  items: any[] = [
    {
      vehicleRegNumber: '',
      vehicleDates: [''], // support multiple dates
      description: '',
      amount: null,
      vehicleId: null,
    },
  ];

  totalAmount: number = 0;
  vehicles: any[] = [];

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.fetchNextInvoiceNumber();
    this.fetchVehicles();
  }

  fetchNextInvoiceNumber() {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Authentication required! Please login.');
      this.router.navigate(['/login']);
      return;
    }

    this.http
      .get<{ nextInvoiceNumber: string }>(
        `${environment.baseUrl}/invoices/next-invoice-number`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .subscribe({
        next: (data) => {
          this.invoiceNumber = data.nextInvoiceNumber;
        },
        error: (err) => {
          console.error('Error fetching invoice number:', err);
          alert('Failed to fetch the next invoice number.');
        },
      });
  }

  fetchVehicles() {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Authentication required! Please login.');
      this.router.navigate(['/login']);
      return;
    }

    this.http
      .get<any[]>(`${environment.baseUrl}/vehicles`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .subscribe({
        next: (vehicles) => {
          this.vehicles = vehicles;
        },
        error: (err) => {
          console.error('Error fetching vehicles:', err);
          alert('Failed to fetch vehicles.');
        },
      });
  }

  setVehicleRegNumber(item: any) {
    const selectedVehicle = this.vehicles.find(
      (vehicle) => vehicle._id === item.vehicleId
    );
    if (selectedVehicle) {
      item.vehicleRegNumber = selectedVehicle.vehicleRegNumber;
    }
  }

  addItem() {
    this.items.push({
      vehicleRegNumber: '',
      vehicleDates: [''],
      description: '',
      amount: null,
      vehicleId: null,
    });
  }

  removeItem(index: number) {
    this.items.splice(index, 1);
    this.calculateTotal();
  }

  addDate(item: any) {
    item.vehicleDates.push('');
    this.calculateTotal();
  }

  removeDate(item: any, index: number) {
    item.vehicleDates.splice(index, 1);
    this.calculateTotal();
  }

  calculateTotal() {
    this.totalAmount = this.items.reduce((sum, item) => {
      const quantity = item.vehicleDates ? item.vehicleDates.length : 1;
      return sum + (item.amount ? item.amount * quantity : 0);
    }, 0);
  }

  generateInvoice() {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Authentication required! Please login.');
      this.router.navigate(['/login']);
      return;
    }

    // Validation
    const invalidItem = this.items.find(
      (item) =>
        !item.vehicleId ||
        !item.vehicleRegNumber ||
        !item.vehicleDates ||
        !item.vehicleDates.length ||
        item.vehicleDates.some((d: string) => !d) || // no empty dates allowed
        !item.description ||
        item.amount === null ||
        item.amount < 0
    );

    if (
      !this.clientName ||
      !this.date ||
      this.items.length === 0 ||
      invalidItem
    ) {
      alert('Please complete all fields before submitting.');
      return;
    }

    const totalAmount = this.items.reduce((sum, item) => {
      const quantity = item.vehicleDates ? item.vehicleDates.length : 1;
      return sum + (item.amount ? item.amount * quantity : 0);
    }, 0);

  const invoiceData = {
    invoiceNumber: this.invoiceNumber,
    clientName: this.clientName,
    date: this.date,
    items: this.items.map((item) => ({
      vehicleRegNumber: item.vehicleRegNumber,
      vehicleDates: item.vehicleDates,
      description: item.description,
      amount: item.amount,
      vehicleId: item.vehicleId,
      quantity: item.quantity ?? 1, // Add quantity, default to 1 if missing
    })),
    totalAmount: totalAmount,
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
          this.router.navigate(['/']);
        },
        error: (err) => {
          console.error('Error creating invoice:', err);
          alert('Failed to create invoice.');
        },
      });
  }
}
