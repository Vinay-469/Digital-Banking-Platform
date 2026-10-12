import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TransactionHistory } from './transaction-history';
import { UserService, Transaction, User, Account } from '../Shared/Custom-Services/user-service';
import { AuthService } from '../Shared/Custom-Services/auth-state';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SignalRService } from '../Shared/Custom-Services/signalr-service';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { provideZonelessChangeDetection } from '@angular/core';
import * as html2canvas from 'html2canvas';

describe('TransactionHistory', () => {

  let component: TransactionHistory;
  let fixture: ComponentFixture<TransactionHistory>;

  let userServiceSpy: jasmine.SpyObj<UserService>;
  let authSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let toastrSpy: jasmine.SpyObj<ToastrService>;

  let signalRSubject: BehaviorSubject<Transaction | null>;
  let signalRSpy: Partial<SignalRService>;

  const mockUser: User = {
    userId: 1,
    fullName: 'Test User',
    email: 'test@test.com',
    netbankingStatus: true
  };

  const mockAccount: Account = {
    userId: 1,
    balance: 1000,
    accountStatus: 1,
    createdBy: 'tester',
    pin: 1234,
    branchId: 101,
    accountTypeId: 1,
    accountType: {
      accountTypeId: 1,
      accountTypeName: 'Savings',
      interestRate: 4,
      overdraftLimit: 0,
      threshold: 500
    },
    user: mockUser
  };

  function makeTransaction(id: number, amount: number, type: boolean, status = 'Completed'): Transaction {
    return {
      transactionId: id,
      accountId: mockAccount.accountNumber ?? 1,
      account: mockAccount,
      amount,
      transactionDate: new Date().toISOString(),
      transactionType: type,
      status
    };
  }

  beforeEach(() => {

    userServiceSpy = jasmine.createSpyObj('UserService', [
      'getTransactions',
      'getTransactionById',
      'filter',
      'search'
    ]);

    authSpy = jasmine.createSpyObj('AuthService', ['userId']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    toastrSpy = jasmine.createSpyObj('ToastrService', ['success', 'error']);

    signalRSubject = new BehaviorSubject<Transaction | null>(null);

    signalRSpy = {
      transaction$: signalRSubject,
      start: jasmine.createSpy()
    };

    TestBed.configureTestingModule({
      imports: [TransactionHistory],
      providers: [
        provideZonelessChangeDetection(),
        { provide: UserService, useValue: userServiceSpy },
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ToastrService, useValue: toastrSpy },
        { provide: SignalRService, useValue: signalRSpy }
      ]
    });

    fixture = TestBed.createComponent(TransactionHistory);
    component = fixture.componentInstance;
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit loads transactions', () => {

    authSpy.userId.and.returnValue(1);

    const txs = [
      makeTransaction(1, 100, true),
      makeTransaction(2, 50, false)
    ];

    userServiceSpy.getTransactions.and.returnValue(of(txs));

    component.ngOnInit();

    expect(component.userId).toBe(1);
    expect(userServiceSpy.getTransactions).toHaveBeenCalledWith(1);
    expect(component.transactions).toEqual(txs);
  });

  it('calculateBalance sums transactions', () => {

    component.transactions = [
      makeTransaction(1, 100, true),
      makeTransaction(2, 50, false)
    ];

    component.calculateBalance();

    expect(component.balance).toBe(50);
  });

  it('viewTransaction loads details', () => {

    const tx = makeTransaction(1, 100, true);

    userServiceSpy.getTransactionById.and.returnValue(of(tx));

    component.viewTransaction(1);

    expect(component.selectedTransaction).toEqual(tx);
    expect(component.loadingDetails).toBeFalse();
  });

  it('closeCard resets state', () => {

    component.selectedTransaction = makeTransaction(1, 100, true);
    component.isCopied = true;

    component.closeCard();

    expect(component.selectedTransaction).toBeNull();
    expect(component.isCopied).toBeFalse();
  });

  it('getTransactionLabel works', () => {

    expect(component.getTransactionLabel(true)).toBe('Credit');
    expect(component.getTransactionLabel(false)).toBe('Debit');

  });

  it('scrollToTop works', () => {

    const spy = spyOn(window, 'scrollTo');

    component.scrollToTop();

    expect(spy).toHaveBeenCalled();

  });

  it('copyTxnId success', async () => {

    spyOn(navigator.clipboard, 'writeText').and.returnValue(Promise.resolve());

    component['toaster'] = toastrSpy;

    await component.copyTxnId('TX123');

    expect(toastrSpy.success).toHaveBeenCalledWith('Transaction ID copied!');

  });

  it('copyTxnId failure', (done) => {

    spyOn(navigator.clipboard, 'writeText')
      .and.returnValue(Promise.reject());

    component['toaster'] = toastrSpy;

    component.copyTxnId('TX123');

    setTimeout(() => {
      expect(toastrSpy.error).toHaveBeenCalledWith('Failed to copy');
      done();
    }, 0);

  });

  it('searchTx updates transactions', () => {

    authSpy.userId.and.returnValue(1);

    const result = [makeTransaction(1, 100, true)];

    userServiceSpy.search.and.returnValue(of(result));

    component.keyword = 'test';

    component.searchTx();

    expect(component.transactions).toEqual(result);

  });

  it('filter toggle', () => {

    component.filter();
    expect(component.isFiltered).toBeTrue();

    component.filter();
    expect(component.isFiltered).toBeFalse();

  });

  it('applyFilter works', () => {

    authSpy.userId.and.returnValue(1);

    const result = [makeTransaction(1, 100, true)];

    userServiceSpy.filter.and.returnValue(of(result));

    component.fromDate = '2026-03-01';
    component.toDate = '2026-03-05';

    component.applyFilter();

    expect(component.transactions).toEqual(result);

  });

  it('downloadReceipt generates receipt', (done) => {

    const element = document.createElement('div');
    element.id = 'receiptCard';

    const btn = document.createElement('button');
    btn.className = 'no-print';
    element.appendChild(btn);

    spyOn(document, 'getElementById').and.returnValue(element);

    const canvas = document.createElement('canvas');
    spyOn(canvas, 'toDataURL').and.returnValue('data:image/png');

    // mock html2canvas
    (window as any).html2canvas = jasmine.createSpy()
      .and.returnValue(Promise.resolve(canvas));

    const originalCreate = document.createElement.bind(document);

    spyOn(document, 'createElement').and.callFake((tag: string) => {

      if (tag === 'a') {
        return {
          href: '',
          download: '',
          click: jasmine.createSpy('click')
        } as any;
      }

      return originalCreate(tag);
    });

    component.selectedTransaction = makeTransaction(1, 100, true);

    component.downloadReceipt();

    setTimeout(() => {
      expect(btn.style.display).toBe('block');
      done();
    }, 0);

  });

  it('downloadReceipt shows error if element missing', () => {

    spyOn(document, 'getElementById').and.returnValue(null);

    component['toaster'] = toastrSpy;

    component.downloadReceipt();

    expect(toastrSpy.error).toHaveBeenCalledWith('Receipt not found!');

  });

  it('redirects to login if userId missing', () => {

    authSpy.userId.and.returnValue(null);

    component.ngOnInit();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);

  });

  it('getStatusClass works', () => {

    expect(component.getStatusClass('Completed')).toBe('completed');
    expect(component.getStatusClass(null)).toBe('');

  });

  it('formatDate works', () => {

    const result = component.formatDate('2026-03-05T00:00:00Z');

    expect(result).toContain('2026');

  });

  it('goToAccounts navigates', () => {

    component.goToAccounts();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['MyAccounts']);

  });

  it('resetFilter should reset filters and reload transactions', () => {

  component.keyword = 'test';
  component.type = false;
  component.fromDate = '2026-03-01';
  component.toDate = '2026-03-05';

  const filterSpy = spyOn(component, 'filter');
  const loadSpy = spyOn(component, 'loadTransactions');

  component.resetFilter();

  expect(component.keyword).toBe('');
  expect(component.type).toBeTrue();
  expect(component.fromDate).toBeUndefined();
  expect(component.toDate).toBeUndefined();

  expect(filterSpy).toHaveBeenCalled();
  expect(loadSpy).toHaveBeenCalled();

});

it('viewTransaction should handle error when transaction not found', () => {

  spyOn(window, 'alert');

  userServiceSpy.getTransactionById.and.returnValue(
    throwError(() => new Error('Not found'))
  );

  component.viewTransaction(99);

  expect(component.loadingDetails).toBeFalse();
  expect(window.alert).toHaveBeenCalledWith('Transaction not found');

});

it('loadTransactions should handle error from service', () => {

  spyOn(console, 'error');

  userServiceSpy.getTransactions.and.returnValue(
    throwError(() => new Error('Load failed'))
  );

  component.userId = 1;

  component.loadTransactions();

  expect(console.error).toHaveBeenCalledWith(
    'Load Error:',
    jasmine.any(Error)
  );

});
it('copyTxnId should return immediately if already copied', () => {
  component.isCopied = true;

  const clipboardSpy = spyOn(navigator.clipboard, 'writeText');

  component.copyTxnId('TX123');

  // Early return should prevent clipboard call
  expect(clipboardSpy).not.toHaveBeenCalled();
});

it('copyTxnId should set isCopied true and reset after timeout', (done) => {
  component.isCopied = false;
  component['toaster'] = toastrSpy;

  spyOn(navigator.clipboard, 'writeText').and.returnValue(Promise.resolve());

  component.copyTxnId('TX123');

  // Immediately after writeText resolves, isCopied should be true
  setTimeout(() => {
    expect(component.isCopied).toBeTrue();
    expect(toastrSpy.success).toHaveBeenCalledWith('Transaction ID copied!');

    // Wait for 5 seconds (simulate timeout) to reset
    setTimeout(() => {
      expect(component.isCopied).toBeFalse();
      done();
    }, 5000);

  }, 0);
});
});