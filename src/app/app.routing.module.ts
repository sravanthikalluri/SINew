import { NgModule } from '@angular/core';
import { CommonModule, } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuardService } from './shared/services/auth-guard.service';

import { UploadComponent } from './upload/upload.component';
import { HomeComponent } from './home/home.component';
import { ReadAlongComponent } from './read-along/read-along.component';
import { LoginComponent } from './login/login.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { RoleGuardService } from './shared/services/roleGuard.service';

// Routing
const appRoutes: Routes = [
  {path: '', component: LoginComponent},
  {path: 'login', component: LoginComponent},
  {path: 'home', component: HomeComponent, canActivate: [ AuthGuardService ]},
  {path: 'upload', component: UploadComponent, canActivate: [ RoleGuardService ]},
  {path: 'transcription/:fileName/:guid/:fileIndex', component : ReadAlongComponent, canActivate: [ AuthGuardService ]},
  {path: '**', component : NotFoundComponent}
];

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    RouterModule.forRoot(appRoutes, {useHash: true})
    ],
    exports: [RouterModule],
  })
export class AppRoutingModule { }
