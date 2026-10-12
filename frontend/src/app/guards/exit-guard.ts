import { Injectable } from '@angular/core';
import { CanDeactivate, Router } from '@angular/router';
import { AuthService } from '../Shared/Custom-Services/auth-state';
import { Home } from '../home/home';

@Injectable({
  providedIn: 'root'
})
export class ExitGuard implements CanDeactivate<Home> {

  constructor(private auth: AuthService, private router: Router) {}

  canDeactivate(): boolean {

    const isLoggedIn = !!this.auth.userId();

    // Detect navigation type
    const navigation = this.router.getCurrentNavigation();
    const trigger = navigation?.trigger;

    // Only for browser BACK/FORWARD
    if (isLoggedIn && trigger === 'popstate') {

      const confirmExit = confirm('Do you want to logout or cancel?');

      if (confirmExit) {
        this.auth.removeToken();
        sessionStorage.clear();
        localStorage.clear();
        return true;
      }

      return false;
    }

    // Allow all internal navigation
    return true;
  }
}