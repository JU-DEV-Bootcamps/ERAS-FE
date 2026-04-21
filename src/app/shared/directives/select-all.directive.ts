import {
  AfterViewInit,
  Directive,
  inject,
  Input,
  OnDestroy,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { MatOption, MatSelect } from '@angular/material/select';
import { Subscription } from 'rxjs';
import { SelectAllValue } from './select-all-value';

@Directive({
  selector: 'mat-option[appSelectAll]',
  standalone: true,
})
export class SelectAllDirective<T extends SelectAllValue>
  implements AfterViewInit, OnDestroy, OnChanges
{
  @Input() allValues: T[] = [];

  private _matSelect = inject(MatSelect);
  private _matOption = inject(MatOption);
  private _subscriptions: Subscription[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['allValues']) {
      const ctrl = this._matSelect.ngControl?.control;
      if (ctrl) {
        setTimeout(() => {
          this._updateState(ctrl.value);
        });
      }
    }
  }

  private getAllIds(): (number | string)[] {
    const all = this.allValues;
    if (!all || all.length === 0) return [];
    if (typeof all[0] === 'object' && all[0] !== null && 'id' in all[0]) {
      return (all as { id: number | string }[]).map(item => item.id);
    }
    return all as (number | string)[];
  }

  private isAllSelected(selected: T[] | null | undefined): boolean {
    const allIds = this.getAllIds();
    if (allIds.length === 0) return false;
    const selectedIds = new Set(
      (selected || [])
        .filter((s): s is T => s !== null && s !== undefined)
        .map(item =>
          typeof item === 'object' && item !== null && 'id' in item
            ? (item as { id: string | number }).id
            : (item as string | number)
        )
    );
    return (
      selectedIds.size === allIds.length &&
      allIds.every(id => selectedIds.has(id))
    );
  }

  private _updateState(currentValue: T[] | null | undefined): void {
    if (!this.allValues || this.allValues.length === 0) {
      this._matOption.deselect(false);
      return;
    }
    if (this.isAllSelected(currentValue)) {
      this._matOption.select(false);
    } else {
      this._matOption.deselect(false);
    }
  }

  ngAfterViewInit(): void {
    const parentSelect = this._matSelect;
    const parentFormControl = parentSelect.ngControl?.control;

    this._subscriptions.push(
      this._matOption.onSelectionChange.subscribe(event => {
        if (event.isUserInput) {
          if (event.source.selected) {
            parentFormControl?.setValue(this.getAllIds());
            this._matOption.select(false);
          } else {
            parentFormControl?.setValue([]);
            this._matOption.deselect(false);
          }
        }
      })
    );

    this._subscriptions.push(
      parentSelect.optionSelectionChanges.subscribe(v => {
        if (v.isUserInput && v.source.value !== this._matOption.value) {
          this._updateState(parentFormControl?.value);
        }
      })
    );

    setTimeout(() => {
      if (this.isAllSelected(parentFormControl?.value || [])) {
        this._matOption.select(false);
      }
    });
  }

  ngOnDestroy(): void {
    this._subscriptions.forEach(s => s.unsubscribe());
  }
}
