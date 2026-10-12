import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import html2canvas from 'html2canvas';
import { Transaction, UserService } from '../Shared/Custom-Services/user-service';
import { AuthService } from '../Shared/Custom-Services/auth-state';
import { Router } from '@angular/router';
import * as signalR from '@microsoft/signalr';
import { ToastrService } from 'ngx-toastr';
import { SignalRService } from '../Shared/Custom-Services/signalr-service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-transaction-history',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule],
  templateUrl: './transaction-history.html',
  styleUrl: './transaction-history.scss',
})
export class TransactionHistory implements OnInit {
  transactions: Transaction[] = [];
  selectedTransaction: Transaction | null = null;
  isCopied = false;
  balance = 0;
  userId!: number;
  loadingDetails = false;
  type: boolean = false;
  fromDate?: string | null;
  toDate?: string | null;
  keyword = '';
  searchId?: number;
  private hubConnection!: signalR.HubConnection;
  isFiltered = false;
  minDate: Date = new Date();

  constructor(
    private transactionService: UserService,
    private authState: AuthService,
    private router: Router,
    private toaster: ToastrService,
    private signalR: SignalRService
  ) { }

  ngOnInit(): void {
    this.scrollToTop();
    const storedUserId = this.authState.userId();
    if (!storedUserId) {
      this.router.navigate(['/login']);
      return;
    }
    this.userId = Number(storedUserId);
    this.loadTransactions();
    // this.startSignalR();
    // this.signalR.start();
    // this.signalR.transaction$.subscribe(data => {
    //   if (data) {
    //     this.transactions.unshift(data);
    //   }
    // });
  }

  // startSignalR() {
  //   if (this.hubConnection) {
  //     this.hubConnection.stop();
  //   }
  //   this.hubConnection = new signalR.HubConnectionBuilder()
  //     .withUrl('https://localhost:7018/transactionHub', {
  //       withCredentials: true,
  //       accessTokenFactory: () => {
  //         return sessionStorage.getItem('userToken') ?? '';
  //       }
  //     })
  //     .withAutomaticReconnect([0, 2000, 5000, 10000])
  //     .configureLogging(signalR.LogLevel.Information)
  //     .build();
  //   this.hubConnection
  //     .start()
  //     .then(() => console.log('SignalR Connected'))
  //     .catch(err => console.error('SignalR Error:', err));
  //   this.hubConnection.onreconnecting(() => {
  //     console.warn('Reconnecting...');
  //   });
  //   this.hubConnection.onreconnected(() => {
  //     console.log('Reconnected');
  //   });

  //   this.hubConnection.onclose(() => {
  //     console.warn('Disconnected');
  //   });

  //   this.hubConnection.off('ReceiveTransaction');
  //   this.hubConnection.on('ReceiveTransaction', (data: Transaction) => {
  //     console.log('New Transaction:', data);
  //     if (data?.account?.userId === this.userId) {
  //       this.transactions.unshift(data);
  //       this.calculateBalance();
  //     }
  //   });
  // }

  loadTransactions() {
    this.transactionService
      .getTransactions(this.userId)
      .subscribe({
        next: (data) => {
          this.transactions = data || [];
          
          this.calculateBalance();
        },
        error: (err) => {
          console.error('Load Error:', err);
        }
      });
  }

  viewTransaction(transactionId: number) {
    this.loadingDetails = true;
    this.transactionService
      .getTransactionById(transactionId)
      .subscribe({
        next: (data) => {
          console.log('Details:', data);
          this.selectedTransaction = data;
          this.loadingDetails = false;
        },
        error: (err) => {
          console.error('View Error:', err);
          this.loadingDetails = false;
          alert('Transaction not found');
        }
      });
  }

  closeCard() {
    this.selectedTransaction = null;
    this.isCopied = false;
  }

  calculateBalance() {
    this.balance = this.transactions.reduce((total, t) => {
      return t.transactionType
        ? total + t.amount
        : total - t.amount;
    }, 0);
  }

  getStatusClass(status: string | null): string {
    return status ? status.toLowerCase() : '';
  }

  getTransactionLabel(type: boolean): string {
    return type ? 'Credit' : 'Debit';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString();
  }

  goToAccounts() {
    this.router.navigate(['MyAccounts']);
  }

  // ngOnDestroy(): void {
  //   if (this.hubConnection) {
  //     this.hubConnection
  //       .stop()
  //       .then(() => console.log('SignalR Stopped'));
  //   }
  // }

  downloadReceipt() {
  const element = document.getElementById('receiptCard');

  if (!element) {
    this.toaster.error('Receipt not found!');
    return;
  }

  const buttons = element.getElementsByClassName('no-print');

  for (let i = 0; i < buttons.length; i++) {
    (buttons[i] as HTMLElement).style.display = 'none';
  }

  html2canvas(element, {
    scale: 3,
    useCORS: true,
    backgroundColor: null
  })
  .then(canvas => {

    const imageData = canvas.toDataURL('image/png');

    const link = document.createElement('a');
    link.href = imageData;
    link.download = `receipt_${this.selectedTransaction?.transactionId}.png`;
    link.click();

  })
  .catch(() => {
    this.toaster.error('Failed to generate receipt');
  })
  .finally(() => {

    // restore buttons
    for (let i = 0; i < buttons.length; i++) {
      (buttons[i] as HTMLElement).style.display = 'block';
    }

  });
}

  copyTxnId(text: string) {
    if (this.isCopied) return;
    navigator.clipboard.writeText(text).then(() => {
      this.isCopied = true;
      this.toaster.success('Transaction ID copied!');
      setTimeout(() => {
        this.isCopied = false;
      }, 5000);
    }).catch(() => {
      this.toaster.error('Failed to copy');
    });
  }
  applyFilter() {
    const userID = this.authState.userId();
    this.userId = Number(userID);

    const fromUtc = this.fromDate
      ? new Date(this.fromDate).toISOString()
      : null;

    const toUtc = this.toDate
      ? new Date(this.toDate).toISOString()
      : null;

    this.transactionService.filter(
      this.userId,
      this.type,
      fromUtc,
      toUtc
    ).subscribe(res => this.transactions = res);
    this.filter()
    console.log('From UTC:', fromUtc);
    console.log('To UTC:', toUtc);
  }

  searchTx() {
    const userID = this.authState.userId();
    this.userId = Number(userID);
    this.transactionService.search(this.userId, this.keyword)
      .subscribe(res => this.transactions = res);
    console.log('txs', this.transactions);

  }

  resetFilter() {
    this.keyword = '';
    this.type = true;
    this.fromDate = undefined;
    this.toDate = undefined;
    // this.filter()
    this.loadTransactions();
  }

  filter() {
    this.isFiltered = !this.isFiltered
  }

  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
}