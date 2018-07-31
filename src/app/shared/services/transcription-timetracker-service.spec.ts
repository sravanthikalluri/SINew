import { TestBed, inject } from '@angular/core/testing';

import { TranscriptionTimetrackerService } from './transcription-timetracker-service';

describe('TranscriptionTimetrackerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TranscriptionTimetrackerService]
    });
  });

  it('should be created', inject([TranscriptionTimetrackerService], (service: TranscriptionTimetrackerService) => {
    expect(service).toBeTruthy();
  }));
});
