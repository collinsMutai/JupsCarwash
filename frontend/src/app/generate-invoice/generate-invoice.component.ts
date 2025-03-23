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
      vehicleRegNumber: '', // Add this field to store vehicle registration number
      description: '',
      amount: null,
      quantity: 1,
      vehicleId: null,
    },
  ];
  totalAmount: number = 0;
  vehicles: any[] = []; // To hold the list of vehicles

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.fetchNextInvoiceNumber();
    this.fetchVehicles(); // Fetch the list of vehicles on component load
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

  // Fetch the list of vehicles from the backend
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
          this.vehicles = vehicles; // Store the vehicle list in the vehicles array
          console.log('vehicles', this.vehicles);
          
        },
        error: (err) => {
          console.error('Error fetching vehicles:', err);
          alert('Failed to fetch vehicles.');
        },
      });
  }

  // Method to set the vehicle registration number when a vehicle is selected
  setVehicleRegNumber(item: any) {
    const selectedVehicle = this.vehicles.find(
      (vehicle) => vehicle._id === item.vehicleId
    );
    if (selectedVehicle) {
      item.vehicleRegNumber = selectedVehicle.vehicleRegNumber; // Set the vehicle registration number
    }
  }

  addItem() {
    this.items.push({
      vehicleRegNumber: '', // Ensure the new item also has this property
      description: '',
      amount: null,
      quantity: 1,
      vehicleId: null, // Vehicle ID to be selected
    });
  }

  removeItem(index: number) {
    this.items.splice(index, 1);
    this.calculateTotal();
  }

  calculateTotal() {
    this.totalAmount = this.items.reduce((sum, item) => {
      return sum + (item.amount ? item.amount * (item.quantity || 1) : 0);
    }, 0);
  }

  generateInvoice() {
    const token = localStorage.getItem('token');

    if (!token) {
      alert('Authentication required! Please login.');
      this.router.navigate(['/login']);
      return;
    }

    // Console log all fields before validation
    console.log('Invoice Number:', this.invoiceNumber);
    console.log('Client Name:', this.clientName);
    console.log('Invoice Date:', this.date);
    console.log('Items:', this.items);

    // Validation: Ensure all fields are filled
    if (
      !this.clientName ||
      !this.date ||
      !this.items.length ||
      this.items.some(
        (item) =>
          !item.vehicleId || // Vehicle ID should be selected from the dropdown
          !item.vehicleRegNumber || // Vehicle registration should be filled
          !item.description || // Description should be filled
          item.amount === null || // Amount should be filled
          item.quantity <= 0 // Quantity should be greater than 0
      )
    ) {
      alert('Please complete all fields before submitting.');
      return;
    }

    const totalAmount = this.items.reduce((sum, item) => {
      return sum + (item.amount ? item.amount * (item.quantity || 1) : 0);
    }, 0);

    const invoiceData = {
      invoiceNumber: this.invoiceNumber,
      clientName: this.clientName,
      date: this.date,
      items: this.items,
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
        next: (response) => {
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
