import { Component, OnInit } from '@angular/core';
import { UserService } from '../Shared/Custom-Services/user-service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { HttpClientModule } from '@angular/common/http';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../Shared/Custom-Services/auth-state';

@Component({
  selector: 'app-registation-forms',
  imports: [CommonModule, HttpClientModule, MatTableModule, MatButtonModule, MatButtonModule, MatListModule, MatCardModule],
  templateUrl: './registation-forms.html',
  styleUrl: './registation-forms.scss',
})

export class RegistationForms implements OnInit {
  manager :number|null=null;
  pendingUsers: any[] = [];
  selectedUser: any = null;
  showTable = true;
  displayedColumns: string[] = ['name', 'phone', 'email', 'action'];
  footerColumns: string[] = ['noData'];
  constructor(private registrationService: UserService,private authState:AuthService, public router: Router, private toaster: ToastrService) { }
  dataSource = new MatTableDataSource<any>([]);

  ngOnInit(): void {
    this.manager = this.authState.userId();
    this.registrationService.getPendingUsers(this.manager).subscribe(res => {
      this.dataSource.data = res;
    });
  }

  loadPendingUsers(): void {
    this.registrationService.getPendingUsers(this.manager).subscribe({
      next: (res) => {
        this.pendingUsers = res;
      },
      error: (err) => {
        console.error('Error loading pending users', err);
      }
    });
  }

  viewDetails(user: any): void {
    this.selectedUser = user;
    this.showTable = false;
    sessionStorage.setItem('Id', this.selectedUser.userId)
  }

  closeDetails(): void {
    this.selectedUser = null;
    this.showTable = true;
  }

  updateStatus(accountId: number, status: number, userId: number, accountTypeId: number, accountType: string) {
    this.closeDetails();

    this.registrationService.ApproveOrReject(accountId, status).subscribe({
      next: (response: any) => {
        if (status === 1) {
          this.registrationService
            .GetAccountByUserIdAndAccountTypeId(userId, accountTypeId)
            .subscribe({
              next: (account: any) => {
                if (!account) {
                  console.error("Account not found, cannot send notification.");
                  return;
                }
                const notification = {
                  userId: userId,
                  type: "info",
                  message: `Your application has been approved!
                Account Number: ${account.accountNumber}
                Account Type: ${accountType} 
                Your PIN will be the year of your birth`,
                  createdAt: new Date(),
                  isRead: false
                };

                this.registrationService.addNotification(notification)
                  .subscribe({
                    next: () => this.toaster.success("Application approved and notification sent to the user"),
                    error: (err) => this.toaster.error("Error sending notification:", err)
                  });
              },
              error: (err) => console.error("Error fetching account details:", err)
            });
        }
        this.registrationService.getPendingUsers(this.manager).subscribe({
          next: (res) => {
            this.dataSource.data = res;
            console.log("Pending users:", this.dataSource?.data?.length);
          },
          error: (err) => console.error("Error loading pending users:", err)
        });
      },
      error: (err) => this.toaster.error("Error in aprroving", err)
    });
  }
}