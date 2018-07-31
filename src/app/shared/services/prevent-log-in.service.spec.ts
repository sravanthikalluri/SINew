import { TestBed, inject } from '@angular/core/testing';

import { PreventLogInService } from './prevent-log-in.service';

describe('PreventLogInService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PreventLogInService]
    });
  });

  it('should be created', inject([PreventLogInService], (service: PreventLogInService) => {
    expect(service).toBeTruthy();
  }));
});
