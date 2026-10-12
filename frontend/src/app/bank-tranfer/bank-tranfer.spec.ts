import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BankTranfer } from './bank-tranfer';
import { UserService } from '../Shared/Custom-Services/user-service';
import { AuthService } from '../Shared/Custom-Services/auth-state';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { provideZoneChangeDetection, provideZonelessChangeDetection } from '@angular/core';

describe('BankTranfer', () => {

  let component: BankTranfer;
  let fixture: ComponentFixture<BankTranfer>;

  let userServiceSpy: jasmine.SpyObj<UserService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let toastrSpy: jasmine.SpyObj<ToastrService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {

    userServiceSpy = jasmine.createSpyObj('UserService', [
      'getActiveAccounts',
      'getAccountByAccountNumberAndIFSCcode',
      'TranferAmount'
    ]);

    authServiceSpy = jasmine.createSpyObj('AuthService', ['userId']);

    toastrSpy = jasmine.createSpyObj('ToastrService', [
      'success',
      'error',
      'warning'
    ]);

    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    authServiceSpy.userId.and.returnValue(1);

    TestBed.configureTestingModule({
      imports: [BankTranfer],
      providers: [
        provideZonelessChangeDetection(),
        { provide: UserService, useValue: userServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ToastrService, useValue: toastrSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    fixture = TestBed.createComponent(BankTranfer);
    component = fixture.componentInstance;

    userServiceSpy.getActiveAccounts.and.returnValue(of([]));

    fixture.detectChanges();
  });

  // Component creation
  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  // Forms initialization
  it('should initialize forms on init', () => {
    expect(component.transferForm).toBeDefined();
    expect(component.amountForm).toBeDefined();
  });

  // Load active accounts
  it('should load active accounts successfully', () => {

    const accounts = [
      { accountNumber: 12345, balance: 1000, customThreshold: 100 }
    ];

    userServiceSpy.getActiveAccounts.and.returnValue(of(accounts));

    component.loadActiveAccounts();

    expect(userServiceSpy.getActiveAccounts).toHaveBeenCalledWith(1);
    expect(component.activeAccounts.length).toBe(1);
  });

  // Transfer form invalid
  it('should show warning when transfer form invalid', () => {

    component.transferForm.patchValue({
      accountNumber: '',
      reEnterAccountNumber: '',
      IFSC: ''
    });

    component.submitTransfer();

    expect(toastrSpy.warning).toHaveBeenCalledWith('Fill all fields correctly');
  });

  // Account mismatch validation
  it('should show error when account numbers do not match', () => {

    component.transferForm.patchValue({
      accountNumber: '1234567890',
      reEnterAccountNumber: '9999999999',
      IFSC: 'SBIN0001'
    });

    component.submitTransfer();

    expect(toastrSpy.error).toHaveBeenCalledWith('Account numbers do not match');
  });

  // Account verification success
  it('should verify account successfully', () => {

    const response = { data: 'John Doe' };

    userServiceSpy
      .getAccountByAccountNumberAndIFSCcode
      .and.returnValue(of(response));

    component.transferForm.patchValue({
      accountNumber: '1234567890',
      reEnterAccountNumber: '1234567890',
      IFSC: 'SBIN0001'
    });

    component.submitTransfer();

    expect(component.accountHolderName).toBe('John Doe');
    expect(component.showAmountCard).toBeTrue();
    expect(component.showAccountCard).toBeFalse();
    expect(toastrSpy.success).toHaveBeenCalledWith('Account Verified');
  });

  // Invalid account verification
  it('should show error when account verification fails', () => {

    userServiceSpy
      .getAccountByAccountNumberAndIFSCcode
      .and.returnValue(of({}));

    component.transferForm.patchValue({
      accountNumber: '1234567890',
      reEnterAccountNumber: '1234567890',
      IFSC: 'SBIN0001'
    });

    component.submitTransfer();

    expect(toastrSpy.error).toHaveBeenCalledWith('Invalid Account / IFSC');
  });

  // Insufficient balance
  it('should show insufficient balance error', () => {

    component.activeAccounts = [
      { accountNumber: 11111, balance: 100, customThreshold: 50 }
    ];

    component.amountForm.patchValue({
      fromAccount: 11111,
      amount: 200
    });

    component.transferForm.patchValue({
      accountNumber: '22222'
    });

    component.submitAmount();

    expect(toastrSpy.error).toHaveBeenCalledWith('Insufficient balance');
  });

  // Threshold trigger
  it('should trigger threshold warning', () => {

    spyOn(component, 'startTimer');

    component.activeAccounts = [
      { accountNumber: 11111, balance: 200, customThreshold: 150 }
    ];

    component.amountForm.patchValue({
      fromAccount: 11111,
      amount: 100
    });

    component.transferForm.patchValue({
      accountNumber: '22222'
    });

    component.submitAmount();

    expect(component.showThresholdCard).toBeTrue();
    expect(component.startTimer).toHaveBeenCalled();
  });

  // Process transfer success
  it('should process transfer successfully', () => {

    userServiceSpy.TranferAmount.and.returnValue(of('Transfer Successful'));

    component.processTransfer(1, 2, 100);

    expect(userServiceSpy.TranferAmount).toHaveBeenCalledWith(1, 2, 100);
    expect(component.showSuccessCard).toBeTrue();
    expect(toastrSpy.success).toHaveBeenCalled();
  });

  // Process transfer failure
  it('should handle transfer error', () => {

    userServiceSpy.TranferAmount.and.returnValue(
      throwError(() => ({ error: 'Transfer failed' }))
    );

    component.processTransfer(1, 2, 100);

    expect(toastrSpy.error).toHaveBeenCalledWith('Transfer failed');
  });

  // Confirm threshold
  it('should confirm threshold and proceed transfer', () => {

    spyOn(component, 'processTransfer');

    component.pendingTransferData = {
      fromAccount: 1,
      toAccount: 2,
      amount: 100
    };

    component.confirmThreshold();

    expect(component.processTransfer).toHaveBeenCalledWith(1, 2, 100);
  });

  // Cancel threshold manually
  it('should cancel threshold manually', () => {

    component.cancelThreshold(false);

    expect(component.showCancelledCard).toBeTrue();
    expect(toastrSpy.warning).toHaveBeenCalledWith("Transaction cancelled by user");
  });

  // Cancel threshold automatically
  it('should cancel threshold automatically', () => {

    component.cancelThreshold(true);

    expect(component.showCancelledCard).toBeTrue();
    expect(toastrSpy.warning).toHaveBeenCalledWith("Transaction auto cancelled");
  });

// effect() - user not logged in
it('should redirect to login when userId is null', () => {

  authServiceSpy.userId.and.returnValue(null);

  const newFixture = TestBed.createComponent(BankTranfer);
  const newComponent = newFixture.componentInstance;

  newFixture.detectChanges(); // triggers constructor + effect

  expect(toastrSpy.error).toHaveBeenCalledWith('User not logged in');
  expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
});


// loadActiveAccounts error case
it('should show error if loading accounts fails', () => {

  userServiceSpy.getActiveAccounts.and.returnValue(
    throwError(() => new Error('API Error'))
  );

  component.loadActiveAccounts();

  expect(toastrSpy.error).toHaveBeenCalledWith('Failed to load accounts');
});

// submitTransfer API error case
it('should show verification failed error', () => {

  userServiceSpy
    .getAccountByAccountNumberAndIFSCcode
    .and.returnValue(throwError(() => new Error()));

  component.transferForm.patchValue({
    accountNumber: '1234567890',
    reEnterAccountNumber: '1234567890',
    IFSC: 'SBIN0001'
  });

  component.submitTransfer();

  expect(toastrSpy.error).toHaveBeenCalledWith('Verification failed');
});

// submitAmount invalid form
it('should show warning if amount form invalid', () => {

  component.amountForm.patchValue({
    fromAccount: '',
    amount: ''
  });

  component.submitAmount();

  expect(toastrSpy.warning).toHaveBeenCalledWith('Enter valid details');
});

// submitAmount sender account not found
it('should show error if sender account not found', () => {

  component.activeAccounts = [];

  component.amountForm.patchValue({
    fromAccount: 999,
    amount: 50
  });

  component.transferForm.patchValue({
    accountNumber: '11111'
  });

  component.submitAmount();

  expect(toastrSpy.error).toHaveBeenCalledWith('Sender account not found');
});

// submitAmount successful transfer path
it('should call processTransfer when threshold not triggered', () => {

  spyOn(component, 'processTransfer');

  component.activeAccounts = [
    { accountNumber: 1, balance: 1000, customThreshold: 100 }
  ];

  component.amountForm.patchValue({
    fromAccount: 1,
    amount: 100
  });

  component.transferForm.patchValue({
    accountNumber: '22222'
  });

  component.submitAmount();

  expect(component.processTransfer).toHaveBeenCalledWith(1, '22222', 100);
});

// goBack()
it('should navigate back to account card', () => {

  component.showAmountCard = true;

  component.goBack();

  expect(component.showAmountCard).toBeFalse();
  expect(component.showAccountCard).toBeTrue();
});

// goHome()
it('should reset cancelled card state', () => {

  component.showCancelledCard = true;

  component.goHome();

  expect(component.showCancelledCard).toBeFalse();
});

// resetForms()
it('should reset all forms and UI states', () => {

  component.accountHolderName = 'Test User';
  component.showAmountCard = true;

  component.resetForms();

  expect(component.transferForm.value.accountNumber).toBeNull();
  expect(component.showAccountCard).toBeTrue();
  expect(component.accountHolderName).toBe('');
});

// startTimer()
it('should start timer and decrease delayTime', () => {

  spyOn(window, 'setInterval').and.callFake((fn: any) => {
    fn(); 
    return 1 as any;
  });

  component.delayTime = 5;

  component.startTimer();

  expect(component.delayTime).toBe(4);
});

it('should clear interval when delayTime reaches zero', () => {

  spyOn(window, 'clearInterval');

  spyOn(window, 'setInterval').and.callFake((fn: any) => {
    fn(); // run interval once
    return 1 as any;
  });

  component.delayTime = 0;

  component.startTimer();

  expect(clearInterval).toHaveBeenCalled();
});

it('should trigger cancelThreshold when threshold timer expires', () => {

  spyOn(component, 'cancelThreshold');

  let timeoutCallback: any;

  spyOn(window, 'setTimeout').and.callFake((cb: any) => {
    timeoutCallback = cb;   // store callback
    return 1 as any;
  });

  component.activeAccounts = [
    { accountNumber: 1, balance: 100, customThreshold: 90 }
  ];

  component.amountForm.patchValue({
    fromAccount: 1,
    amount: 20
  });

  component.transferForm.patchValue({
    accountNumber: '222222'
  });

  component.submitAmount();

  // simulate timeout AFTER Angular finishes processing
  timeoutCallback();

  expect(component.cancelThreshold).toHaveBeenCalledWith(true);
});
});