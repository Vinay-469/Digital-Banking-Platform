import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Cards } from './cards';
import { UserService } from '../Shared/Custom-Services/user-service';
import { AuthService } from '../Shared/Custom-Services/auth-state';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { of, throwError } from 'rxjs';
import { NgForm } from '@angular/forms';
import { provideZonelessChangeDetection } from '@angular/core';

describe('Cards', () => {
  let component: Cards;
  let fixture: ComponentFixture<Cards>;

  let userServiceSpy: jasmine.SpyObj<UserService>;
  let authStateSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let toasterSpy: jasmine.SpyObj<ToastrService>;

  let mockForm: NgForm;

  beforeEach(async () => {
    userServiceSpy = jasmine.createSpyObj('UserService', ['GetAccountDetailsByUserId', 'applyDebitCard']);
    authStateSpy = jasmine.createSpyObj('AuthService', ['userId']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    toasterSpy = jasmine.createSpyObj('ToastrService', ['success', 'error', 'warning']);

    await TestBed.configureTestingModule({
      imports: [Cards],
      providers: [
        provideZonelessChangeDetection(),
        { provide: UserService, useValue: userServiceSpy },
        { provide: AuthService, useValue: authStateSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ToastrService, useValue: toasterSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Cards);
    component = fixture.componentInstance;

    // Mock form object
    mockForm = {
      invalid: false,
      control: { markAllAsTouched: jasmine.createSpy('markAllAsTouched') },
      resetForm: jasmine.createSpy('resetForm')
    } as any;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load accounts if userId exists', () => {
      authStateSpy.userId.and.returnValue(1);
      const accounts = [{ accountTypeName: 'Savings Account', accountNumber: '12345' }];
      userServiceSpy.GetAccountDetailsByUserId.and.returnValue(of({ status: true, data: accounts } as any));

      component.ngOnInit();

      expect(component.userId).toBe(1);
      expect(component.loading).toBeFalse();
      expect(component.savingsAccountNumber).toBe('12345');
      expect(component.pageError).toBe('');
    });

    it('should set pageError if no savings account found', () => {
      authStateSpy.userId.and.returnValue(1);
      const accounts = [{ accountTypeName: 'Checking', accountNumber: '99999' }];
      userServiceSpy.GetAccountDetailsByUserId.and.returnValue(of({ status: true, data: accounts } as any));

      component.ngOnInit();

      expect(component.pageError).toBe('No Savings account found');
    });

    it('should set pageError on API error', () => {
      authStateSpy.userId.and.returnValue(1);
      userServiceSpy.GetAccountDetailsByUserId.and.returnValue(throwError(() => new Error('API Error')));

      component.ngOnInit();

      expect(component.pageError).toBe('Failed to load account details');
      expect(component.loading).toBeFalse();
    });
  });

  describe('apply', () => {
    beforeEach(() => {
      component.savingsAccountNumber = '12345';
      component.selectedCardType = 'Debit';
      component.address = '123 Street';
    });

    it('should show warning if form is invalid', () => {
      (mockForm as any).invalid = true;

      component.apply(mockForm);

      expect(mockForm.control.markAllAsTouched).toHaveBeenCalled();
      expect(toasterSpy.warning).toHaveBeenCalledWith('Please enter all the required data');
    });

    it('should apply debit card successfully', () => {
      userServiceSpy.applyDebitCard.and.returnValue(of({ message: 'Success' }));

      component.apply(mockForm);

      expect(toasterSpy.success).toHaveBeenCalledWith('Success');
      expect(component.showApplyCard).toBeFalse();
      expect(component.selectedCardType).toBe('');
      expect(component.address).toBe('');
      expect(mockForm.resetForm).toHaveBeenCalled();
    });

    it('should show error if applyDebitCard fails', () => {
      userServiceSpy.applyDebitCard.and.returnValue(throwError(() => ({ error: { message: 'Fail' } })));

      component.apply(mockForm);

      expect(toasterSpy.error).toHaveBeenCalledWith('Fail');
    });

    it('should show generic error if no error message', () => {
      userServiceSpy.applyDebitCard.and.returnValue(throwError(() => ({})));

      component.apply(mockForm);

      expect(toasterSpy.error).toHaveBeenCalledWith('Something went wrong');
    });
  });

  describe('closeApply', () => {
    it('should reset form and fields', () => {
      component.showApplyCard = true;
      component.selectedCardType = 'Debit';
      component.address = 'Address';
      component.closeApply(mockForm);

      expect(component.showApplyCard).toBeFalse();
      expect(component.selectedCardType).toBe('');
      expect(component.address).toBe('');
      expect(mockForm.resetForm).toHaveBeenCalled();
    });
  });

  describe('applyDebitCard', () => {
    it('should set showApplyCard to true', () => {
      component.showApplyCard = false;
      component.applyDebitCard();
      expect(component.showApplyCard).toBeTrue();
    });
  });

  describe('applyCreditCard', () => {
    it('should log message', () => {
      spyOn(console, 'log');
      component.applyCreditCard();
      expect(console.log).toHaveBeenCalledWith('Credit card applied');
    });
  });
});