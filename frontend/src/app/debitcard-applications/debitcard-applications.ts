import { Component } from '@angular/core';
import { DebitCardApplication, UserService } from '../Shared/Custom-Services/user-service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatError } from '@angular/material/input';

@Component({
  selector: 'app-debitcard-applications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './debitcard-applications.html',
  styleUrl: './debitcard-applications.scss',
})
export class DebitcardApplications {

  applications: DebitCardApplication[] = [];
  selectedApplication: DebitCardApplication | null = null;
  loading = true;
  errorMessage = '';
  detailsLoading = false;

  // Constructor - Injecting required services
  constructor(
    private userService: UserService,
    private toaster: ToastrService,
    private router: Router
  ) { }

  // Automatically executes when component is initialized
  ngOnInit() {
    this.loadApplications();
  }

  // Loads all pending debit card applications from backend
  loadApplications() {
    this.loading = true;

    this.userService.getPendingDebitApplications()
      .subscribe({
        next: (res: any) => {
          this.loading = false;
          this.applications = res?.status ? res.data : [];
        },
        error: () => {
          this.loading = false;
          this.errorMessage = 'Failed to load applications';
          this.toaster.error(this.errorMessage);
        }
      });
  }

  // Fetches complete details of selected debit application
  viewApplication(id: number) {
    this.detailsLoading = true;

    this.userService.getDebitApplicationById(id)
      .subscribe({
        next: (res: any) => {
          this.detailsLoading = false;
          this.selectedApplication = res?.status ? res.data : null;
        },
        error: () => {
          this.detailsLoading = false;
          this.toaster.error('Failed to load application details');
        }
      });
  }

  // Clears selected application and returns to list view
  backToList() {
    this.selectedApplication = null;
  }

  // Approves or Rejects debit card application
  approveCard(id: number, status: string) {

    this.userService.processCard(id, status)
      .subscribe({
        next: (res) => {
          this.ngOnInit();
          this.selectedApplication = null;
          if(status=='Approved') this.toaster.success(res);
          else this.toaster.error(res)
        },
        error: (err) => {
          this.router.navigate(['applyDebitCard']);
          this.toaster.error(err.Message);
        }
      });
  }
}
