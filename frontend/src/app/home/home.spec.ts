import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Home } from './home';
import { Router } from '@angular/router';
import { AuthService } from '../Shared/Custom-Services/auth-state';
import { UserService, Transaction } from '../Shared/Custom-Services/user-service';
import { of, throwError } from 'rxjs';
import { provideZonelessChangeDetection } from '@angular/core';

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;

  let routerSpy: jasmine.SpyObj<Router>;
  let authSpy: jasmine.SpyObj<AuthService>;
  let transactionSpy: jasmine.SpyObj<UserService>;

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    authSpy = jasmine.createSpyObj('AuthService', ['role', 'netbankingStatus', 'userId']);
    transactionSpy = jasmine.createSpyObj('UserService', ['getRecentTransactionById']);

    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [
        provideZonelessChangeDetection(),
        { provide: Router, useValue: routerSpy },
        { provide: AuthService, useValue: authSpy },
        { provide: UserService, useValue: transactionSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit sets role, netbankingStatus, userId and loads recent transactions', () => {
    const dummyTransactions: Transaction[] = [{ transactionId: 1, status: 'Success', transactionDate: '2026-03-09' }] as Transaction[];
    authSpy.role.and.returnValue('Admin');
    authSpy.netbankingStatus.and.returnValue(true);
    authSpy.userId.and.returnValue(123);
    transactionSpy.getRecentTransactionById.and.returnValue(of(dummyTransactions));

    component.ngOnInit();

    expect(component.role).toBe('Admin');
    expect(component.netbankingStatus).toBeTrue();
    expect(component.userId).toBe(123);
    expect(component.transactions).toEqual(dummyTransactions);
  });

  it('loadRecentTransaction sets transactions on success', () => {
    const dummyTransactions: Transaction[] = [{ transactionId: 1, status: 'Pending', transactionDate: '2026-03-09' }] as Transaction[];
    transactionSpy.getRecentTransactionById.and.returnValue(of(dummyTransactions));

    component.loadRecentTransaction(123);

    expect(component.transactions).toEqual(dummyTransactions);
    expect(transactionSpy.getRecentTransactionById).toHaveBeenCalledWith(123);
  });

  it('loadRecentTransaction sets transactions to empty array if null', () => {
    transactionSpy.getRecentTransactionById.and.returnValue(of([]));

    component.loadRecentTransaction(123);

    expect(component.transactions).toEqual([]);
  });

  it('loadRecentTransaction logs error if service fails', () => {
    const consoleSpy = spyOn(console, 'error');
    transactionSpy.getRecentTransactionById.and.returnValue(throwError('Error'));

    component.loadRecentTransaction(123);

    expect(consoleSpy).toHaveBeenCalledWith('Load Error:', 'Error');
  });

  it('navigation methods call router.navigate with correct paths', () => {
    component.goToMyAccounts();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['MyAccounts']);

    component.goToRegister();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/register']);

    component.goToLogin();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);

    component.goToNetBanking();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['netbanking']);

    component.goToTransactions();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['history']);

    component.goToBankTransfer();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['bankTranfer']);

    component.goToApplications();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['registrationForms']);
  });

  it('getStatusClass returns lowercase status or empty string', () => {
    expect(component.getStatusClass('Success')).toBe('success');
    expect(component.getStatusClass('FAIL')).toBe('fail');
    expect(component.getStatusClass(null)).toBe('');
    expect(component.getStatusClass(undefined)).toBe('');
  });

  it('formatDate returns locale date string', () => {
    const dateStr = '2026-03-09T12:00:00Z';
    const formatted = component.formatDate(dateStr);
    expect(formatted).toBe(new Date(dateStr).toLocaleDateString());
  });
});