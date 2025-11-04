import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ListStudentsByPollComponent } from './list-students-by-poll.component';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

describe('ListStudentsByPollComponent', () => {
  const mockActivatedRoute = {
    snapshot: {
      paramMap: {
        get: () => null,
      },
    },
    params: of({}),
    queryParams: of({}),
  };

  let component: ListStudentsByPollComponent;
  let fixture: ComponentFixture<ListStudentsByPollComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ListStudentsByPollComponent,
        HttpClientModule,
        BrowserAnimationsModule,
      ],
      providers: [{ provide: ActivatedRoute, useValue: mockActivatedRoute }],
    }).compileComponents();

    fixture = TestBed.createComponent(ListStudentsByPollComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
