import { Injectable } from '@angular/core';
import { DataService } from '../../shared/services/data.service';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class LoginService {

  constructor(private _dataService: DataService) { }

  logIn(url, credentials): Observable<string> {
    return this._dataService.dataServicePost(url, credentials).map(res => <string>res);
  }

}
