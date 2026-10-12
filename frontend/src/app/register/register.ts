import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormField, MatError } from "@angular/material/input";
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../Shared/Custom-Services/user-service';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Observable, of, timer } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';
import { ConsoleLogger } from '@microsoft/signalr/dist/esm/Utils';
import { faL } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-register',
  templateUrl: './register.html',
  styleUrl: './register.scss',
  imports: [MatFormField, RouterModule, ReactiveFormsModule, MatInputModule, MatFormFieldModule, MatSelectModule, MatDatepickerModule, MatNativeDateModule, CommonModule]
})
export class Register implements OnInit {

  showKycForm = false;
  showUserForm = false;
  showAddressForm = false;
  showBranchForm = true;
  submitted = false;
  showCard = false;
  userForm!: FormGroup;
  accountForm!: FormGroup;
  maxDob!: Date;
  username: string = '';
  password: string = '';
  showAccountForm: any;
  accountTypes: any[] = [];
  branchCities: any[] = [];
  branchLocations: any[] = [];
  allBranches: any[] = [];
  selectedCity: string = '';
  selectedAccountTypeId: number | null = null;
  branchForm: any;
  successMessage = false;
  step = 1;

  get f() {
    return this.userForm.controls;
  }

  nextStep() {

    if (this.step === 1 && this.branchForm.invalid) {
      this.branchForm.markAllAsTouched();
      return;
    }

    if (this.step === 2 && this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.step++;
  }

  prevStep() {
    this.step--;
  }

  onSubmit() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.successMessage = true;
  }

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    private toaster: ToastrService
  ) {
    const today = new Date();
    this.maxDob = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    this.password = this.generatePassword();


    this.accountForm = this.fb.group({
      userId: [0, Validators.required],
      branchId: [0, Validators.required],
      accountTypeId: ['', Validators.required],
    });

    this.userForm = this.fb.group({
      userId: [0],
      addressId: [0],
      kycId: [0],
      fullName: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]+$'), this.noWhitespaceValidator]],
      email: ['', [Validators.required, Validators.email], [this.emailExistsValidator.bind(this)]],
      phone: ['', [
        Validators.required,
        Validators.pattern('^[0-9]{10}$')
      ]],
      role: ['User'],
      status: ['Active'],
      dateOfBirth: ['', Validators.required],
      gender: ['', Validators.required],
      dateJoined: [new Date()],
      occupation: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]+$'), this.noWhitespaceValidator]],
      maritalStatus: ['', Validators.required],
      password: [this.password],
      netbankingStatus: [false],
      accountTypeId: ['', Validators.required],
      address: this.fb.group({
        doorNumber: ['', [
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(10),
          Validators.pattern(/^[a-zA-Z0-9\/-]+$/), this.noWhitespaceValidator
        ]],

        landMark: ['', [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
          Validators.pattern(/^[a-zA-Z0-9\s,.\-]+$/), this.noWhitespaceValidator
        ]],

        street: ['', [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100),
          Validators.pattern(/^[a-zA-Z0-9\s,.\-\/]+$/), this.noWhitespaceValidator
        ]],

        city: ['', [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
          Validators.pattern(/^[a-zA-Z\s ]+$/), this.noWhitespaceValidator
        ]],

        district: ['', [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
          Validators.pattern(/^[a-zA-Z\s]+$/), this.noWhitespaceValidator
        ]],

        state: ['', [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
          Validators.pattern(/^[a-zA-Z\s]+$/), this.noWhitespaceValidator
        ]],

        country: ['', [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
          Validators.pattern(/^[a-zA-Z\s]+$/), this.noWhitespaceValidator
        ]],

        pinCode: ['', [Validators.required, Validators.pattern(/^[1-9][0-9]{5}$/)]],
      }),

      kyc: this.fb.group({
        panNumber: ['', [Validators.pattern('^[A-Z]{5}[0-9]{4}[A-Z]{1}$')]],
        adhaarNumber: ['', [Validators.required, Validators.pattern('^[2-9]{1}[0-9]{11}$')]],
        profileImage: ['File'],
        submittedOn: [new Date()],
        approvedOn: [null],
        adhaarFile: ['File'],
        panFile: ['File']
      })
    });
  }
  ngOnInit() {
    this.getAllAccountTypes();
    this.getAllBranches();
    this.branchForm = this.fb.group({
      city: ['', Validators.required],
      location: ['', Validators.required]
    });
  }

  emailExistsValidator(control: AbstractControl): Observable<any> {
    if (!control.value) return of(null);

    return timer(50).pipe(
      switchMap(() =>
        this.userService.checkEmailExists(control.value).pipe(
          map(res => (res.exists ? { emailTaken: true } : null)),
          catchError(() => of(null))
        )
      )
    );
  }

  noWhitespaceValidator(control: AbstractControl) {
    if (!control.value) {
      return null;
    }
    const value = control.value.replace(/\s+/g, ' ').trim();
    return value.length === 0 ? { whitespace: true } : null;
  }

  getAllAccountTypes() {
    this.userService.getAllAccountTypes().subscribe({
      next: (response: any) => {
        if (response.status) {
          this.accountTypes = response.data;
          console.log(this.accountTypes);
        }
      },
      error: (error) => {
        console.error('Error fetching account types', error);
      }
    });
  }

  generatePassword(length: number = 10): string {
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '!@#$%^&*';
    const all = upper + lower + numbers + special;
    let password = '';
    password += upper[Math.floor(Math.random() * upper.length)];
    password += lower[Math.floor(Math.random() * lower.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];

    for (let i = password.length; i < length; i++) {
      password += all[Math.floor(Math.random() * all.length)];
    }
    return password;
  }

  continueToAddress() {

    const requiredFields = [
      'fullName',
      'email',
      'phone',
      'dateOfBirth',
      'gender',
      'occupation',
      'maritalStatus',
      'accountTypeId'
    ];
    for (let index = 0; index < requiredFields.length; index++) {
      const element = this.userForm.get(requiredFields[index])?.value;
      console.log(element);

    }
    let isValid = true;
    requiredFields.forEach(field => {
      const control = this.userForm.get(field);
      if (!control || control.invalid) {
        control?.markAsTouched();
        isValid = false;
        console.log(false)
      }
    });

    if (isValid) {
      console.log(this.userForm.get('fullName')?.value.charAt(0).toUpperCase() + this.userForm.get('fullName')?.value.slice(1));
      this.showAccountForm = false;
      this.showBranchForm = false;
      this.showKycForm = false;
      this.showAddressForm = true;
    }
  }

  goBackToBasic() {
    this.showAddressForm = false;
  }



  // ================= TRIM ADDRESS =================
  private editFields() {

    const formGroup = this.userForm as FormGroup;

    Object.keys(formGroup.controls).forEach(key => {

      const control = formGroup.get(key);

      // If it's a nested FormGroup (like address)
      if (control instanceof FormGroup) {

        Object.keys(control.controls).forEach(innerKey => {
          const innerControl = control.get(innerKey);

          if (innerControl && typeof innerControl.value === 'string') {
            innerControl.setValue(innerControl.value.replace(/\s+/g, ' ').trim());
          }
        });

      }
      // If it's a normal control
      else if (control && typeof control.value === 'string') {
        control.setValue(control.value.replace(/\s+/g, ' ').trim());
      }

    });

    this.userForm.patchValue({
      fullName: this.userForm.get('fullName')?.value.charAt(0).toUpperCase() + this.userForm.get('fullName')?.value.slice(1)
    });
  }

  // ================= CREATE USER =================
  private createUser(formValue: any, email: string, phone: string) {

    this.userForm.patchValue({
      fullName: this.userForm.get('fullName')?.value.charAt(0).toUpperCase() + this.userForm.get('fullName')?.value.slice(1)
    });
    this.accountForm.patchValue({
      PIN: new Date(this.userForm.get('dateOfBirth')?.value).getFullYear()

    });

    this.userService.createUser(formValue).subscribe({
      next: () => {
        this.username = this.userForm.get('fullName')?.value;
        this.toaster.success('User added successfully');

        this.getUserIdAndCreateAccount(phone, email);
      },
      error: () => {
        this.submitted = false;
        this.toaster.error('User creation failed');
      }
    });
  }

  // ================= GET USER ID =================
  private getUserIdAndCreateAccount(phone: string, email: string) {

    this.userService.getUserId(phone, email).subscribe({

      next: (userId: any) => {

        if (userId <= 0) {
          this.toaster.error('Could not get User ID');
          return;
        }

        this.accountForm.patchValue({
          userId: userId,
          accountTypeId: this.userForm.get('accountTypeId')?.value
        });

        this.createAccount();
      },
      error: () => {
        this.toaster.error('Failed to fetch User ID');
      }
    });
  }

  // ================= CREATE ACCOUNT =================
  private createAccount() {
    console.log(this.accountForm.value);
    const userId = this.accountForm.get('userId')?.value;
    const branchId = this.accountForm.get('branchId')?.value;
    const accountTypeId = this.accountForm.get('accountTypeId')?.value;
    this.userService.createAccount(userId, branchId, accountTypeId).subscribe({
      next: () => {
        this.toaster.success('Account created successfully!');
        this.successMessage = true;
      },
      error: () => {
        this.toaster.error('Account creation failed');
      }
    });
  }

  onAccountTypeChange(accountTypeId: number) {
    this.accountForm.patchValue({
      accountTypeId: accountTypeId
    });
  }

  continueToKyc() {
    const requiredFields = [
      'address.doorNumber',
      'address.landMark',
      'address.street',
      'address.city',
      'address.pinCode',
      'address.district',
      'address.state',
      'address.country'
    ];

    let isValid = true;
    requiredFields.forEach(field => {
      const control = this.userForm.get(field);
      if (!control || control.invalid) {
        control?.markAsTouched();
        isValid = false;
      }
    });

    if (!isValid) {
      return;
    }
    this.showAddressForm = true;
    this.showAddressForm = false;
    this.showKycForm = true;
  }

  goBackToAddress() {
    this.showKycForm = false;
    this.showAddressForm = true;
  }

  ContinuetoLogin() {
    this.router.navigate(['/login']);
    this.submitted = false;
  }

  getAllBranches() {
    this.userService.getAllBranches().subscribe({
      next: (response: any) => {
        if (response.status) {
          const branches = response.data;
          this.branchCities = [...new Set(branches.map((b: any) => b.city))];
          this.allBranches = branches;
        }
      },
      error: (error) => {
        console.error('Error fetching branches:', error);
      }
    });
  }

  onCitySelected() {
    const selectedCity = this.branchForm.get('city')?.value;
    this.branchLocations = this.allBranches
      .filter(branch => branch.city === selectedCity)
      .map(branch => branch.branchLocation);
    this.branchForm.get('location')?.setValue('');
  }

  continueFromBranch() {
    const selectedCity = this.branchForm.get('city')?.value;
    const selectedLocation = this.branchForm.get('location')?.value;
    if (!selectedCity || !selectedLocation) {
      this.toaster.error('Please select both city and location');
      return;
    }
    const selectedBranch = this.allBranches.find(
      branch => branch.city === selectedCity && branch.branchLocation === selectedLocation
    );
    if (selectedBranch) {
      this.accountForm.patchValue({ branchId: selectedBranch.branchId });
      this.showBranchForm = false;
      this.showUserForm = true;
      console.log("Selected Branch:", selectedBranch);
    } else {
      this.toaster.error('Branch not found for selected city & location');
    }
  }


}