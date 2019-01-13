import {Component, EventEmitter, OnDestroy, OnInit} from '@angular/core';
import {AutocompleteObject} from '../../models/autocompleteObject';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-autocomplete-page-root',
  templateUrl: './autocompletePage.component.html',
  styleUrls: ['./autocompletePage.component.scss']
})
export class AutocompletePageComponent implements OnInit, OnDestroy {
  public data: AutocompleteObject;
  public update = new EventEmitter<AutocompleteObject>();
  public messageList: string[] = [];

  // Parameters
  public values: FormGroup;
  private form$: Subscription;
  private items = [
    {id: 0, text: 'Pizza'},
    {id: 1, text: 'Burger'},
    {id: 2, text: 'Kebab'}
  ];

  constructor(
    private fb: FormBuilder
  ) { }

  ngOnDestroy() {
    if (this.form$) { this.form$.unsubscribe(); }
  }

  ngOnInit() {
    this.setFormData();
    this.setFormListener();
    this.setAutocompleteData();
  }

  setFormData() {
    this.values = this.fb.group({
      placeholder: ['Search for items'],
      minCharacters: [0],
      maxResults: [0],
      maxHeight: [5],
      value: [''],
      width: [300],
      cleanInputOnSelection: [false]
      // items : [this.items]
    });
  }

  setFormListener() {
    this.form$ = this.values.valueChanges.subscribe(() =>
      this.setAutocompleteData()
    );
  }

  setAutocompleteData() {
    this.data = {
      placeholder: this.values.get('placeholder').value,
      minCharacters: this.values.get('minCharacters').value,
      maxResults: this.values.get('maxResults').value,
      value: this.values.get('value').value,
      width: this.values.get('width').value,
      cleanInputOnSelection: this.values.get('cleanInputOnSelection').value,
    } as AutocompleteObject;

    if (this.values.get('maxHeight').value) { this.data.maxHeight = 55 * this.values.get('maxHeight').value; }
    this.data.items = this.items.map((item: any) => ({name: item.text, item: item}));

    this.update.emit(this.data);
  }

  itemSelected(item: any) {
    this.messageList.push(`Item selected : ${JSON.stringify(item)}`);
  }

  itemCleared() {
    this.messageList.push(`Value erased`);
  }
}
