import {Component, OnInit} from '@angular/core';
import {DOCUMENT} from '@angular/platform-browser';
import {Inject} from '@angular/core';
import {FileInfoService} from './shared/file-info.service';
import {Router} from '@angular/router';
import {DataService} from '../shared/services/data.service';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';
import {environment} from '../../environments/environment';
import {AuthService} from '../shared/services/auth.service';
import * as moment from 'moment';
import * as momentTz from 'moment-timezone';
import {FileInfo} from './fileInfo.interface';
import {NgbModalRef, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {LambdaTriggerService} from '../shared/services/lambda-trigger.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit {
  searchText: string;
  filesInfo: FileInfo[];
  loading = true;
  fileInfoLength: number;
  uploadedTimeArray: string[] = [];
  selectedListCount = 'All';
  linkToCopy: string;
  private dom: Document;
  txtArea: any;
  modalRef: NgbModalRef;
  curfileToDelete: string;
  curfileGuidToDelete: string;
  statusMessage: string;
  successValue = false;
  failureValue = false;

  constructor(private fileInfoService: FileInfoService,
              private modalService: NgbModal,
              private _router: Router,
              public dataService: DataService,
              @Inject(DOCUMENT) dom: Document,
              public authService: AuthService,
              private lambdaService: LambdaTriggerService) {
    this.dom = dom;
  }

  ngOnInit() {
    this.getFileInfo();
  }

  getFileInfo() {  // To get the information of the files to display in the table in the dashboard/home page.
    this.loading = true;
    this.fileInfoService.getFileInfo().subscribe(data => {
        this.dataService.downloadLinks = [];
        this.filesInfo = data;
        console.log(this.filesInfo);
        this.filesInfo.forEach(element => {
          const filedocx = element.Guid.replace('mp3', 'docx'); // we need to call the API with the guid having docx extension
          this.dataService.downloadLinks.push(`${environment.download_Api}/${filedocx}`);
        });
        this.fileInfoLength = this.filesInfo.length;
        this.createUploadedTimeArray(); // creating array containing time based on the time zone.
      },
      error => {
        console.log(error);
      },
      () => {
        this.loading = false;
      });
  }

  createUploadedTimeArray() {
    for (let i = 0; i < this.fileInfoLength; i++) {
      if (!(this.filesInfo[i].Status === 'Not Uploaded')) {
        if (this.filesInfo[i].UploadedDate) {
          const gmtDateTime = moment.utc(this.filesInfo[i].UploadedDate);
          const local = momentTz(gmtDateTime).tz('America/Los_Angeles').format('MMM DD, YYYY h:mmA'); // using moment library to format
          // let local = gmtDateTime.local().format('MMM DD, YYYY h:mmA');
          this.uploadedTimeArray.push(local);
        } else {
          this.uploadedTimeArray.push(' ');
        }
      } else {
        this.uploadedTimeArray.push(' ');
      }
    }
  }

  trackByData(file: any) { // using in the html
    return file.fileName;
  }

  editFile(Guid, FileName, Status, FileIndex) {
    if (Status === 'Completed') {
      this._router.navigate(['transcription', FileName, Guid, FileIndex]);
    }
  }

  copyTextToClipboard(text) {
    this.createAndSelectTextArea(text); // to select text
    try {
      const successful = this.dom.execCommand('copy'); // to copy text
      if (successful) {
        return true;
      }
    } catch (err) {
      console.log('Oops, unable to copy', err);
    } finally {
      this.dom.body.removeChild(this.txtArea);
    }
    return false;
  }

  createAndSelectTextArea(text) {
    this.txtArea = this.dom.createElement('textarea'); // creating a textarea to select and copy.
    this.txtArea.id = 'txt';
    this.txtArea.style.position = 'fixed';
    this.txtArea.style.top = '0';
    this.txtArea.style.left = '0';
    this.txtArea.style.opacity = '0';
    this.txtArea.value = text;
    document.body.appendChild(this.txtArea);
    this.txtArea.select();
  }

  copyToClipboard(guid, fileName, popover, FileIndex) {
    // creating URL to access edit page
    this.linkToCopy = encodeURI(`${environment.base_Url}/#/transcription/${fileName}/${guid}/${FileIndex}`);
    const result = this.copyTextToClipboard(this.linkToCopy);
    if (result) {
      setTimeout(() => {
        popover.close();
      }, 1000);
    }
  }

  getAllFilesCount(): number { // using in the html for sorting
    return this.filesInfo.length;
  }

  getProcessingFilesCount(): number { // using in the html for sorting
    return this.filesInfo.filter(item => item.Status === 'Processing').length;
  }

  getCompletedFilesCount(): number { // using in the html for sorting
    return this.filesInfo.filter(e => e.Status === 'Completed').length;
  }

  onSelectListCount(selectedRadioButtonValue: string) {
    this.selectedListCount = selectedRadioButtonValue;
  }

  onClickDeleteFile(guid, name, modal) {
    this.curfileToDelete = name;
    this.curfileGuidToDelete = guid;
    this.modalRef = this.modalService.open(modal);
  }

  deleteFile() {
    const pullParams = {
      FunctionName: `DeleteFile:${environment.envName}`,
      Payload: `{"fileGuid" : "${this.curfileGuidToDelete}"}`
    };
    const lambdaPromise = this.lambdaService.executeLambda(pullParams);
    lambdaPromise.then(data => {
      if (data.StatusCode === 200 && data.Payload === '"Success"') {
        this.successValue = true;
        this.statusMessage = 'File Deleted Successfully';
        this.setMessage('');
      } else if (data.StatusCode === 200 && data.Payload === '"Failure"') {
        this.statusMessage = 'Error deleting file';
        this.failureValue = true;
        this.setMessage('');
      }
    });
  }

  setMessage(value: string) {
    if (value !== 'retry') {
      this.close();
    }
    setTimeout(() => {
      this.successValue = false;
      this.failureValue = false;
    }, 1000);

    setTimeout(() => {
      this.getFileInfo();
    }, 2000);
  }

  close() {
    this.modalRef.close();
  }

  retryFile(watsonJobId) {
    const pullParams = {
      FunctionName: `CheckWatsonJob:${environment.envName}`,
      Payload: `{"job_id" : "${watsonJobId}"}`
    };

    const lambdaPromise = this.lambdaService.executeLambda(pullParams);
    lambdaPromise.then(data => {
      if (data.StatusCode === 200 && data.Payload === '"processing"') {
        this.statusMessage = 'File is still under process';
      }
      this.setMessage('retry');
    });
  }
}
