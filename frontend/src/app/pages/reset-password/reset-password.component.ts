import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class ResetPasswordComponent implements OnInit {
  token = '';
  newPassword = '';

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
  }

  resetPassword() {
    this.api.resetPassword(this.token, this.newPassword).subscribe({
      next: () => {
        alert('Password has been reset.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        alert(err.error?.error || 'Reset failed');
      },
    });
  }
}
