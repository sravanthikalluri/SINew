import { Injectable } from '@angular/core';
import { SessionService } from './session.service';
import { Router, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable()
export class PreventLogInService {

  constructor(private _router: Router, private _authService: AuthService) {}

  canActivate(): boolean {
    if (this._authService.isAuthenticated()) {
      return false;
    } else {
      this._router.navigate(['home']);
      return true;
    }
  }
}
