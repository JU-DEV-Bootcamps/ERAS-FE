import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

import { ModalStudentDetailV2Component } from './modal-student-detail-v2.component';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FeatureFlagsService } from '@core/components/feature-flags/feature-flags.service';
import { FEATURE_FLAGS } from '@core/components/feature-flags/feature-flags';

describe('ModalStudentDetailV2Component', () => {
  let component: ModalStudentDetailV2Component;
  let fixture: ComponentFixture<ModalStudentDetailV2Component>;
  let featureFlagsServiceSpy: jasmine.SpyObj<FeatureFlagsService>;

  const mockData = { studentId: 26 };

  beforeEach(async () => {
    featureFlagsServiceSpy = jasmine.createSpyObj('FeatureFlagsService', [
      'isEnabled',
    ]);

    await TestBed.configureTestingModule({
      imports: [ModalStudentDetailV2Component],
      providers: [
        provideHttpClient(),
        { provide: MAT_DIALOG_DATA, useValue: mockData },
        { provide: FeatureFlagsService, useValue: featureFlagsServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalStudentDetailV2Component);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose the injected dialog data', () => {
    expect(component.data).toEqual(mockData);
  });

  it('should compute showV2 as true when the feature flag is enabled', () => {
    featureFlagsServiceSpy.isEnabled.and.returnValue(true);

    expect(component.showV2()).toBe(true);
    expect(featureFlagsServiceSpy.isEnabled).toHaveBeenCalledWith(
      FEATURE_FLAGS.studentDetails
    );
  });

  it('should compute showV2 as false when the feature flag is disabled', () => {
    featureFlagsServiceSpy.isEnabled.and.returnValue(false);

    expect(component.showV2()).toBe(false);
  });
});
