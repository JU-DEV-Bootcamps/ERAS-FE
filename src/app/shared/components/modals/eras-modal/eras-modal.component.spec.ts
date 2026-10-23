import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { ErasModalComponent } from './eras-modal.component';
import {
  ErasModalAction,
  ErasModalData,
  InnerComponent,
} from './eras-modal.interface';
import { By } from '@angular/platform-browser';

@Component({
  standalone: true,
  selector: 'app-fake-inner',
  template: '',
})
class FakeInnerComponent implements InnerComponent {
  formInstance = new EventEmitter<FormGroup>();
}

describe('ErasModalComponent', () => {
  describe('without a dynamic inner component', () => {
    let component: ErasModalComponent;
    let fixture: ComponentFixture<ErasModalComponent>;
    let dialogRefSpy: jasmine.SpyObj<MatDialogRef<ErasModalComponent>>;
    let data: ErasModalData;

    beforeEach(async () => {
      dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
      data = {};

      await TestBed.configureTestingModule({
        imports: [ErasModalComponent],
        providers: [
          { provide: MAT_DIALOG_DATA, useValue: data },
          { provide: MatDialogRef, useValue: dialogRefSpy },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(ErasModalComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should not populate data.form when there is no inner component', () => {
      expect(component.data.form).toBeUndefined();
    });

    it('should close the dialog with the action value for a non-save action', () => {
      const action: ErasModalAction = { label: 'Cancel', value: 'cancel' };

      component.onAction(action);

      expect(dialogRefSpy.close).toHaveBeenCalledWith('cancel');
    });

    it('should close the dialog with the action value when action is save but there is no form', () => {
      const action: ErasModalAction = { label: 'Save', value: 'save' };

      component.onAction(action);

      expect(dialogRefSpy.close).toHaveBeenCalledWith('save');
    });

    it('should mark the form as touched and not close when saving an invalid form', () => {
      const form = new FormGroup({
        name: new FormControl('', Validators.required),
      });
      component.data.form = form;

      const markAllAsTouchedSpy = spyOn(
        form,
        'markAllAsTouched'
      ).and.callThrough();
      const action: ErasModalAction = { label: 'Save', value: 'save' };

      component.onAction(action);

      expect(markAllAsTouchedSpy).toHaveBeenCalled();
      expect(dialogRefSpy.close).not.toHaveBeenCalled();
    });

    it('should close the dialog with the form raw value when saving a valid form', () => {
      const form = new FormGroup({
        name: new FormControl('Lucia'),
      });
      component.data.form = form;
      const action: ErasModalAction = { label: 'Save', value: 'save' };

      component.onAction(action);

      expect(dialogRefSpy.close).toHaveBeenCalledWith({
        type: 'save',
        data: { name: 'Lucia' },
      });
    });
  });

  describe('with a dynamic inner component', () => {
    let component: ErasModalComponent;
    let fixture: ComponentFixture<ErasModalComponent>;

    beforeEach(async () => {
      const data: ErasModalData<FakeInnerComponent> = {
        component: FakeInnerComponent,
      };

      await TestBed.configureTestingModule({
        imports: [ErasModalComponent, FakeInnerComponent],
        providers: [
          { provide: MAT_DIALOG_DATA, useValue: data },
          {
            provide: MatDialogRef,
            useValue: jasmine.createSpyObj('MatDialogRef', ['close']),
          },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(ErasModalComponent);
      component = fixture.componentInstance;
    });

    it('should create the inner component inside the container on init', () => {
      fixture.detectChanges();

      expect(component.erasModalContainer.length).toBe(1);
    });

    it('should link data.form when the inner component emits formInstance', () => {
      fixture.detectChanges();

      const innerDebugEl = fixture.debugElement.query(
        By.directive(FakeInnerComponent)
      );
      const innerInstance = innerDebugEl.injector.get(FakeInnerComponent);

      const formGroup = new FormGroup({ email: new FormControl('') });
      innerInstance.formInstance.emit(formGroup);

      expect(component.data.form).toBe(formGroup);
    });
  });
});
