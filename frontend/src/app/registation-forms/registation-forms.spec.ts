// import { ComponentFixture, TestBed } from '@angular/core/testing';
// import { of, throwError } from 'rxjs';
// import { MatTableDataSource, MatTableModule } from '@angular/material/table';
// import { Router } from '@angular/router';
// import { ToastrService } from 'ngx-toastr';
// import { RegistationForms } from './registation-forms';
// import { User, UserService } from '../Shared/Custom-Services/user-service';
// import { CommonModule } from '@angular/common';
// import { HttpClientModule } from '@angular/common/http';
// import { MatButtonModule } from '@angular/material/button';
// import { MatListModule } from '@angular/material/list';
// import { MatCardModule } from '@angular/material/card';
// import { provideZonelessChangeDetection } from '@angular/core';

// describe('RegistationForms', () => {
//   let component: RegistationForms;
//   let fixture: ComponentFixture<RegistationForms>;
//   let userServiceSpy: jasmine.SpyObj<UserService>;
//   let routerSpy: jasmine.SpyObj<Router>;
//   let toastrSpy: jasmine.SpyObj<ToastrService>;

//   const mockUsers: User[] = [
//   {
//     userId: 1,
//     fullName: 'John Doe',
//     email: 'john@example.com',
//     phone: '1234567890',
//     netbankingStatus: true, // required
//     // optional properties can be added if needed
//   },
//   {
//     userId: 2,
//     fullName: 'Jane Smith',
//     email: 'jane@example.com',
//     phone: '0000000001',
//     netbankingStatus: false, // required
//   }
// ];

//   beforeEach(async () => {
//     userServiceSpy = jasmine.createSpyObj('UserService', [
//       'getPendingUsers',
//       'ApproveOrReject',
//       'GetAccountByUserIdAndAccountTypeId',
//       'addNotification'
//     ]);
//     routerSpy = jasmine.createSpyObj('Router', ['navigate']);
//     toastrSpy = jasmine.createSpyObj('ToastrService', ['success', 'error']);

//     await TestBed.configureTestingModule({
//       imports: [
//         CommonModule,
//         HttpClientModule,
//         MatTableModule,
//         MatButtonModule,
//         MatListModule,
//         MatCardModule,
//         RegistationForms
//       ],
//       providers: [
//         provideZonelessChangeDetection(),
//         { provide: UserService, useValue: userServiceSpy },
//         { provide: Router, useValue: routerSpy },
//         { provide: ToastrService, useValue: toastrSpy }
//       ]
//     }).compileComponents();

//     fixture = TestBed.createComponent(RegistationForms);
//     component = fixture.componentInstance;

//     spyOn(sessionStorage, 'setItem');
//     spyOn(sessionStorage, 'getItem').and.returnValue(null);

//     userServiceSpy.getPendingUsers.and.returnValue(of(mockUsers));
//     fixture.detectChanges();
//   });

//   it('should create component', () => {
//     expect(component).toBeTruthy();
//   });

//   it('ngOnInit should load pending users', () => {
//     component.ngOnInit();
//     expect(component.dataSource.data).toEqual(mockUsers);
//     expect(component.pendingUsers).toEqual(mockUsers);
//   });

//   it('loadPendingUsers should set pendingUsers', () => {
//     component.loadPendingUsers();
//     expect(component.pendingUsers).toEqual(mockUsers);
//   });

//   it('viewDetails should set selectedUser and store Id in sessionStorage', () => {
//     const user = mockUsers[0];
//     component.viewDetails(user);
//     expect(component.selectedUser).toEqual(user);
//     expect(component.showTable).toBeFalse();
//     expect(sessionStorage.setItem).toHaveBeenCalledWith('Id', user.userId.toString());
//   });

//   it('closeDetails should reset selectedUser and showTable', () => {
//     component.selectedUser = mockUsers[0];
//     component.showTable = false;
//     component.closeDetails();
//     expect(component.selectedUser).toBeNull();
//     expect(component.showTable).toBeTrue();
//   });

//   it('updateStatus should approve and send notification', () => {
//     const user = mockUsers[0];
//     const account = { accountNumber: '12345678', exists: true };

//     userServiceSpy.ApproveOrReject.and.returnValue(of());
//     userServiceSpy.GetAccountByUserIdAndAccountTypeId.and.returnValue(of(account));
//     userServiceSpy.addNotification.and.returnValue(of({}));

//     component.updateStatus(1, 1, user.userId, user.id, 'Savings');

//     expect(component.selectedUser).toBeNull();
//     expect(component.showTable).toBeTrue();
//     expect(toastrSpy.success).toHaveBeenCalledWith('Application approved and notification sent to the user');
//   });

//   it('updateStatus should handle missing account', () => {
//     const user = mockUsers[0];
//     userServiceSpy.ApproveOrReject.and.returnValue(of());
//     userServiceSpy.GetAccountByUserIdAndAccountTypeId.and.returnValue(of({ exists: false }));

//     component.updateStatus(1, 1, user.userId, user.accountTypeId, 'Savings');

//     expect(component.selectedUser).toBeNull();
//     expect(component.showTable).toBeTrue();
//     expect(toastrSpy.success).not.toHaveBeenCalled();
//   });

//   it('updateStatus should handle error in ApproveOrReject', () => {
//     const user = mockUsers[0];
//     userServiceSpy.ApproveOrReject.and.returnValue(throwError(() => new Error('Approve failed')));

//     component.updateStatus(1, 1, user.userId, user.accountTypeId, 'Savings');

//     expect(toastrSpy.error).toHaveBeenCalledWith('Failed to approve/reject application');
//   });
// });