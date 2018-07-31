import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';
import {DataService} from '../services/data.service';
import {environment} from '../../../environments/environment';
import {HttpRequest, HttpClient, HttpEventType, HttpResponse} from '@angular/common/http';

@Injectable()
export class UploadService {

  files: string;
  url: string;
  data: any;
  fileData: any;
  fileGuid: string;
  uploading: boolean;
  uploadingSuccess: boolean;
  uploadingFailed: boolean;
  fileDuration: number;
  totalFilesLength: number;
  fileCounter: number;
  percentDone: number;

  constructor(private _dataService: DataService, private _http: HttpClient) {
  }

  private trackFile = new Subject();
  trackFile$ = this.trackFile.asObservable();

  sendFileStatus(status) {
    this.trackFile.next(status);
  }

  postFile(data, file) {
    this.uploading = true;
    return this._dataService.dataServicePost(`${environment.transcription_Api}/api/file/url`, data)
      .subscribe(item => {
          this.fileData = item;
          const req = new HttpRequest('PUT', this.fileData.Url, file, {
            reportProgress: true,
          });
          this._http.request(req).subscribe((event) => {
            // Via this API, you get access to the raw event stream.
            // Look for upload progress events.
            if (event.type === HttpEventType.UploadProgress) {
              // This is an upload progress event. Compute and show the % done:
              this.percentDone = Math.round(100 * event.loaded / event.total);
              // console.log(`File is ${this.percentDone}% uploaded.`);
            } else if (event instanceof HttpResponse) {
              this._dataService.dataServicePut(`${environment.transcription_Api}/api/file/${this.fileData.Guid}/status/2`, '')
                .subscribe((data) => {
                this.fileCounter++;
                if (this.fileCounter === this.totalFilesLength) {
                  this.uploading = false;
                  this.uploadingSuccess = true;
                  this.sendFileStatus(this.uploadingSuccess); // sending status to clear the form if uploading is success.
                }
              }, err => {
                this.uploading = false;
                this.uploadingSuccess = false;
                this.uploadingFailed = true;
                console.log(err);
              });
              // console.log('File is completely uploaded!');
            }
          }, err => {
            this.uploading = false;
            this.uploadingSuccess = false;
            this.uploadingFailed = true;
            console.log(err);
          });
        },
        err => {
          if (err) {
            console.log(err);
            this.uploading = false;
            this.uploadingSuccess = false;
            this.uploadingFailed = true;
          }
        });
  }
}
