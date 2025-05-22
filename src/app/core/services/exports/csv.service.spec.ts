import { TestBed } from '@angular/core/testing';
import { CsvService } from './csv.service';
import { ActivatedRoute } from '@angular/router';

describe('CsvService', () => {
  let service: CsvService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [{ provide: ActivatedRoute, useValue: {} }],
    }).compileComponents();
    service = TestBed.inject(CsvService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});