import {AutocompleteItem} from './autocompleteItem';

export class AutocompleteObject {

  constructor(
    public placeholder: string, // The text inside input (translation key)
    public minCharacters: number, // The minimum number of characters for triggering autocomplete items
    public maxResults: number, // The maximum number of items as result
    public items: AutocompleteItem[], // The list of items (all possible choices of items)
    public maxHeight?: number, // One item is 55px, maxHeight = 55 x maxResults
    public value?: string, // The content in input
    public cleanInputOnSelection?: boolean, // If yes or no the input field has to be clear after user selects an option
    public width?: number
    ) { }

}
