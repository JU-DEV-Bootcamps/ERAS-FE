import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeatMapComponent } from './heat-map.component';
import { of } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { CohortService } from '../../../core/services/api/cohort.service';

describe('HeatMapComponent', () => {
  let component: HeatMapComponent;
  let fixture: ComponentFixture<HeatMapComponent>;
  let mockCohortService: jasmine.SpyObj<CohortService>;

  beforeEach(async () => {
    mockCohortService = jasmine.createSpyObj('mockCohortService', [
      'getCohorts',
    ]);

    mockCohortService.getCohorts.and.returnValue(
      of({
        body: [],
        success: true,
        message: '',
        validationErrors: null,
      })
    );

    await TestBed.configureTestingModule({
      imports: [HeatMapComponent],
      providers: [provideHttpClient(), provideAnimationsAsync()],
    }).compileComponents();

    fixture = TestBed.createComponent(HeatMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
