import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { AuthGuard } from './auth.guard';
import { GenerateInvoiceComponent } from './generate-invoice/generate-invoice.component';
import { AddVehicleComponent } from './add-vehicle/add-vehicle.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import { LayoutComponent } from './pages/layout/layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, data: { isRegistering: false } },
  {
    path: 'register',
    component: LoginComponent,
    data: { isRegistering: true },
  },
  { path: 'reset-password', component: ResetPasswordComponent },

  // Layout as default route with children
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }, // redirect '' to dashboard
      { path: 'dashboard', component: DashboardComponent },
      { path: 'generate-invoice', component: GenerateInvoiceComponent },
      { path: 'create-vehicle', component: AddVehicleComponent },
      // Add more child routes here if needed
    ],
  },

  // Wildcard route
  { path: '**', redirectTo: 'login' },
];
