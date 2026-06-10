import { ScrollingModule } from '@angular/cdk/scrolling';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { SingleSelectItem } from '../interfaces/select';
import { MatInputModule } from '@angular/material/input';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { VIRTUAL_SCROLL_THRESHOLD } from '@core/constants/select';

@Component({
  selector: 'app-select-virtual-scroll',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    ReactiveFormsModule,
    ScrollingModule,
    MatInputModule,
    MatAutocompleteModule,
  ],
  templateUrl: './select-virtual-scroll.component.html',
  styleUrl: './select-virtual-scroll.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectVirtualScrollComponent {
  readonly templateCacheSize = 50;
  readonly itemSize = 48;
  readonly label = input<string>('');
  readonly items = input<SingleSelectItem[]>([]);
  readonly id = input<string>('');
  readonly control = input.required<FormControl>();
  readonly selectionChange = output<MatAutocompleteSelectedEvent>();

  private searchText = signal('');
  filteredItems = computed(() => {
    const search = this.searchText().toLocaleLowerCase().trim();
    if (!search) return this.items();
    return this.items().filter(item =>
      item.label.toLowerCase().includes(search)
    );
  });

  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchText.set(value);
  }

  displayFn = (value: unknown): string => {
    const match = this.items().find(item => item.value === value);
    return match?.label ?? '';
  };

  trackByFn = (_: number, item: SingleSelectItem) => item.value;

  readonly useVirtualScroll = computed(
    () => this.items().length > VIRTUAL_SCROLL_THRESHOLD
  );
}
