import {Component, OnInit, ViewChild, ElementRef, TemplateRef, OnDestroy, trigger, transition, style, animate} from '@angular/core';
import {TranscriptionTimetrackerService} from '../shared/services/transcription-timetracker-service';
import {DataService} from '../shared/services/data.service';
import {ISubscription} from 'rxjs/Subscription';
import {HostListener} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {environment} from '../../environments/environment';

@Component({
  selector: 'si-read-along',
  templateUrl: './read-along.component.html',
  styleUrls: ['./read-along.component.css']
})
export class ReadAlongComponent implements OnInit, OnDestroy {

  transcription: any;
  transcript: any;
  myInterval: any;
  transcriptData: any;
  audioSource: String;
  newTranscription: any[] = [];
  transcriptionLength: number;
  confidenceArray: any[] = [];
  durationArray: any[] = [];
  wordLength: number;
  errorWordCount: number;
  totalWordCount: number;
  newWords: any[] = [];
  subscription: ISubscription;
  saveSubcription: ISubscription;
  loading: boolean;
  speedArray: any[] = [0.5, 1.0, 1.5, 2.0];
  selectedSpeed: any;
  map: any = {};
  playing: boolean;
  selectedTagType: string;
  wordTags: string[];
  instructions: string;
  searchClick = false;
  savingWords: boolean;
  isPlaying: boolean;

  @ViewChild('track') private track: ElementRef; // referencing the audio in the html

  constructor(private _timeTrackerService: TranscriptionTimetrackerService,
              public dataService: DataService,
              private _route: ActivatedRoute) {
  }

  ngOnInit() {
    this.cleanUp();
    this.wordCleanUp();
    this.saveSubcription = this.dataService.saveTranscript$.subscribe(data => { // on save click
      if (data === 'saveWords') { // if save words icon is clicked
        this.newWords = this.dataService.newWords;
        if (this.newWords.length > 0) { // save words only if the new words are present
          console.log(this.newWords);
          this.newWords = this.createOutArray(this.newWords); // removes duplicates
          this.newWords = this.newWords.filter(function (props) {
            delete props.from; // deleting key from object.
            return true;
          });
          this.loading = true;
          this.saveWords(this.newWords, data);
        } else {
          // if there are are no new words in the array.
        }
      } else if (data === 'saveSpeakerLabels') { // To save speaker labels (we are saving speaker labels on blur)
        this.loading = true;
        this.saveWords(this.dataService.speakerLabels, data);
      } else if (data === 'saveTag') { // To save tags.
        this.loading = true;
        this.saveWords(this.dataService.wordTags, data);
      }
    });

    this.track.nativeElement.addEventListener('play', () => { // adding play event on audio
      this.playing = true;
      this.myInterval = setInterval(() => {
        // sending current time on the audio for every 100 milliseconds as an observable
        this._timeTrackerService.sendCurrentTime(this.track.nativeElement.currentTime);
      }, 100);
    });

    // adding pause event on audio and clearing the interval when audio is paused.
    this.track.nativeElement.addEventListener('pause', () => {
      this.playing = false;
      clearInterval(this.myInterval);
    });

    // when there is a double click on the word, we are setting the current time on the audio based on the word clicked
    this.subscription = this._timeTrackerService.setCurrentTime$.subscribe(clickedTime => {
      this.track.nativeElement.currentTime = clickedTime;
    });
    this.loading = true;
    this.getTranscriptdata();
    this.track.nativeElement.playbackRate = 1.0; // setting initial playback rate and speed of the audio.
    this.selectedSpeed = 1.0;
    this.savingWords = false;
  }

  ngOnDestroy() { // clearing the interval of the audio and unsubscribing from the subscriptions.
    clearInterval(this.myInterval);
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.saveSubcription) {
      this.saveSubcription.unsubscribe();
    }
    this.map = {};
    this.dataService.removeCurrentTime();
  }

  speedChanger(speed) { // changing playback rate.
    this.track.nativeElement.playbackRate = speed;
    this.selectedSpeed = speed;
  }

  @HostListener('window:keypress', ['$event'])
  handleKeyboardEvent(e: KeyboardEvent) {  // keyboard shortcuts
    this.map[e.keyCode] = e.type === 'keydown';
    this.pauseAndPlay();
    if (this.map[18] && this.map[39]) { // ALT + right arrow
      this.track.nativeElement.currentTime += 5;
      return false;
    } else if (this.map[18] && this.map[37]) { // ALT + left arrow
      if (!this.track.nativeElement.currentTime) {
        return false; // to prevent default behaviour when current time is zero.
      }
      this.track.nativeElement.currentTime -= 5;
      return false; // to overwrite the default behaviour
    } else if (this.map[18] && this.map[38]) { // ALT + UP
      this.track.nativeElement.volume += 0.1;
      return false;
    } else if (this.map[18] && this.map[40]) { // ALT + DOWN
      this.track.nativeElement.volume -= 0.1;
      return false;
    } else if (this.map[18] && this.map[83]) { // ALT + S
      this.dataService.saveEditedTranscript('saveWords');
      return false;
    } else if (this.map[13]) { // Enter key
      return false; // preventing from creating new line.
    }
  }

  pauseAndPlay() {
    if (this.map[18] && this.map[80]) { // ALT + P
      if (this.playing) { // if playing pause and vice versa
        this.track.nativeElement.pause();
      } else {
        this.track.nativeElement.play();
      }
      return false;
    }
  }

  searchClicked(e) { // to toggle search and replace
    this.searchClick = !this.searchClick;
  }

  saveWords(editedTranscriptData, saveType) { // to save words
    // checking the audio status before saving (after saving, we will play/pause if it was playing/pausing )
    this.isPlaying = this.playing;
    this.track.nativeElement.pause();
    this.dataService
      .dataServicePut(`${environment.transcription_Api}/api/watson/save/` + this._route.snapshot.params.guid, editedTranscriptData)
      .subscribe(data => {
          this.wordCleanUp(); // deleting data from the variables
          this.savingWords = true;
          if (this.isPlaying) {
            this.track.nativeElement.play();
          }
          if (saveType === 'saveTag') {
            this.loading = true;
            this.getTranscriptdata(); // getting transcript again after saving data.
          }
        },
        error => {
          console.log(error);
          this.wordCleanUp();
        }, () => {
          if (!(saveType === 'saveTag')) {
            this.loading = false;
          }
        });
  }

  wordCleanUp() {
    this.newWords = [];
    this.dataService.newWords = [];
    this.dataService.speakerLabels = [];
    this.dataService.wordTags = [];
  }

  getTranscriptdata() {
    this.dataService
      .dataServiceGet(`${environment.transcription_Api}/api/watson/file/` + this._route.snapshot.params.guid)
      .subscribe(data => {
          // this.loading = false;
          this.cleanUp();
          this.transcriptData = data;
          if (!this.audioSource) { // because we do not want to load audio again if it is already set.
            this.audioSource = this.transcriptData.FileUrl;
          }
          this.instructions = this.transcriptData.Instruction;
          this.transcription = JSON.parse(this.transcriptData.Body);
          console.log( this.transcription);
          this.newTranscription = this.transcription;
          this.transcriptionLength = this.transcription.length;
          this.createWordStats();
        },
        (err) => {
          console.log(err);
        },
        () => {
          this.loading = false;
          // if(this.savingWords) {
          //   setTimeout(() => {
          //     if(this.isPlaying) {
          //       this.track.nativeElement.play();
          //     }
          //   }, 200);
          // }
        });
  }

  cleanUp() {
    this.confidenceArray = [];
    this.durationArray = [];
    this.errorWordCount = 0;
    this.totalWordCount = 0;
    this.wordLength = 0;
  }

  createWordStats() { // analysis on words (confidence array and duration array is used to create graph.)
    this.wordTags = [];
    for (let i = 0; i < this.transcriptionLength; i++) {
      for (let j = 0; j < this.transcription[i].SpeakerTranscript.Content.length; j++) {
        if (this.transcription[i].SpeakerTranscript.Content[j].Confidence < 0.8) {
          this.errorWordCount++;
        }
        this.confidenceArray.push(this.transcription[i].SpeakerTranscript.Content[j].Confidence);
        this.durationArray.push(
          this.dataService
            .formatTime(
              this.transcription[i].SpeakerTranscript.Content[j].Begin + this.transcription[i].SpeakerTranscript.Content[j].Duration));
        if (this.transcription[i].SpeakerTranscript.Content[j].Tag) {
          this.wordTags = this.wordTags.concat(this.transcription[i].SpeakerTranscript.Content[j].Tag.split(','));
        }
      }
    }
    this.totalWordCount = this.confidenceArray.length;
    this.wordLength = (this.confidenceArray.length - 1);
  }

  tagSelected(tag) {
    this.selectedTagType = tag;
  }

  createOutArray(a) { // to filter out duplicates from the array.
    const len = a.length;
    const fromValues = [];
    fromValues[0] = a[len - 1];
    for (let i = len - 1; i >= 0; i--) {
      let flag = 0;
      const flen = fromValues.length;
      for (let j = 0; j < flen; j++) {
        if (a[i].from === fromValues[j].from) {
          flag = 1;
        }
      }
      if (flag === 0) {
        fromValues.push(a[i]);
      }
    }
    return fromValues;
  }
}

// this.newWordArrayLength = this.dataService.newWordArray.length;
// for (let i = 0; i < this.newWordArrayLength; i++) {
//   this.newTranscription.splice(this.dataService.newWordArray[i].index, 1);
//   let newWordObj = {
//     speaker: this.transcription[this.dataService.newWordArray[i].index].speaker,
//     transcript: this.dataService.newWordArray[i].newArray
//   }
//   this.newTranscription.splice(this.dataService.newWordArray[i].index, 0, newWordObj);
// }
// this.dataService.dataServicePut(`${environment.transcription_Api}/api/watson/save/`
// + this._sessionService.getfileGuid(),this.newTranscription).subscribe(data => {
//   console.log(data);
// },
// error => {
//   console.log(error);
// })
