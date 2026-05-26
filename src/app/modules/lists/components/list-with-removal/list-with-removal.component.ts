import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
} from '@angular/core';
import { EventAction, EventLoad, EventUpdate } from '@core/models/load';
import { ActionDatas } from '@shared/components/list/types/action';
import { MapClass } from '@shared/components/list/types/class';
import { Column } from '@shared/components/list/types/column';
import { MatCardDetailsComponent } from '@shared/components/mat-card-details/mat-card-details.component';

@Component({
  selector: 'app-list-with-removal',
  imports: [NgTemplateOutlet, MatCardDetailsComponent],
  templateUrl: './list-with-removal.component.html',
  styleUrl: './list-with-removal.component.scss',
})
export class ListWithRemovalComponent<T extends object> {
  @Input() items: T[] = [];
  @Input() totalItems = 0;
  @Input() columns: Column<T>[] = [] as Column<T>[];
  @Input() columnTemplates: Column<T>[] = [];
  @Input() actionDatas: ActionDatas = [];
  @Input() mapClass?: MapClass;
  @Input() emptyTemplate?: TemplateRef<T>;

  @Output() loadCalled = new EventEmitter<EventLoad>();
  @Output() actionCalled = new EventEmitter<EventAction>();

  handleAction(event: EventUpdate) {
    this.actionCalled.emit(event);
  }
}
