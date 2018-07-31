import { Injectable } from '@angular/core';
import { DataService } from '../../shared/services/data.service';
import { environment } from '../../../environments/environment';
import 'rxjs/add/operator/map';
import { FileInfo } from '../fileInfo.interface';
import { Observable } from 'rxjs';

@Injectable()
export class FileInfoService {
  fileData: any;
  constructor(private _dataService: DataService) {}

  getFileInfo(): Observable<FileInfo[]> {
    return this._dataService.dataServiceGet(`${environment.transcription_Api}/api/file/`).map(res => <FileInfo[]>res);
  }
}
