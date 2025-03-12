import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StudentDetailComponent } from './student-detail.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { Component } from '@angular/core';

@Component({
  selector: 'app-ng-apexcharts',
  template: '',
  standalone: true,
})
export class MockNgApexchartsComponent {}

describe('StudentDetailComponent', () => {
  let component: StudentDetailComponent;
  let fixture: ComponentFixture<StudentDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        StudentDetailComponent,
        MockNgApexchartsComponent,
      ],
      providers: [
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

  it('should call getStudentDetails on init', () => {
    const spy = spyOn(component, 'getStudentDetails');
    component.ngOnInit();
    expect(spy).toHaveBeenCalled();
  });
});
