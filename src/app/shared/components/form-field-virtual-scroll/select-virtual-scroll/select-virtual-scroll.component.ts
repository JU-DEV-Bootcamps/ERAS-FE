import { ScrollingModule } from '@angular/cdk/scrolling';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { SingleSelectItem } from '../interfaces/select';

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
  readonly itemSize = 48;
  readonly label = input<string>('');
  readonly items = input<SingleSelectItem[]>([]);
  readonly id = input<string>('');
  readonly control = input.required<FormControl>();
  readonly selectionChange = output<MatSelectChange>();
}
