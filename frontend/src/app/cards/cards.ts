import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Account, UserService } from '../Shared/Custom-Services/user-service';
import { AuthService } from '../Shared/Custom-Services/auth-state';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-cards',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cards.html',
  styleUrl: './cards.scss',
})
export class Cards {

  showApplyCard = false;
  selectedCardType: string = '';
  address: string = '';
  userId: number | null = null;
  loading = true;
  pageError = '';
  savingsAccountNumber: any;

  constructor(
    private userService: UserService,
    private authState: AuthService,
    private router: Router,
    private toaster: ToastrService
  ) {}

  ngOnInit() {
    this.userId = Number(this.authState.userId());
    if (this.userId) {
      this.loadAccounts(this.userId);
    }
  }

  // Loads user accounts and retrieves Savings Account number
loadAccounts(userId: number) {
  this.loading = true;
  this.pageError = '';

  this.userService.GetAccountDetailsByUserId(userId)
    .subscribe({
      next: (res: any) => {
        this.loading = false;
        const accountList = res?.status ? res.data ?? [] : [];
        const savings = accountList.find(
          (acc: any) => acc.accountTypeName === 'Savings Account'
        );
        if (savings) {
          this.savingsAccountNumber = savings.accountNumber;
        } else {
          this.pageError = 'No Savings account found';
        }
      },
      error: () => {
        this.loading = false;
        this.pageError = 'Failed to load account details';
      }
    });
}

// Submits debit card application after form validation
apply(form: NgForm) {
  if (form.invalid) {
    form.control.markAllAsTouched();
    this.toaster.warning('Please enter all the required data');
    return;
  }

  const requestBody = {
    accountNumber: this.savingsAccountNumber,
    cardType: this.selectedCardType,
    communicationAddress: this.address.trim()
  };

  this.userService.applyDebitCard(requestBody)
    .subscribe({
      next: (res: any) => {
        this.toaster.success(res.message || 'Application submitted successfully');
        this.closeApply(form);
      },
      error: (err) => {
        this.toaster.error(err.error?.message || 'Something went wrong');
      }
    });
}

// Closes application form and resets fields
closeApply(form?: NgForm) {
  this.showApplyCard = false;
  this.selectedCardType = '';
  this.address = '';
  form?.resetForm();
}

// Opens debit card application section
applyDebitCard() {
  console.log(this.savingsAccountNumber);
  if(!this.savingsAccountNumber) this.toaster.error("You don't have a savings account to apply for a debit card")
  this.showApplyCard = true;
}

// Placeholder method for credit card application
applyCreditCard() {
  console.log('Credit card applied');
}
}
