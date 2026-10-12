import { Routes } from '@angular/router';
import { Register } from './register/register';
import { RegistationForms } from './registation-forms/registation-forms';
import { LoginForm } from './login-form/login-form';
import { Home } from './home/home';
import { MyAccounts } from './my-accounts/my-accounts';
import { Cards } from './cards/cards';
import { NetBanking } from './net-banking/net-banking';
import { BankTranfer } from './bank-tranfer/bank-tranfer';
import { TransactionHistory } from './transaction-history/transaction-history';
import { Profile } from './profile/profile';
import { ResetPassword } from './reset-password/reset-password';
import { DebitcardApplications } from './debitcard-applications/debitcard-applications';
import { MyCards } from './my-cards/my-cards';
import { UploadKycDocuments } from './upload-kyc-documents/upload-kyc-documents';
import { ViewKycDocuments } from './view-kyc-documents/view-kyc-documents';
import { EmiCalculator } from './emi-calculator/emi-calculator';
import { ExpenseTracker } from './expense-tracker/expense-tracker';
import { Notifications } from './notifications/notifications';
import { ExitGuard } from './guards/exit-guard';

export const routes: Routes = [
     { path: 'home', component: Home ,canDeactivate: [ExitGuard]},
     { path: '', pathMatch: 'full', component: Home , canDeactivate:[ExitGuard]},
     { path: 'register', component: Register },
     { path: 'registrationForms', component: RegistationForms },
     { path: 'login', component: LoginForm },
     { path: 'reset', component: NetBanking,data:{isReset:true} },
     { path: 'cards', component: Cards},
     { path: 'netbanking', component:NetBanking,data:{isReset:false}},
     { path: 'bankTranfer', component:BankTranfer},
     { path: 'applyDebitCard',component:DebitcardApplications},
     { path: 'uploadKycDocuments', component: UploadKycDocuments},
     { path: 'my-cards', component: MyCards},
     { path: 'emiCalculator' , component : EmiCalculator},
     { path: 'MyAccounts', component: MyAccounts },
     { path: 'viewKycDocuments', component: ViewKycDocuments},
     { path: 'history', component: TransactionHistory},
     { path: 'profile', component: Profile},
     { path: 'resetPassword',component:ResetPassword},
     { path: 'expenseTracker',component:ExpenseTracker},
     { path: 'notifications',component:Notifications},
     ];