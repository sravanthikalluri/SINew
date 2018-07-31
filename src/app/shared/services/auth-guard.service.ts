import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, RouterStateSnapshot, Router} from '@angular/router';
import {SessionService} from './session.service';
import {AuthService} from './auth.service';

@Injectable()
export class AuthGuardService {

  constructor(private _sessionService: SessionService, private _router: Router, private _authService: AuthService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (!this._authService.isAuthenticated()) {
      this._authService.redirectUrl = state.url;
      this._router.navigate(['login']);
      return false;
    }
    return true;
  }
}
