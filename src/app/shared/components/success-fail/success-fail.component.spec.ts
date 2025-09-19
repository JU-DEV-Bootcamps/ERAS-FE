import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SuccessFailComponent } from './success-fail.component';

describe('SuccessFailComponent', () => {
  let component: SuccessFailComponent;
  let fixture: ComponentFixture<SuccessFailComponent>;

  const mockMatDialogData = {
    data: {
      subtitle: '',
      type: '',
    },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuccessFailComponent],
      providers: [{ provide: MAT_DIALOG_DATA, useValue: mockMatDialogData }],
    }).compileComponents();

    fixture = TestBed.createComponent(SuccessFailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
