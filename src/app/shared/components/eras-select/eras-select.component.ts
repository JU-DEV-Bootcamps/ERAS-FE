import {
  Component,
  effect,
  EventEmitter,
  HostListener,
  input,
  Output,
  signal,
} from '@angular/core';

export interface SelectedOptionModel<T = unknown> {
  label: string;
  value: T;
}

@Component({
  selector: 'app-eras-select',
  templateUrl: './eras-select.component.html',
  styleUrl: './eras-select.component.scss',
})
export class ErasSelectComponent<T> {
  label = input.required<string>();
  placeholder = input.required<string>();
  options = input.required<SelectedOptionModel<T>[]>();
  value = input<T | null>();

  compareBy = input<(a: T, b: T) => boolean>((a, b) => a === b);

  @Output() valueChange = new EventEmitter<T>();

  readonly isOpen = signal(false);
  readonly selected = signal<SelectedOptionModel<T> | null>(null);

  constructor() {
    effect(() => {
      const value = this.value();
      const opts = this.options();

      if (!value) {
        this.selected.set(null);
        return;
      }

      const match = opts.find(o => this.compareBy()(o.value, value)) ?? null;
      this.selected.set(match);
    });
  }

  toggle() {
    this.isOpen.update(booleanValue => !booleanValue);
  }

  select(option: SelectedOptionModel<T>) {
    this.selected.set(option);
    this.valueChange.emit(option.value);
    this.isOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onOutsideClick(event: MouseEvent) {
    if (!(event.target as HTMLElement).closest('.eras-select')) {
      this.isOpen.set(false);
    }
  }
}
