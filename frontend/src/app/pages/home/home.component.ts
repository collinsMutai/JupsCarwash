import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service'; // ✅ Import ApiService

// Define interfaces here or import from types.ts if you're using that approach
interface InvoiceItem {
  vehicleRegNumber: string;
  description: string;
  amount: number;
  quantity?: number; // Optional
  _id: string;
}

interface Invoice {
  _id: string;
  invoiceNumber: string;
  clientName: string;
  totalAmount: number;
  date: string;
  createdBy: string;
  items: InvoiceItem[];
  showDetails?: boolean;
  __v: number;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  invoices: Invoice[] = []; // Strongly type invoices as an array of Invoice objects
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
      next: (data: Invoice[]) => {
        // Type the response as an array of invoices
        this.invoices = data;
        this.invoices.forEach((invoice) => {
          invoice.items.forEach((item) => {
            if (!item.quantity) {
              item.quantity = 1; // Set default quantity to 1 if missing
            }
          });
        });
      },
      error: (err) => console.error(err),
    });
  }

  // Method to duplicate the invoice
  duplicateInvoice(invoice: Invoice) {
    const newInvoice = { ...invoice, _id: undefined, invoiceNumber: undefined }; // Remove _id and invoiceNumber for new invoice

    // Create a new invoice with the same details
    this.apiService.createInvoice(newInvoice).subscribe({
      next: (createdInvoice) => {
        // Reload the invoice list after creating the new invoice
        this.invoices.push(createdInvoice);
      },
      error: (err) => console.error('Error duplicating invoice:', err),
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

  // Method to delete the invoice
  deleteInvoice(invoice: Invoice) {
    const confirmation = window.confirm(
      'Are you sure you want to delete this invoice?'
    );

    if (confirmation) {
      this.apiService.deleteInvoice(invoice._id).subscribe({
        next: () => {
          // Remove the deleted invoice from the list
          this.invoices = this.invoices.filter(
            (inv) => inv._id !== invoice._id
          );
        },
        error: (err) => console.error('Error deleting invoice:', err),
      });
    }
  }
}
