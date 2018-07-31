import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';

@Component({
  selector: 'app-selectlist',
  templateUrl: './selectlist.component.html',
  styleUrls: ['./selectlist.component.css']
})
export class SelectlistComponent implements OnInit {
  selectedRadioButtonValue = 'All';

  @Output()
  countRadioButtonSelectionChanges: EventEmitter<string> = new EventEmitter<string>();

  @Input()
  all: number;

  @Input()
  processing: number;

  @Input()
  completed: number;

  onRadioButtonSelectionChange() {
    this.countRadioButtonSelectionChanges.emit(this.selectedRadioButtonValue); // emitting value when clicked on a radio button
  }

  constructor() {
  }

  ngOnInit() {
  }

}
