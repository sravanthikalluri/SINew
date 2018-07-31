import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DataService } from '../../shared/services/data.service';

@Injectable()
export class TranscriptService {

  constructor(private _dataService: DataService) { }
  getTranscription() {
    return this._dataService.dataServiceGet('./assets/api/transcription.json');
  }
  getTranscript() {
    return this._dataService.dataServiceGet('./assets/api/words.json');
  }
}
