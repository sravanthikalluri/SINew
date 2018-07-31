import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {HttpClientModule, HTTP_INTERCEPTORS} from '@angular/common/http';
import {AppRoutingModule} from './app.routing.module';
import {FileDropModule} from 'ngx-file-drop';
import {NgxPaginationModule} from 'ngx-pagination';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
// Components
import {DashboardComponent} from './dashboard/dashboard.component';
import {HeaderComponent} from './header/header.component';
import {UploadComponent} from './upload/upload.component';
import {ReadAlongComponent} from './read-along/read-along.component';
import {TranscriptionComponent} from './shared/transcription/transcription.component';
import {TranscriptionTextComponent} from './transcription-text/transcription-text.component';
import {LoginComponent} from './login/login.component';
import {HomeComponent} from './home/home.component';
import {NotFoundComponent} from './not-found/not-found.component';
import {SideBarComponent} from './read-along/side-bar/side-bar.component';

// Services
import {TranscriptService} from './read-along/shared/transcript.service';
import {TranscriptionTimetrackerService} from './shared/services/transcription-timetracker-service';
import {DataService} from './shared/services/data.service';
import {UploadService} from './shared/services/upload.service';
import {FileInfoService} from './home/shared/file-info.service';
import {SessionService} from './shared/services/session.service';
import {PreventLogInService} from './shared/services/prevent-log-in.service';
import {AuthGuardService} from './shared/services/auth-guard.service';
import {AuthService} from './shared/services/auth.service';
import {JwtModule} from '@auth0/angular-jwt';
import {TokenInterceptor} from './shared/services/token.interceptor';
import {RoleGuardService} from './shared/services/roleGuard.service';
import {LambdaTriggerService} from './shared/services/lambda-trigger.service';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
// icons library
import {faPencilAlt, faSyncAlt} from '@fortawesome/fontawesome-free-solid';
import fontawesome from '@fortawesome/fontawesome';
import {SearchPipe} from './home/shared/filter/search.pipe';
import {SelectlistComponent} from './home/selectlist/selectlist.component';
import {SortPipe} from './home/shared/filter/sort.pipe';
import {ChartComponent} from './read-along/chart/chart.component';
import {RightClickDirective} from './shared/transcription/rightClick.directive';
import {SpinnerComponent} from './shared/components/spinner/spinner.component';
import {LoginService} from './login/shared/login.service';

fontawesome.library.add(faPencilAlt);
fontawesome.library.add(faSyncAlt);

export function gettoken() {
  return localStorage.getItem('token');
}

@NgModule({
  declarations: [
    DashboardComponent,
    HeaderComponent,
    UploadComponent,
    TranscriptionTextComponent,
    TranscriptionComponent,
    ReadAlongComponent,
    HomeComponent,
    LoginComponent,
    NotFoundComponent,
    SearchPipe,
    SortPipe,
    SelectlistComponent,
    ChartComponent,
    RightClickDirective,
    SideBarComponent,
    SpinnerComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    RouterModule,
    FileDropModule,
    NgxPaginationModule,
    JwtModule.forRoot({
      config: {
        tokenGetter: gettoken,
        whitelistedDomains: ['localhost:4200', 'https://d3codgzuy94wwm.cloudfront.net', 'https://d1542gx2ogz2qv.cloudfront.net']
      }
    }),
    NgbModule.forRoot(),
    BrowserAnimationsModule
  ],
  providers: [
    UploadService,
    TranscriptService,
    TranscriptionTimetrackerService,
    DataService,
    FileInfoService,
    SessionService,
    AuthGuardService,
    PreventLogInService,
    LambdaTriggerService,
    AuthService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    },
    RoleGuardService,
    LoginService],
  bootstrap: [DashboardComponent
  ]
})

export class AppModule {
}
