import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Subject} from 'rxjs/Subject';

@Injectable()
export class DataService {

  fileGuid: string;
  newWords: any[] = [];
  speakerLabels: any[] = [];
  wordTags: any[] = [];
  downloadLinks: string[] = [];
  highlightWords: any[] = [];
  wordToReplaceIndex: number;
  curReplaceWord: any;

  private replaceText = new Subject();
  replaceText$ = this.replaceText.asObservable();

  private previousWord = new Subject();
  previousWord$ = this.previousWord.asObservable();

  private nextWord = new Subject();
  nextWord$ = this.nextWord.asObservable();

  private saveTranscript = new Subject();
  saveTranscript$ = this.saveTranscript.asObservable();


  saveEditedTranscript(saveInfo) {
    this.saveTranscript.next(saveInfo);
  }


  constructor(private _http: HttpClient) {
  }

  replaceEditedTranscript(replaceInfo): void {
    this.replaceText.next(replaceInfo);
  }

  highlightPreviousWord(previousWord) {
    this.previousWord.next(previousWord);
  }

  highlightNextWord(nextWord) {
    this.nextWord.next(nextWord);
  }

  removeCurrentTime() {
    localStorage.removeItem('CurrentTime');
  }

  dataServiceGet(url) {
    return this._http.get(url);
  }

  dataServicePut(url, data) {
    return this._http.put(url, data);
  }

  dataServicePost(url, data) {
    return this._http.post(url, data);
  }

  dataServiceDelete(url, data) {
    return this._http.delete(url, data);
  }

  dataServicePatch(url, data) {
    return this._http.patch(url, data);
  }

  getFileuploadUrl() {
    return this._http.get('https://1y514rxuc0.execute-api.us-west-2.amazonaws.com/Prod/api/recording/test/url/test/test');
  }

  formatTime(seconds) {
    const date = new Date(null);
    if (seconds) {
      date.setSeconds(seconds); // specify value for SECONDS here
      const result = date.toISOString().substr(11, 8);
      const hours = result.split(':')[0];
      if (hours === '00') {
        return (result.split(':')[1] + ':' + result.split(':')[2]);
      }
      return result;
    } else {
      return '';
    }
  }
}

