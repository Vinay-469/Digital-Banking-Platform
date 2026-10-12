import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResetPassword } from './reset-password';
import { ReactiveFormsModule, FormsModule, FormBuilder } from '@angular/forms';
import { AuthService } from '../Shared/Custom-Services/auth-state';
import { UserService } from '../Shared/Custom-Services/user-service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { provideZonelessChangeDetection } from '@angular/core';

describe('ResetPassword Component (Standalone)', () => {
  let component: ResetPassword;
  let fixture: ComponentFixture<ResetPassword>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let toastrSpy: jasmine.SpyObj<ToastrService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['removeToken']);
    userServiceSpy = jasmine.createSpyObj('UserService', ['ResetPassword']);
    toastrSpy = jasmine.createSpyObj('ToastrService', ['success', 'error']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [ResetPassword, ReactiveFormsModule, FormsModule], // <- standalone component goes here
      providers: [
        provideZonelessChangeDetection(),
        { provide: AuthService, useValue: authServiceSpy },
        { provide: UserService, useValue: userServiceSpy },
        { provide: ToastrService, useValue: toastrSpy },
        { provide: Router, useValue: routerSpy },
        FormBuilder
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ResetPassword);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize resetForm with password and confirmPassword controls', () => {
    component.ngOnInit();
    expect(component.resetForm).toBeDefined();
    expect(component.resetForm.controls['password']).toBeDefined();
    expect(component.resetForm.controls['confirmPassword']).toBeDefined();
  });

  it('should validate PasswordCheck regex correctly', () => {
    const validPasswords = ['Aa1@5678', 'StrongPass1!', 'Test1234$'];
    const invalidPasswords = ['weakpass', 'AAAA1111', 'aaaa1111', 'Aa111111', 'Aa@aaaaa'];

    validPasswords.forEach(pwd => expect(component.PasswordCheck.test(pwd)).toBeTrue());
    invalidPasswords.forEach(pwd => expect(component.PasswordCheck.test(pwd)).toBeFalse());
  });

  it('should show error if password empty or invalid', () => {
    component.ngOnInit();
    component.resetForm.patchValue({ password: '', confirmPassword: '' });
    component.resetPassword();
    expect(toastrSpy.error).toHaveBeenCalledWith('enter valid password');

    component.resetForm.patchValue({ password: 'weakpass', confirmPassword: 'weakpass' });
    component.resetPassword();
    expect(toastrSpy.error).toHaveBeenCalledWith('enter valid password');
  });

  it('should reset password successfully', () => {
    spyOn(sessionStorage, 'getItem').and.returnValue('123');
    spyOn(sessionStorage, 'clear');
    userServiceSpy.ResetPassword.and.returnValue(of('Password updated successfully!'));

    component.ngOnInit();
    component.resetForm.patchValue({ password: 'Aa1@5678', confirmPassword: 'Aa1@5678' });

    component.resetPassword();

    expect(userServiceSpy.ResetPassword).toHaveBeenCalledWith(123, 'Aa1@5678');
    expect(toastrSpy.success).toHaveBeenCalledWith('Password updated successfully!');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    expect(authServiceSpy.removeToken).toHaveBeenCalled();
    expect(sessionStorage.clear).toHaveBeenCalled();
  });

  it('should handle ResetPassword service error', () => {
    spyOn(sessionStorage, 'getItem').and.returnValue('123');
    const errorResponse = 'Server error';
    userServiceSpy.ResetPassword.and.returnValue(throwError(() => errorResponse));

    component.ngOnInit();
    component.resetForm.patchValue({ password: 'Aa1@5678', confirmPassword: 'Aa1@5678' });

    component.resetPassword();

    expect(userServiceSpy.ResetPassword).toHaveBeenCalledWith(123, 'Aa1@5678');
    expect(toastrSpy.error).toHaveBeenCalledWith(errorResponse);
  });

  it('should default userId to 0 if sessionStorage has no value', () => {
    spyOn(sessionStorage, 'getItem').and.returnValue(null);
    userServiceSpy.ResetPassword.and.returnValue(of('Password updated!'));

    component.ngOnInit();
    component.resetForm.patchValue({ password: 'Aa1@5678', confirmPassword: 'Aa1@5678' });

    component.resetPassword();

    expect(userServiceSpy.ResetPassword).toHaveBeenCalledWith(0, 'Aa1@5678');
  });
});