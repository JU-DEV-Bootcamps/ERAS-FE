import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';

import { EvaluationProcessFormComponent } from './evaluation-process-form.component';
import { of, throwError } from 'rxjs';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CosmicLatteService } from '@core/services/api/cosmic-latte.service';
import { EvaluationsService } from '@core/services/api/evaluations.service';
import Keycloak from 'keycloak-js';
import { AuditModel } from '@core/models/common/audit.model';
import { PollInstance } from '@core/models/poll-instance.model';
import { ConfigurationsModel } from '@core/models/configurations.model';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';

import { Component, Input } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'apx-chart',
  standalone: true,
  template: '<div></div>',
})
class MockChartComponent {
  @Input() chart: unknown;
  @Input() series: unknown;
  @Input() labels: unknown;
}

describe('EvaluationProcessFormComponent', () => {
  let component: EvaluationProcessFormComponent;
  let fixture: ComponentFixture<EvaluationProcessFormComponent>;
  let mockKeycloak: jasmine.SpyObj<Keycloak>;
  let mockCosmicLatteService: jasmine.SpyObj<CosmicLatteService>;

  const mockEvaluationService = jasmine.createSpyObj(
    'EvaluationProcessService',
    ['createEvalProc']
  );

  beforeEach(async () => {
    mockCosmicLatteService = jasmine.createSpyObj('CosmicLatteService', [
      'getPollNames',
      'importAnswerBySurvey',
    ]);
    mockCosmicLatteService.getPollNames.and.returnValue(of([]));
    mockKeycloak = jasmine.createSpyObj('Keycloak', ['loadUserProfile']);
    mockKeycloak.loadUserProfile.and.resolveTo({ id: 'user123' });

    await TestBed.configureTestingModule({
      declarations: [],
      imports: [
        EvaluationProcessFormComponent,
        HttpClientTestingModule,
        ReactiveFormsModule,
      ],
      providers: [
        { provide: CosmicLatteService, useValue: mockCosmicLatteService },
        { provide: EvaluationsService, useValue: mockEvaluationService },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        {
          provide: MatDialogRef,
          useValue: jasmine.createSpyObj('MatDialogRef', ['close']),
        },
        { provide: Keycloak, useValue: mockKeycloak },
        provideNoopAnimations(),
      ],
    })
      .overrideComponent(EvaluationProcessFormComponent, {
        remove: { imports: [NgApexchartsModule] },
        add: { imports: [MockChartComponent] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(EvaluationProcessFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should reset the form after a successful submission', () => {
    const audit: AuditModel = {
      createdBy: 'string',
      modifiedBy: 'string',
      createdAt: new Date(),
      modifiedAt: new Date(),
    };

    const poll: PollInstance[] = [
      {
        id: 0,
        idCosmicLatte: 'string',
        uuid: 'string',
        name: 'string',
        version: 'string',
        finishedAt: 'string',
        components: [],
        audit: audit,
      },
    ];

    component.selectedConfiguration = {
      id: 1,
      serviceProviderId: 1,
    } as ConfigurationsModel;

    component.form.controls['pollName'].setValue('Test Survey');

    mockCosmicLatteService.importAnswerBySurvey.and.returnValue(of(poll));

    component.onSubmit();

    expect(component.form.controls['pollName'].value).toBeNull();
    expect(component.form.pristine).toBeTrue();
    expect(component.form.untouched).toBeTrue();
  });

  it('should handle error on submission', fakeAsync(() => {
    component.selectedConfiguration = {
      id: 1,
      serviceProviderId: 1,
    } as ConfigurationsModel;

    component.form.patchValue({
      name: 'Example',
      configuration: { id: 1, configurationName: 'Test Survey' },
      pollName: 'Test Survey',
      startDate: '2026-01-01',
      endDate: '2026-01-10',
    });

    fixture.detectChanges();

    mockEvaluationService.createEvalProc.and.returnValue(
      throwError(() => ({ error: 'Server error' }))
    );

    component.onSubmit();
    tick();
    fixture.detectChanges();

    expect(mockEvaluationService.createEvalProc).toHaveBeenCalled();
    expect(component.form.controls['pollName'].value).toBeNull();
  }));
});
