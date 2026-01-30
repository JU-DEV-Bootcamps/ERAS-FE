import { ScrollingModule } from '@angular/cdk/scrolling';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  input,
  output,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { CommonItem } from '../interfaces/select';

@Component({
  selector: 'app-select-virtual-scroll',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    ReactiveFormsModule,
    ScrollingModule,
  ],
  templateUrl: './select-virtual-scroll.component.html',
  styleUrl: './select-virtual-scroll.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectVirtualScrollComponent {
  readonly label = input<string>('');
  readonly items = input<CommonItem[]>([]);
  readonly id = input<string>('');
  readonly control = input.required<FormControl>();
  readonly selectionChange = output<MatSelectChange>();
  readonly chooseDefaultValue = input<boolean>();

  constructor() {
    effect(() => {
      const currentItems = this.items();

      if (currentItems && currentItems.length > 0) {
        const defaultValue = currentItems[0].value;

        this.control().patchValue(defaultValue);
        this.selectionChange.emit({
          value: defaultValue,
        } as MatSelectChange);
      }
    });
  }
}
