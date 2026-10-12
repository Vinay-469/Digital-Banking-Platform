import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface Address {
  addressId: number;
  doorNumber?: string;
  landMark?: string;
  street?: string;
  city?: string;
  pinCode?: number;
  district?: string;
  state?: string;
  country?: string;
}

export interface KycDocument {
  kycId: number;
  panNumber: string;
  adhaarNumber: string;
  profileImage?: string | null;
  submittedOn: string;
  approvedOn?: string | null;
  adhaarFile: string;
  panFile: string;
  kycStatus: boolean;
}

export interface User {
  userId: number;
  fullName: string;
  email: string;
  phone?: string;
  role?: string;
  status?: string;
  dateOfBirth?: string | null;
  gender?: string;
  dateJoined?: string | null;
  occupation?: string;
  maritalStatus?: string;
  password?: string;
  netbankingStatus: boolean;
  addressId?: number | null;
  address?: Address;
  kycId?: number | null;
  kyc?: KycDocument;
}

export interface Branch {
  branchId: number;
  branchName: string;
  branchCode: string;
  branchLocation: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  contactNumber: string;
  email: string;
  ifscCode: string;
  openingDate: string | null;
  numEmployees: number | null;
  isActive: boolean | null;
}

export interface AccountType {
  accountTypeId: number | null;
  accountTypeName: string | null;
  interestRate: number | null;
  overdraftLimit: number | null;
  threshold: number | null;
}

export interface Account {
  accountId?: number;
  accountNumber?: number;
  balance: number;
  accountStatus: number;
  createdOn?: Date;
  createdBy: string;
  modifiedOn?: Date | null;
  modifiedBy?: string | null;
  customThreshold?: number | null;
  isLocked?: number;
  closingDate?: Date | null;
  userId: number;
  user: User;
  branchId: number;
  // branch: Branch;
  accountTypeId: number;
  accountType: AccountType;
  pin: number;
}

export interface Transaction {
  transactionId: number;
  accountId: number;
  account?: Account;
  amount: number;
  transactionDate: string;
  status: string | null;
  referenceAccountId?: number | null;
  referenceAccount?: Account;
  transactionType: boolean;
}

export interface DebitCardApplication {
  applicationId: number;
  accountId: number;
  account?: Account;
  communicationAddress: string;
  appliedDate: string;
  approvedDate?: string | null;
  applicationStatus: string;
  cardType: string;
}

export interface Card {
  cardId: number;
  userId: number;
  accountId: number;
  account: Account;
  cardTypeId: number;
  cardType?: CardType;
  cardNumber: number;
  issueDate: string;
  expiryDate: string;
  cvv?: number;
  status: number;
  withdrawLimit?: number;
  availableCredit?: number;
  pin?: number;
}

export interface CardType {
  cardTypeId: number;
  cardTypeName: string;
  network: string;
  defaultLimit?: number;
  maxLimit: number;
}

export interface AccountTypeDto {
  accountTypeId: number;
  accountTypeName: string;
}

export interface AccountDetailsDto {
  accountId: number;
  accountNumber: number | null;
  balance: number | null;
  accountStatus: number;
  isLocked: number | null;
  createdOn: string | null;
  createdBy: string | null;
  closingDate: string | null;
  threshold: number | null;
  userId: number;
  fullName: string;
  branchId: number;
  branchName: string | null;
  ifscCode: string | null;
  city: string | null;
  accountTypeName: string | null;
  interestRate: number | null;
  customThreshold: number | null;
}

export interface Notification {
  notificationId: number;
  userId: number;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

@Injectable({
  providedIn: 'root',

})
export class UserService {
  constructor(private api: HttpClient) { }

  url = environment.apiBaseUrl;

  getPendingUsers(managerId: number | null): Observable<any[]> {
    return this.api.get<any[]>(`${this.url}/api/account/GetPendingApplications?managerId=${managerId}`);
  }

  createUser(data: any) {
    return this.api.post(`${this.url}/api/User/AddUsers`, data, { responseType: 'text' });
  }

  getAllAccountTypes() {
    return this.api.get(`${this.url}/GetAllAccountTypes`);
  }

  GetAccountDetailsByUserId(userId: number | null) {
    return this.api.get<AccountDetailsDto[]>(
      `${this.url}/api/account/GetAccountDetailsByUserId/${userId}`
    );
  }

  GetAccountByUserIdAndAccountTypeId(userId: number, accountTypeId: number) {
    return this.api.get<{ exists: boolean }>(`${this.url}/api/account/GetAccount/${userId}&${accountTypeId}`);
  }

  getAvailableAccountTypes(userId: number | null): Observable<AccountTypeDto[]> {
    return this.api.get<AccountTypeDto[]>(`${this.url}/available/${userId}`);
  }

  getAllBranches() {
    return this.api.get(`${this.url}/api/Branches/GetAllBranches`);
  }

  getUserId(phone: string, email: string) {
    return this.api.get(`${this.url}/api/User/GetUserIdByEmail?phone=${phone}&email=${email}`);
  }

  getUserById(UserId: number | null) {
    return this.api.get(`${this.url}/api/User/GetUserById?id=${UserId}`);
  }

  checkEmailExists(email: string): Observable<{ exists: boolean }> {
    return this.api.get<{ exists: boolean }>(`${this.url}/api/User/check-email?email=${email}`);
  }

  login(username: string, password: string) {
    const params = new HttpParams()
      .set('username', username)
      .set('password', password);

    return this.api.get<{ status: boolean; token: string; userDetails: any; }>(
      `${this.url}/api/User/Login`,
      { params }
    );
  }

  ApproveOrReject(accountId: number, status: number) {
    return this.api.put(`${this.url}/api/account/ApprovalState?accountId=${accountId}&status=${status}`, {}, { responseType: 'text' });
  }

  GetBranchId(location: string, city: string) {
    return this.api.get<{ branchId: number }>(`${this.url}/api/Branches/GetBranchId?location=${location}&city=${city}`);
  }

  CheckBalance(accountId: number, PIN: string) {
    return this.api.get<{ status: boolean; data: string; message: string }>(`${this.url}/api/account/CheckBalance?accountId=${accountId}&pin=${PIN}`);
  }

  createAccount(userId: number | null, branchId: number, accountTypeId: number | null): Observable<any> {
    return this.api.post(`${this.url}/api/account/AddAccounts?userId=${userId}&branchId=${branchId}&accountTypeId=${accountTypeId}`, {}, { responseType: 'text' });
  }

  addNotification(notification: any): Observable<any> {
    return this.api.post(`${this.url}/api/Notifications/addNotification`, notification, { responseType: 'text' });
  }

  getNotificationsByUserId(userId: number): Observable<any> {
    return this.api.get(`${this.url}/api/Notifications/GetNotificationsByUserId/${userId}`);
  }

  markAsRead(notificationId: number): Observable<any> {
    return this.api.put(`${this.url}/api/Notifications/read/${notificationId}`, {}, { responseType: 'text' });
  }

  generateOtp(phone: string, email: string): Observable<any> {
    var body = { phone, email }
    return this.api.post(`${this.url}/api/otp/send?phone=${phone}&email=${email}`, body);
  }

  verifyOtp(userId: number | null, otp: number) {
    const body = { userId: userId, otp: otp };
    return this.api.post(`${this.url}/api/otp/verify`, body, { responseType: 'text' });
  }

  RegisterToNetBanking(userId: number, status: boolean) {
    return this.api.put(`${this.url}/api/User/registerToNetBanking?userId=${userId}&status=${status}`, {}, { responseType: 'text' });
  }

  getAccountByAccountNumberAndIFSCcode(accountNumber: number, IFSCcode: string) {
    return this.api.get(`${this.url}/api/account/GetByAccountAndIfsc?accountNumber=${accountNumber}&IFSCcode=${IFSCcode}`);
  }

  getAccountByAccountNumber(accountNumber: number) {
    return this.api.get(`${this.url}/api/account/GetAccountByAccountNumber?accountNumber=${accountNumber}`);
  }

  TranferAmount(fromAccount: number, toAccount: number, amount: number) {
    return this.api.post(`${this.url}/api/account/transfer?fromAccount=${fromAccount}&toAccount=${toAccount}&amount=${amount}`, {}, { responseType: 'text' });
  }

  getActiveAccounts(userId: number | null) {
    return this.api.get<any[]>(`${this.url}/api/account/active/${userId}`);
  }

  getTransactions(userId: number | null) {
    return this.api.get<any[]>(`${this.url}/api/Transactions/user/${userId}`);
  }

  getTransactionById(transactionId: number) {
    return this.api.get<Transaction>(`${this.url}/api/Transactions/${transactionId}`);
  }

  getRecentTransactionById(userId: number | null) {
    return this.api.get<Transaction[]>(`${this.url}/api/Transactions/recentTransaction?userId=${userId}`);
  }

  filter(userId: number, type: boolean, fromDate?: string | null, toDate?: string | null): Observable<any[]> {
    let params = new HttpParams()
      .set('userId', userId)
      .set('type', type);

    if (fromDate)
      params = params.set('fromDate', fromDate);

    if (toDate)
      params = params.set('toDate', toDate);

    return this.api.get<any[]>(`${this.url}/api/Transactions/filter`, { params });
  }

  search(userId: number, keyword: string): Observable<any[]> {
    const params = new HttpParams()
      .set('userId', userId)
      .set('keyword', keyword);
    return this.api.get<any[]>(`${this.url}/api/Transactions/search`, { params });
  }

  updateUserProfile(id: number | null, data: any) {
    return this.api.put(`${this.url}/api/User/UpdateUserProfile?id=${id}`, data, { responseType: 'text' });
  }

  updateAddress(id: number | null, data: any) {
    return this.api.put(`${this.url}/api/Address/update/${id}`, data, { responseType: 'text' });
  }

  ResetPassword(userId: number | null, password: string) {
    return this.api.put(`${this.url}/api/User/resetPassword?userId=${userId}&password=${password}`, {}, { responseType: 'text' });
  }

  GetUserIdByMailAndPhone(phone: string, email: string) {
    return this.api.get(`${this.url}/api/User/GetUserIdByEmail?phone=${phone}&email=${email}`)
  }

  updateThreshold(accountId: number, threshold: number) {
    return this.api.put(
      `${this.url}/api/account/setThreshold?accountId=${accountId}&threshold=${threshold}`, {}, { responseType: 'text' });
  }

  applyDebitCard(data: any) {
    return this.api.post(`${this.url}/api/Cards/apply`, data);
  }

  getPendingDebitApplications() {
    return this.api.get<any>(`${this.url}/api/Cards/pendingApplications`);
  }

  getDebitApplicationById(id: number) {
    return this.api.get<any>(`${this.url}/api/Cards/${id}`);
  }

  processCard(id: number, status: string) {
    return this.api.put(`${this.url}/api/Cards/process/${id}?status=${status}`, {}, { responseType: 'text' });
  }

  userHasActiveCards(userId: number | null): Observable<boolean> {
    return this.api.get<boolean>(`${this.url}/api/Cards/UserHasActiveCards/${userId}`);
  }

  getActiveCards(userId: number | null): Observable<Card[]> {
    return this.api.get<Card[]>(`${this.url}/api/Cards/user/activeCards?userId=${userId}`);
  }

  blockOrUnblock(cardId: number, status: number) {
    return this.api.put(
      `${this.url}/api/Cards/blockOrUnblock?cardId=${cardId}&status=${status}`,
      {},
      { responseType: 'text' })
  }

  setWithdrawLimit(cardId: number, limit: number) {
    return this.api.put(
      `${this.url}/api/Cards/set-withdraw-limit?cardId=${cardId}&limit=${limit}`,
      {},
      { responseType: 'text' });
  }

  resetPin(cardNumber: number | null, cvv: number, newPin: number) {
    return this.api.post(`${this.url}/api/Cards/reset-pin?cardNumber=${cardNumber}&cvv=${cvv}&newPin=${newPin}`, {});
  }

  updateLockStatus(accountId: number, status: number) {
    return this.api.put(
      `${this.url}/api/account/accountControl?accountId=${accountId}&status=${status}`,
      {}, { responseType: 'text' }
    );

  }
  uploadKycDocuments(kycId: number | null | undefined, files: File[]) {
    const formData = new FormData();

    files.forEach(file => {
      formData.append('documents', file); // MUST match backend parameter
    });

    return this.api.put(
      `${this.url}/api/kyc/UploadKycDocuments?kycId=${kycId}`,
      formData,
      { responseType: 'text' }
    );
  }

  getKycDocument(kycId: number | null | undefined, documentType: string) {
    return this.api.get(
      `${this.url}/api/kyc/GetKycDocuments?kycId=${kycId}&documentType=${documentType}`,
      { responseType: 'blob' }
    );
  }

  getKycStatus(kycId: number | null | undefined) {
    return this.api.get<any>(
      `${this.url}/api/kyc/IsKycDone?kycId=${kycId}`
    );
  }

  downloadMiniStatement(accountId: number, fromDate: string, toDate: string) {

    const params = new HttpParams()
      .set('accountId', accountId)
      .set('fromDate', fromDate)
      .set('toDate', toDate);

    return this.api.get(
      `${this.url}/api/Transactions/mini-statement/download`,
      {
        params,
        responseType: 'blob'
      }
    );
  }
}
