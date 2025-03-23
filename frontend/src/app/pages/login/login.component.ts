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
  role = 'user'; // Default role for registration
  isRegistering = false; // Dynamic state
  private apiService = inject(ApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  ngOnInit() {
    // Detect whether we're on /login or /register
    this.route.data.subscribe((data) => {
      this.isRegistering = data['isRegistering'] || false;
    });
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
        error: (err) => alert('Login failed! ' + err.error?.message),
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
        error: (err) => alert('Registration failed! ' + err.error?.message),
      });
  }
}
