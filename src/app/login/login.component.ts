import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {DataService} from '../shared/services/data.service';
import {AuthService} from '../shared/services/auth.service';
import * as jwt_decode from 'jwt-decode';
import {environment} from '../../environments/environment';
import {LoginService} from './shared/login.service';
import {Token} from './token.interface';

@Component({
  selector: 'si-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit {

  message: string;
  loginForm: FormGroup;
  tokenInfo: Token;
  loading: boolean;

  constructor(private router: Router,
              private _fb: FormBuilder,
              private _dataSerice: DataService,
              private _authService: AuthService,
              private _loginService: LoginService) {
    this.loginForm = this._fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  loginUser() {
    this.loading = true;
    const credentials = { // grabbing the value from the input fields
      username: this.loginForm.controls['username'].value,
      password: this.loginForm.controls['password'].value
    };

    // checking credentials to login, setting token and role for the user
    this._loginService.logIn(environment.user_Api, credentials).subscribe(data => {
        this.tokenInfo = JSON.parse(data);
        this._authService.setToken(this.tokenInfo.auth_token);
        this._authService.setUsername(credentials.username);
        this.setRole();
        this.loading = false;
        if (this._authService.redirectUrl) {
          this.router.navigateByUrl(this._authService.redirectUrl);
        } else {
          this.router.navigate(['/home']);
        }
      },
      error => {
        this.loading = false;
        if (error.status === 401) {
          this.message = 'Invalid username or password'; // setting message for invalid credetials.
        }
      });
  }

  setRole() { // setting user role
    const role = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';
    const token = this._authService.getToken();
    const tokenDecoded = jwt_decode(token);
    this._authService.setRole(tokenDecoded[role]);
  }

  ngOnInit() {
    this.loading = false;
    this.message = '';
  }
}
