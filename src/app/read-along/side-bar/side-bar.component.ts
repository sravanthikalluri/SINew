import {Component, OnInit, Input, EventEmitter, Output, OnChanges, OnDestroy} from '@angular/core';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {DataService} from '../../shared/services/data.service';
import {ActivatedRoute} from '@angular/router';
import {AuthService} from '../../shared/services/auth.service';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {TranscriptionTimetrackerService} from '../../shared/services/transcription-timetracker-service';
import {ISubscription} from 'rxjs/Subscription';
import {LambdaTriggerService} from '../../shared/services/lambda-trigger.service';

@Component({
  selector: 'si-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.css']
})
export class SideBarComponent implements OnChanges, OnInit, OnDestroy {

  @Input() instructions: string;
  @Input() errorWordCount: number;
  @Input() totalWordCount: number;
  modalRef: NgbModalRef;
  @Output() onSearchClick: EventEmitter<string> = new EventEmitter();
  @Output() onTagSelect: EventEmitter<string> = new EventEmitter();
  link = 'https://app.powerbi.com/view?r=eyJrIjoiZGI2YjNjZGUtNjY0Yi00MjRjLWFlNTQtODhkY2YxODc1YjU0IiwidCI6IjJjZjI3MzdlLTBiOWEtNDA1OS05MjIyLTNhMDQwOWZmZTBlMSIsImMiOjF9';
  @Input() wordTags: string[];
  tagTypes: any[] = [];
  tagTypesAvailable: boolean;
  selectedTagType: string;
  timeSubscription: ISubscription;

  constructor(private modalService: NgbModal,
              private _dataService: DataService,
              private _route: ActivatedRoute,
              private _authService: AuthService,
              private _http: HttpClient,
              private _timeTrackerService: TranscriptionTimetrackerService,
              private lambdaService: LambdaTriggerService) {
  }

  ngOnInit() {
    this.timeSubscription = this._timeTrackerService.trackTime$.subscribe(curTime => {
    });
  }

  ngOnChanges() {
    if (this.wordTags) {
      // word tags array is being created in read along component. so, we have to create the tag types as the word tags change.
      this.createTagTypesArray(this.wordTags);
    }
  }

  ngOnDestroy(): void {
    this.timeSubscription.unsubscribe();
  }

  iconsModal(modal) {
    this.modalRef = this.modalService.open(modal); // creating reference to a modal
  }

  close() {
    this.modalRef.close(); // closing the corresponding modal
  }

  searchClicked() {
    this.onSearchClick.emit('searchClicked'); // to toggle when search icon is clicked
  }

  save() {
    this._dataService.saveEditedTranscript('saveWords'); // To save transcript after editing.
  }

  analytics() {
    this._http
      .get(`${environment.transcription_Api}/api/watson/analytics/${this._route.snapshot.params.guid}/${this._authService.getUsername()}`)
      .subscribe(Response => {
        if (Response) {
          const pullParams = {
            FunctionName: `SentimentAnalysisFunction:${environment.envName}`,
            Payload: `{"plainText" : "${Response['plainText']}","textId":"${Response['textId']}"}`
          };
          const lambdaPromise = this.lambdaService.executeLambda(pullParams);
          lambdaPromise.then(data => {
            console.log(data);
          });
        }
      });
  }

  selectType(tag) {
    this.selectedTagType = tag.tagName;
    this.onTagSelect.emit(this.selectedTagType); // emitting the selected tag type
  }

  createTagTypesArray(arr) {
    this.tagTypes = [];
    const obj = {};
    let elm;
    for (let i = 0; i < arr.length; i++) { // first creating an object with tags as keys and their count as value.
      elm = arr[i];
      if (!obj[elm]) {
        obj[elm] = 1;
      } else {
        obj[elm]++;
      }
    }
    for (const key in obj) { // creating an array with tags and their count.
      if (obj.hasOwnProperty(key)) {
        const myObj = {
          tagName: key,
          count: obj[key]
        };
        this.tagTypes.push(myObj);
      }
    }
    if (this.tagTypes.length) {
      this.tagTypesAvailable = true;
    } else {
      this.tagTypesAvailable = false;
    }
  }

  openPopOver(popover) { // to cloase tags popover
    popover.close();
  }

  clearSelection() {
    this.selectedTagType = ''; // clear tags selection
    this.onTagSelect.emit('');
  }
}
