import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NetBanking } from './net-banking';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgOtpInputModule } from 'ng-otp-input';
import { UserService } from '../Shared/Custom-Services/user-service';
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../Shared/Custom-Services/auth-state';
import { of, throwError } from 'rxjs';
import { provideZonelessChangeDetection } from '@angular/core';

describe('NetBanking', () => {
  let component: NetBanking;
  let fixture: ComponentFixture<NetBanking>;

  let otpServiceSpy: jasmine.SpyObj<UserService>;
  let toasterSpy: jasmine.SpyObj<ToastrService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let authStateSpy: jasmine.SpyObj<AuthService>;

  const routeStub: Partial<ActivatedRoute> = {
    snapshot: { data: { isReset: true } } as any
  };

  beforeEach(async () => {
    otpServiceSpy = jasmine.createSpyObj('UserService', ['generateOtp', 'verifyOtp', 'RegisterToNetBanking']);
    toasterSpy = jasmine.createSpyObj('ToastrService', ['success', 'error', 'warning']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    authStateSpy = jasmine.createSpyObj('AuthService', [], { netbankingStatus: { set: jasmine.createSpy() } });

    await TestBed.configureTestingModule({
      imports: [NetBanking, CommonModule, ReactiveFormsModule, NgOtpInputModule],
      providers: [
        provideZonelessChangeDetection(),
        { provide: UserService, useValue: otpServiceSpy },
        { provide: ToastrService, useValue: toasterSpy },
        { provide: Router, useValue: routerSpy },
        { provide: AuthService, useValue: authStateSpy },
        { provide: ActivatedRoute, useValue: routeStub }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NetBanking);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should warn on invalid form when sending OTP', () => {
    component.netBankingForm.controls['email'].setValue('');
    component.netBankingForm.controls['mobile'].setValue('');
    component.sendOtp();
    expect(toasterSpy.warning).toHaveBeenCalledWith('Enter valid details');
  });

  it('should handle OTP generation success', () => {
    component.netBankingForm.controls['email'].setValue('a@b.com');
    component.netBankingForm.controls['mobile'].setValue('123456');
    const otpResp = { id: 1, otp: '1234' };
    otpServiceSpy.generateOtp.and.returnValue(of(otpResp));

    component.sendOtp();

    expect(component.isOtp).toBeTrue();
    expect(component.isOtpSent).toBeTrue();
    expect(component.userId).toBe(1);
    expect(toasterSpy.success).toHaveBeenCalled();
  });

  it('should handle OTP generation with null response', () => {
    component.netBankingForm.controls['email'].setValue('a@b.com');
    component.netBankingForm.controls['mobile'].setValue('123456');
    otpServiceSpy.generateOtp.and.returnValue(of(null));

    component.sendOtp();

    expect(toasterSpy.warning).toHaveBeenCalledWith('Invalid details');
  });

  it('should handle OTP response without otp field', () => {
    component.netBankingForm.controls['email'].setValue('a@b.com');
    component.netBankingForm.controls['mobile'].setValue('123456');
    otpServiceSpy.generateOtp.and.returnValue(of({ id: 1, otp: null, message: 'No OTP' }));

    component.sendOtp();

    expect(toasterSpy.error).toHaveBeenCalledWith('No OTP');
  });

  it('should handle OTP API error', () => {
    component.netBankingForm.controls['email'].setValue('a@b.com');
    component.netBankingForm.controls['mobile'].setValue('123456');
    otpServiceSpy.generateOtp.and.returnValue(throwError({ message: 'Server error' }));

    component.sendOtp();

    expect(toasterSpy.error).toHaveBeenCalledWith('Server error');
  });

  it('should update otpValue on change', () => {
    component.onOtpChange('5678');
    expect(component.otpValue).toBe('5678');
  });

  it('should warn if OTP length invalid', () => {
    component.otpValue = '12';
    component.verifyOtp();
    expect(toasterSpy.warning).toHaveBeenCalledWith('Enter valid OTP');
  });

  it('should verify OTP and navigate to resetPassword if isReset', () => {
    component.isReset = true;
    component.userId = 1;
    component.otpValue = '1234';
    component.netBankingForm.controls['email'].setValue('a@b.com');
    component.netBankingForm.controls['mobile'].setValue('123456');
    otpServiceSpy.verifyOtp.and.returnValue(of('OTP Verified'));

    component.verifyOtp();

    expect(toasterSpy.success).toHaveBeenCalledWith('OTP Verified');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['resetPassword']);
    expect(sessionStorage.getItem('userId')).toBe('1');
  });

  it('should verify OTP and register if not isReset', () => {
    component.isReset = false;
    component.userId = 1;
    component.otpValue = '1234';
    component.netBankingForm.controls['email'].setValue('a@b.com');
    component.netBankingForm.controls['mobile'].setValue('123456');
    otpServiceSpy.verifyOtp.and.returnValue(of('OTP Verified'));
    otpServiceSpy.RegisterToNetBanking.and.returnValue(of('Registered'));

    component.verifyOtp();

    expect(toasterSpy.success).toHaveBeenCalledWith('OTP Verified');
    expect(authStateSpy.netbankingStatus.set).toHaveBeenCalledWith(true);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['bankTranfer']);
  });

  it('should handle RegisterToNetBanking error', () => {
    component.isReset = false;
    component.userId = 1;
    component.otpValue = '1234';
    component.netBankingForm.controls['email'].setValue('a@b.com');
    component.netBankingForm.controls['mobile'].setValue('123456');
    otpServiceSpy.verifyOtp.and.returnValue(of('OTP Verified'));
    otpServiceSpy.RegisterToNetBanking.and.returnValue(throwError({}));

    component.verifyOtp();

    expect(toasterSpy.error).toHaveBeenCalledWith('Failed to update user status');
  });

  it('should handle OTP verification error with error.message', () => {
    component.userId = 1;
    component.otpValue = '1234';
    component.netBankingForm.controls['email'].setValue('a@b.com');
    component.netBankingForm.controls['mobile'].setValue('123456');
    otpServiceSpy.verifyOtp.and.returnValue(throwError({ error: 'OTP failed' }));

    component.verifyOtp();

    expect(toasterSpy.error).toHaveBeenCalledWith('OTP failed');
  });

  it('should handle OTP verification error without error.message', () => {
    component.userId = 1;
    component.otpValue = '1234';
    component.netBankingForm.controls['email'].setValue('a@b.com');
    component.netBankingForm.controls['mobile'].setValue('123456');
    otpServiceSpy.verifyOtp.and.returnValue(throwError({}));

    component.verifyOtp();

    expect(toasterSpy.error).toHaveBeenCalledWith('OTP verification failed');
  });

  it('should start OTP timer and clear existing timer', () => {
    component.timer = 123 as any;
    spyOn(window, 'clearInterval');
    spyOn(window, 'setInterval').and.callFake(() => 999 as any);
    component.startOtpTimer();
    expect(clearInterval).toHaveBeenCalledWith(123);
    expect(component.timer).toBe(999 as any);
  });

  it('should return early from sendOtp if isOtpSent is true', () => {
    component.isOtpSent = true;
    component.sendOtp();
    expect(otpServiceSpy.generateOtp).not.toHaveBeenCalled();
    expect(toasterSpy.warning).not.toHaveBeenCalled();
  });

  it('should clear timer when delayTime reaches 0', (done) => {
    component.delayTime = 1; // set small number so it reaches 0 quickly
    spyOn(window, 'clearInterval').and.callThrough();
    component.startOtpTimer();

    setTimeout(() => {
      expect(clearInterval).toHaveBeenCalledWith(component.timer);
      done();
    }, 1100);
  });
});