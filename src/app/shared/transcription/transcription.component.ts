import {Component, OnInit, Input, ViewChild, OnDestroy, ElementRef, OnChanges, AfterViewInit} from '@angular/core';
import {TranscriptionTimetrackerService} from '../services/transcription-timetracker-service';
import {HttpClient} from '@angular/common/http';
import {DataService} from '../services/data.service';
import {ActivatedRoute, Router} from '@angular/router';
import {ISubscription} from 'rxjs/Subscription';
import {FormGroup, FormBuilder, Validators} from '@angular/forms';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {environment} from '../../../environments/environment';

@Component({
  selector: 'si-transcription',
  templateUrl: './transcription.component.html',
  styleUrls: ['./transcription.component.css']
})
export class TranscriptionComponent implements OnInit, OnDestroy, OnChanges, AfterViewInit {

  @Input() transcript: any;
  @Input() transcriptIndex: number;
  @Input() selectedTagType: any;
  @Input() originalData:any;
  _transcriptFilter: string;
  @Input() set transcriptFilter(text) {
    this._transcriptFilter = text;
    this.wordCountTracker = 0;
    this.clearHighlight(); // clearing highlighted words on each edit.
  }

  get transcriptFilter(): string {
    return this._transcriptFilter;
  }
  newLabels: any;
  wordLength: any;
  currentTime: any;
  transcriptWordLength: number;
  wordList: any;
  obj: any;
  originalWordArrayLength: number;
  originalWordMap: any;
  editedWordMap: any;
  timeSubscription: ISubscription;
  rightclickedWord: string;
  rightPanelStyle: any;
  searchEditedWordMap: any;
  tagForWord: string;
  wordTags: string;
  tagForm: FormGroup;
  modalRef: NgbModalRef;
  curWordtags: string[] = [];
  newWordTags: string[] = [];
  tagObj: any;
  curWordIndex: number;
  replaceSubscription: ISubscription;
  previousWordSubscription: ISubscription;
  nextWordSubscription: ISubscription;
  wordCountTracker: number;
  @Input() replaceText: string;

  @ViewChild('tr') private tr: ElementRef;

  constructor(private _timeTrackerService: TranscriptionTimetrackerService,
              private modalService: NgbModal,
              private _http: HttpClient,
              private _dataService: DataService,
              private _router: Router,
              private _fb: FormBuilder,
              private _route: ActivatedRoute) {
  }

  ngOnInit() {
    this.tagForm = this._fb.group({
      addTag: ['', [Validators.required, Validators.maxLength(20)]]
    });
    this.timeSubscription = this._timeTrackerService.trackTime$.subscribe(curTime => {
      this.currentTime = curTime;
    });
    this.originalWordArrayLength = this.transcript.length;
    this.originalWordMap = new Map();
    for (let i = 0; i < this.originalWordArrayLength; i++) {
      if (this.transcript[i].Word) {
        this.originalWordMap.set(this.transcript[i].Begin, {index: i, Word: this.transcript[i].Word});
      }
    }
    this.editedWordMap = new Map();
    this.searchEditedWordMap = new Map();
    this.replaceSubscription = this._dataService.replaceText$.subscribe(data => {
      if (data === 'replaceAll') {
        this.replaceAll();
      } else if (data === 'replace') {
        this.replace();
      }
    });
    this.previousWordSubscription = this._dataService.previousWord$.subscribe(data => {
      if (data === 'previous word') {
        this.highlightPreviousWord();
      }
    });
    this.nextWordSubscription = this._dataService.nextWord$.subscribe(data => {
      if (data === 'next word') {
        this.highlightNextWord();
      }
    });
    this.wordCountTracker = 0;
  }

  ngAfterViewInit() {
    this.createSearchEditedWordMap();
  }

  createSearchEditedWordMap() {
    this.wordList = this.tr.nativeElement.children;
    this.transcriptWordLength = this.wordList.length;
    for (let i = 0; i < this.transcriptWordLength; i++) {
      this.searchEditedWordMap.set(parseFloat(this.tr.nativeElement.children[i].id), {
        index: i,
        Word: this.tr.nativeElement.children[i].innerText,
        Begin: this.tr.nativeElement.children[i].id
      });
    }
  }

  ngOnChanges() {
    if ((typeof (this.transcriptFilter) !== 'undefined')) {
      this.createSearchEditedWordMap();
      this.searchAndHighlight();
      // this.wordCountTracker = 0;
    }
  }

  searchAndHighlight() {
    if (this.transcriptWordLength > 0) {
      this.searchEditedWordMap.forEach(word => {
        if (word.Word.includes(this.transcriptFilter)) {
          this.tr.nativeElement.children[word.index].classList.add('searchHighlight');
          this._dataService.highlightWords.push({
            begin: this.tr.nativeElement.children[word.index].id,
            index: word.index,
            word: word.Word,
            transcriptIndex: this.transcriptIndex
          });
        } else {
          this.tr.nativeElement.children[word.index].classList.remove('searchHighlight');
        }
        if (!this.transcriptFilter) {
          this.tr.nativeElement.children[word.index].classList.remove('searchHighlight');
        }
      });
    }
  }

  checkTagType(tag) {
    if (tag && this.selectedTagType && (tag.split(',').indexOf(this.selectedTagType)) !== -1) {
      return true;
    } else {
      return false;
    }
  }

  highlightPreviousWord() {
    if (this.wordCountTracker > 1) {
      this.wordCountTracker--;
    }
    const word = this._dataService.highlightWords[this.wordCountTracker - 1];
    this.searchEditedWordMap.forEach(transcriptWord => {
      if (word.begin === transcriptWord.Begin) {
        this._dataService.curReplaceWord = word;
        this._dataService.wordToReplaceIndex = transcriptWord.index;
        this.tr.nativeElement.children[transcriptWord.index].classList.add('highlightSpecificWord');
      } else {
        if (this.tr.nativeElement.children[transcriptWord.index]) {
          this.tr.nativeElement.children[transcriptWord.index].classList.remove('highlightSpecificWord');
        }
      }
    });
  }

  clearHighlight() {
    // this.searchEditedWordMap.forEach(transcriptWord => {
    //   if (this._dataService.curReplaceWord.begin === transcriptWord.Begin) {
    //     console.log(this.tr.nativeElement.children[transcriptWord.index].innerText);
    //     this.tr.nativeElement.children[this._dataService.wordToReplaceIndex].classList.remove('highlightSpecificWord');
    //   }
    // });
    if (this.tr.nativeElement.children[this._dataService.wordToReplaceIndex]) {
      this.tr.nativeElement.children[this._dataService.wordToReplaceIndex].classList.remove('highlightSpecificWord');
    }
  }

  highlightNextWord() {
    if (this.wordCountTracker < this._dataService.highlightWords.length) {
      this.wordCountTracker++;
    }
    const word = this._dataService.highlightWords[this.wordCountTracker - 1];
    this.searchEditedWordMap.forEach(transcriptWord => {
      if (word.begin === transcriptWord.Begin) {
        this._dataService.curReplaceWord = word;
        this._dataService.wordToReplaceIndex = transcriptWord.index;
        this.tr.nativeElement.children[transcriptWord.index].classList.add('highlightSpecificWord');
      } else {
        if (this.tr.nativeElement.children[transcriptWord.index]) {
          this.tr.nativeElement.children[transcriptWord.index].classList.remove('highlightSpecificWord');
        }
      }
    });
  }

  replace() {
    if (this.wordCountTracker) {
      this.searchEditedWordMap.forEach(transcriptWord => {
        if (this._dataService.curReplaceWord.begin === transcriptWord.Begin) {
          const nativeElement = this.tr.nativeElement;
          nativeElement.children[this._dataService.curReplaceWord.index].innerText =
            nativeElement.children[this._dataService.curReplaceWord.index].innerText.replace(this.transcriptFilter, this.replaceText);
        }
      });
      this.createSearchEditedWordMap();
      this.searchAndHighlight();
      this.onContentChange();
      this.clearHighlight();
    }
  }

  replaceAll() {
    if (this.transcriptWordLength > 0) {
      this.searchEditedWordMap.forEach(word => {
        if (word.Word.includes(this.transcriptFilter)) {
          const nativeElement = this.tr.nativeElement;
          if (nativeElement.children[word.index].innerText) {
            nativeElement.children[word.index].innerText =
              nativeElement.children[word.index].innerText.replace(this.transcriptFilter, this.replaceText);
          }
        }
      });
    }
    this.createSearchEditedWordMap();
    this.searchAndHighlight();
    this.onContentChange();
    this.clearHighlight();
  }

  ngOnDestroy(): void {
    this.timeSubscription.unsubscribe();
    this.transcript = [];
    this.replaceSubscription.unsubscribe();
    this.previousWordSubscription.unsubscribe();
    this.nextWordSubscription.unsubscribe();
  }

  wordClicked(Word) {
    this._timeTrackerService.wordClickTime((Word.Begin));
  }

  onRightClick($event, Word) {
    this.rightclickedWord = Word.Begin;
    this.rightPanelStyle = {'display': 'block', 'position': 'absolute'};
    return false;
  }

  closeContextMenu() {
    this.rightPanelStyle = {'display': 'none'};
  }

  ignore(Word, index, from, wordContent) {
    Word.classList.remove('markRed');
    Word.style.borderBottom = '2px solid green';
    this.createObject(this.transcriptIndex, index, wordContent, from, wordContent);
    this._dataService.newWords.push(this.obj);
    this.closeContextMenu();
    console.log(this._dataService.newWords);
  }

  ignoreAll() {
    // this._dataService.saveEditedTranscript('saveWords');
    // for (let i = 0; i < this.tr.nativeElement.children.length; i++) {
    //   if (this.tr.nativeElement.children[i].className.includes('markRed')) {
    //     this.tr.nativeElement.children[i].classList.remove('markRed');
    //     this.tr.nativeElement.children[i].style.borderBottom = '2px solid green';
    //     this.createObject(this.transcriptIndex, i, this.tr.nativeElement.children[i].firstChild.textContent.trim(),
    // parseFloat(this.tr.nativeElement.children[i].getAttribute('id')), this.tr.nativeElement.children[i].firstChild.textContent.trim());
    //     this._dataService.newWords.push(this.obj);
    //   }
    // }
    // this.closeContextMenu();
    // this._dataService.saveEditedTranscript('saveWords');
    this.createEditedWordMap();
    this.editedWordMap.forEach((value: any, key: any) => {
      if (this.tr.nativeElement.children[this.editedWordMap.get(key).index].className.includes('markRed')) {
        const nativeElement = this.tr.nativeElement;
        nativeElement.children[this.editedWordMap.get(key).index].classList.remove('markRed');
        nativeElement.children[this.editedWordMap.get(key).index].style.borderBottom = '2px solid green';
        this.createObject(
          this.transcriptIndex,
          this.originalWordMap.get(key).index,
          nativeElement.children[this.editedWordMap.get(key).index].firstChild.textContent.trim(), key, this.originalWordMap.get(key).Word);
        this._dataService.newWords.push(this.obj);
      }
    });
    this.closeContextMenu();
    console.log(this._dataService.newWords);
  }

  addTag(word, index, wordTr, modal) { // wordTr is the template reference of the word.
    this.tagForWord = word.Word;
    this.wordTags = word.Tag;
    this.curWordIndex = index;
    this.modalRef = this.modalService.open(modal);
  }

  removeTag(word, index, wordTr, modal) {
    this.tagForWord = word.Word;
    if (word.Tag) {
      this.curWordtags = word.Tag.split(',');
    }
    this.curWordIndex = index;
    this.modalRef = this.modalService.open(modal);
  }

  saveAfterDeleting() {
    this.createTagObjAndSaveTag(this.curWordtags);
    this.modalRef.close();
  }

  saveTag() {
    if (this.wordTags) {
      this.newWordTags = this.wordTags.split(',');
    }
    if (this.tagForm.controls['addTag'].value) {
      this.newWordTags.push(this.tagForm.controls['addTag'].value);
    }
    this.createTagObjAndSaveTag(this.newWordTags);
    this.modalRef.close();
  }

  createTagObjAndSaveTag(curWordTags) {
    this.tagObj = {
      Index: this.transcriptIndex,
      WordIndex: this.curWordIndex,
      Tag: curWordTags.join()
    };
    this._dataService.wordTags.push(this.tagObj);
    this._dataService.saveEditedTranscript('saveTag');
  }

  close() {
    this.modalRef.close();
  }

  deleteTag(i) {
    this.curWordtags.splice(i, 1);
  }

  createEditedWordMap() {
    this.editedWordMap.clear();
    this.wordList = this.tr.nativeElement.children;
    this.transcriptWordLength = this.wordList.length;
    for (let i = 0; i < this.transcriptWordLength; i++) {
      this.editedWordMap.set(parseFloat(this.tr.nativeElement.children[i].id), {
        index: i,
        Word: this.tr.nativeElement.children[i].innerText
      });
    }
  }

  addWordIfEmpty(i, key, editedIndex, oldWord) {
    if (this.tr.nativeElement.children[editedIndex].innerText === '') { // check if Word is empty
      this.createObject(this.transcriptIndex, i, '', key, oldWord);
      this._dataService.newWords.push(this.obj); // add Word
    }
  }

  addWordUnderlineGreen(i, key, editedIndex, oldWord) {
    // check if the 'from' in 'id' is equal to key which also contains 'from'
    if (this.tr.nativeElement.children[editedIndex].getAttribute('id') == key) {
      // console.log(this.tr.nativeElement.children[editedIndex].getAttribute('id'));
      this.tr.nativeElement.children[editedIndex].classList.remove('markRed');
      this.tr.nativeElement.children[editedIndex].style.borderBottom = '2px solid green'; // underline green
      this.createObject(this.transcriptIndex, i, this.tr.nativeElement.children[editedIndex].innerText, key, oldWord);
      this._dataService.newWords.push(this.obj); // add object
    }
  }

  createObject(speakerIndex, wordIndex, word, from, oldWord) {
    if (word) {
      word = word.trim();
    }
    if (oldWord) {
      oldWord = oldWord.trim();
    }
    this.obj = { // create Word object
      Index: speakerIndex,
      WordIndex: wordIndex,
      NewWord: word.replace(/\s+/g, ' '),
      OldWord: oldWord.replace(/\s+/g, ' '),
      from: from
    };
  }

  objectPropInArray(array, prop, val) {
    if (array.length > 0) {
      for (const i in array) {
        if (array[i][prop] === val) {
          return true;
        }
      }
    }
    return false;
  }

  speakerChange(index, oldSpeaker, newSpeaker) {
    const obj = {
      Index: index,
      oldSpeaker: oldSpeaker,
      newSpeaker: newSpeaker.innerText
    };
    this.newLabels = this._dataService.speakerLabels;
    this.wordLength = this.newLabels.length;
    for (let i = 0; i < this.wordLength; i++) {
      if (this.newLabels[i].oldSpeaker === oldSpeaker) {
        this.newLabels.splice(i, 1);
      }
    }
    this._dataService.speakerLabels.push(obj);
  }
  onContentChange() {
    this.createEditedWordMap(); // creates edited Word map
    this.originalWordMap.forEach((value: any, key: any) => { // looping through edited Word map
      let editedVal;
      if (this.editedWordMap.get(key)) {
        editedVal = this.editedWordMap.get(key).Word; // comparing the values in both the maps using edited Word map key
        if (editedVal && editedVal.length > 0) {
          if (editedVal !== value.Word) { // if the Word is changed
            this.addWordIfEmpty(value.index, key, this.editedWordMap.get(key).index, this.originalWordMap.get(key).Word);
            this.addWordUnderlineGreen(value.index, key, this.editedWordMap.get(key).index, this.originalWordMap.get(key).Word);
          } else {
            // if the Word is put back to match the original Word, we will remove all the changes of that respective Word from the array.
            if (this.objectPropInArray(this._dataService.newWords, 'from', key)) {
              this._dataService.newWords = this._dataService.newWords.filter(obj => {
                if (obj.from === key) {
                  this.tr.nativeElement.children[this.editedWordMap.get(key).index].style.borderBottom = 'none';
                }
                return !(obj.from === key);
              });
            }
          }
        } else { // if the key in the originalWord map is not present in the editedWord map then we have to remove that Word.
          // create Word object
          this.createObject(this.transcriptIndex, this.originalWordMap.get(key).index, '', key, this.originalWordMap.get(key).Word);
          this._dataService.newWords.push(this.obj); // add object
        }
      } else { // if the key in the originalWord map is not present in the editedWord map then we have to remove that Word.
        // create Word object
        this.createObject(this.transcriptIndex, this.originalWordMap.get(key).index, '', key, this.originalWordMap.get(key).Word);
        this._dataService.newWords.push(this.obj); // add object
      }
    });
  }

  lienBreak(word, index, originalData, transcriptObject) {
    console.log(this.originalData[this.transcriptIndex]);
    var newRecord = transcriptObject.splice(index);
    this.originalData.map(item => {
      if ((this.transcriptIndex) < item['Index']){
        item['Index'] = item['Index'] + 1;
       }
    })
    var or = {
      Index: this.transcriptIndex + 1,
      SpeakerTranscript: {
        Content: newRecord,
        Speaker: 'newSpeaker'
      }
    };
    this.originalData.splice((this.transcriptIndex + 1), 0, or);

    this._dataService.dataServicePost(`${environment.transcription_Api}/api/watson/UpdateFullTranscriptData/` + this._route.snapshot.params.guid, this.originalData )
      .subscribe(data => {
        console.log(data);
      }, error => {
        console.log(error);
      })
     console.log(this.originalData);

  }

}

// for (let i = 0; i < this.transcriptWordLength; i++) {
//   if (!(this.originalWordArray[i] === this.editedWordArray[i])) {
//     this.transcriptEditEvent.target.children[i].style.borderBottom = '2px solid green';
//     this.obj = {
//       speakerIndex: this.transcriptIndex,
//       wordIndex: i,
//       Word: this.editedWordArray[i],
//       oldWord: this.originalWordArray[i],
//       // Duration: this.transcript[i].Duration,
//       from: this.transcript[i].Begin
//       // to: (this.transcript[i].Begin + this.transcript[i].Duration)
//     }
//   }
// }

// console.log(this.obj);
// if(this.obj) {
//   this._dataService.newWords.push(this.obj);
//   console.log(this._dataService.newWords);
// }


// refresh() {
//   this._router.navigate['/transcription'];
//   this.ngOnInit();
// }


// objectPropInArray(array, prop, val) {
//   if (array.length > 0) {
//     for (let i in array) {
//       if (array[i][prop] === val) {
//         return true;
//       }
//     }
//   }
//   return false;
// }


// returns entire transcript----------------->

// wordClicked(Word) {
//   this._timeTrackerService.wordClickTime((Word.Begin));
// }
// onContentChange(e) {
//   this.transcriptEditEvent = e;
//   this.editedWordArray = [];
//   this.editedTranscript = [];
//   this.wordList = this.transcriptEditEvent.target.children;
//   this.transcriptWordLength = this.wordList.length;
//   for (let i = 0; i < this.transcriptWordLength; i++) {
//     let wordObj = {
//       Word: this.transcriptEditEvent.target.children[i].innerText,
//       Duration: this.transcript[i].Duration,
//       Begin: this.transcript[i].Begin,
//       confidence: this.transcript[i].confidence
//     }
//     this.editedTranscript.push(wordObj);
//     this.editedWordArray.push(this.transcriptEditEvent.target.children[i].innerText);
//   }
//   for (let i = 0; i < this.transcriptWordLength; i++) {
//     if (!(this.originalWordArray[i] === this.editedWordArray[i])) {
//       this.transcriptEditEvent.target.children[i].style.borderBottom = '2px solid green';
//       this.obj = {
//         index: this.transcriptIndex,
//         newArray: this.editedTranscript
//       }
//     }
//   }
//   if (!this.objectPropInArray(this._dataService.newWordArray, 'index', this.obj['index'])) {
//     this._dataService.newWordArray.push(this.obj);
//   } else {
//     let index;
//     index = this.findWithAttr(this._dataService.newWordArray, 'index', this.obj['index']);
//     this._dataService.newWordArray.splice(index, 1);
//     this._dataService.newWordArray.push(this.obj);
//   }
// }

// findWithAttr(array, attr, value) {
//   for (var i = 0; i < array.length; i += 1) {
//     if (array[i][attr] === value) {
//       return i;
//     }
//   }
//   return -1;
// }

// objectPropInArray(array, prop, val) {
//   if (array.length > 0) {
//     for (let i in array) {
//       if (array[i][prop] === val) {
//         return true;
//       }
//     }
//   }
//   return false;
// }
