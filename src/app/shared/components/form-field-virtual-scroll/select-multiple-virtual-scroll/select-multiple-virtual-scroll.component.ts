import { ScrollingModule } from '@angular/cdk/scrolling';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal,
  viewChildren,
  ChangeDetectorRef,
  inject,
} from '@angular/core';
import { FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import {
  FloatLabelType,
  MatFormFieldModule,
} from '@angular/material/form-field';
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
import { MatOption, MatOptionSelectionChange } from '@angular/material/core';
import {
  MatChipInput,
  MatChipGrid,
  MatChipRow,
  MatChipRemove,
  MatChipInputEvent,
} from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { ModeType } from '@core/factories/forms/form-factory.interface';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { viewChild } from '@angular/core';

type SelectAllValueId = string | number;

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
  readonly templateCacheSize = 20;
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
    this.dedupeById(
      this.scrollItems()
        .filter(
          (item): item is MultipleSelectCommonItem => !this.isGroupItem(item)
        )
        .map(scrollItem => scrollItem.value)
    )
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
  readonly virtualScrollViewport = viewChild(CdkVirtualScrollViewport);

  private readonly renderedOptions = viewChildren(MatOption);

  private readonly cdr = inject(ChangeDetectorRef);

  private getValueId(value: SelectAllValue): SelectAllValueId {
    return value && typeof value === 'object' && 'id' in value
      ? (value as { id: SelectAllValueId }).id
      : (value as SelectAllValueId);
  }

  private dedupeById(values: SelectAllValue[]): SelectAllValue[] {
    const seen = new Set<SelectAllValueId>();
    const result: SelectAllValue[] = [];
    for (const value of values) {
      const valueId = this.getValueId(value);
      if (!seen.has(valueId)) {
        seen.add(valueId);
        result.push(value);
      }
    }
    return result;
  }

  compareFn = (o1: SelectAllValue, o2: SelectAllValue): boolean => {
    return this.getValueId(o1) === this.getValueId(o2);
  };

  isSelected(value: SelectAllValue): boolean {
    const valueId = this.getValueId(value);
    return this.selectedItemsValues().some(v => this.getValueId(v) === valueId);
  }

  constructor() {
    effect(onCleanup => {
      const currentItems = this.scrollItems();
      const defaultValue = this.scrollItemsValues();
      const ctrl = this.control();
      const initialValues = this.inputControlValues();

      if (initialValues) {
        this.selectedItemsValues.set(this.dedupeById(initialValues));
      }

      const hasNoInitialSelection =
        !initialValues || initialValues.length === 0;

      if (
        currentItems?.length > 0 &&
        this.autoSelect() &&
        hasNoInitialSelection
      ) {
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

    effect(onCleanup => {
      const viewport = this.virtualScrollViewport();
      if (!viewport) return;

      const subscription = viewport.renderedRangeStream.subscribe(() => {
        requestAnimationFrame(() => {
          this.syncRenderedOptionsSelection();
          this.cdr.detectChanges();
        });
      });
      onCleanup(() => subscription.unsubscribe());
    });

    effect(() => {
      this.selectedItemsValues();
      this.filteredScrollItems();
      queueMicrotask(() => this.syncRenderedOptionsSelection());
    });
  }

  private syncRenderedOptionsSelection(): void {
    const currentValues = this.selectedItemsValues();
    if (!currentValues) return;

    const selectedIds = new Set(currentValues.map(v => this.getValueId(v)));
    const options = this.renderedOptions();

    for (const option of options) {
      if (option.value === 'allValues' || option.disabled) continue;

      const optionId = this.getValueId(option.value as SelectAllValue);
      const shouldBeSelected = selectedIds.has(optionId);

      if (shouldBeSelected !== option.selected) {
        if (shouldBeSelected) {
          option.select();
        } else {
          option.deselect();
        }
      }
    }
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
    if (
      currentSelectionValues.length === scrollItems.length &&
      this.displayMode() !== 'chips'
    ) {
      itemSelection = ['All'];
    } else {
      itemSelection = currentSelectionValues.map(
        (selectedItem: SelectAllValue) => {
          const selectedId = this.getValueId(selectedItem);
          const match = scrollItems.find((item: MultipleSelectItem) => {
            if (this.isGroupItem(item)) return false;
            return this.getValueId(item.value) === selectedId;
          });

          return match ? match.label : '';
        }
      );
    }

    return itemSelection;
  }

  isGroupItem(item: MultipleSelectItem): item is MultipleSelectGroup {
    return !!(item.type && item.type === 'group');
  }

  trackScrollItem(
    index: number,
    item: MultipleSelectItem
  ): string | number | boolean {
    if (this.isGroupItem(item)) {
      return `group-${index}`;
    }
    return this.getValueId(item.value);
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
    } else {
      setTimeout(() => {
        this.virtualScrollViewport()?.checkViewportSize();
        this.syncRenderedOptionsSelection();
      });
    }
    this.openedChange.emit(isOpen);
  }

  onSelectAllToggle(event: MatOptionSelectionChange): void {
    if (!event.isUserInput) {
      return;
    }
    this.selectedItemsValues.set(
      event.source.selected ? this.scrollItemsValues() : []
    );
  }

  onOptionToggle(event: MatOptionSelectionChange, value: SelectAllValue): void {
    if (!event.isUserInput) {
      return;
    }
    const valueId = this.getValueId(value);
    this.selectedItemsValues.update(values =>
      event.source.selected
        ? values.some(v => this.getValueId(v) === valueId)
          ? values
          : [...values, value]
        : values.filter(v => this.getValueId(v) !== valueId)
    );
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
    const itemId = this.getValueId(item.value);
    this.selectedItemsValues.update(values =>
      values.some(v => this.getValueId(v) === itemId)
        ? values
        : [...values, item.value]
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
    const itemId = this.getValueId(item.value);
    this.selectedItemsValues.update(values =>
      values.filter(value => this.getValueId(value) !== itemId)
    );
  }
}
