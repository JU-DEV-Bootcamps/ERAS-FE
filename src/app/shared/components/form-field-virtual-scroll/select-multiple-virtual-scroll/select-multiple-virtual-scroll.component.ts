import { ScrollingModule } from '@angular/cdk/scrolling';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import { FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import {
  FloatLabelType,
  MatFormFieldModule,
} from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import {
  MultipleSelectCommonItem,
  MultipleSelectGroup,
  MultipleSelectItem,
  SelectGroup,
} from '../interfaces/select';
import { SelectAllDirective } from '@shared/directives/select-all.directive';
import { SelectedItemsComponent } from '@modules/reports/components/poll-filters/selected-items/selected-items.component';
import { SelectAllValue } from '@shared/directives/select-all-value';
import { UpperCasePipe } from '@angular/common';
import { VIRTUAL_SCROLL_THRESHOLD } from '@core/constants/select';
import { MatOptionSelectionChange } from '@angular/material/core';
import {
  MatChipInput,
  MatChipGrid,
  MatChipRow,
  MatChipRemove,
  MatChipInputEvent,
} from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { COMMA, ENTER } from '@angular/cdk/keycodes';

type ModeType = 'list' | 'chips';

@Component({
  selector: 'app-select-multiple-virtual-scroll',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    ReactiveFormsModule,
    ScrollingModule,
    SelectAllDirective,
    SelectedItemsComponent,
    UpperCasePipe,
    FormsModule,
    MatChipInput,
    MatAutocompleteModule,
    MatChipGrid,
    MatChipRow,
    MatChipRemove,
  ],
  templateUrl: './select-multiple-virtual-scroll.component.html',
  styleUrl: './select-multiple-virtual-scroll.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectMultipleVirtualScrollComponent {
  readonly templateCacheSize = 10;
  readonly itemSize = 48;
  readonly label = input<string>('');
  readonly id = input<string>('');
  readonly control = input.required<FormControl>();
  readonly items = input<MultipleSelectItem[]>([]);
  readonly groups = input<SelectGroup[]>([]);
  readonly scrollItems = computed<MultipleSelectItem[]>(() =>
    this.buildScrollItems()
  );
  readonly scrollItemsValues = computed<SelectAllValue[]>(() =>
    this.scrollItems()
      .filter(
        (item): item is MultipleSelectCommonItem => !this.isGroupItem(item)
      )

      .map(scrollItem => scrollItem.value)
  );
  readonly openedChange = output<boolean>();
  readonly autoSelect = input<boolean>(true);
  readonly useVirtualScroll = computed(
    () => this.scrollItems().length > VIRTUAL_SCROLL_THRESHOLD
  );
  readonly floatLabelSetup = input<FloatLabelType>('auto');
  readonly placeholder = input<string>('Search...');
  readonly selectedItemsValues = signal<SelectAllValue[]>([]);
  readonly selectedItemsLabels = signal<string[]>([]);
  readonly inputControlValues = computed<SelectAllValue[]>(
    () => this.control().value
  );
  readonly displayMode = input<ModeType>('list');
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  constructor() {
    effect(onCleanup => {
      const currentItems = this.scrollItems();
      const defaultValue = this.scrollItemsValues();
      const ctrl = this.control();

      // Account for edit modals with existing values
      if (this.inputControlValues()) {
        this.selectedItemsValues.set(this.inputControlValues());
      }

      if (currentItems?.length > 0 && this.autoSelect()) {
        const timeoutId = setTimeout(() => {
          ctrl.patchValue(defaultValue);
          this.selectedItemsValues.set(defaultValue);
          this.openedChange.emit(false);
        });

        onCleanup(() => clearTimeout(timeoutId));
      }
    });

    effect(() => {
      this.control().patchValue(this.selectedItemsValues());
      this.selectedItemsLabels.set(this.getItemSelection());
    });
  }

  buildScrollItems() {
    let scrollItems: MultipleSelectItem[] = this.items ? this.items() : [];

    if (!scrollItems || scrollItems.length === 0) {
      const groups = this.groups ? this.groups() : [];

      if (groups.length > 0) {
        scrollItems = groups.flatMap(g => [
          { label: g.label, type: 'group' },
          ...g.items,
        ]);
      }
    }

    return scrollItems;
  }

  getItemSelection() {
    const currentSelectionValues = this.selectedItemsValues();
    const scrollItems = this.scrollItems().filter(
      scrollItem => !scrollItem.type || scrollItem.type !== 'group'
    );

    let itemSelection = [''];
    if (currentSelectionValues.length === scrollItems.length) {
      itemSelection = ['Select all'];
    } else {
      itemSelection = currentSelectionValues.map(
        (selectedItem: SelectAllValue) => {
          const match = scrollItems.find(
            (item: MultipleSelectItem) =>
              !this.isGroupItem(item) && item.value === selectedItem
          );

          return match ? match.label : '';
        }
      );
    }

    return itemSelection;
  }

  isGroupItem(item: MultipleSelectItem): item is MultipleSelectGroup {
    return !!(item.type && item.type === 'group');
  }

  private readonly searchText = signal('');

  readonly filteredScrollItems = computed(() => {
    const search = this.searchText().toLowerCase().trim();
    if (!search) return this.scrollItems();

    const items = this.scrollItems();
    const result: MultipleSelectItem[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      if (this.isGroupItem(item)) {
        const hasMatch = items
          .slice(i + 1)
          .some(
            next =>
              !this.isGroupItem(next) &&
              next.label.toLowerCase().includes(search)
          );
        if (hasMatch) result.push(item);
      } else {
        if (item.label.toLowerCase().includes(search)) {
          result.push(item);
        }
      }
    }

    return result;
  });

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchText.set(value);
  }

  handleOpenedChange(isOpen: boolean): void {
    if (!isOpen) {
      this.searchText.set('');
    }
    this.openedChange.emit(isOpen);
  }

  selectAllClicked(selection: MatOptionSelectionChange) {
    if (selection.isUserInput && !selection.source.selected) {
      this.selectedItemsValues.set([]);
    }
  }

  updateSelection(selection: MatSelectChange<SelectAllValue[]>) {
    if (selection.value.includes('allValues')) {
      this.selectedItemsValues.set(this.scrollItemsValues());
    } else {
      this.selectedItemsValues.update(oldSelection => {
        const newSelection: SelectAllValue[] = [...oldSelection];
        const filteredItemsValues = this.filteredScrollItems().map(
          item => (item as MultipleSelectCommonItem).value
        );

        // Add new selections while avoiding duplicates
        newSelection.push(
          ...selection.value.filter(item => !oldSelection.includes(item))
        );

        // Remove previously selected item if it is deselected
        oldSelection.forEach(item => {
          if (
            filteredItemsValues.includes(item) &&
            !selection.value.includes(item)
          ) {
            const index = newSelection.indexOf(item);
            newSelection.splice(index, 1);
          }
        });

        return newSelection;
      });
    }
  }

  add(event: MatChipInputEvent): void {
    const label = (event.value || '').trim();
    if (!label) {
      return;
    }
    const item = this.scrollItems().find(
      scrollItem =>
        !this.isGroupItem(scrollItem) &&
        scrollItem.label.toLowerCase() === label.toLowerCase()
    );
    if (!item || this.isGroupItem(item)) {
      event.chipInput?.clear();
      return;
    }
    this.selectedItemsValues.update(values =>
      values.includes(item.value) ? values : [...values, item.value]
    );
    event.chipInput?.clear();
  }

  remove(label: string): void {
    const item = this.scrollItems().find(
      scrollItem => !this.isGroupItem(scrollItem) && scrollItem.label === label
    );
    if (!item || this.isGroupItem(item)) {
      return;
    }
    this.selectedItemsValues.update(values =>
      values.filter(value => value !== item.value)
    );
  }
}
