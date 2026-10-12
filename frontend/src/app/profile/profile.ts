import { Component, OnInit } from '@angular/core';
import { UserService } from '../Shared/Custom-Services/user-service';
import { AuthService } from '../Shared/Custom-Services/auth-state';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [RouterLink, FormsModule, NgIf],
  templateUrl: './profile.html'
})
export class Profile implements OnInit {

  user: any = {};
  userId: number | null = null;
  isEditing: boolean = false;
  originalUser: any = {};
  isAddressEditing: boolean = false;
  isKycDone: boolean = false;
  originalAddress: any = {};


  constructor(
    private userService: UserService,
    private authState: AuthService,
    private toaster: ToastrService,
    private router : Router
  ) { }

  ngOnInit(): void {
    this.userId = this.authState.userId();
    console.log(this.userId);
    
    const stored = sessionStorage.getItem('kycStatus');
    if (stored !== null) {
  this.isKycDone= stored === 'true';
}
    if (this.userId) {
      this.loadUser();
    } else {
      console.error('User ID not found');
    }
  }

  // Loads user data from backend and initializes form values
  loadUser() {
    if (!this.userId) return;
    this.userService.getUserById(this.userId).subscribe({
      next: (res: any) => {
        this.user = res;
        if (!this.user.address) {
          this.user.address = {
            doorNumber: '',
            landMark: '',
            street: '',
            pinCode: '',
            city: '',
            district: '',
            state: '',
            country: ''
          };
        }
        if (this.user.dateOfBirth) {
          this.user.dateOfBirth =
            new Date(this.user.dateOfBirth).toISOString().split('T')[0];
        }
        if (this.user.dateJoined) {
          this.user.dateJoined =
            new Date(this.user.dateJoined).toISOString().split('T')[0];
        }
        this.originalUser = { ...this.user };
        this.originalAddress = { ...this.user.address };
        console.log(this.user);
      },
      error: (err) => {
        console.error('Failed to load user', err);
      }
    });
  }

  // Toggles edit mode for personal details
  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.user = { ...this.originalUser };
    }
  }

  // Saves updated personal profile to backend
  saveProfile() {
    if (!this.userId) {
      this.toaster.error('User ID missing');
      return;
    }
    const cleanedUser = {
      ...this.user,
      occupation: this.user.occupation?.trim(),
      phone: this.user.phone?.trim(),
      maritalStatus: this.user.maritalStatus?.trim()
    };

    this.userService.updateUserProfile(this.userId, cleanedUser)
      .subscribe({
        next: (res: any) => {
          this.toaster.success(res?.message || 'Profile updated successfully');
          this.originalUser = { ...cleanedUser };
          this.isEditing = false;
        },
        error: (err) => {
          console.error(err);
          this.toaster.error('Update failed');
        }
      });
  }

  // Toggles edit mode for address
  toggleAddressEdit() {
    this.isAddressEditing = !this.isAddressEditing;
    if (this.isAddressEditing) {
      this.originalAddress = { ...this.user.address };
    } else {
      this.user.address = { ...this.originalAddress };
    }
  }

  // Saves updated address to backend
  saveAddress() {
    if (!this.userId) {
      this.toaster.error('User ID missing');
      return;
    }
    const cleanedAddress = {
      doorNumber: this.user.address.doorNumber?.trim(),
      landMark: this.user.address.landMark?.trim(),
      street: this.user.address.street?.trim(),
      pinCode: this.user.address.pinCode,
      city: this.user.address.city?.trim(),
      district: this.user.address.district?.trim(),
      state: this.user.address.state?.trim(),
      country: this.user.address.country?.trim()
    };
    this.userService.updateAddress(this.userId, cleanedAddress)
      .subscribe({
        next: (res: any) => {
          this.toaster.success(res?.message || 'Address updated successfully');
          this.originalAddress = { ...cleanedAddress };
          this.isAddressEditing = false;
        },
        error: (err) => {
          console.error(err);
          this.toaster.error('Address update failed');
        }
      });
  }

  goToKyc() {
    if (this.isKycDone) {
      this.router.navigate(['/viewKycDocuments']);
    } else {
      this.router.navigate(['/uploadKycDocuments']);
    }
  }
}