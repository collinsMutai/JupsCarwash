import { Component, inject } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  username = '';
  password = '';
  email = '';
  role = 'user';
  isRegistering = false;
  isResetting = false;

  private apiService = inject(ApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  ngOnInit() {
    this.route.data.subscribe((data) => {
      this.isRegistering = data['isRegistering'] || false;
    });
  }

  toggleRegister() {
    this.isRegistering = !this.isRegistering;
    this.isResetting = false;
    this.clearFields();
  }

  toggleReset() {
    this.isResetting = !this.isResetting;
    this.isRegistering = false;
    this.clearFields();
  }

  clearFields() {
    this.username = '';
    this.password = '';
    this.email = '';
  }

  onSubmit() {
    if (this.isResetting) {
      this.requestPasswordReset();
    } else if (this.isRegistering) {
      this.register();
    } else {
      this.login();
    }
  }

  login() {
    this.apiService
      .login({ username: this.username, password: this.password })
      .subscribe({
        next: (res) => {
          localStorage.setItem('token', res.token);
          localStorage.setItem('role', res.user.role);
          this.router.navigate(['/']);
        },
        error: (err) =>
          alert('Login failed! ' + err.error?.message || 'Unexpected error'),
      });
  }

  register() {
    this.apiService
      .register({
        username: this.username,
        password: this.password,
        role: this.role,
      })
      .subscribe({
        next: () => {
          alert('Registration successful! Please log in.');
          this.router.navigate(['/login']);
        },
        error: (err) =>
          alert(
            'Registration failed! ' + err.error?.message || 'Unexpected error'
          ),
      });
  }

  requestPasswordReset() {
    this.apiService.requestPasswordReset(this.email).subscribe({
      next: () => {
        alert('Reset email sent! Check your inbox.');
        this.toggleReset();
      },
      error: (err) =>
        alert(
          'Error sending reset email: ' + err.error?.message ||
            'Unexpected error'
        ),
    });
  }
}
