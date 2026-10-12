import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { DebitcardApplications } from './debitcard-applications';
import { DebitCardApplication, UserService } from '../Shared/Custom-Services/user-service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { provideZonelessChangeDetection } from '@angular/core';

describe('DebitcardApplications', () => {
  let component: DebitcardApplications;
  let fixture: ComponentFixture<DebitcardApplications>;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let toasterSpy: jasmine.SpyObj<ToastrService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockApplications: DebitCardApplication[] = [
  {
    applicationId: 1,
    accountId: 101,
    account: undefined, // optional
    communicationAddress: '123 Main St, Mumbai, India',
    appliedDate: '2026-03-09',
    approvedDate: null,
    applicationStatus: 'Pending',
    cardType: 'Debit'
  },
  {
    applicationId: 2,
    accountId: 102,
    account: undefined, // optional
    communicationAddress: '456 Park Ave, Delhi, India',
    appliedDate: '2026-03-08',
    approvedDate: null,
    applicationStatus: 'Pending',
    cardType: 'Debit'
  }
];

  beforeEach(async () => {
    userServiceSpy = jasmine.createSpyObj('UserService', [
      'getPendingDebitApplications',
      'getDebitApplicationById',
      'processCard'
    ]);
    toasterSpy = jasmine.createSpyObj('ToastrService', ['success', 'error']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [DebitcardApplications],
      providers: [
        provideZonelessChangeDetection(),
        { provide: UserService, useValue: userServiceSpy },
        { provide: ToastrService, useValue: toasterSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DebitcardApplications);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit should call loadApplications', () => {
    spyOn(component, 'loadApplications');
    component.ngOnInit();
    expect(component.loadApplications).toHaveBeenCalled();
  });

  it('loadApplications should set applications on success', () => {
    userServiceSpy.getPendingDebitApplications.and.returnValue(of({ status: true, data: mockApplications }));
    component.loadApplications();
    expect(component.loading).toBeFalse();
    expect(component.applications).toEqual(mockApplications);
  });

  it('loadApplications should handle error', () => {
    userServiceSpy.getPendingDebitApplications.and.returnValue(throwError(() => new Error('Failed')));
    component.loadApplications();
    expect(component.loading).toBeFalse();
    expect(component.errorMessage).toBe('Failed to load applications');
    expect(toasterSpy.error).toHaveBeenCalledWith('Failed to load applications');
  });

  it('viewApplication should set selectedApplication on success', () => {
    const app = mockApplications[0];
    userServiceSpy.getDebitApplicationById.and.returnValue(of({ status: true, data: app }));
    component.viewApplication(app.applicationId);
    expect(component.detailsLoading).toBeFalse();
    expect(component.selectedApplication).toEqual(app);
  });

  it('viewApplication should handle error', () => {
    userServiceSpy.getDebitApplicationById.and.returnValue(throwError(() => new Error('Failed')));
    component.viewApplication(1);
    expect(component.detailsLoading).toBeFalse();
    expect(toasterSpy.error).toHaveBeenCalledWith('Failed to load application details');
  });

  it('backToList should reset selectedApplication', () => {
    component.selectedApplication = mockApplications[0];
    component.backToList();
    expect(component.selectedApplication).toBeNull();
  });

  it('approveCard should approve and call toaster success', () => {
    const app = mockApplications[0];
    userServiceSpy.processCard.and.returnValue(of('Approved successfully'));
    spyOn(component, 'ngOnInit');

    component.approveCard(app.applicationId, 'Approved');

    expect(component.selectedApplication).toBeNull();
    expect(component.ngOnInit).toHaveBeenCalled();
    expect(toasterSpy.success).toHaveBeenCalledWith('Approved successfully');
  });

  it('approveCard should reject and call toaster error', () => {
    const app = mockApplications[0];
    userServiceSpy.processCard.and.returnValue(of('Rejected due to invalid info'));
    spyOn(component, 'ngOnInit');

    component.approveCard(app.applicationId, 'Rejected');

    expect(component.selectedApplication).toBeNull();
    expect(component.ngOnInit).toHaveBeenCalled();
    expect(toasterSpy.error).toHaveBeenCalledWith('Rejected due to invalid info');
  });

  it('approveCard should handle error and navigate', () => {
    const app = mockApplications[0];
    const errorObj = { Message: 'Processing failed' };
    userServiceSpy.processCard.and.returnValue(throwError(() => errorObj));

    component.approveCard(app.applicationId, 'Approved');

    expect(routerSpy.navigate).toHaveBeenCalledWith(['applyDebitCard']);
    expect(toasterSpy.error).toHaveBeenCalledWith('Processing failed');
  });
});