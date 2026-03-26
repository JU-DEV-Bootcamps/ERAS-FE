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
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
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

  constructor() {
    effect(() => {
      const currentItems = this.scrollItems();
      const defaultValue = this.scrollItemsValues();

      if (currentItems && currentItems.length > 0 && this.autoSelect()) {
        this.control().patchValue(defaultValue);
        this.openedChange.emit(false);
      }
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
    const value = this.control().value;

    let toReturn = [''];

    if (value) {
      const selectedItems = value.filter((item: MultipleSelectItem) => !!item);
      const scrollItems = this.scrollItems().filter(
        scrollItem => !scrollItem.type || scrollItem.type !== 'group'
      );

      if (selectedItems.length === scrollItems.length) {
        toReturn = ['Select all'];
      } else {
        toReturn = selectedItems?.map((selectedItem: unknown) => {
          const match = scrollItems.find(
            (item: MultipleSelectItem) =>
              !this.isGroupItem(item) && item.value === selectedItem
          );

          return match ? match.label : '';
        });
      }
    }

    return toReturn;
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
}
