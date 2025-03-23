import { Component } from '@angular/core';

import { Router } from '@angular/router'; // To navigate on success
import { CommonModule } from '@angular/common'; // CommonModule required for ngIf, ngModel
import { FormsModule } from '@angular/forms'; // Required for ngModel
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-add-vehicle',
  standalone: true, // Make this a standalone component
  templateUrl: './add-vehicle.component.html',
  styleUrls: ['./add-vehicle.component.css'],
  imports: [CommonModule, FormsModule], // Import CommonModule and FormsModule
})
export class AddVehicleComponent {
  vehicleRegNumber: string = '';
  make: string = '';
  model: string = '';
  year: number | null = null;
  ownerName: string = '';
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(private apiService: ApiService, private router: Router) {}

  // Handle form submission
  onSubmit() {
    const newVehicle = {
      vehicleRegNumber: this.vehicleRegNumber,
      make: this.make,
      model: this.model,
      year: this.year,
      ownerName: this.ownerName,
    };

    this.apiService
      .createVehicle(newVehicle) // Call the createVehicle method from ApiService
      .subscribe(
        (response) => {
          this.successMessage = 'Vehicle added successfully!';
          this.errorMessage = null;
          // Optionally, navigate to another page (e.g., vehicle list page)
          this.router.navigate(['/']);
        },
        (error) => {
          this.errorMessage = error.error?.message || 'Failed to add vehicle';
          this.successMessage = null;
        }
      );
  }
}
