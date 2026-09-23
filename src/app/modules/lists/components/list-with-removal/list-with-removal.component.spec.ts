import {
  Component,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ListWithRemovalComponent } from './list-with-removal.component';
import { MatCardDetailsComponent } from '@shared/components/mat-card-details/mat-card-details.component';
import { EventLoad, EventUpdate } from '@core/models/load';
import { Column } from '@shared/components/list/types/column';
import { ActionDatas } from '@shared/components/list/types/action';
import { MapClass } from '@shared/components/list/types/class';

interface TestRow {
  id: number;
  name: string;
}

@Component({
  selector: 'app-mat-card-details',
  template: '',
  standalone: true,
})
class MockMatCardDetailsComponent {
  @Input() items: unknown[] = [];
  @Input() totalItems = 0;
  @Input() columns: unknown[] = [];
  @Input() columnTemplates: unknown[] = [];
  @Input() actionDatas: unknown[] = [];
  @Input() mapClass?: unknown;
  @Input() emptyTemplate?: TemplateRef<unknown>;

  @Output() loadCalled = new EventEmitter<unknown>();
  @Output() actionCalled = new EventEmitter<unknown>();
}

describe('ListWithRemovalComponent', () => {
  let component: ListWithRemovalComponent<TestRow>;
  let fixture: ComponentFixture<ListWithRemovalComponent<TestRow>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListWithRemovalComponent],
    })
      .overrideComponent(ListWithRemovalComponent, {
        remove: { imports: [MatCardDetailsComponent] },
        add: { imports: [MockMatCardDetailsComponent] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(ListWithRemovalComponent<TestRow>);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Inputs default values', () => {
    it('should have correct default values for all inputs', () => {
      expect(component.items).toEqual([]);
      expect(component.totalItems).toBe(0);
      expect(component.columns).toEqual([]);
      expect(component.columnTemplates).toEqual([]);
      expect(component.actionDatas).toEqual([]);
      expect(component.mapClass).toBeUndefined();
      expect(component.emptyTemplate).toBeUndefined();
    });

    it('should accept custom inputs properly', () => {
      const mockItems: TestRow[] = [{ id: 1, name: 'Item 1' }];
      const mockColumns = [{ key: 'name', label: 'Name' }] as Column<TestRow>[];
      const mockActionDatas = [
        { id: 'delete', label: 'Delete' },
      ] as unknown as ActionDatas;
      const mockMapClass = { success: 'class-ok' } as unknown as MapClass;

      component.items = mockItems;
      component.totalItems = 1;
      component.columns = mockColumns;
      component.columnTemplates = mockColumns;
      component.actionDatas = mockActionDatas;
      component.mapClass = mockMapClass;

      fixture.detectChanges();

      expect(component.items).toBe(mockItems);
      expect(component.totalItems).toBe(1);
      expect(component.columns).toBe(mockColumns);
      expect(component.columnTemplates).toBe(mockColumns);
      expect(component.actionDatas).toBe(mockActionDatas);
      expect(component.mapClass).toBe(mockMapClass);
    });
  });

  describe('handleAction', () => {
    it('should emit actionCalled when handleAction is executed', () => {
      const emitSpy = spyOn(component.actionCalled, 'emit');
      const mockEvent: EventUpdate = {
        action: 'DELETE',
        item: { id: 1, name: 'Item 1' },
      } as unknown as EventUpdate;

      component.handleAction(mockEvent);

      expect(emitSpy).toHaveBeenCalledTimes(1);
      expect(emitSpy).toHaveBeenCalledWith(mockEvent);
    });
  });

  describe('loadCalled Output', () => {
    it('should emit loadCalled with proper event payload', done => {
      const mockLoadEvent: EventLoad = {
        page: 1,
        pageSize: 10,
      } as unknown as EventLoad;

      component.loadCalled.subscribe(event => {
        expect(event).toEqual(mockLoadEvent);
        done();
      });

      component.loadCalled.emit(mockLoadEvent);
    });
  });

  describe('Template bindings to child component', () => {
    it('should forward actionCalled event from app-mat-card-details to handleAction if bound in template', () => {
      const handleActionSpy = spyOn(component, 'handleAction');
      const mockCardDetails = fixture.debugElement.query(
        By.directive(MockMatCardDetailsComponent)
      );

      if (mockCardDetails) {
        const mockChildInstance =
          mockCardDetails.componentInstance as MockMatCardDetailsComponent;
        const mockEvent = { action: 'EDIT' } as unknown as EventUpdate;

        mockChildInstance.actionCalled.emit(mockEvent);
        fixture.detectChanges();

        expect(handleActionSpy).toHaveBeenCalledWith(mockEvent);
      }
    });
  });
});
