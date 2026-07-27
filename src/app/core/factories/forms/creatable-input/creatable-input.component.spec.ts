import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatableInputComponent } from './creatable-input.component';

describe('CreatableInputComponent', () => {
  let component: CreatableInputComponent;
  let fixture: ComponentFixture<CreatableInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreatableInputComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CreatableInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
