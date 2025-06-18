import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { AuthGuard } from './auth.guard';
import { GenerateInvoiceComponent } from './generate-invoice/generate-invoice.component';
import { AddVehicleComponent } from './add-vehicle/add-vehicle.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, data: { isRegistering: false } }, // Login route
  {
    path: 'register',
    component: LoginComponent,
    data: { isRegistering: true },
  }, // Register route
  { path: '', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'generate-invoice', component: GenerateInvoiceComponent },
  {
    path: 'create-vehicle',
    component: AddVehicleComponent,
    canActivate: [AuthGuard],
  },
  { path: 'reset-password', component: ResetPasswordComponent },

  { path: '**', redirectTo: 'login' },
];
