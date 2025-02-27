import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportAnswersPreviewComponent } from './import-answers-preview.component';
import {
  BrowserAnimationsModule,
  provideNoopAnimations,
} from '@angular/platform-browser/animations';
import { CosmicLatteService } from '../../core/services/cosmic-latte.service';
import { PollService } from '../../core/services/poll.service';
import { provideHttpClient } from '@angular/common/http';

describe('ImportAnswersPreviewComponent', () => {
  let component: ImportAnswersPreviewComponent;

  let fixture: ComponentFixture<ImportAnswersPreviewComponent>;
  const mockPollService = jasmine.createSpyObj('PollService', [
    'savePollsCosmicLattePreview',
  ]);
  const mockCosmicLatteService = jasmine.createSpyObj('CosmicLatteService', [
    'getPollNames',
  ]);

  beforeEach(async () => {
    mockCosmicLatteService.getPollNames.and.returnValue([]);
    mockPollService.savePollsCosmicLattePreview.and.returnValue([]);

    await TestBed.configureTestingModule({
      imports: [ImportAnswersPreviewComponent, BrowserAnimationsModule],
      providers: [
        { provide: CosmicLatteService, useValue: mockCosmicLatteService },
        { provide: PollService, useValue: mockPollService }, // Agregar el servicio mockeado
        provideNoopAnimations(),
        provideHttpClient(), // Proveer HttpClient para evitar el error
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ImportAnswersPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
