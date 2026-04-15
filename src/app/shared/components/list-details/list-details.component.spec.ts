import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivatedRoute } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { ListDetailsComponent } from './list-details.component';

describe('ListComponent', () => {
  let component: ListDetailsComponent<object>;
  let fixture: ComponentFixture<ListDetailsComponent<object>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListDetailsComponent],
      providers: [
        provideAnimations(),
        { provide: ActivatedRoute, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ListDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
