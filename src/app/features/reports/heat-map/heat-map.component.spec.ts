import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeatMapComponent } from './heat-map.component';
import { CohortService } from '../../../core/services/cohort.service';
import { of } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';

describe('HeatMapComponent', () => {
  let component: HeatMapComponent;
  let fixture: ComponentFixture<HeatMapComponent>;
  let mockCohortService: jasmine.SpyObj<CohortService>;

  beforeEach(async () => {
    mockCohortService = jasmine.createSpyObj('mockCohortService', [
      'getCohorts',
    ]);

    mockCohortService.getCohorts.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [HeatMapComponent],
      providers: [provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(HeatMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
