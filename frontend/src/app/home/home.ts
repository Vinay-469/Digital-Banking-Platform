import { CommonModule } from '@angular/common';
import { Component, OnInit, HostListener } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../Shared/Custom-Services/auth-state';
import { Transaction, User, UserService } from '../Shared/Custom-Services/user-service';
import { ToastrService } from 'ngx-toastr';
import { A11yModule } from "@angular/cdk/a11y";
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { SignalRService } from '../Shared/Custom-Services/signalr-service';
import { App } from '../app';

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrl:'./home.scss',
  imports: [CommonModule, RouterLink, A11yModule, FormsModule],
})

export class Home implements OnInit {

  constructor(
    private router: Router,
    public authState: AuthService,
    private transactionService: UserService,
    private toaster: ToastrService,
    private http: HttpClient,
    private signalr: SignalRService,
    private app:App
  ) { }

  transactions!: Transaction[] ;
  user: User | null = null;
  role: string | null = null;
  userId: number | null = null;
  netbankingStatus: boolean = false;
  isKycDone: boolean = false;
  latestNotification!:Notification;
  hasTransactions = false;

  ngOnInit() {
    this.role = this.authState.role();
    this.netbankingStatus = this.authState.netbankingStatus();
    this.userId = this.authState.userId();
    this.user = this.authState.user();

    if (this.userId) {
      this.loadKycStatus();
      this.loadRecentTransaction(this.userId);

      this.transactionService.userHasActiveCards(this.userId).subscribe({
        next: (result: boolean) => {
          this.authState.hasCard.set(result);
        },
        error: (err) => {
          console.error("Error checking active cards:", err);
          this.authState.hasCard.set(false);
        }
      });
    }
     this.signalr.start(this.userId);

    this.signalr.onTransaction((data: any) => {
      console.log("LIVE TX:", data);
      this.transactions.unshift(data);
    });

    this.signalr.onNotification((msg: string) => {
      alert(msg);
    });

    this.app.loadNotifications()
    this.latestNotification = this.app.notifications[0]
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    $event.returnValue = true;
  }

  canDeactivate(): boolean {
    return confirm('Do you want to logout or stay on this page?');
  }

  // ================= EXISTING METHODS =================

  loadKycStatus() {
    this.transactionService.getKycStatus(this.user?.kycId)
      .subscribe({
        next: (res) => {
          this.isKycDone = res.isKycCompleted;
          sessionStorage.setItem('kycStatus',this.isKycDone.toString());

        },
        error: () => {
        }
      });
  }

  goToMyAccounts() {
    this.router.navigate(['MyAccounts']);
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  goToNetBanking() {
    this.router.navigate(['netbanking']);
  }

  goToTransactions() {
    this.router.navigate(['history']);
  }

  goToBankTransfer() {
    this.router.navigate(['bankTranfer']);
  }

  goToKyc() {
    if (this.isKycDone) {
      this.router.navigate(['/viewKycDocuments']);
    } else {
      this.router.navigate(['/uploadKycDocuments']);
    }
  }

  goToApplications() {
    this.router.navigate(['registrationForms']);
  }

  goToEmiCalculator() {
    this.router.navigate(['emiCalculator']);
  }

  getStatusClass(status: string | null | undefined) {
    return status ? status.toLowerCase() : '';
  }

  loadRecentTransaction(userID: number | null) {
    this.transactionService
      .getRecentTransactionById(userID)
      .subscribe({
        next: (data) => {
          this.transactions = data || [];
          this.hasTransactions = this.transactions.length!=0
        },
        error: (err) => {
          console.error('Load Error:', err);
        }
      });
  }

  canExit(): boolean {
    return confirm('Do you want to logout or cancel?');
  }
}