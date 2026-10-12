import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { Router, RouterLink } from "@angular/router";
import { MatTableModule } from '@angular/material/table';
import { ChangeDetectorRef } from '@angular/core';
import { UserService } from '../Shared/Custom-Services/user-service';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { timeout } from 'rxjs';
import { AuthService } from '../Shared/Custom-Services/auth-state';
import { App } from '../app';

@Component({
  selector: 'app-login-form',
  imports: [MatChipsModule, MatTableModule, MatProgressBarModule, CommonModule, MatCardModule, MatDividerModule, FormsModule, MatFormFieldModule, MatIconModule, MatInputModule, MatButtonModule, RouterLink],
  templateUrl: './login-form.html'
})
export class LoginForm {
  protected readonly title = signal('ProductsManagement');
  hide = signal(true);
  clickEvent(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }
  public username = '';
  public password = '';
  Show = true;
  hidePassword = true;
  NameCheck = /^[A-Za-z ]{5,100}$/;
  PasswordCheck = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,15}$/;

  constructor(public router: Router,
    public service: UserService,
    private cd: ChangeDetectorRef,
    private toaster: ToastrService,
    private authState: AuthService,
    private app: App
  ) { }
  
  // Validates login inputs and performs user authentication
  Submit() {

    if (this.username == '' && this.password == '') {
      this.toaster.error("Enter some inputs");
    }
    else if (!this.PasswordCheck.test(this.password) && !this.NameCheck.test(this.username)) {
      this.toaster.error("enter appropriate inputs");
    }
    else if (this.username == '' || !this.NameCheck.test(this.username)) {
      this.toaster.error("enter appropriate username");
    }
    else if (this.password == '' || !this.PasswordCheck.test(this.password)) {
      this.toaster.error("enter appropriate password");
    }
    else {
      const username = this.username;
      const password = this.password;
      this.service.login(username, password).subscribe({
        next: (token) => {
          console.log(token);
          
          if (token.status) {
            this.Show = false;
            this.authState.setAuthData(token);
            this.app.startIdleTimer();
            this.toaster.success("Login Successful", "Hurray!");
            this.router.navigate(['home']);
          } else {
            this.toaster.error("Login Failed");
            this.router.navigate(['login']);
            this.Show = true;
          }
        },
        error: (err) => {
          console.error("API call failed:", err);
          alert("Login failed due to server error");
          this.Show = true;
        }
      });
    }
  }
}