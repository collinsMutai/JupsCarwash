import { Component, inject } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css'],
  standalone: true,
  imports: [RouterOutlet, RouterModule],
})
export class LayoutComponent {
  isAdmin = false;
  private router = inject(Router);

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
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    this.router.navigate(['/login']);
  }

  goToDashboard() {
    this.router.navigateByUrl('/dashboard');
  }

  goToGenerateInvoice() {
    this.router.navigate(['/generate-invoice']);
  }

  goToCreateVehicle() {
    this.router.navigate(['/create-vehicle']);
  }
}
