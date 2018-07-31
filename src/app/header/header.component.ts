import {Component, OnInit} from '@angular/core';
import {Router, NavigationEnd} from '@angular/router';
import {SessionService} from '../shared/services/session.service';
import {AuthService} from '../shared/services/auth.service';
import {environment} from '../../environments/environment';

@Component({
  selector: 'si-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})

export class HeaderComponent implements OnInit {
  routeParam: string;
  title: string;
  inTranscription: boolean;
  inNotFound: boolean;
  inLoginPage: boolean;
  inHomePage: boolean;
  inUploadPage: boolean;
  inLogout = false;
  btnTxt: string;
  fileName: string;
  downloadLink: string;
  envName: string;

  constructor(private router: Router, public sessionService: SessionService, public authService: AuthService) {
  }

  ngOnInit() {
    this.router.events.forEach((event: NavigationEnd) => { // fires on each route change
      if (event instanceof NavigationEnd) {
        this.routeParam = event.url;
      }
      this.inTranscription = false; // there is a boolean variable for each page. EX: InTranscription for edit/transcription page
      this.inNotFound = false; // initially we are making all the booleans false and then we are making boolean true based on the route
      this.inLoginPage = false;
      this.inHomePage = false;
      this.inUploadPage = false;
      if (this.routeParam === '/') {
        this.title = 'Speech Intel';
        this.inLogout = false;
        this.inLoginPage = true;
      } else if (this.routeParam === '/login') {
        this.title = 'Speech Intel';
        this.inLoginPage = true;
      } else if (this.routeParam === '/home') {
        this.title = 'Dashboard';
        this.btnTxt = 'UPLOAD FILES';
        this.inHomePage = true;
      } else if (this.routeParam === '/error') {
        this.title = 'Speech Intel';
      } else if (this.routeParam === '/upload') {
        this.title = 'Upload Files';
        this.btnTxt = 'DASHBOARD';
        this.inUploadPage = true;
      } else if (this.routeParam) {
        if (this.routeParam.includes('transcription')) {
          this.title = 'Edit';
          this.inTranscription = true;
          this.btnTxt = 'DASHBOARD';
          let fileGuid = this.routeParam.split('/')[3];
          fileGuid = fileGuid.replace('mp3', 'docx');
          this.downloadLink = `${environment.download_Api}/${fileGuid}`;
          this.fileName = decodeURI(this.routeParam.split('/')[2]);
        }
      } else {
        this.inNotFound = true;
        this.title = 'Page Not Found';
      }
    });
    this.envName = environment.envName;
  }

  submit(route) {
    if (this.btnTxt === 'DASHBOARD') { // if we are in home/dashboard page, it will be navigated to the upload page and vice versa.
      this.router.navigateByUrl(route);
    } else {
      this.router.navigateByUrl(route);
    }
  }

  formatUsername() { // to display the first letter in the username on the logout menu in the navbar.
    if (this.authService.getUsername()) {
      return this.authService.getUsername().charAt(0).toUpperCase();
    } else {
      return '';
    }
  }

  logout() { // clearing session storage and local storage and redirecting to login page.
    this.sessionService.logOut();
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
