import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActionButtonComponent } from './action-button.component';
import { ActionData } from '@shared/components/list/types/action';

describe('ActionButtonComponent', () => {
  let component: ActionButtonComponent;
  let fixture: ComponentFixture<ActionButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActionButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ActionButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('defaults', () => {
    it('should initialize with default values', () => {
      expect(component.actionData).toEqual({
        columnId: '',
        text: '',
        label: '',
        id: '',
      });
      expect(component.item).toEqual({});
      expect(component.disabled).toBeFalse();
    });
  });

  describe('onButtonClick', () => {
    it('should emit actionCalled with event, data, and item when actionData.label is present', () => {
      spyOn(component.actionCalled, 'emit');

      const mockActionData: ActionData = {
        id: 'btn-1',
        label: 'Editar',
        columnId: 'col-1',
        text: 'Editar item',
      };
      const mockItem = { id: 101, name: 'Item 1' };
      const mockEvent = new MouseEvent('click');

      component.actionData = mockActionData;
      component.item = mockItem;

      component.onButtonClick(mockEvent);

      expect(component.actionCalled.emit).toHaveBeenCalledWith({
        event: mockEvent,
        data: mockActionData,
        item: mockItem,
      });
    });

    it('should not emit actionCalled when actionData.label is empty', () => {
      spyOn(component.actionCalled, 'emit');

      component.actionData = {
        id: 'btn-1',
        label: '',
        columnId: 'col-1',
        text: 'Sin etiqueta',
      };
      const mockEvent = new MouseEvent('click');

      component.onButtonClick(mockEvent);

      expect(component.actionCalled.emit).not.toHaveBeenCalled();
    });

    it('should not emit actionCalled when actionData.label is undefined or falsy', () => {
      spyOn(component.actionCalled, 'emit');

      component.actionData = {
        id: 'btn-1',
        label: undefined as unknown as string,
        columnId: 'col-1',
        text: 'Texto',
      };
      const mockEvent = new MouseEvent('click');

      component.onButtonClick(mockEvent);

      expect(component.actionCalled.emit).not.toHaveBeenCalled();
    });
  });

  describe('inputs', () => {
    it('should update disabled state correctly', () => {
      component.disabled = true;
      fixture.detectChanges();
      expect(component.disabled).toBeTrue();
    });

    it('should update item input correctly', () => {
      const customItem = { code: 'ITEM_XYZ', active: true };
      component.item = customItem;
      fixture.detectChanges();
      expect(component.item).toEqual(customItem);
    });
  });
});
