import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyAccounts } from './my-accounts';
import { UserService } from '../Shared/Custom-Services/user-service';
import { AuthService } from '../Shared/Custom-Services/auth-state';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { of, throwError, firstValueFrom } from 'rxjs';
import { skip } from 'rxjs/operators';
import { Account } from '../Shared/Custom-Services/user-service';
import { provideZonelessChangeDetection } from '@angular/core';

describe('MyAccounts Component', () => {

  let component: MyAccounts;
  let fixture: ComponentFixture<MyAccounts>;

  let userServiceSpy: jasmine.SpyObj<UserService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let toastrSpy: jasmine.SpyObj<ToastrService>;

  const mockAccount: Account = {
    accountId: 1,
    accountNumber: 123456,
    balance: 5000,
    accountStatus: 1,
    createdBy: 'admin',
    userId: 1,
    user: {} as any,
    branchId: 1,
    accountTypeId: 1,
    accountType: {} as any,
    pin: 1234,
    customThreshold: 10000
  };

  beforeEach(async () => {

    userServiceSpy = jasmine.createSpyObj('UserService', [
      'GetAccountDetailsByUserId',
      'CheckBalance',
      'updateThreshold'
    ]);

    authServiceSpy = jasmine.createSpyObj('AuthService', ['userId']);

    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    toastrSpy = jasmine.createSpyObj('ToastrService', [
      'success',
      'error'
    ]);

    authServiceSpy.userId.and.returnValue(1);

    userServiceSpy.GetAccountDetailsByUserId.and.returnValue(
      of({ status: true, data: [mockAccount] } as any)
    );

    await TestBed.configureTestingModule({
      imports: [MyAccounts],
      providers: [
        provideZonelessChangeDetection(),
        { provide: UserService, useValue: userServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ToastrService, useValue: toastrSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MyAccounts);
    component = fixture.componentInstance;
  });

  // ----------------------------------------

  it('should create component and trigger loadAccounts from effect', () => {

  spyOn(component, 'loadAccounts');

  fixture.detectChanges();   // triggers constructor effect

  expect(component).toBeTruthy();
  expect(component.loadAccounts).toHaveBeenCalledWith(1);

});

  // ----------------------------------------

  it('should handle user not logged in', async () => {

    authServiceSpy.userId.and.returnValue(0);

    fixture = TestBed.createComponent(MyAccounts);
    component = fixture.componentInstance;

    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.pageError).toBe('User not logged in');

  });

  // ----------------------------------------

  it('should load accounts successfully', async () => {

    component.loadAccounts(1);

    const data = await firstValueFrom(
      component.accounts.pipe(skip(1))
    );

    expect(data.length).toBe(1);
    expect(data[0].accountId).toBe(1);

  });

  // ----------------------------------------

  it('should handle load accounts error', async () => {

    userServiceSpy.GetAccountDetailsByUserId.and.returnValue(
      throwError(() => new Error('error'))
    );

    component.loadAccounts(1);

    const data = await firstValueFrom(
      component.accounts.pipe(skip(1))
    );

    expect(data.length).toBe(0);

  });

  // ----------------------------------------

  it('should show PIN input', () => {

    component.viewBalance(1);

    expect(component.showPinInput[1]).toBeTrue();

  });

  // ----------------------------------------

  it('should show error for invalid pin', () => {

    component.pinValue[1] = '12';

    component.submitPin(1);

    expect(component.errorMessage[1]).toBe('Enter valid 4-digit PIN');

  });

  // ----------------------------------------

  it('should fetch balance successfully', () => {

    component.pinValue[1] = '1234';

    userServiceSpy.CheckBalance.and.returnValue(
      of({ status: true, data: '5000', message: '' })
    );

    component.submitPin(1);

    expect(component.balanceVisible[1]).toBeTrue();
    expect(component.balanceValue[1]).toBe('5000');

  });

  // ----------------------------------------

  it('should show invalid pin error', () => {

    component.pinValue[1] = '1234';

    userServiceSpy.CheckBalance.and.returnValue(
      of({ status: false, data: '', message: 'Invalid PIN' })
    );

    component.submitPin(1);

    expect(component.errorMessage[1]).toBe('Invalid PIN');

  });

  // ----------------------------------------

  it('should handle CheckBalance error', () => {

    component.pinValue[1] = '1234';

    userServiceSpy.CheckBalance.and.returnValue(
      throwError(() => new Error('server error'))
    );

    component.submitPin(1);

    expect(component.errorMessage[1]).toBe('Invalid PIN or server error');

  });

  // ----------------------------------------

  it('should hide balance', () => {

    component.balanceVisible[1] = true;

    component.hideBalance(1);

    expect(component.balanceVisible[1]).toBeFalse();

  });

  // ----------------------------------------

  it('should open threshold card', () => {

    component.setThreshold(mockAccount);

    expect(component.showThresholdCard).toBeTrue();
  });

  // ----------------------------------------

  it('should close threshold card', () => {

    component.showThresholdCard = true;

    component.closeThreshold();

    expect(component.showThresholdCard).toBeFalse();

  });

  // ----------------------------------------

  it('should show error if threshold invalid', () => {

    component.newThreshold = 0;

    component.updateThreshold(1);

    expect(toastrSpy.error).toHaveBeenCalledWith('Enter valid threshold');

  });

  // ----------------------------------------

  it('should update threshold successfully', () => {

    component.selectedAccount = mockAccount;
    component.newThreshold = 20000;

    userServiceSpy.updateThreshold.and.returnValue(of('success'));

    component.updateThreshold(1);

    expect(toastrSpy.success).toHaveBeenCalledWith(
      'Threshold updated successfully'
    );

    expect(component.selectedAccount.customThreshold).toBe(20000);

  });

  // ----------------------------------------

  it('should handle update threshold error', () => {

    component.selectedAccount = mockAccount;
    component.newThreshold = 20000;

    userServiceSpy.updateThreshold.and.returnValue(
      throwError(() => new Error('error'))
    );

    component.updateThreshold(1);

    expect(toastrSpy.error).toHaveBeenCalledWith(
      'Failed to update threshold'
    );

  });

});