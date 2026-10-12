import { Component, OnInit } from '@angular/core';
import { AuthService } from '../Shared/Custom-Services/auth-state';
import { UserService } from '../Shared/Custom-Services/user-service';
import { Toast, ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reset-password',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss',
})
export class ResetPassword implements OnInit {

  PasswordCheck = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,15}$/;
  resetForm!: FormGroup

  constructor(
    private authState: AuthService,
    private userService: UserService,
    private toaster: ToastrService,
    private router: Router,
    private fb: FormBuilder

  ) { }

  ngOnInit() {
    this.resetForm = this.fb.group({
      password: ['', [Validators.required, Validators.pattern(this.PasswordCheck)]],
      confirmPassword: ['', [Validators.required, Validators.pattern(this.PasswordCheck)]]
    });
  if(this.authState.userId()){
    
  }
  }

  resetPassword() {
    let userId = Number(sessionStorage.getItem('userId'));
    const password = this.resetForm.value.password;
    if (password == '' || !this.PasswordCheck.test(password)) {
      this.toaster.error("enter valid password");
    }
    else {
      this.userService.ResetPassword(userId, password).subscribe({
        next: (message: string) => {
          this.toaster.success(message);
          sessionStorage.clear();
          this.router.navigate(['/login']);
          this.authState.removeToken();
        },
        error: (err) => {
          this.toaster.error(err)
        },
      })
    }
  }
}