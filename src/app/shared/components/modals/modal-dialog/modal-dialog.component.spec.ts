import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { ModalComponent } from './modal-dialog.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogData } from './types/dialog';

describe('ModalComponent', () => {
  let component: ModalComponent;
  let fixture: ComponentFixture<ModalComponent>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<ModalComponent>>;
  let data: DialogData;

  beforeEach(async () => {
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
    data = {
      title: 'Test Title',
      message: 'Test Message',
      type: 'error',
      details: ['Error detail 1', 'Error detail 2'],
    } as DialogData;

    await TestBed.configureTestingModule({
      imports: [
        ModalComponent,
        MatButtonModule,
        MatIconModule,
        NoopAnimationsModule,
      ],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: data },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('closeDialog', () => {
    it('should close the dialog', () => {
      component.closeDialog();

      expect(dialogRefSpy.close).toHaveBeenCalled();
    });
  });

  describe('doAction', () => {
    it('should call the provided action function and close the dialog', () => {
      const actionSpy = jasmine.createSpy('action');
      component.data.action = { label: 'Retry', action: actionSpy };

      component.doAction();

      expect(actionSpy).toHaveBeenCalled();
      expect(dialogRefSpy.close).toHaveBeenCalled();
    });

    it('should warn and still close the dialog when no action is provided', () => {
      component.data.action = undefined;
      const consoleWarnSpy = spyOn(console, 'warn');

      component.doAction();

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'No action function provided'
      );
      expect(dialogRefSpy.close).toHaveBeenCalled();
    });
  });

  describe('getTypeIcon', () => {
    it('should return "error" icon for type "error"', () => {
      expect(component.getTypeIcon('error')).toBe('error');
    });

    it('should return "info" icon for type "info"', () => {
      expect(component.getTypeIcon('info')).toBe('info');
    });

    it('should return "done" icon for type "success"', () => {
      expect(component.getTypeIcon('success')).toBe('done');
    });

    it('should return "warning" icon for type "warning"', () => {
      expect(component.getTypeIcon('warning')).toBe('warning');
    });

    it('should return an empty string for an unmapped type', () => {
      expect(component.getTypeIcon('unknown' as never)).toBe('');
    });
  });
});
