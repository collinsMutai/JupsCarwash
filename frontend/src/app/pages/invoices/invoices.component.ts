import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

interface InvoiceItem {
  vehicleRegNumber: string;
  description: string;
  amount: number;
  quantity?: number;
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
  selector: 'app-invoices',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './invoices.component.html',
})
export class InvoicesComponent {
  invoices: Invoice[] = [];
  paginatedInvoices: Invoice[] = [];
  currentPage = 1;
  pageSize = 10;
  searchTerm: string = '';
  filteredInvoices: Invoice[] = [];
  isAdmin = false;

  private apiService = inject(ApiService);

  ngOnInit() {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.isAdmin = payload.role === 'admin';
      } catch (error) {
        console.error('Invalid token:', error);
      }
    }

    this.apiService.getInvoices().subscribe({
      next: (data: Invoice[]) => {
        this.invoices = data.map((invoice) => {
          invoice.items.forEach((item) => {
            if (!item.quantity) item.quantity = 1;
          });
          return invoice;
        });
        this.filteredInvoices = [...this.invoices];
        this.updatePaginatedInvoices();
      },
      error: (err) => console.error(err),
    });
  }

  updatePaginatedInvoices() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedInvoices = this.filteredInvoices.slice(start, end);
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.updatePaginatedInvoices();
  }

  get totalPages(): number[] {
    return Array.from(
      { length: Math.ceil(this.filteredInvoices.length / this.pageSize) },
      (_, i) => i + 1
    );
  }

  duplicateInvoice(invoice: Invoice) {
    const newInvoice = { ...invoice, _id: undefined, invoiceNumber: undefined };
    this.apiService.createInvoice(newInvoice).subscribe({
      next: (createdInvoice) => {
        this.invoices.push(createdInvoice);
        this.updatePaginatedInvoices();
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
          console.error('Popup blocked.');
        }
      },
      error: (err) => console.error('Print error:', err),
    });
  }

  deleteInvoice(invoice: Invoice) {
    const confirmation = window.confirm(
      'Are you sure you want to delete this invoice?'
    );
    if (confirmation) {
      this.apiService.deleteInvoice(invoice._id).subscribe({
        next: () => {
          this.invoices = this.invoices.filter(
            (inv) => inv._id !== invoice._id
          );
          this.updatePaginatedInvoices();
        },
        error: (err) => console.error('Error deleting invoice:', err),
      });
    }
  }

  filterInvoices() {
    const term = this.searchTerm.toLowerCase().trim();

    this.filteredInvoices = this.invoices.filter((invoice) => {
      return (
        invoice.invoiceNumber.toLowerCase().includes(term) ||
        invoice.date.toLowerCase().includes(term) ||
        invoice.totalAmount.toString().includes(term)
      );
    });

    this.currentPage = 1;
    this.updatePaginatedInvoices();
  }
}
