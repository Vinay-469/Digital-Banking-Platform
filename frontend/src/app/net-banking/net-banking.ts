import { CommonModule } from '@angular/common';
import { Component, effect, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgOtpInputConfig, NgOtpInputModule } from 'ng-otp-input';
import { User, UserService } from '../Shared/Custom-Services/user-service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../Shared/Custom-Services/auth-state';
import { App } from '../app';
import { otp_configuration } from '../Shared/config/otp-config.config';

@Component({
  selector: 'app-net-banking',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgOtpInputModule
  ],
  templateUrl: './net-banking.html',
})
export class NetBanking implements OnInit {
  user: null | User = null;
  isReset = false;
  netBankingForm!: FormGroup;
  isOtp = false;
  userId: number | null = null;
  otpValue = '';
  delayTime: number = 30;
  timer!: ReturnType<typeof setInterval>;
  isOtpSent = false;
  otpConfig: NgOtpInputConfig = otp_configuration;

  constructor(
    private fb: FormBuilder,
    private otpService: UserService,
    private toaster: ToastrService,
    private router: Router,
    private authState: AuthService,
    private route: ActivatedRoute
  ) {
    this.createForm();
  }

  ngOnInit() {
    this.isReset = this.route.snapshot.data['isReset'];
    this.user = this.authState.user();

    this.createForm();

    if (this.user) {
      this.netBankingForm.patchValue({
        email: this.user.email,
        mobile: this.user.phone
      });

      this.netBankingForm.get('email')?.disable();
      this.netBankingForm.get('mobile')?.disable();
    }
  }

  // Initializes reactive form for Net Banking registration and OTP verification
  createForm() {
    this.netBankingForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      mobile: ['', [Validators.required]],
      otp: ['']
    });

  }

  // Generates and sends OTP to the provided email and mobile number
  sendOtp() {
    if (this.isOtpSent) return;

    if (this.netBankingForm.invalid) {
      this.toaster.warning('Enter valid details');
      return;
    }

    const email = this.netBankingForm.value.email;
    const phone = this.netBankingForm.value.mobile;

    this.otpService.generateOtp(phone, email)
      .subscribe({
        next: (res) => {
          this.userId = res.id;
          if (res.otp != null) {
            this.isOtp = true;
            this.isOtpSent = true;
            this.startOtpTimer();
            this.toaster.success(
              'OTP sent. Do not share it with anyone',
              res.otp,
              { timeOut: 10000 }
            );
          }
          else {
            this.toaster.error(res.message)
          }
        },
        error: (res) => {
          this.toaster.error(res.message);
        }
      });
  }

  // Starts countdown timer for OTP expiration
  startOtpTimer() {
    if (this.timer) {
      clearInterval(this.timer);
    }

    this.timer = setInterval(() => {
      this.delayTime--;
      if (this.delayTime <= 0) {
        clearInterval(this.timer);
      }
    }, 1000);
  }

  // Captures OTP input value from OTP component
  onOtpChange(otp: string) {
    this.otpValue = otp;
  }

  // Verifies entered OTP and proceeds with reset or net banking registration
  verifyOtp() {
    if (this.otpValue.length !== 4) {
      this.toaster.warning('Enter valid OTP');
      return;
    }

    const otp = Number(this.otpValue);
    const email = this.netBankingForm.value.email;
    const phone = this.netBankingForm.value.mobile;

    this.otpService.verifyOtp(this.userId, otp)
      .subscribe({
        next: (res: string) => {
          this.toaster.success(res);

          if (this.isReset) {
            if (this.userId) {
              sessionStorage.setItem('userId', this.userId.toString());
            }
            this.router.navigate(['resetPassword']);
          }
          else {
            this.otpService.RegisterToNetBanking(this.userId!, true)
              .subscribe({
                next: () => {
                  this.authState.netbankingStatus.set(true);
                  this.router.navigate(['bankTranfer']);
                },
                error: () => {
                  this.toaster.error('Failed to update user status');
                }
              })
          }
        },
        error: (err) => {
          if (err.error) {
            this.toaster.error(err.error);
          } else {
            this.toaster.error('OTP verification failed');
          }
        }
      });
  }
}
