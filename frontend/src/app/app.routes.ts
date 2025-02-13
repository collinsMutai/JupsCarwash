import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { AuthGuard } from './auth.guard';
import { GenerateInvoiceComponent } from './generate-invoice/generate-invoice.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, data: { isRegistering: false } }, // Login route
  {
    path: 'register',
    component: LoginComponent,
    data: { isRegistering: true },
  }, // Register route
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'generate-invoice', component: GenerateInvoiceComponent },
  { path: '**', redirectTo: 'login' },
];
