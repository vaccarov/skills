import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, startWith, tap } from 'rxjs/operators';
import {AutocompleteObject} from '../../../models/autocompleteObject';
import {Observable, of, Subscription} from 'rxjs';
import {AutocompleteItem} from '../../../models/autocompleteItem';

export const ITEM_HEIGHT = 55;

@Component({
  selector: 'app-autocomplete',
  templateUrl: './autocomplete.component.html',
  styleUrls: ['./autocomplete.component.scss']
})
/**
 * @description Autocomplete component
 * @ViewChild {ElementRef} itemListContainer - The item list container so we can manually trigger the scroll
 * @Input {AutocompleteObject} data - The component data [placeholder, minCharacters, maxResults, maxHeight, items = [name, item]]
 * @Input {EventEmitter} update - Observable that fire when a change is made on data
 * @Output {EventEmitter} onItemSelected - Trigger the observable when user select an item
 * @Output {EventEmitter} onInputErased - Trigger the observable when user click on the cross icon to clear input
 */
export class AutocompleteComponent implements OnInit, OnDestroy {
  @ViewChild('itemList') itemListContainer: ElementRef;
  @Input() data: AutocompleteObject;
  @Input() update: EventEmitter<AutocompleteObject>;
  @Output() onItemSelected: EventEmitter<any> = new EventEmitter();
  @Output() onInputErased: EventEmitter<boolean> = new EventEmitter();

  private input$: Subscription; // Subscription of input's observable
  private update$: Subscription; // Subscription of update's observable
  public inputControl: FormControl = new FormControl(); // Input listener
  public filteredItems: Observable<AutocompleteItem[]> = of([]); // List of items that match user's search terms
  public itemActive: AutocompleteItem; // For arrow selection (item is active when hover on it or select with arrows)
  public showBorderShadow: boolean = false; // boolean to show/hide the shadow border of the autocomplete

  /**
   * Life cycle
   * */
  constructor() { }

  /** Set the listeners of the input, and subscribe to update to refresh data every time update is triggered */
  ngOnInit() {
    if (this.update) {
      this.update$ = this.update.subscribe((updatedData: AutocompleteObject) => {
        this.data = updatedData;
        this.setFormControl();
      });
    }
    this.setFormControl();
  }

  ngOnDestroy() {
    if (this.input$) { this.input$.unsubscribe(); }
    if (this.update$) { this.update$.unsubscribe(); }
  }

  /** Setup input listener, to refresh item list every time user type something */
  private setFormControl() {
    if (this.data) {
      if (this.input$) { this.input$.unsubscribe(); }
      this.inputControl.setValue(this.data.value || '');
      this.input$ = this.inputControl.valueChanges.pipe(
        distinctUntilChanged(),
        startWith(this.data.value || ''),
        tap((term: string) => {
          // If the term length is big enough, filter items by name, if not, set the list empty so an error message appear
          // Then get an observable of these filtered items so the DOM can show them
          this.filteredItems = of(this.sliceItems((term.length >= this.data.minCharacters) ? this.filterItemsByName(term) : []));
        }),
        debounceTime(250)
      ).subscribe();
    }
  }

  /**
   * @description Filter item list by returning only the list of items that match what user typed
   * @param {string} name - What user typed in input field
   * @return {AutocompleteItem} - List of items that match provided name
   */
  private filterItemsByName(name: string): AutocompleteItem[] {
    return this.data.items.filter((item: AutocompleteItem) => item.name.toLowerCase().indexOf(name.toLowerCase()) === 0);
  }

  /**
   * @description Set a maximum number of results if user has specified maxResults
   * @param {AutocompleteItem[]} items - Full item list
   * @return {AutocompleteItem[]} - Item list from 0 to maxResults (if maxResults = 0 don't cut the list)
   */
  private sliceItems(items: AutocompleteItem[]): AutocompleteItem[] {
    return this.data.maxResults ? items.slice(0, this.data.maxResults) : items;
  }

  /** When user click on the delete button in the input */
  eraseInput() {
    this.onInputErased.emit();
    this.resetInput();
  }

  /**
   * @description When user click on one item in the autocomplete list
   * @param {AutocompleteItem} item - The item that user has clicked on
   * */
  itemSelected(item: AutocompleteItem) {
    this.onItemSelected.emit(item.item);
    this.resetInput(this.data.cleanInputOnSelection ? '' : item.name);
  }

  /**
   * @description Reset input value, border and item active
   * @param {string} value - The text that is the name of the item to appear in input
   */
  private resetInput(value: string = '') {
    this.inputControl.setValue(value);
    this.showBorderShadow = false;
    this.itemActive = undefined;
  }

  /**
   * @description Set the active item when user hover on one item
   * @param {AutocompleteItem} item - The item the user has hover on
   */
  setActiveItem(item: AutocompleteItem) { this.itemActive = item; }

  /**
   * @description Return true if the item is the one currently selected (for change background with css)
   * @param {AutocompleteItem} item - The item to be tested if is active
   */
  isItemSelected(item: AutocompleteItem): boolean { return item === this.itemActive; }

  /**
   * The following is related to user interaction when typing on input
   * */

  /** Input get focus */
  inputFocused() { this.showBorderShadow = true; }

  /**
   * @description Whenever the user type on his keyboard within the input
   * @param {KeyboardEvent} event - The key input the user has typed
   */
  onKeyDown(event: KeyboardEvent) {
    event.stopPropagation();
    if (event.key !== undefined) { // Since event.keyCode is deprecated, use event.key
      switch (event.key) {
        case 'Enter': this.enterKeyEntered(event); break;
        case 'Escape': this.escapeKeyEntered(event); break;
        case 'ArrowUp': case 'ArrowDown': this.selectItem(event.key); break;
      }
    }
  }

  /**
   * @description If user press Escape, blur input and erase its content
   * @param {KeyboardEvent} event - The key input user has typed
   */
  private escapeKeyEntered(event: KeyboardEvent) {
    (event.target as HTMLInputElement).blur();
    this.eraseInput();
  }


  /**
   * @description If user press Enter, blur the input and select the corresponding item
   * @param {KeyboardEvent} event - The key input user has typed
   */
  private enterKeyEntered(event: KeyboardEvent) {
    if (this.itemActive) {
      (event.target as HTMLInputElement).blur();
      this.itemSelected(this.itemActive);
    }
  }

  /**
   * @description Get currently shown items (filteredItems) and the selected item, and redirect to correct method depending on user input
   * @param {string} direction - The code of key that user has typed (event.key)
   */
  private selectItem(direction: string) {
    this.filteredItems.subscribe(((items: AutocompleteItem[]) => {
      if (!items.length) { return; }
      if (!this.itemActive) {
        this.itemActive = items[0];
        return;
      }
      const index: number = items.indexOf(this.itemActive);
      switch (direction) {
        case 'ArrowUp': this.upKeyEntered(index, items); break;
        case 'ArrowDown': this.downKeyEntered(index, items); break;
      }
    }));
  }

  /**
   * @description If user type 'ArrowUp' key
   * @param {number} index - The index of itemActive
   * @param {AutocompleteItem[]} items - The item list
   */
  private upKeyEntered(index: number, items: AutocompleteItem[]) {
    if (index > 0) {
      // If index is positive, itemActive = items[element before], scroll up
      this.itemActive = items[index - 1];
      this.itemListContainer.nativeElement.scrollTop -= ITEM_HEIGHT;
    } else {
      // If index === 0 so take last item, scroll to bottom
      this.itemActive = items[items.length - 1];
      this.itemListContainer.nativeElement.scrollTop = this.itemListContainer.nativeElement.scrollHeight;
    }
  }

  /**
   * @description If user type 'ArrowDown' key
   * @param {number} index - The index of itemActive
   * @param {AutocompleteItem[]} items - The item list
   */
  private downKeyEntered(index: number, items: AutocompleteItem[]) {
    if (index < items.length - 1) {
      // If index isn't the last item, take the next item, scroll down
      this.itemActive = items[index + 1];
      this.itemListContainer.nativeElement.scrollTop += ITEM_HEIGHT;
    } else {
      // if it's the last item, go back to first item, scroll to top
      this.itemActive = items[0];
      this.itemListContainer.nativeElement.scrollTop = 0;
    }
  }
}
