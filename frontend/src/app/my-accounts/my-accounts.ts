import { Component, effect, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { Account, AccountDetailsDto, AccountTypeDto, User, UserService } from '../Shared/Custom-Services/user-service';
import { Observable, of } from 'rxjs';
import { map, catchError, startWith } from 'rxjs/operators';
import { AuthService } from '../Shared/Custom-Services/auth-state';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AfterViewInit, OnDestroy } from '@angular/core';
import { Html5Qrcode } from 'html5-qrcode';
import QRCode from 'qrcode';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-my-accounts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-accounts.html',
  styleUrl: './my-accounts.scss'
})

export class MyAccounts implements OnInit {

  selectedAccountId!: number;
  selectedAccount!: Account;
  displayAccount: null | AccountDetailsDto = null;
  pageError = '';
  thresholdForms: { [key: number]: FormGroup } = {};
  accounts: Observable<any[]> = of([]);
  userId: number | null = null;
  showPinInput: { [key: number]: boolean } = {};
  pinValue: { [key: number]: string } = {};
  balanceVisible: { [key: number]: boolean } = {};
  balanceValue: { [key: number]: string } = {};
  errorMessage: { [key: number]: string } = {};
  showThresholdCard = false;
  newThreshold: number = 0;
  threshold: number = 0;
  showPassword: boolean = false;
  accountTypes: AccountTypeDto[] = [];
  selectedAccountTypeId: number | null = null;
  showDropdown = false;
  selectedAccountTypeName = '';
  accountForm!: FormGroup;
  successMessage = false;
  branchId!: number
  user: User | null = null;
  showMiniStatement = false;
  showControlsMenu: { [key: number]: boolean } = {};
  today: string = new Date().toISOString().split('T')[0];
  miniForm = {
    accountId: 0,
    fromDate: '',
    toDate: ''
  };
  accountNumber: number | null = 0;
  ifsc: string | undefined = '';
  qrImage: string = '';
  scannedData: any = null;
  qrScanner: Html5Qrcode | null = null;

  constructor(
    private userService: UserService,
    private authState: AuthService,
    private router: Router,
    private fb: FormBuilder,
    private toaster: ToastrService,
  ) { }

  ngOnInit() {
    this.user = this.authState.user()
    console.log(this.user);
    this.userId = this.authState.userId();
    if (!this.userId) {
      this.pageError = 'User not logged in';
      this.accounts = of([]);
      return;
    }
    this.loadAccounts(this.userId);
    this.loadAccountTypes(this.userId)
    this.accountForm = this.fb.group({
      userId: [0, Validators.required],
      branchId: [0, Validators.required],
      accountTypeId: ['', Validators.required],
    });
  }


  // Loads accounts for logged-in user using signal effect
  loadAccounts(userId: number | null) {
    this.pageError = '';
    this.accounts = this.userService
      .GetAccountDetailsByUserId(userId)
      .pipe(
        map((res: any) => {
          console.log(res);
          this.branchId = res.data[0].branchId
          return res?.status ? res.data ?? [] : [];
        }),
        catchError(() => {
          this.pageError = 'Failed to load account details';
          return of([]);
        }),
        startWith([])
      );
  }

  loadAccountTypes(userId: number | null) {
    this.userService.getAvailableAccountTypes(userId)
      .subscribe({
        next: (data: any) => {
          this.accountTypes = data.data;
        },
        error: () => {
          this.errorMessage = 'Failed to load account types';
        }
      });
  }

  onAccountTypeChange() {
    const selected = this.accountTypes.find(
      acc => acc.accountTypeId === this.selectedAccountTypeId
    );
    this.selectedAccountTypeName = selected ? selected.accountTypeName : '';
  }

  openDropdown() {
    this.showDropdown = true;
    this.loadAccountTypes(this.userId);
  }

  closeDropdown() {
    this.showDropdown = false;
    this.selectedAccountTypeId = 0;
  }

  createAccount() {
    console.log(this.accountForm.value);
    this.userService.createAccount(this.userId, this.branchId, this.selectedAccountTypeId).subscribe({
      next: () => {
        this.toaster.success('Application submitted successfully!');
        this.successMessage = true;
        this.closeDropdown();
        this.loadAccounts(this.userId);
        this.loadAccountTypes(this.userId);
      },
      error: () => {
        this.toaster.error('Account creation failed');
      }
    });
  }

  // Displays PIN input field for selected account
  viewBalance(accountId: number): void {
    if (this.balanceVisible[accountId]) { this.hideBalance(accountId); return; }
    this.showPinInput[accountId] = true;
    this.errorMessage[accountId] = '';
  }

  // Validates PIN and fetches account balance
  submitPin(accountId: number): void {
    const pin = this.pinValue[accountId];
    if (!pin || pin.length !== 4) {
      this.errorMessage[accountId] = 'Enter valid 4-digit PIN';
      return;
    }
    this.userService.CheckBalance(accountId, pin).subscribe({
      next: (res: any) => {
        if (res.status) {
          this.balanceValue[accountId] = res.data;
          this.balanceVisible[accountId] = true;
          this.showPinInput[accountId] = false;
          this.errorMessage[accountId] = '';
          setTimeout(() => {
            this.hideBalance(accountId);
          }, 10000);
        } else {
          this.errorMessage[accountId] = res.message || 'Invalid PIN';
        }
      },
      error: () => {
        this.errorMessage[accountId] = 'Invalid PIN or server error';
      }
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
  // Hides balance and resets PIN input for selected account
  hideBalance(accountId: number): void {
    this.balanceVisible[accountId] = false;
    this.pinValue[accountId] = '';
    this.showPinInput[accountId] = false;
  }

  // Opens threshold update UI for selected account
  setThreshold(account: any) {
    this.threshold = account.threshold;
    this.selectedAccount = account;
    this.newThreshold = account.customThreshold;
    this.showThresholdCard = true;
  }

  // Closes threshold update UI
  closeThreshold() {
    this.showThresholdCard = false;
  }

  // Updates custom threshold value for selected account
  updateThreshold(accountId: number) {
    if (!this.newThreshold || this.newThreshold <= 0) {
      this.toaster.error('Enter valid threshold');
      return;
    }
    this.userService
      .updateThreshold(accountId, this.newThreshold)
      .subscribe({
        next: (res) => {
          console.log('Success:', res);
          this.toaster.success('Threshold updated successfully');
          this.selectedAccount.customThreshold = this.newThreshold;
          this.closeThreshold();
        },
        error: (err) => {
          console.log('ERROR RESPONSE:', err);
          console.log('Status:', err.status);
          console.log('Message:', err.error);
          this.toaster.error('Failed to update threshold');
        }
      });
  }

  updateAccountStatus(account: AccountDetailsDto, status: number, balance: number) {
    if (status === 2) {
      const confirmDeactivate = window.confirm('Are you sure you want to deactivate this account?');

      if (!confirmDeactivate) {
        this.toaster.info('Deactivation cancelled');
        return;
      }
    }
    console.log(balance);

    this.userService.updateLockStatus(account.accountId, status)
      .subscribe({
        next: (res: any) => {

          if (status === 2 && balance > 0) {
            console.log(22);
            this.toaster.info(
              `
              <div>
              <b>Account Closed Successfully</b><br><br>
              Remaining Balance: ₹${balance}<br><br>
              Please visit your nearest bank branch with a valid ID proof to withdraw the remaining amount.<br><br>
              Reference ID: ACC-${account.accountId}
              </div>
              `,
              'Withdrawal Receipt',
              {
                enableHtml: true,
                timeOut: 20000
              }
            );
          } else {
            this.toaster.success(res || 'Account status updated successfully');
            this.closeDetails();
            // this.selectAccount(account);
          }
          this.loadAccounts(this.userId);
        },
        error: () => {
          this.toaster.error('Something went wrong');
        }
      });
  }

  openMiniStatement(accountId: number) {
    this.selectedAccountId = accountId;
    this.showMiniStatement = true;
  }

  closeMiniStatement() {
    this.showMiniStatement = false;
  }

  formatDate(date: string): string {
    return new Date(date).toISOString();
  }

  downloadMiniStatement() {
    const { fromDate, toDate } = this.miniForm;

    if (!fromDate || !toDate) {
      alert('Please fill all fields');
      return;
    }

    const formattedFrom = this.formatDate(fromDate);
    const formattedTo = this.formatDate(toDate);

    this.userService
      .downloadMiniStatement(this.selectedAccountId, formattedFrom, formattedTo)
      .subscribe({
        next: (blob: Blob) => {

          // Handle empty PDF
          if (blob.size === 0) {
            alert('No transactions found for selected period');
            return;
          }

          const downloadUrl = window.URL.createObjectURL(blob);

          const a = document.createElement('a');
          a.href = downloadUrl;
          a.download = `MiniStatement_${this.selectedAccountId}.pdf`;
          a.click();

          window.URL.revokeObjectURL(downloadUrl);
          this.closeMiniStatement();
        },

        error: (err) => {

          if (err.error instanceof Blob) {

            err.error.text().then((message: string) => {

              this.handleErrorMessage(err.status, message);

            });

          } else {

            this.handleErrorMessage(err.status, err.error);

          }
        }
      });
  }

  handleErrorMessage(status: number, message: string) {
    if (status === 400) {
      if (message.includes('Invalid date range')) {
        this.toaster.warning('Invalid date range');
      }
      else if (message.includes('Maximum allowed range is 90 days')) {
        this.toaster.warning('Date range should not exceed 90 days');
      }
      else if (message.includes('Account is locked')) {
        this.toaster.warning('This account is locked.');
      }
      else if (message.includes('Account is inactive')) {
        this.toaster.warning('This account is inactive.');
      }
      else if (message.includes('No transactions found')) {
        this.toaster.warning('No transactions found for selected date range');
      }
      else {
        this.toaster.warning(message);
      }
    }

    else if (status === 404) {
      alert('Account not found');
    }

    else {
      alert('Something went wrong while downloading');
    }
  }

  trackById(index: number, item: any) {
    return item.accountId;
  }

  selectAccount(acc: AccountDetailsDto) {
    console.log(acc);
    this.displayAccount = acc;
    this.accountNumber = acc.accountNumber;
    this.ifsc = acc.ifscCode?.toString();
    this.generateQR()
  }

  closeDetails() {
    this.displayAccount = null;
  }

  toggleControls(accountId: number, event: Event) {
    event.stopPropagation();
    this.showControlsMenu[accountId] = !this.showControlsMenu[accountId];
  }

  async generateQR() {
    if (!this.accountNumber || !this.ifsc) {
      alert('Enter both Account Number and IFSC');
      return;
    }

    const payload = {
      accountNumber: this.accountNumber,
      ifsc: this.ifsc
    };

    this.qrImage = await QRCode.toDataURL(JSON.stringify(payload));
  }

  @ViewChild('qrContainer') qrContainer!: ElementRef;

  downloadQR(name: string) {
    html2canvas(this.qrContainer.nativeElement).then(canvas => {

      const r = 20; // corner radius
      const c = document.createElement('canvas');
      const ctx = c.getContext('2d');

      if (!ctx) return;

      c.width = canvas.width;
      c.height = canvas.height;

      ctx.beginPath();
      ctx.roundRect(0, 0, c.width, c.height, r);
      ctx.clip();

      ctx.drawImage(canvas, 0, 0);

      const link = document.createElement('a');
      link.download = `${name}.png`;
      link.href = c.toDataURL();
      link.click();
    });
  }
}