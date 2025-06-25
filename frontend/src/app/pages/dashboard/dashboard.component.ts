import { Component } from '@angular/core';
import { InvoicesComponent } from '../invoices/invoices.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [InvoicesComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent {}
