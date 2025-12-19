import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StudentDetailComponent } from './student-detail.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-ng-apexcharts',
  template: '',
  standalone: true,
})
export class MockNgApexchartsComponent {}

describe('StudentDetailComponent', () => {
  let component: StudentDetailComponent;
  let fixture: ComponentFixture<StudentDetailComponent>;
  let httpClientSpy: jasmine.SpyObj<HttpClient>;

  beforeEach(() => {
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['get']);
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentDetailComponent, MockNgApexchartsComponent],
      providers: [
        { provide: HttpClient, useValue: httpClientSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ studentId: 26 }),
          },
        },
        {
          provide: MockNgApexchartsComponent,
          useValue: {},
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentDetailComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
