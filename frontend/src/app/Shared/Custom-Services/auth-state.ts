import { Injectable, signal } from '@angular/core';
import { User } from './user-service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {


  user = signal<User | null>(null);
  role = signal<string | null>(null);
  userName = signal<string | null>(null);
  userId = signal<number | null>(null);
  netbankingStatus = signal<boolean>(false);
  timer = signal<boolean>(false);
  hasCard = signal<boolean>(false);
  constructor() {
    this.loadAuthData(); 
  }

  setAuthData(token: any) {
    sessionStorage.setItem('userToken', JSON.stringify(token));

    this.user.set(token.userDetails);
    this.role.set(token.userDetails.role);
    this.userName.set(token.userDetails.fullName);
    this.userId.set(token.userDetails.userId);
    this.netbankingStatus.set(token.userDetails.netbankingStatus);
    this.timer.set(true);
  }

  private loadAuthData() {
    const token = sessionStorage.getItem('userToken');
    if (token) {
      const parsed = JSON.parse(token);
      this.user.set(parsed.userDetails);
      this.role.set(parsed.userDetails.role);
      this.userName.set(parsed.userDetails.fullName);
      this.userId.set(parsed.userDetails.userId);
      this.netbankingStatus.set(parsed.userDetails.netbankingStatus);
      this.timer.set(true);
    }
  }

  removeToken(){
    sessionStorage.removeItem('userToken');
    this.user.set(null);
    this.userId.set(null);
    this.role.set(null);
    this.netbankingStatus.set(false);
    this.timer.set(false);
  }

  isLoggedIn(): boolean {
    return !!this.userId();
  }
}
