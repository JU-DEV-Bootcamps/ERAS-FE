import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';

import { ModalStudentDetailComponent } from './modal-student-detail.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { provideHttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';

describe('ModalStudentDetailComponent', () => {
  let component: ModalStudentDetailComponent;
  let fixture: ComponentFixture<ModalStudentDetailComponent>;
  let dialogRefSpy: { close: jasmine.Spy; updateSize: jasmine.Spy };

  beforeEach(async () => {
    dialogRefSpy = {
      close: jasmine.createSpy('close'),
      updateSize: jasmine.createSpy('updateSize'),
    };

    await TestBed.configureTestingModule({
      imports: [ModalStudentDetailComponent],
      providers: [
        provideAnimations(),
        { provide: MatDialogRef, useValue: dialogRefSpy },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            studentId: 1,
          },
        },
        { provide: ActivatedRoute, useValue: {} },
        provideHttpClient(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalStudentDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with the injected dialog data', () => {
    expect(component.data).toEqual({ studentId: 1 });
  });

  describe('ngAfterViewInit', () => {
    it('should call dialogRef.updateSize("auto") after the timeout', fakeAsync(() => {
      component.ngAfterViewInit();
      tick();

      expect(dialogRefSpy.updateSize).toHaveBeenCalledWith('auto');
    }));
  });

  describe('delete', () => {
    it('should close the dialog', () => {
      component.delete();

      expect(dialogRefSpy.close).toHaveBeenCalled();
    });
  });

  describe('closeDialog', () => {
    it('should close the dialog', () => {
      component.closeDialog();

      expect(dialogRefSpy.close).toHaveBeenCalled();
    });
  });
});
