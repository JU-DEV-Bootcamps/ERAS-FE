import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalRiskStudentsDetailComponent } from './modal-risk-students-detail.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { HeatMapService } from '../../../core/services/heat-map.service';

describe('ModalRiskStudentsDetailComponent', () => {
  let component: ModalRiskStudentsDetailComponent;
  let fixture: ComponentFixture<ModalRiskStudentsDetailComponent>;

  let mockService = jasmine.createSpyObj('HeatMapService', [
    'getStudentHeatMapDetails',
  ]);

  beforeEach(async () => {
    mockService.getStudentHeatMapDetails.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [ModalRiskStudentsDetailComponent],
      providers: [
        {
          provide: MatDialogRef,
          useValue: jasmine.createSpyObj('MatDialogRef', ['close']),
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            component: 'academico',
          },
        },
        { provide: HeatMapService, useValue: mockService },
        provideNoopAnimations(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalRiskStudentsDetailComponent);
    component = fixture.componentInstance;

    mockService = TestBed.inject(HeatMapService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
