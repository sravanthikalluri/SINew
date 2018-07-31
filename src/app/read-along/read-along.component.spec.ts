import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReadAlongComponent } from './read-along.component';

describe('ReadAlongComponent', () => {
  let component: ReadAlongComponent;
  let fixture: ComponentFixture<ReadAlongComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReadAlongComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReadAlongComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
