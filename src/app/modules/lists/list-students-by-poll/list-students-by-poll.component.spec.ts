import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ListStudentsByPollComponent } from './list-students-by-poll.component';

describe('ListStudentsByPollComponent', () => {
  let component: ListStudentsByPollComponent;
  let fixture: ComponentFixture<ListStudentsByPollComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ListStudentsByPollComponent,
        HttpClientModule,
        BrowserAnimationsModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ListStudentsByPollComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
