import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErasButtonComponent } from './eras-button.component';

describe('ErasButtonComponent', () => {
  let component: ErasButtonComponent;
  let fixture: ComponentFixture<ErasButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErasButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ErasButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
